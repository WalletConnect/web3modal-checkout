import * as React from "react";
import styled from "styled-components";
import { BigNumber, Contract, providers, utils } from "ethers";

import Web3Modal from "web3modal";
import { CHAIN_DATA_LIST } from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Fortmatic from "fortmatic";
import Torus from "@toruslabs/torus-embed";
import Portis from "@portis/web3";
import Authereum from "authereum";

import Column from "./components/Column";
import Wrapper from "./components/Wrapper";
import Header from "./components/Header";
import ConnectButton from "./components/ConnectButton";
import PaymentResult from "./components/PaymentResult";

import {
  parseQueryString,
  appendToQueryString,
  checkRequiredParams,
  toHex
} from "./helpers/utilities";
import { IAssetData, IChainData, IPayment } from "./helpers/types";
import { fonts } from "./styles";
import {
  PAYMENT_SUCCESS,
  PAYMENT_FAILURE,
  PAYMENT_PENDING,
} from "./constants/paymentStatus";
import { RPC_URLS_FOR_SUPPORTED_CHAINS, SUPPORTED_ASSETS, SUPPORTED_CHAINS } from "./constants/supported";
import { ERC20 } from "./helpers/abi";
import { getChain } from "./helpers/chains";

const SLayout = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  text-align: center;
`;

const SContent = styled(Wrapper)`
  width: 100%;
  height: 100%;
  padding: 0 16px;
`;

const SLanding = styled(Column as any)`
  height: 600px;
`;

const SBalances = styled(SLanding as any)`
  height: 100%;
  & h3 {
    padding-top: 30px;
  }
`;

const SPaymentRequestDescription = styled.p`
  & span {
    font-weight: ${fonts.weight.bold};
  }
`;

const SDisplayTxHash = styled.a`
  cursor: pointer;
  font-weight: ${fonts.weight.semibold};
  font-family: ${fonts.family.RobotoMono};
