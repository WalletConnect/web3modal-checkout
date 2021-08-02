import { IAssetData } from "../helpers/types";

interface ISupportedChains {
  [chainId: number]: {
    name: string;
    chainId: number;
    assets: string[];
    blockExplorerUrl: string;
  };
}

export const SUPPORTED_CHAINS: ISupportedChains = {
  1: {
    name: "Ethereum",
    chainId: 1,
    assets: ["eth", "dai"],
    blockExplorerUrl: "https://etherscan.io",
  },
  3: {
    name: "Ethereum Ropsten Testnet",
    chainId: 3,
    assets: ["eth", "dai"],
    blockExplorerUrl: "https://ropsten.etherscan.io",

  },
  4: {
    name: "Ethereum Rinkeby Testnet",
    chainId: 4,
    assets: ["eth", "dai"],
    blockExplorerUrl: "https://rinkeby.etherscan.io",
  },
  10: {
    name: "Optimism Mainnet",
    chainId: 10,
    assets: ["eth", "dai"],
    blockExplorerUrl: "https://optimistic.etherscan.io",
  },
  69: {
    name: "Optimism Kovan Testnet",
    chainId: 69,
    assets: ["eth", "dai"],
    blockExplorerUrl: "https://kovan-optimistic.etherscan.io",
  },
  100: {
    name: "xDAI",
    chainId: 100,
    assets: ["xdai"],
    blockExplorerUrl: "https://blockscout.com/poa/dai",
  },
  42161: {
    name: "Arbitrum Mainnet",
    chainId: 42161,
    assets: ["eth", "dai"],
    blockExplorerUrl: "https://explorer.arbitrum.io",
  },
  421611: {
    name: "Arbitrum Rinkeby Testnet",
    chainId: 421611,
    assets: ["eth", "dai"],
    blockExplorerUrl: "https://rinkeby-explorer.arbitrum.io",
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
    dai: {
      symbol: "DAI",
      name: "DAI Stablecoin",
      decimals: "18",
      contractAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
    },
  },
  3: {
    eth: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: "18",
      contractAddress: "",
    },
    dai: {
      symbol: "DAI",
      name: "DAI Stablecoin",
      decimals: "18",
      contractAddress: "0xad6d458402f60fd3bd25163575031acdce07538d",
    },
  },
  4: {
    eth: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: "18",
      contractAddress: "",
    },
    dai: {
      symbol: "DAI",
      name: "DAI Stablecoin",
      decimals: "18",
      contractAddress: "0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735",
    },
  },
  10: {
    eth: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: "18",
      contractAddress: "",
    },
    dai: {
      symbol: "DAI",
      name: "DAI Stablecoin",
      decimals: "18",
      contractAddress: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
    },
  },
  69: {
    eth: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: "18",
      contractAddress: "",
    },
    dai: {
      symbol: "DAI",
      name: "DAI Stablecoin",
      decimals: "18",
      contractAddress: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
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
  421611: {
    eth: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: "18",
      contractAddress: ""
    },
  //   dai: {
  //     symbol: "DAI",
  //     name: "DAI Stablecoin",
  //     decimals: "18",
  //     contractAddress: "TODO",
  //   },
  },
  42161: {
    eth: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: "18",
      contractAddress: "",
    },
  //   dai: {
  //     symbol: "DAI",
  //     name: "DAI Stablecoin",
  //     decimals: "18",
  //     contractAddress: "TODO",
  //   },
  },
};
