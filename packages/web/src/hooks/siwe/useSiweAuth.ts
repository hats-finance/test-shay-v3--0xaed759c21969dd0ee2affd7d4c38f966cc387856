import { useEffect, useState } from "react";
import { useAccount, useNetwork, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { useOnChange } from "hooks/usePrevious";
import * as SIWEService from "./siweService";

export const useSiweAuth = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { signMessageAsync } = useSignMessage();

  const [nonce, setNonce] = useState<string | undefined>();

  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<{
    loggedIn: boolean;
    address?: string | undefined;
    chainId?: number | undefined;
  }>({ loggedIn: false });

  const getNonce = async () => {
    const nonce = await SIWEService.getNonce();
    setNonce(nonce);
  };

  const getProfile = async () => {
    const profile = await SIWEService.profile();
    setProfileData(profile);
  };

  useEffect(() => {
    getNonce();
  }, []);

  useEffect(() => {
    getProfile();

    window.addEventListener("focus", getProfile);
    return () => window.removeEventListener("focus", getProfile);
  }, []);

  useOnChange(address, (newVal, prevVal) => {
    if (prevVal && !newVal) logout();
    if (prevVal && newVal && prevVal !== newVal) logout();
  });

  useEffect(() => {
    if (address && profileData.address && address !== profileData.address) logout();
  }, [address, profileData]);

  const signIn = async (): Promise<{ ok: boolean }> => {
    try {
      const chainId = chain?.id;
      if (!address || !chainId) return { ok: false };

      setIsSigningIn(true);

      // Create SIWE message with pre-fetched nonce and sign with wallet
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Hats.finance wants you to Sign In With Ethereum in order to execute that action.",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      });
      const signature = await signMessageAsync({ message: message.prepareMessage() });

      // Verify signature
      const verifyOk = await SIWEService.verifyMessage(message, signature);
      if (!verifyOk) throw new Error("Error verifying message");

      setIsSigningIn(false);
      getProfile();

      return { ok: true };
    } catch (error) {
      console.log(error);

      setIsSigningIn(false);
      setNonce(undefined);
      getNonce();

      return { ok: false };
    }
  };

  const tryAuthentication = async (): Promise<boolean> => {
    if (!profileData.loggedIn) {
      const authenticated = (await signIn()).ok;
      return authenticated;
    }

    return true;
  };

  const logout = async (): Promise<void> => {
    await SIWEService.logout();
    setProfileData({ loggedIn: false });
  };

  return { signIn, logout, isSigningIn, profileData, isAuthenticated: profileData.loggedIn, tryAuthentication };
};