`;

interface IPaymentRequest {
  chainId: number;
  currency: string;
  amount: string;
  to: string;
  callbackUrl: string;
  data: string;
}

interface IAppState {
  connected: boolean;
  address: string; //to render on homepage
  chain: IChainData | undefined;
  expectedNetwork: string;
  provider: providers.Web3Provider | undefined;
  paymentRequest: IPaymentRequest | undefined;
  paymentStatus: IPayment | undefined;
  errorMsg: string;
}

const INITIAL_STATE: IAppState = {
  connected: false,
  address: "",
  chain: undefined,
  expectedNetwork: "mainnet",
  provider: undefined,
  paymentRequest: undefined,
  paymentStatus: undefined,
  errorMsg: "",
};

let accountInterval: any = undefined;

class App extends React.Component<any, any> {
  // @ts-ignore
  public web3Modal: Web3Modal;
  public state: IAppState;

  constructor(props: any) {
    super(props);
    this.state = {
      ...INITIAL_STATE,
      paymentRequest: this.getPaymentRequest(),
    };
    // if there is a payment network, set the expected Network (defaults to mainnet otherwise)
    if (this.state.paymentRequest) {
      this.state.expectedNetwork = CHAIN_DATA_LIST[this.state.paymentRequest.chainId].network;
    }
    this.web3Modal = new Web3Modal({
      network: this.state.expectedNetwork,
      cacheProvider: true,
      providerOptions: this.getProviderOptions(),
    });
  }

  // Connect on wallet on page load and subscribe to events.
  async componentDidMount() {
    const web3Provider = await this.web3Modal.connect();
    await this.connectToApp();

    // Subscribe to events
    web3Provider.on("disconnect", () => this.resetApp());

    web3Provider.on("accountsChanged", async (accounts: string[]) => {
      this.setState({ address: accounts[0] })
      await this.pay();
    });

    web3Provider.on("chainChanged", async (chainId: number) => {
      const chain = await getChain(`eip155:${chainId}`);
      this.setState({ chain });
      await this.pay();
    });
  };


  public connectToApp = async () => {
    const web3Provider = await this.web3Modal.connect();
    const ethersProvider = new providers.Web3Provider(web3Provider, "any");
    const { chainId } = await ethersProvider.getNetwork();
    const chain = await getChain(`eip155:${chainId}`);
    const address = await ethersProvider.getSigner().getAddress();

    this.setState({
      provider: ethersProvider,
      connected: true,
      address, //needed to render on home page
      chain
    });
  }


  public addNetwork = async () => {
    try {
      if (!this.state.paymentRequest) {
        throw new Error("No payment request found");
      }

      const requiredChainId = this.state.paymentRequest!.chainId
      const requiredChainDetails = SUPPORTED_CHAINS[requiredChainId]
      const params = {
        chainId: toHex(requiredChainId),
        chainName: requiredChainDetails.name,
        nativeCurrency: {
          name: requiredChainDetails.nativeCurrency.name,
          symbol: requiredChainDetails.nativeCurrency.symbol,
          decimals: requiredChainDetails.nativeCurrency.decimals,
        },
        rpcUrls: [requiredChainDetails.rpcUrl],
        blockExplorerUrls: [requiredChainDetails.blockExplorerUrl]
      }

      await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [params],
      });
    } catch (error) {
      return this.displayErrorMessage(`Error occurred - ${error.message}`);
    } 
  }

  public pay = async () => {
    if (!this.state.connected) {
      await this.connectToApp();
    }
    // check that the right chain was connected to!
    if (this.state.paymentRequest && this.state.chain!.chainId !== this.state.paymentRequest!.chainId) {
      return this.displayErrorMessage(`Please switch to ${this.state.expectedNetwork}`);
    }
    await this.requestTransaction();
  }

  public getProviderOptions = () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: "8733c260b59e445e85ee90bd80d869aa",//process.env.REACT_APP_INFURA_ID,
          rpc: RPC_URLS_FOR_SUPPORTED_CHAINS, //for chain IDs that wallet connect hasn't configured infura for yet.
        },
      },
      torus: {
        package: Torus,
        options: {},
      },
      fortmatic: {
        package: Fortmatic,
        options: {
          key: process.env.REACT_APP_FORTMATIC_KEY,
        },
      },
      portis: {
        package: Portis,
        options: {
          id: process.env.REACT_APP_PORTIS_ID,
        },
      },
      authereum: {
        package: Authereum,
        options: {},
      },
    };
    return providerOptions;
  };

  public getPaymentRequest = () => {
    let result: IPaymentRequest | undefined = undefined;
    if (typeof window !== "undefined") {
      const queryString = window.location.search;
      if (queryString && queryString.trim()) {
        const queryParams = parseQueryString(queryString);
        if (Object.keys(queryParams).length) {
          try {
            checkRequiredParams(queryParams, ["currency", "amount", "to"]);
            result = {
              currency: queryParams.currency,
              amount: queryParams.amount,
              to: queryParams.to,
              callbackUrl: decodeURIComponent(queryParams.callbackUrl) || "",
              chainId: parseInt(queryParams.chainId) || 1,
              data: queryParams.data || "",
            };
            // check network support:
            if (typeof SUPPORTED_CHAINS[result.chainId] === "undefined") {
              throw new Error("The app can't handle this network currently...");
            }
          } catch (error) {
            result = undefined;
            console.error(error);
          }
        }
      }
    }
    return result;
  };

  
  public clearErrorMessage = () => this.setState({ errorMsg: "" });

  public displayErrorMessage = (errorMsg: string) => {
    this.setState({ errorMsg });
    if (this.state.connected) {
      this.updatePaymentStatus(PAYMENT_FAILURE);
    }
  };

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
    const { provider, paymentRequest } = this.state;
    if (paymentRequest) {
      const { amount, to, data, callbackUrl } = paymentRequest;
      const assetSymbol = paymentRequest.currency.toLowerCase();
      if (typeof provider === "undefined") {
        return this.displayErrorMessage(
          "Wallet Provider selected is unavailable"
        );
      }
      let asset: IAssetData;
      try {
        asset = this.getAsset(assetSymbol, paymentRequest.chainId);
      } catch (e) {
        return this.displayErrorMessage(e.message);
      }

      this.updatePaymentStatus(PAYMENT_PENDING);
      try {
        let txHash: string | undefined = undefined;
        if (asset.contractAddress) {
          const contract = new Contract(
            asset.contractAddress,
            ERC20.abi,
            provider.getSigner()
          );
          const tx = await contract.transfer(
            to,
            utils.parseUnits(amount, BigNumber.from(asset.decimals))
          );
          txHash = tx.hash;
        } else {
          const tx = await provider.getSigner().sendTransaction({
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
          return this.displayErrorMessage(error.data.message);
        }
        return this.displayErrorMessage(error.message);
      }
    } else {
      return this.displayErrorMessage("Payment request missing or invalid");
    }
  };

  public updatePaymentStatus = (status: string, result: any = undefined) => {
    this.setState({ paymentStatus: { status, result } });
  }

  public redirectToCallbackUrl = () => {
    const { paymentRequest, paymentStatus } = this.state;
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

  public resetApp = async () => {
    const { provider } = this.state;
    if (
      provider &&
      (provider.provider as WalletConnectProvider).isWalletConnect
    ) {
      await (provider.provider as WalletConnectProvider).close();
    }
    clearInterval(accountInterval);
    this.setState({ ...INITIAL_STATE });
  };

  public renderTxHash = () => {
    const { paymentRequest, paymentStatus } = this.state;
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
    const {
      connected,
      address,
      chain,
      errorMsg,
      paymentRequest,
      paymentStatus,
    } = this.state;
    const btn = 
      paymentRequest ? 
        chain?.chainId === paymentRequest!.chainId 
          ? <ConnectButton label="Pay" onClick={this.pay} />
          : <ConnectButton label="Add/Switch Network" onClick={this.addNetwork} />
      : <div></div>
    
    return (
      <SLayout>
        <Column maxWidth={1000} spanHeight>
          <Header
            connected={connected}
            address={address}
            chain={chain}
            killSession={this.resetApp}
          />
          <SContent>
            {!paymentRequest ? (
              <SBalances>
                <h3>Failed</h3>
                <p>{`Payment request not supported or invalid`}</p>
              </SBalances>
            ) : (
              <SLanding center>
                <h3>{`Payment Request`}</h3>

                <SPaymentRequestDescription>
                  {`Paying `}
                  <span>{`${paymentRequest.amount} ${paymentRequest.currency}`}</span>
                  {` to ${paymentRequest.to} on ${SUPPORTED_CHAINS[paymentRequest.chainId].name} network`}
                </SPaymentRequestDescription>
                {!paymentStatus ? btn : (
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
            )}
          </SContent>
        </Column>
      </SLayout>
    );
  };
}

export default App;
