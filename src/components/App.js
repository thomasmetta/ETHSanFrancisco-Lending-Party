import React, { Component } from 'react';
import { Button, Container, Divider, Grid, Header, Image, Menu, Segment, Message, Input } from 'semantic-ui-react';
import { connect } from 'react-redux';

import logo from '../logo.svg';
import './App.css';
import StartButton from './StartButton.js';
import CreateMaker from './CreateMaker.js';
import AuthenticateMaker from './AuthenticateMaker.js';
import OpenCdp from './OpenCdp.js';
import LockEth from './LockEth.js';
import DrawDai from './DrawDai.js';
import WipeDebt from './WipeDebt.js';
import ShutCdp from './ShutCdp.js';
import {RequestQRCode, RequestData} from '@bloomprotocol/share-kit';
import Lottie from 'lottie-react-web'
import animation from './pinjump.json';
import smallTree from './smallTree.json';
import bigTree from './bigTree.json';
import Maker from '@makerdao/dai';
import { calcMaxDebtInCDP, calcMaxDebtFromWallet} from '../actions';
import io from 'socket.io-client';

const socket = io("localhost:8000");

const BloomQRComponent: React.SFC = props => {
  const requestData = {
  action: "request_attestation_data",
  token: '0x8f31e48a585fd12ba58e70e03292cac712cbae39bc7eb980ec189aa88e24d041',
  url: 'https://78651dda.ngrok.io/',
  org_logo_url: 'https://bloom.co/images/notif/bloom-logo.png',
  org_name: 'Bloom',
  org_usage_policy_url: 'https://bloom.co/legal/terms',
  org_privacy_policy_url: 'https://bloom.co/legal/privacy',
  types: ['phone', 'email'],
}
  return <RequestQRCode requestData={requestData} size={200} />
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {maxDebt: 0, maxDebtFromWallet: 0, showBarcode: true};
  }

  async componentDidMount() {
    socket.on('foo', data => {
      console.log("bar", data);
      this.setState({showBarcode: false});
    })
    const maker = Maker.create("kovan", {
      privateKey: "C87509A1C067BBDE78BEB793E6FA76530B6382A4C0241E5E4A9EC0A0F44DC0D3",
      overrideMetamask: true
    });
    await maker.authenticate();
    const cdp = await maker.getCdp(2824);

    const maxDebt = await calcMaxDebtInCDP(maker, cdp);
    const maxDebtFromWallet = await calcMaxDebtFromWallet(maker, cdp);
    const maxDebtCombined = maxDebt + maxDebtFromWallet;
    this.setState((state) => {
      return {maxDebt: maxDebt};
    });
    this.setState((state) => {
      return {maxDebtCombined: maxDebtCombined};
    });
  }

  render() {

    console.log(this.state)

    return (

      <div className="App">
        <header className="App-header">
          <h1 className="App-title">BloomLending</h1>
        </header>
          <br/>
          <div className="app-head-container">
            <div>
            <h1 className="App-subtitle">Personal loans. Sign up only with your Bloom ID</h1>
            {this.state.showBarcode && <BloomQRComponent/>}
            </div>
            <Lottie
              options={{
                animationData: animation
              }}
              width={650}
            />
          </div>
          <br/>
          <div>
          <Divider/>
          <div className="lendContainer firstContainer">
            <div className="lendTextContainer">
              You can lend out up to <div className="lendText">${this.state.maxDebt}</div> from your CDP
            </div>
            <Lottie
              options={{
                animationData: smallTree
              }}
              width={450}
            />
          </div>
          <div className="lendContainer">
            <div className="lendTextContainer">
              <div className="secondText">If you add collateral from your ETH Balance, you can lend out up to a total of <div className="lendText">${this.state.maxDebtCombined}</div></div>
            </div>
            <Lottie
              options={{
                animationData: bigTree
              }}
              width={450}
            />
          </div>
          Amount: <Input focus placeholder='Search...' />
          <Button>Go</Button>
          <Divider/>
          </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return { store: state };
};

export default connect(mapStateToProps)(App);
