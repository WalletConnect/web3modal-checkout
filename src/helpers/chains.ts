import axios from "axios";

import { SUPPORTED_CHAINS } from "../constants/supported";
import { IChainData } from "./types";
import { toHex } from "./utilities";

const EIP155_API_URL = "https://chainid.network/chains.json";

export async function getEip155Chains(): Promise<IChainData[]> {
  const { data } = await axios.get(EIP155_API_URL);
  return data;
}

export async function getEip155Chain(chainRef: number): Promise<IChainData> {
  const chains = await getEip155Chains();
  const chain = chains.find((x) => x.chainId === chainRef);
  if (!chain) {
    throw new Error(`No EIP155 chain found with chainId: eip155:${chainRef}`);
  }
  return chain;
}

export async function getChain(chainId: string) {
  const [namespace, reference] = chainId.split(":");
  switch (namespace) {
    case "eip155":
      return getEip155Chain(Number(reference));
    default:
      throw new Error(`Chain namespace not supported for chainId: ${chainId}`);
  }
}

 /**
  * Add a new network to wallet
  * @param web3ModalProvider 
  * @param requiredChainId of the network to add
  * @param infuraNetworkName to build infura URL if rpc not supplied in supported.ts
  */
export async function addOrSwitchChain(web3ModalProvider: any, requiredChainId: number, infuraNetworkName?: string) {
  const requiredChainDetails = SUPPORTED_CHAINS[requiredChainId]
  let networkRpcUrl = requiredChainDetails.rpcUrl
  // Nuild rpc url if none exists.
  if (networkRpcUrl === undefined)
    networkRpcUrl = `https://${infuraNetworkName}.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`;
    
  const params = {
    chainId: toHex(requiredChainId),
    chainName: requiredChainDetails.name,
    nativeCurrency: {
      name: requiredChainDetails.nativeCurrency.name,
      symbol: requiredChainDetails.nativeCurrency.symbol,
      decimals: requiredChainDetails.nativeCurrency.decimals,
    },
    rpcUrls: [networkRpcUrl],
    blockExplorerUrls: [requiredChainDetails.blockExplorerUrl]
  }

  await web3ModalProvider.request({
      method: 'wallet_addEthereumChain',
      params: [params],
  });
}
