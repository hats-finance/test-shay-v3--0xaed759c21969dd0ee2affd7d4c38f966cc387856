import { toWei, fromWei } from "../utils";
import { ethers, BigNumber, Contract, Signer } from "ethers";
import vaultAbi from "../data/abis/HATSVault.json";
import erc20Abi from "../data/abis/erc20.json";
import { DEFAULT_ERROR_MESSAGE, NotificationType, TransactionStatus } from "../constants/constants";
import { InfuraProvider, InfuraWebSocketProvider, Web3Provider } from "@ethersproject/providers";
import { Dispatch } from "redux";
import { toggleInTransaction, toggleNotification } from "./index";
import { NETWORK } from "../settings";

const MAX_SPENDING = BigNumber.from(2).pow(BigNumber.from(96)).sub(BigNumber.from(1));

let provider: Web3Provider;
let signer: Signer;
let infuraProvider: InfuraWebSocketProvider;

if (window.ethereum) {
  provider = new ethers.providers.Web3Provider((window as any).ethereum);
  signer = provider.getSigner();
  infuraProvider = InfuraProvider.getWebSocketProvider(NETWORK);
}

/**
 * Returns the current block number
 */
export const getBlockNumber = async () => {
  try {
    return await provider.getBlockNumber();
  } catch (error) {
    console.error(error);
  }
}

/**
 * Given token address returns it's symbol
 * @param {string} tokenAddress
 */
export const getTokenSymbol = async (tokenAddress: string) => {
  try {
    const contract = new Contract(tokenAddress, erc20Abi, provider);
    return await contract.symbol();
  } catch (error) {
    console.error(error);
  }
}

/**
 * Given token address and current wallet account address returns the token balance
 * @param {string} tokenAddress
 * @param {string} selectedAddress
 */
export const getTokenBalance = async (tokenAddress: string, selectedAddress: string, decimals: string) => {
  try {
    const contract = new Contract(tokenAddress, erc20Abi, infuraProvider);
    const balance: BigNumber = await contract.balanceOf(selectedAddress);
    return fromWei(balance, decimals);
  } catch (error) {
    console.error (error);
    return "-";
  }
}

/**
 * Checks whether a given account address and a spender can spend a given token
 * @param {string} tokenAddress
 * @param {string} selectedAddress
 * @param {string} tokenSpender
 */
export const isApproved = async (tokenAddress: string, selectedAddress: string, tokenSpender: string) => {
  try {
    const contract = new Contract(tokenAddress, erc20Abi, provider);
    const allowance: BigNumber = await contract.allowance(selectedAddress, tokenSpender);
    return allowance.gt(0);
  } catch (error) {
    console.error(error);
    return false;
  }
}

/**
 * Approves a spender to spend a given token
 * @param {string} tokenAddress
 * @param {string} tokenSpender
 */
export const approveToken = async (tokenAddress: string, tokenSpender: string) => {
  try {
    const contract = new Contract(tokenAddress, erc20Abi, signer);
    return await contract.approve(tokenSpender, MAX_SPENDING);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Withdraw Request
 * @param {string} pid
 * @param {string} address
 */
export const withdrawRequest = async (pid: string, address: string) => {
  try {
    const contract = new Contract(address, vaultAbi, signer);
    return await contract.withdrawRequest(pid);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Deposit and claim (if acceptable)
 * @param {string} address
 * @param {string} amount
 */
export const depositAndClaim = async (pid: string, address: string, amount: string, decimals: string) => {
  const contract = new Contract(address, vaultAbi, signer);
  return await contract.deposit(pid, toWei(amount, decimals));
}

/**
 * Withdraw and claim (if acceptable)
 * @param {string} address
 * @param {string} amount
 */
export const withdrawAndClaim = async (pid: string, address: string, amount: string, decimals) => {
  const contract = new Contract(address, vaultAbi, signer);
  return await contract.withdraw(pid, toWei(amount, decimals));
}

/**
 * Claim
 * @param {stirng} address
 */
export const claim = async (pid: string, address: string) => {
  const contract = new Contract(address, vaultAbi, signer);
  return await contract.claimReward(pid);
}

/**
 * Returns the HATS reward for a user
 * @param {string} address
 * @param {stirng} pid
 * @param {string} selectedAddress
 */
export const getPendingReward = async (address: string, pid: string, selectedAddress: string) => {
  try {
    const contract = new Contract(address, vaultAbi, signer);
    return await contract.pendingReward(pid, selectedAddress);
  } catch (error) {
    console.error(error);
    return BigNumber.from(0);
  }
}

/**
 * Submits the hash of the vulnerability description
 * @param {string} address
 * @param {string} descriptionHash the sha256 of the vulnerability description
 */
export const submitVulnerability = async (address: string, descriptionHash: string) => {
  const contract = new Contract(address, vaultAbi, signer);
  return await contract.claim(descriptionHash);
}

/**
 * This is a generic function that wraps a call that interacts with the blockchain
 * Dispatches automatically a notification on success or on error.
 * @param {Function} tx The function that creates the transaction on the blockchain
 * @param {Function} onSuccess Function to call on success
 * @param {Function} onWalletAction Function to call while a transaction is being processed
 * @param {Function} onFail Function to call on fail
 * @param {Dispatch} dispatch The Redux dispath function to dispatch the notification
 * @param {string} successText Optional extra text to show on success
 * @param {number} confirmations The number of confirmations on the blockchain to wait until we consider the transaction has succeeded. Default is 1 confirmation.
 * @param {boolean} disableAutoHide Disable auto-hide of the notifications
 */
export const createTransaction = async (tx: Function, onWalletAction: Function, onSuccess: Function, onFail: Function, dispatch: Dispatch, successText?: string, confirmations = 1, disableAutoHide?: boolean) => {
  try {
    const transaction = await tx();
    await onWalletAction();
    dispatch(toggleInTransaction(true, transaction.hash));
    const receipt = await transaction.wait(confirmations);
    if (receipt.status === TransactionStatus.Success) {
      await onSuccess();
      dispatch(toggleNotification(true, NotificationType.Success, successText ?? "Transaction succeeded", disableAutoHide));
    } else {
      throw new Error();
    }
  } catch (error) {
    console.error(error);
    await onFail();
    dispatch(toggleNotification(true, NotificationType.Error, error?.message ?? DEFAULT_ERROR_MESSAGE, disableAutoHide));
  }
}
