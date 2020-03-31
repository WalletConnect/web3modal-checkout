import { IAssetData } from "../helpers/types";

interface ISupportedAssets {
  [chainId: number]: {
    [assetSymbol: string]: IAssetData;
  };
}

const SUPPORTED_ASSETS: ISupportedAssets = {
  1: {
    ETH: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: "18",
      contractAddress: ""
    },
    DAI: {
      symbol: "DAI",
      name: "DAI Stablecoin v1.0",
      decimals: "18",
      contractAddress: "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359"
    }
  },
  100: {
    xDAI: {
      symbol: "xDAI",
      name: "xDAI",
      decimals: "18",
      contractAddress: ""
    }
  }
};

export default SUPPORTED_ASSETS;
