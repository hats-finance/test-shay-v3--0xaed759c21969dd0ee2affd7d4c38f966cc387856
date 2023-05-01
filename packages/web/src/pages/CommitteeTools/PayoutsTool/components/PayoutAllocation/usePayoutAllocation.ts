import { IPayoutResponse, IVault } from "@hats-finance/shared";
import { BigNumber, ethers } from "ethers";
import { useVaults } from "hooks/vaults/useVaults";
import millify from "millify";
import { Amount } from "utils/amounts.utils";

type PayoutAllocationAmount = {
  tokens: { formatted: string; number: string };
  usd: { formatted: string; number: string };
  percentage: string | undefined;
};

type PayoutAllocation = {
  immediateAmount: PayoutAllocationAmount | undefined;
  vestedAmount: PayoutAllocationAmount | undefined;
  hatsRewardAmount: PayoutAllocationAmount | undefined;
  committeeAmount: PayoutAllocationAmount | undefined;
  governanceAmount: PayoutAllocationAmount | undefined;
  totalAmount: PayoutAllocationAmount | undefined;
  totalHackerAmount: PayoutAllocationAmount | undefined;
};

const DEFAULT_RETURN: PayoutAllocation = {
  immediateAmount: undefined,
  vestedAmount: undefined,
  hatsRewardAmount: undefined,
  committeeAmount: undefined,
  governanceAmount: undefined,
  totalAmount: undefined,
  totalHackerAmount: undefined,
};

/**
 * This hook is used to calculate the payout allocation for a specific payout.
 *
 * @remarks It works with single and split payout. And with V1 and V2 vaults.
 *
 * @param vault The vault that the payout is related to
 * @param payout The payout that we want to calculate the allocation
 * @param percentageToPayOfTheVault The percentage of the vault that we want to pay for this specific payout
 * @param percentageOfPayout The percentage of the whole payout that we want to pay for this specific beneficiary. This
 * is only used when the payout is splitted between multiple beneficiaries.
 */
