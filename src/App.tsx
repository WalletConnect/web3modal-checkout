import * as React from "react";
import styled from "styled-components";
import Web3 from "web3";

import Web3Modal from "web3modal";
// @ts-ignore
import WalletConnectProvider from "@walletconnect/web3-provider";
// @ts-ignore
import Fortmatic from "fortmatic";
import Torus from "@toruslabs/torus-embed";
import Portis from "@portis/web3";
import Authereum from "authereum";

import Column from "./components/Column";
import Wrapper from "./components/Wrapper";
import Header from "./components/Header";
import Loader from "./components/Loader";
import ConnectButton from "./components/ConnectButton";
import PaymentResult from "./components/PaymentResult";

import { parseQueryString, getChainData } from "./helpers/utilities";
import { formatTransaction } from "./helpers/transaction";
import { IPayment } from "./helpers/types";
import { fonts } from "./styles";
import {
  PAYMENT_SUCCESS,
  PAYMENT_FAILURE,
  PAYMENT_PENDING
} from "./constants/paymentStatus";

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

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`;

const SLanding = styled(Column)`
  height: 600px;
`;

const SBalances = styled(SLanding)`
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
  currency: string;
  amount: string;
  to: string;
  // callbackUrl: string;
  data: string;
}

interface IAppState {
  fetching: boolean;
  address: string;
  web3: any;
  connected: boolean;
  chainId: number;
  paymentRequest: IPaymentRequest | null;
  paymentStatus: IPayment | null;
  errorMsg: string;
}

const INITIAL_STATE: IAppState = {
  fetching: false,
  address: "",
  web3: null,
  connected: false,
  chainId: 1,
  paymentRequest: null,
  paymentStatus: null,
  errorMsg: ""
};

let accountInterval: any = null;

function initWeb3(provider: any) {
  const web3: any = new Web3(provider);

  web3.eth.extend({
    methods: [
      {
        name: "chainId",
        call: "eth_chainId",
        outputFormatter: web3.utils.hexToNumber
      }
    ]
  });

  return web3;
}

function loadPaymentRequest(): IPaymentRequest | null {
  let result: IPaymentRequest | null = null;
  if (typeof window !== "undefined") {
    const queryString = window.location.search;
    if (queryString && queryString.trim()) {
      const queryParams = parseQueryString(queryString);
      if (Object.keys(queryParams).length) {
        if (!queryParams.currency) {
          console.error("No Currency Value Provided"); // tslint:disable-line
          return null;
        }
        if (!queryParams.amount) {
          console.error("No Amount Value Provided"); // tslint:disable-line
          return null;
        }
        if (!queryParams.to) {
          console.error("No Address Value Provided"); // tslint:disable-line
          return null;
        }
        // if (!queryParams.callbackUrl) {
        //   console.error("No Callback Url Provided"); // tslint:disable-line
        //   return null;
        // }
        result = {
          currency: queryParams.currency,
          amount: queryParams.amount,
          to: queryParams.to,
          // callbackUrl: decodeURIComponent(queryParams.callbackUrl),
          data: queryParams.data || ""
        };
      }
    }
  }
  return result;
}

class App extends React.Component<any, any> {
  // @ts-ignore
  public web3Modal: Web3Modal;
  public state: IAppState;

  constructor(props: any) {
    super(props);
    this.state = {
      ...INITIAL_STATE,
      paymentRequest: loadPaymentRequest()
    };
    this.web3Modal = new Web3Modal({
      network: this.getNetwork(),
      cacheProvider: true,
      providerOptions: this.getProviderOptions()
    });
  }

  public onConnect = async () => {
    const provider = await this.web3Modal.connect();

    await this.subscribeProvider(provider);

    const web3: any = initWeb3(provider);

    const accounts = await web3.eth.getAccounts();

    const address = accounts[0];

    const networkId = await web3.eth.net.getId();

    const chainId = await web3.eth.chainId();

    await this.setState({
      web3,
      provider,
      connected: true,
      address,
      chainId,
      networkId
    });
    await this.requestTransaction();
  };

  public getNetwork = () => getChainData(this.state.chainId).network;

