import { IAssetData } from "../helpers/types";

interface ISupportedChains {
  [network: string]: {
    name: string;
    chainId: number;
    assets: string[];
  };
}

export const SUPPORTED_CHAINS: ISupportedChains = {
  mainnet: {
    name: "Ethereum",
    chainId: 1,
    assets: ["eth", "sai", "dai"],
  },
  xdai: {
    name: "xDAI",
    chainId: 100,
    assets: ["xdai"],
  },
};

interface ISupportedAssets {
  [chainId: number]: {
    [assetSymbol: string]: IAssetData;
  };
}

export const SUPPORTED_ASSETS: ISupportedAssets = {
  1: {
    eth: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: "18",
      contractAddress: "",
    },
    sai: {
      symbol: "SAI",
      name: "SAI Stablecoin",
      decimals: "18",
      contractAddress: "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
    },
    dai: {
      symbol: "DAI",
      name: "DAI Stablecoin",
      decimals: "18",
      contractAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
    },
  },
  100: {
    xdai: {
      symbol: "xDAI",
      name: "xDAI",
      decimals: "18",
      contractAddress: "",
    },
  },
};
