import { Chain } from "@wagmi/core";

export const meter = {
  id: 82,
  name: "Meter",
  network: "meter",
  nativeCurrency: {
    decimals: 18,
    name: "MeterStable",
    symbol: "MTR",
  },
  rpcUrls: {
    public: { http: ["https://meter.blockpi.network/v1/rpc/public"] },
    default: { http: ["https://meter.blockpi.network/v1/rpc/public"] },
  },
  blockExplorers: {
    etherscan: { name: "Meter Explorer", url: "https://scan.meter.io " },
    default: { name: "Meter Explorer", url: "https://scan.meter.io " },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 11_907_934,
    },
  },
} as const satisfies Chain;
