export interface IAssetData {
  symbol: string;
  name: string;
  decimals: string;
  contractAddress?: string;
}

export interface IChainData {
  name: string;
  shortName: string;
  chain: string;
  network: string;
  chainId: number;
  networkId: number;
  nativeCurrency: IAssetData;
  rpc: string[];
  faucets: string[];
  infoURL: string;
}

export interface IGasPrice {
  time: number;
  price: number;
}

export interface IGasPrices {
  timestamp: number;
  slow: IGasPrice;
  average: IGasPrice;
  fast: IGasPrice;
}

export interface IParsedTx {
  timestamp: string;
  hash: string;
  from: string;
  to: string;
  nonce: string;
  gasPrice: string;
  gasUsed: string;
  fee: string;
  value: string;
  input: string;
  error: boolean;
  asset: IAssetData;
  operations: ITxOperation[];
}

export interface ITxOperation {
  asset: IAssetData;
  value: string;
  from: string;
  to: string;
  functionName: string;
}

export interface IPaymentRequest {
  chainId: number;
  currency: string;
  amount: string;
  to: string;
  callbackUrl: string;
  data: string;
}

export type IPaymentStatus = "pending" | "success" | "failure";

export interface IPayment {
  status: IPaymentStatus;
  result: any;
}
