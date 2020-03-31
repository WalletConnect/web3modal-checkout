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
    SAI: {
      symbol: "SAI",
      name: "SAI Stablecoin",
      decimals: "18",
      contractAddress: "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359"
    },
    DAI: {
      symbol: "DAI",
      name: "DAI Stablecoin",
      decimals: "18",
      contractAddress: "0x6b175474e89094c44da98b954eedeac495271d0f"
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