  public getProviderOptions = () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.REACT_APP_INFURA_ID
        }
      },
      torus: {
        package: Torus,
        options: {}
      },
      fortmatic: {
        package: Fortmatic,
        options: {
          key: process.env.REACT_APP_FORTMATIC_KEY
        }
      },
      portis: {
        package: Portis,
        options: {
          id: process.env.REACT_APP_PORTIS_ID
        }
      },
      authereum: {
        package: Authereum,
        options: {}
      }
    };
    return providerOptions;
  };

  public subscribeProvider = async (provider: any) => {
    provider.on("close", () => this.resetApp());
    provider.on("accountsChanged", async (accounts: string[]) => {
      await this.setState({ address: accounts[0] });
    });
    provider.on("chainChanged", async (chainId: number) => {
      const { web3 } = this.state;
      const networkId = await web3.eth.net.getId();
      await this.setState({ chainId, networkId });
    });

    provider.on("networkChanged", async (networkId: number) => {
      const { web3 } = this.state;
      const chainId = await web3.eth.chainId();
      await this.setState({ chainId, networkId });
    });
  };

  public clearErrorMessage = () => this.setState({ errorMsg: "" });

  public displayErrorMessage = (errorMsg: string) => {
    this.setState({ errorMsg });
    if (this.state.connected) {
      this.updatePaymentStatus(PAYMENT_FAILURE);
    }
  };

  public requestTransaction = async () => {
    const { address, paymentRequest, chainId } = this.state;
    if (paymentRequest) {
      if (paymentRequest.currency.toLowerCase() === "eth" && chainId !== 1) {
        return this.displayErrorMessage(
          "Please switch to Ethereum Mainnet and refresh this page"
        );
      }
      if (paymentRequest.currency.toLowerCase() === "xdai" && chainId !== 100) {
        return this.displayErrorMessage(
          "Please switch to xDAI and refresh this page"
        );
      }
      this.updatePaymentStatus(PAYMENT_PENDING);
      try {
        const { currency, amount, to, data } = paymentRequest;
        const from = address;
        const tx = await formatTransaction(
          from,
          to,
          amount,
          currency,
          chainId,
          data
        );
        const txHash = await this.web3SendTransaction(tx);
        this.updatePaymentStatus(PAYMENT_SUCCESS, txHash);
        // setTimeout(
        //   () => this.redirectToCallbackUrl(),
        //   2000 // 2 secs
        // );
      } catch (error) {
        console.error(error); // tslint:disable-line
        return this.displayErrorMessage(error.message);
      }
    } else {
      return this.displayErrorMessage("Payment request missing or invalid");
    }
  };

  public updatePaymentStatus = (status: string, result: any = null) =>
    this.setState({ paymentStatus: { status, result } });

  public web3SendTransaction = (tx: any) => {
    const { web3 } = this.state;
    return new Promise((resolve, reject) => {
      web3.eth.sendTransaction(tx, (err: any, txHash: string) => {
        if (err) {
          reject(err);
        }
        resolve(txHash);
      });
    });
  };

  // public redirectToCallbackUrl() {
  //   const { paymentRequest, paymentStatus } = this.state;
  //   if (paymentRequest && paymentStatus) {
  //     if (typeof window !== "undefined") {
  //       const url = appendToQueryString(paymentRequest.callbackUrl, {
  //         txhash: paymentStatus.result,
  //         currency: paymentRequest.currency
  //       });
  //       window.open(url);
  //     } else {
  //       return this.displayErrorMessage("Window is undefined");
  //     }
  //   }
  // }

  public checkCurrentAccount = async () => {
    const { web3, address, chainId } = this.state;
    if (!web3) {
      return;
    }
    const accounts = await web3.eth.getAccounts();
    if (accounts[0] !== address) {
      this.onSessionUpdate(accounts, chainId);
    }
  };

  public onSessionUpdate = async (accounts: string[], chainId: number) => {
    const address = accounts[0];
    await this.setState({ chainId, accounts, address });
  };

  public resetApp = async () => {
    const { web3 } = this.state;
    if (
      web3 &&
      web3.currentProvider &&
      web3.currentProvider.connection &&
      web3.currentProvider.connection.isWalletConnect
    ) {
      await web3.currentProvider.connection._walletConnector.killSession();
    }
    clearInterval(accountInterval);
    this.setState({ ...INITIAL_STATE });
  };

  public renderTxHash = () => {
    const { paymentRequest, paymentStatus } = this.state;
    if (paymentRequest && paymentStatus) {
      const txHash = paymentStatus.result;
      const url =
        paymentRequest.currency.toLowerCase() === "xdai"
          ? `https://blockscout.com/poa/dai/tx/${txHash}`
          : `https://etherscan.io/tx/${txHash}`;
      return (
        <SDisplayTxHash href={url} target="blank" rel="noreferrer noopener">
          {txHash}
        </SDisplayTxHash>
      );
    }
    return null;
  };

  public render = () => {
    const {
      fetching,
      connected,
      address,
      chainId,
      errorMsg,
      paymentRequest,
      paymentStatus
    } = this.state;
    return (
      <SLayout>
        <Column maxWidth={1000} spanHeight>
          <Header
            connected={connected}
            address={address}
            chainId={chainId}
            killSession={this.resetApp}
          />
          <SContent>
            {fetching ? (
              <Column center>
                <SContainer>
                  <Loader />
                </SContainer>
              </Column>
            ) : !paymentRequest ? (
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
                  {` to ${paymentRequest.to}`}
                </SPaymentRequestDescription>
                {!paymentStatus ? (
                  <ConnectButton label="Pay" onClick={this.onConnect} />
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
            )}
          </SContent>
        </Column>
      </SLayout>
    );
  };
}

export default App;
