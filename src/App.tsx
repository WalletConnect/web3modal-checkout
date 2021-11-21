import * as React from "react";
import styled from "styled-components";
import { providers } from "ethers";

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
import Payment from "./components/Payment";

import {
  parseQueryString,
  checkRequiredParams,
} from "./helpers/utilities";
import { IChainData, IPaymentRequest} from "./helpers/types";

import { RPC_URLS_FOR_SUPPORTED_CHAINS, SUPPORTED_CHAINS } from "./constants/supported";
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

interface IAppState {
  connected: boolean;
  address: string; //to render on homepage
  chain: IChainData | undefined;
  provider: providers.Web3Provider | undefined;
  paymentRequest: IPaymentRequest | undefined;
}

const INITIAL_STATE: IAppState = {
  connected: false,
  address: "",
  chain: undefined,
  provider: undefined,
  paymentRequest: undefined,
};

let accountInterval: any = undefined;

class App extends React.Component<any, IAppState> {
  // @ts-ignore
  public web3Modal: Web3Modal;

  constructor(props: any) {
    super(props);
    this.state = {
      ...INITIAL_STATE,
      paymentRequest: this.getPaymentRequest(),
    };
    // if there is a payment network, set the expected Network (defaults to mainnet otherwise)
    let expectedNetwork: string = "mainnet";
    if (this.state.paymentRequest) {
      expectedNetwork = CHAIN_DATA_LIST[this.state.paymentRequest.chainId].network;
    }
    this.web3Modal = new Web3Modal({
      network: expectedNetwork,
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

    web3Provider.on("accountsChanged", (accounts: string[]) => {
      this.setState({ address: accounts[0] })
    });

    web3Provider.on("chainChanged", async (chainId: number) => {
      const chain = await getChain(`eip155:${chainId}`);
      this.setState({ chain });
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
  
  public getProviderOptions = () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.REACT_APP_INFURA_ID,
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

  // Load URL params into object
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
          }
        }
      }
    }
    return result;
  };

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

  public render = () => {
    const {
      connected,
      address,
      chain,
      paymentRequest,
      provider
    } = this.state;

    // Render payment component if connected and request present.
    let toRender = <div></div>;
    if (paymentRequest && connected) {
      toRender = <Payment paymentRequest={paymentRequest} chain={chain} provider={provider}/>
    }
    else if (!paymentRequest) {
      toRender = (
        <SBalances>
          <h3>Failed</h3>
          <p>{`Payment request not supported or invalid`}</p>
        </SBalances>
      )
    }

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
            {toRender}
          </SContent>
        </Column>
      </SLayout>
    );
  };
}

export default App;
