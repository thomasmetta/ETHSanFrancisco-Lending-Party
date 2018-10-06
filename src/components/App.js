import React, { Component } from 'react';
import { Button, Container, Divider, Grid, Header, Image, Menu, Segment } from 'semantic-ui-react'

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
import animation from './pinjump.json'

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

  render() {



    return (

      <div className="App">
        <header className="App-header">
          <h1 className="App-title">BloomLending</h1>
        </header>
          <br/>
          <div className="app-head-container">
            <div>
            <h1 className="App-subtitle">Personal loans. Sign up only with your Bloom ID</h1>
            <BloomQRComponent/>
            </div>
            <Lottie
              options={{
                animationData: animation
              }}
              width={650}
            />
          </div>
          <br/>
          <br /><p className="App-intro"><strong>This application pulls in maker.js to open a cdp, lock eth, draw dai, repay the dai, and then shut the cdp.  Each transaction is sent after the other is mined.  Progress is reported below.  Click Start to begin.</strong></p><br />
          <Container style={{ marginTop: '3em' }}>
            <Header as='h1'>Maker CDPs</Header>
            <StartButton/>
          </Container>
          <CreateMaker/>
          <AuthenticateMaker/>
          <OpenCdp/>
          <LockEth/>
          <DrawDai/>
          <WipeDebt/>
          <ShutCdp/>
      </div>
    );
  }
}

export default App;
