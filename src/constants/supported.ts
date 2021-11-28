import { IAssetData } from "../helpers/types";

interface ISupportedChains {
  [chainId: number]: {
    name: string;
    chainId: number;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    assets: string[];
    blockExplorerUrl: string;
    rpcUrl?: string; // used for walletconnect provider.
  };
}

export const SUPPORTED_CHAINS: ISupportedChains = {
  1: {
    name: "Ethereum",
    chainId: 1,
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    assets: ["eth", "dai"],
    blockExplorerUrl: "https://etherscan.io",
  },
  3: {
    name: "Ethereum Ropsten Testnet",
    chainId: 3,
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    assets: ["eth", "dai"],
    blockExplorerUrl: "https://ropsten.etherscan.io",
  },
  4: {
    name: "Ethereum Rinkeby Testnet",
    chainId: 4,
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    assets: ["eth", "dai"],
    blockExplorerUrl: "https://rinkeby.etherscan.io",
  },
  5: {
    name: "Ethereum Goerli Testnet",
    chainId: 5,
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    assets: ["eth", "dai"],
    blockExplorerUrl: "https://goerli.etherscan.io/",
  },
  10: {
    name: "Optimism Mainnet",
    chainId: 10,
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    assets: ["eth", "dai"],
    blockExplorerUrl: "https://optimistic.etherscan.io",
    rpcUrl: "https://mainnet.optimism.io",
  },
  69: {
    name: "Optimism Kovan Testnet",
    chainId: 69,
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    assets: ["eth", "dai"],
    blockExplorerUrl: "https://kovan-optimistic.etherscan.io",
    rpcUrl: "https://kovan.optimism.io",
  },
  100: {
    name: "xDAI",
    chainId: 100,
    nativeCurrency: {
      name: "Dai",
      symbol: "DAI",
      decimals: 18,
    },
    assets: ["xdai"],
    blockExplorerUrl: "https://blockscout.com/poa/dai",
  },
  42161: {
    name: "Arbitrum Mainnet",
    chainId: 42161,
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    assets: ["eth", "dai"],
    blockExplorerUrl: "https://arbiscan.io",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
  },
  421611: {
    name: "Arbitrum Rinkeby Testnet",
    chainId: 421611,
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    assets: ["eth", "dai"],
    blockExplorerUrl: "https://rinkeby-explorer.arbitrum.io",
    rpcUrl: " https://rinkeby.arbitrum.io/rpc",
  },
};

export const RPC_URLS_FOR_SUPPORTED_CHAINS = 
  Object.keys(SUPPORTED_CHAINS).reduce(function(result, key) {
    if (SUPPORTED_CHAINS[key].rpcUrl !== undefined)
      result[key] = SUPPORTED_CHAINS[key].rpcUrl 
    return result
  }, {});

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
  5: {
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
      contractAddress: "0x73967c6a0904aa032c103b4104747e88c566b1a2",
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
  },
  42161: {
    eth: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: "18",
      contractAddress: "",
    },
  },
};