export const usePayoutAllocation = (
  vault: IVault | undefined,
  payout: IPayoutResponse | undefined,
  percentageToPayOfTheVault: string | undefined,
  percentageOfPayout?: string | undefined
): PayoutAllocation => {
  const { payouts, tokenPrices } = useVaults();

  // We need to multiply the results by the percentage of the payout that we want to pay for this specific beneficiary. This is
  // only used when we want to split the payout between multiple beneficiaries
  const beneficiaryFactor = percentageOfPayout ? Number(percentageOfPayout) / 100 : 1;

  if (!payout || !vault || !percentageToPayOfTheVault) return DEFAULT_RETURN;

  const tokenAddress = vault.stakingToken;
  const tokenSymbol = vault.stakingTokenSymbol;
  const tokenDecimals = vault.stakingTokenDecimals;
  const tokenPrice = tokenPrices?.[tokenAddress] ?? 0;

  // Check if this payout is already created on chain
  const payoutOnChainData = payouts?.find((p) => p.id === payout.payoutClaimId);

  if (payoutOnChainData?.approvedAt) {
    // If payout is already created on chain, we can use the data from the contract
    const immediateSplit = new Amount(
      BigNumber.from(payoutOnChainData.hackerReward).mul(beneficiaryFactor),
      tokenDecimals,
      tokenSymbol
    );
    const vestedSplit = new Amount(
      BigNumber.from(payoutOnChainData.hackerVestedReward).mul(beneficiaryFactor),
      tokenDecimals,
      tokenSymbol
    );
    const hatsRewardSplit = new Amount(
      BigNumber.from(payoutOnChainData.hackerHatReward).mul(beneficiaryFactor),
      tokenDecimals,
      tokenSymbol
    );
    const committeeSplit = new Amount(
      BigNumber.from(payoutOnChainData.committeeReward).mul(beneficiaryFactor),
      tokenDecimals,
      tokenSymbol
    );
    const governanceSplit = new Amount(
      BigNumber.from(payoutOnChainData.governanceHatReward).mul(beneficiaryFactor),
      tokenDecimals,
      tokenSymbol
    );
    const totalHackerSplit = new Amount(immediateSplit.bigNumber.add(vestedSplit.bigNumber), tokenDecimals, tokenSymbol);
    const totalSplit = new Amount(
      immediateSplit.bigNumber
        .add(vestedSplit.bigNumber)
        .add(hatsRewardSplit.bigNumber)
        .add(committeeSplit.bigNumber)
        .add(governanceSplit.bigNumber),
      tokenDecimals,
      tokenSymbol
    );

    return {
      immediateAmount:
        immediateSplit.number > 0
          ? {
              tokens: { formatted: immediateSplit.formatted(5), number: immediateSplit.formattedWithoutSymbol(5) },
              usd: {
                formatted: `${millify(immediateSplit.number * tokenPrice, { precision: 2 })}$`,
                number: millify(immediateSplit.number * tokenPrice, { precision: 2 }),
              },
              percentage: `${millify((immediateSplit.number / totalSplit.number) * 100, { precision: 2 })}%`,
            }
          : undefined,
      vestedAmount:
        vestedSplit.number > 0
          ? {
              tokens: { formatted: vestedSplit.formatted(5), number: vestedSplit.formattedWithoutSymbol(5) },
              usd: {
                formatted: `${millify(vestedSplit.number * tokenPrice, { precision: 2 })}$`,
                number: millify(vestedSplit.number * tokenPrice, { precision: 2 }),
              },
              percentage: `${millify((vestedSplit.number / totalSplit.number) * 100, { precision: 2 })}%`,
            }
          : undefined,
      hatsRewardAmount:
        hatsRewardSplit.number > 0
          ? {
              tokens: { formatted: hatsRewardSplit.formatted(5), number: hatsRewardSplit.formattedWithoutSymbol(5) },
              usd: {
                formatted: `${millify(hatsRewardSplit.number * tokenPrice, { precision: 2 })}$`,
                number: millify(hatsRewardSplit.number * tokenPrice, { precision: 2 }),
              },
              percentage: `${millify((hatsRewardSplit.number / totalSplit.number) * 100, { precision: 2 })}%`,
            }
          : undefined,
      committeeAmount:
        committeeSplit.number > 0
          ? {
              tokens: { formatted: committeeSplit.formatted(5), number: committeeSplit.formattedWithoutSymbol(5) },
              usd: {
                formatted: `${millify(committeeSplit.number * tokenPrice, { precision: 2 })}$`,
                number: millify(committeeSplit.number * tokenPrice, { precision: 2 }),
              },
              percentage: `${millify((committeeSplit.number / totalSplit.number) * 100, { precision: 2 })}%`,
            }
          : undefined,
      governanceAmount:
        governanceSplit.number > 0
          ? {
              tokens: { formatted: governanceSplit.formatted(5), number: governanceSplit.formattedWithoutSymbol(5) },
              usd: {
                formatted: `${millify(governanceSplit.number * tokenPrice, { precision: 2 })}$`,
                number: millify(governanceSplit.number * tokenPrice, { precision: 2 }),
              },
              percentage: `${millify((governanceSplit.number / totalSplit.number) * 100, { precision: 2 })}%`,
            }
          : undefined,
      totalHackerAmount:
        totalHackerSplit.number > 0
          ? {
              tokens: { formatted: totalHackerSplit.formatted(5), number: totalHackerSplit.formattedWithoutSymbol(5) },
              usd: {
                formatted: `${millify(totalHackerSplit.number * tokenPrice, { precision: 2 })}$`,
                number: millify(totalHackerSplit.number * tokenPrice, { precision: 2 }),
              },
              percentage: `${millify((totalHackerSplit.number / totalSplit.number) * 100, { precision: 2 })}%`,
            }
          : undefined,
      totalAmount:
        totalSplit.number > 0
          ? {
              tokens: { formatted: totalSplit.formatted(5), number: totalSplit.formattedWithoutSymbol(5) },
              usd: {
                formatted: `${millify(totalSplit.number * tokenPrice, { precision: 2 })}$`,
                number: millify(totalSplit.number * tokenPrice, { precision: 2 }),
              },
              percentage: undefined,
            }
          : undefined,
    };
  } else {
    // If payout is not created on chain, we calculate the amount in real time (based on the vault balance and the percentage to pay)
    const immediatePercentage = +vault.hackerRewardSplit / 100 / 100;
    const vestedPercentage = +vault.hackerVestedRewardSplit / 100 / 100;
    const committeePercentage = +vault.committeeRewardSplit / 100 / 100;
    const governancePercentage = BigNumber.from(vault.governanceHatRewardSplit).eq(ethers.constants.MaxUint256)
      ? +vault.master.defaultGovernanceHatRewardSplit / 100 / 100
      : +vault.governanceHatRewardSplit / 100 / 100;
    const hatsRewardPercentage = BigNumber.from(vault.hackerHatRewardSplit).eq(ethers.constants.MaxUint256)
      ? +vault.master.defaultHackerHatRewardSplit / 100 / 100
      : +vault.hackerHatRewardSplit / 100 / 100;

    // In v2 vaults the split sum (immediate, vested, committee) is 100%. So we need to calculate the split factor to get the correct values.
    // In v1 this is not a probem. So the factor is 1.
    const splitFactor = vault.version === "v1" ? 1 : 1 - Number(governancePercentage) - Number(hatsRewardPercentage);
    const vaultBalance = new Amount(BigNumber.from(vault.honeyPotBalance), tokenDecimals, tokenSymbol).number;
    const payoutFactor = (+percentageToPayOfTheVault / 100) * beneficiaryFactor;

    const immediateSplit = vaultBalance * immediatePercentage * splitFactor * payoutFactor;
    const vestedSplit = vaultBalance * vestedPercentage * splitFactor * payoutFactor;
    const committeeSplit = vaultBalance * committeePercentage * splitFactor * payoutFactor;
    const governanceSplit = vaultBalance * governancePercentage * payoutFactor;
    const hatsRewardSplit = vaultBalance * hatsRewardPercentage * payoutFactor;
    const totalHackerSplit = immediateSplit + vestedSplit;
    const totalSplit = immediateSplit + vestedSplit + hatsRewardSplit + committeeSplit + governanceSplit;

    return {
      immediateAmount:
        immediateSplit > 0
          ? {
              tokens: {
                formatted: `${millify(immediateSplit, { precision: 5 })} ${tokenSymbol}`,
                number: millify(immediateSplit, { precision: 5 }),
              },
              usd: {
                formatted: `${millify(immediateSplit * tokenPrice, { precision: 2 })}$`,
                number: millify(immediateSplit * tokenPrice, { precision: 2 }),
              },
              percentage: `${millify((immediateSplit / totalSplit) * 100, { precision: 2 })}%`,
            }
          : undefined,
      vestedAmount:
        vestedSplit > 0
          ? {
              tokens: {
                formatted: `${millify(vestedSplit, { precision: 5 })} ${tokenSymbol}`,
                number: millify(vestedSplit, { precision: 5 }),
              },
              usd: {
                formatted: `${millify(vestedSplit * tokenPrice, { precision: 2 })}$`,
                number: millify(vestedSplit * tokenPrice, { precision: 2 }),
              },
              percentage: `${millify((vestedSplit / totalSplit) * 100, { precision: 2 })}%`,
            }
          : undefined,
      hatsRewardAmount:
        hatsRewardSplit > 0
          ? {
              tokens: {
                formatted: `${millify(hatsRewardSplit, { precision: 5 })} ${tokenSymbol}`,
                number: millify(hatsRewardSplit, { precision: 5 }),
              },
              usd: {
                formatted: `${millify(hatsRewardSplit * tokenPrice, { precision: 2 })}$`,
                number: millify(hatsRewardSplit * tokenPrice, { precision: 2 }),
              },
              percentage: `${millify((hatsRewardSplit / totalSplit) * 100, { precision: 2 })}%`,
            }
          : undefined,
      committeeAmount:
        committeeSplit > 0
          ? {
              tokens: {
                formatted: `${millify(committeeSplit, { precision: 5 })} ${tokenSymbol}`,
                number: millify(committeeSplit, { precision: 5 }),
              },
              usd: {
                formatted: `${millify(committeeSplit * tokenPrice, { precision: 2 })}$`,
                number: millify(committeeSplit * tokenPrice, { precision: 2 }),
              },
              percentage: `${millify((committeeSplit / totalSplit) * 100, { precision: 2 })}%`,
            }
          : undefined,
      governanceAmount:
        governanceSplit > 0
          ? {
              tokens: {
                formatted: `${millify(governanceSplit, { precision: 5 })} ${tokenSymbol}`,
                number: millify(governanceSplit, { precision: 5 }),
              },
              usd: {
                formatted: `${millify(governanceSplit * tokenPrice, { precision: 2 })}$`,
                number: millify(governanceSplit * tokenPrice, { precision: 2 }),
              },
              percentage: `${millify((governanceSplit / totalSplit) * 100, { precision: 2 })}%`,
            }
          : undefined,
      totalHackerAmount:
        totalHackerSplit > 0
          ? {
              tokens: {
                formatted: `${millify(totalHackerSplit, { precision: 5 })} ${tokenSymbol}`,
                number: millify(totalHackerSplit, { precision: 5 }),
              },
              usd: {
                formatted: `${millify(totalHackerSplit * tokenPrice, { precision: 2 })}$`,
                number: millify(totalHackerSplit * tokenPrice, { precision: 2 }),
              },
              percentage: `${millify((totalHackerSplit / totalSplit) * 100, { precision: 2 })}%`,
            }
          : undefined,
      totalAmount:
        totalSplit > 0
          ? {
              tokens: {
                formatted: `${millify(totalSplit, { precision: 5 })} ${tokenSymbol}`,
                number: millify(totalSplit, { precision: 5 }),
              },
              usd: {
                formatted: `${millify(totalSplit * tokenPrice, { precision: 2 })}$`,
                number: millify(totalSplit * tokenPrice, { precision: 2 }),
              },
              percentage: undefined,
            }
          : undefined,
    };
  }
};
