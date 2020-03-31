import { convertNumberToHex, convertUtf8ToNumber } from "@walletconnect/utils";
import {
  convertAmountToRawNumber,
  multiply,
  add,
  smallerThan
} from "../helpers/bignumber";
import {
  apiGetAccountNonce,
  apiGetGasPrices,
  apiGetAccountBalance,
  apiGetTokenBalance
} from "../helpers/api";
import {
  getDataString,
  removeHexPrefix,
  sanitizeHex
} from "../helpers/utilities";
import FUNCTIONS from "../constants/functions";
import SUPPORTED_ASSETS from "../constants/supportedAssets";
import { IAssetData } from "./types";

export function getAsset(symbol: string, chainId: number) {
  let result: IAssetData | null = null;
  if (SUPPORTED_ASSETS[chainId]) {
    result = SUPPORTED_ASSETS[chainId][symbol] || null;
  }
  return result;
}

export function getSupportedTokens(chainId: number) {
  let result: string[] = [];
  const assetList = SUPPORTED_ASSETS[chainId];
  if (assetList) {
    const assetSymbols = Object.keys(assetList);
    result = assetSymbols.filter(symbol => isToken(assetList[symbol]));
  }
  return result;
}

export function isToken(asset: any) {
  return !!asset.contractAddress;
}

export async function formatTransaction(
  from: string,
  to: string,
  amount: string,
  symbol: string,
  chainId: number,
  customData: string
) {
  const supportedTokens = getSupportedTokens(chainId);
  const asset = getAsset(symbol, chainId);

  if (!asset) {
    throw new Error(`Currency ${symbol} not supported!`);
  }

  let value = "";
  let data = "";
  let gasLimit = 0;

  amount = convertAmountToRawNumber(amount);

  const nonce = await apiGetAccountNonce(from, chainId);

  const gasPrices = await apiGetGasPrices();
  const gasPrice = convertUtf8ToNumber(
    convertAmountToRawNumber(gasPrices.average.price, 9)
  );

  const eth = await apiGetAccountBalance(from, chainId);

  if (!isToken(asset)) {
    value = amount;
    data = customData || "0x";
    gasLimit = !customData ? 21000 : 40000;
    const gasTotal = multiply(gasPrice, gasLimit);
    const total = add(amount, gasTotal);

    if (smallerThan(eth.balance || "0", total)) {
      throw new Error(`ETH balance is not enough`);
    }
  } else if (supportedTokens.includes(asset.symbol)) {
    const dai = await apiGetTokenBalance(from, asset.contractAddress, chainId);
    value = "0x00";
    data = getDataString(FUNCTIONS.TOKEN_TRANSFER, [
      removeHexPrefix(to),
      removeHexPrefix(convertNumberToHex(amount))
    ]);
    gasLimit = 40000;
    to = asset.contractAddress;
    const gasTotal = multiply(gasPrice, gasLimit);

    if (smallerThan(dai.balance || "0", amount)) {
      throw new Error(`${asset.symbol} balance is not enough`);
    } else if (smallerThan(eth.balance || "0", gasTotal)) {
      throw new Error(`Not enough ETH to cover gas costs`);
    }
  } else {
    throw new Error(`Currency ${asset.symbol} not supported!`);
  }

  const tx = {
    from: sanitizeHex(from),
    to: sanitizeHex(to),
    nonce: nonce ? convertNumberToHex(nonce) : "",
    gasPrice: gasPrice ? convertNumberToHex(gasPrice) : "",
    gasLimit: gasLimit ? convertNumberToHex(gasLimit) : "",
    value: value ? convertNumberToHex(value) : "",
    data: data || "0x"
  };

  return tx;
}
