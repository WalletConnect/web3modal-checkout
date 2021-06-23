import axios from "axios";

import { IChainData } from "./types";

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