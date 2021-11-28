import * as React from "react";
import styled from "styled-components";
import { BigNumber, Contract, utils } from "ethers";

import Column from "./Column";
import ConnectButton from "./ConnectButton";
import PaymentResult from "./PaymentResult";

import { appendToQueryString } from "../helpers/utilities";
import { IAssetData, IPayment, IPaymentStatus } from "../helpers/types";
import { ERC20 } from "../helpers/abi";
import { fonts } from "../styles";
import {
  PAYMENT_SUCCESS,
  PAYMENT_FAILURE,
  PAYMENT_PENDING,
} from "../constants/paymentStatus";
import { SUPPORTED_ASSETS, SUPPORTED_CHAINS } from "../constants/supported";
import { addOrSwitchChain } from "../helpers/chains";


const SDisplayTxHash = styled.a`
  cursor: pointer;
  font-weight: ${fonts.weight.semibold};
  font-family: ${fonts.family.RobotoMono};
`;


const SLanding = styled(Column as any)`
  height: 600px;
`;


const SPaymentRequestDescription = styled.p`
  & span {
    font-weight: ${fonts.weight.bold};
  }
`;

interface IPaymentState {
  errorMsg: string;
  paymentStatus: IPayment | undefined;
}

class Payment extends React.Component<any, IPaymentState> {

  constructor(props: any) {
    super(props);
    this.state = {
      errorMsg: "",
      paymentStatus: undefined
    }
  }

  public pay = async () => {
    const { chain, paymentRequest, web3ModalProvider } = this.props;
    // check that the right chain was connected to!
    if (paymentRequest && chain.chainId !== paymentRequest.chainId) {
      try {
        await addOrSwitchChain(web3ModalProvider, paymentRequest.chainId);
      } catch (error) {
        //@ts-ignore
        this.displayErrorMessage(`Error while switching chains: ${error.message}`)
      }
    }
    await this.requestTransaction();
  }
  
  // Get asset details from constants based on chainID and token symbol.
  public getAsset = (assetSymbol: string, chainId: number): IAssetData => {
    let result: IAssetData | undefined = undefined;
    if (SUPPORTED_ASSETS[chainId]) {
      result = SUPPORTED_ASSETS[chainId][assetSymbol.toLowerCase()] || undefined;
    }
    if (typeof result === "undefined") {
      throw new Error(`Asset request is not supported: ${assetSymbol}`);
    }
    return result;
  };

  public requestTransaction = async () => {
    const { ethersProvider, paymentRequest } = this.props;
    if (paymentRequest) {
      const { amount, to, data, callbackUrl } = paymentRequest;
      const assetSymbol = paymentRequest.currency.toLowerCase();
      if (typeof ethersProvider === "undefined") {
        return this.displayErrorMessage(
          "Wallet Provider selected is unavailable"
        );
      }
      // Get asset
      let asset: IAssetData;
      try {
        asset = this.getAsset(assetSymbol, paymentRequest.chainId);
      } catch (e) {
        return this.displayErrorMessage(e.message);
      }

      this.updatePaymentStatus(PAYMENT_PENDING);
      try {
        // Do erc20 transfer or crypto transfer.
        let txHash: string | undefined = undefined;
        if (asset.contractAddress) { // erc20 transfer
          const contract = new Contract(
            asset.contractAddress,
            ERC20.abi,
            ethersProvider.getSigner()
          );
          const tx = await contract.transfer(
            to,
            utils.parseUnits(amount, BigNumber.from(asset.decimals))
          );
          txHash = tx.hash;
        } else { // crypto transfer
          const tx = await ethersProvider.getSigner().sendTransaction({
            to,
            value: utils.parseEther(amount),
            data: data || "0x",
          });
          txHash = tx.hash;
        }
        if (typeof txHash === "undefined") {
          return this.displayErrorMessage(`Failed or missing transaction`);
        }
        this.updatePaymentStatus(PAYMENT_SUCCESS, txHash);
        if (callbackUrl) {
          setTimeout(
            () => this.redirectToCallbackUrl(),
            2000 // 2 secs
          );
        }
      } catch (error) {
        console.error(error);
        if (error.data && error.data.message) {
          // Get better error message
          return this.displayErrorMessage(error.data.message);
        }
        return this.displayErrorMessage(error.message);
      }
    } else {
      return this.displayErrorMessage("Payment request missing or invalid");
    }
  };

  public updatePaymentStatus = (status: string, result: any = undefined) => {
    this.setState({ 
      paymentStatus: { 
        status: status as IPaymentStatus, 
        result: result 
      } 
    });
  }

  public redirectToCallbackUrl = () => {
    const { paymentRequest } = this.props;
    const { paymentStatus } = this.state;

    if (paymentRequest && paymentStatus) {
      if (typeof window !== "undefined") {
        // open callback if defined. decodeURIComponent returns string(undefiend).
        if (paymentRequest.callbackUrl!=="undefined") {
          const url = appendToQueryString(paymentRequest.callbackUrl, {
            txhash: paymentStatus.result,
            currency: paymentRequest.currency,
          });        
          window.open(url);
        }
      } else {
        return this.displayErrorMessage("Window is undefined");
      }
    }
  }

  public displayErrorMessage = (errorMsg: string) => {
    this.setState({ errorMsg: errorMsg });
    this.updatePaymentStatus(PAYMENT_FAILURE);
  };

  public renderTxHash = () => {
    const { paymentRequest } = this.props;
    const { paymentStatus } = this.state;

    if (paymentRequest && paymentStatus) {
      const txHash = paymentStatus.result;
      const url = `${SUPPORTED_CHAINS[paymentRequest.chainId].blockExplorerUrl}/tx/${txHash}`;
      return (
        <SDisplayTxHash href={url} target="blank" rel="noreferrer noopener">
          <hr />
          Transaction Hash: {txHash}
        </SDisplayTxHash>
      );
    }
    return undefined;
  };

  public render = () => {
    const {paymentRequest} = this.props;
    const {paymentStatus, errorMsg} = this.state;
    
    return (
      <SLanding center>
        <h3>{`Payment Request`}</h3>

        <SPaymentRequestDescription>
          {`Paying `}
          <span>{`${paymentRequest.amount} ${paymentRequest.currency}`}</span>
          {` to ${paymentRequest.to} on ${SUPPORTED_CHAINS[paymentRequest.chainId].name} network`}
        </SPaymentRequestDescription>
        {paymentStatus === undefined ? (
          <ConnectButton label="Pay" onClick={this.pay} />
        ) : (
          <PaymentResult
            height={300}
            payment={paymentStatus}
            description={
              paymentStatus.status === PAYMENT_FAILURE && errorMsg
                ? errorMsg
                : ""
            }
          />
        )}
        {paymentStatus &&
          paymentStatus.status === PAYMENT_SUCCESS &&
          this.renderTxHash()}
      </SLanding>
    )
  }
}

export default Payment;