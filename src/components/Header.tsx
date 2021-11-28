import * as React from "react";
import styled from "styled-components";
import * as PropTypes from "prop-types";
import Blockie from "./Blockie";
import Banner from "./Banner";
import { ellipseAddress } from "../helpers/utilities";
import { transitions } from "../styles";
import { IChainData } from "../helpers/types";

const SHeader = styled.div`
  margin-top: -1px;
  margin-bottom: 1px;
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
`;

const SActiveAccount = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  font-weight: 500;
`;

const SActiveChain = styled(SActiveAccount)`
  flex-direction: column;
  text-align: left;
  align-items: flex-start;
  & p {
    font-size: 0.8em;
    margin: 0;
    padding: 0;
  }
  & p:nth-child(2) {
    font-weight: bold;
  }
`;

const SBlockie = styled(Blockie)`
  margin-right: 10px;
`;

interface IHeaderStyle {
  connected?: boolean;
}

const SAddress = styled.p<IHeaderStyle>`
  transition: ${transitions.base};
  font-weight: bold;
  margin: ${({ connected }) => (connected ? "-2px auto 0.7em" : "0")};
`;

interface IHeaderProps {
  killSession: () => void;
  connected: boolean;
  address: string;
  chain: IChainData | undefined;
}

const Header = (props: IHeaderProps) => {
  const {
    // killSession,
    connected,
    address,
    chain,
  } = props;
  return (
    <SHeader {...props}>
      {connected && chain ? (
        <SActiveChain>
          <p>{`Connected to`}</p>
          <p>{chain.name}</p>
        </SActiveChain>
      ) : (
        <Banner />
      )}
      {address && (
        <SActiveAccount>
          <SBlockie address={address} />
          <SAddress
          // connected={connected}
          >
            {ellipseAddress(address)}
          </SAddress>
          {/* <SDisconnect connected={connected} onClick={killSession}>
            {'Disconnect'}
          </SDisconnect> */}
        </SActiveAccount>
      )}
    </SHeader>
  );
};

Header.propTypes = {
  killSession: PropTypes.func.isRequired,
  address: PropTypes.string,
};

export default Header;
