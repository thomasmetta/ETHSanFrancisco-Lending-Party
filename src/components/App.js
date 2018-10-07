import React, { Component } from 'react';
import { Button, Container, Divider, Grid, Header, Image, Menu, Segment, Message, Input } from 'semantic-ui-react';
import { connect } from 'react-redux';
import axios from 'axios';
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
import downArrow from './downArrow.json';
import checkJson from './check.json';
import loadingJson from './loading.json';
import Maker from '@makerdao/dai';
import FundFromWalletDialog from './FundFromWalletDialog';
import { calcMaxDebtInCDP, calcMaxDebtFromWallet, calcNeededEth, drawDaiAsync} from '../actions';
import io from 'socket.io-client';
import scrollToComponent from 'react-scroll-to-component';
import PieChart from 'react-minimal-pie-chart';

const ENDPOINT = "http://10.7.13.228:8000/";

const socket = io(ENDPOINT);

const BloomQRComponent: React.SFC = props => {
  const requestData = {
  action: "request_attestation_data",
  token: '0x8f31e48a585fd12ba58e70e03292cac712cbae39bc7eb980ec189aa88e24d041',
  url: ENDPOINT,
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
    this.state = {maxDebt: 0, maxDebtFromWallet: 0, inputAmount: 0, isVerified: false, showDialog: false,
      neededEth: 0, usd: 0, percentage: 0, isLoading: false, isFirstTime: true, payload: {}};
    this.handleClick = this.handleClick.bind(this);
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
    this.scrollClick = this.scrollClick.bind(this);
    this.onChange = this.onChange.bind(this);
    this.myRef = React.createRef();
    this.handleConfirmTransfer = this.handleConfirmTransfer.bind(this);
    this.handleRangeChange = this.handleRangeChange.bind(this);
  }

  onChange(event) {
    this.inputAmount = event.target.value;
  }

  async handleConfirmTransfer(val) {
    console.log("confirmed!");
    // transfer eth to the CDP
    console.log("going to draw an additional " + this.state.neededEth + " ether from wallet");
    const lockEthTx = await this.cdp.lockEth(this.state.neededEth);
    // now we can update again
    this.handleClick(this.inputAmount);
  }

  async handleCloseDialog() {
    this.setState({
      showDialog: false
    });
  }

  scrollClick() {
    scrollToComponent(this.resultPage, {
      offset: 1000,
      align: 'top',
      duration: 1500
    });
  }

  async handleClick(amount) {
    this.setState({
      isFirstTime: false,
      isLoading: true
    });
    if (!amount || amount == '' || parseFloat(amount) <= 0) {
      return; // no input
    }
    amount = parseFloat(amount);

    await drawDaiAsync(this.maker, this.cdp, amount);

    let daiDebt = await this.cdp.getDebtValue();
    daiDebt = daiDebt.toNumber();
    const maxDebt = await calcMaxDebtInCDP(this.maker, this.cdp);
    let calculatedMaxDebt = maxDebt-daiDebt;
    calculatedMaxDebt = Math.max(calculatedMaxDebt, 0);
    const maxDebtFromWallet = await calcMaxDebtFromWallet(this.maker, this.cdp);
    const maxDebtCombined = calculatedMaxDebt + maxDebtFromWallet;

    // if the requested amount is greater than what's available in the CDP
    // bring up the confirmation dialog
    // otherwise, continue
    console.log("amount is " + amount + " debt is " + calculatedMaxDebt);
    if (amount > calculatedMaxDebt) {
      let neededUsd = amount - calculatedMaxDebt;
      // get eth value to calculate
      let neededEth = await calcNeededEth(this.maker, neededUsd);
      this.setState({
        neededEth: neededEth,
        usd: amount,
        showDialog: true
      });
      return;
    }

    // draw the DAI from the CDP
    console.log("going to draw " + amount + " DAI");


    this.setState({
      maxDebt: Math.round(calculatedMaxDebt*100)/100,
      maxDebtCombined: Math.round(maxDebtCombined*100)/100,
      isLoading: false
    });

    axios.post(ENDPOINT+'wyre', {
      amount
    })
    .then(data => {
      setTimeout(() => {
        window.open('https://www.testwyre.com/dashboard', "_blank")
      }, 3000)
    });
  }

  async componentDidMount() {
    this.maker = Maker.create("kovan", {
      privateKey: process.env['REACT_APP_PRIVATE_KEY'],
      overrideMetamask: true
    });
    await this.maker.authenticate();
    let cdpId = process.env['REACT_APP_CDP_ID'];
    this.cdp = await this.maker.getCdp(cdpId ? parseInt(cdpId) : 2836);

    socket.on('foo', data => {
      this.setState({isVerified: true, payload: data});
    })

    let daiDebt = await this.cdp.getDebtValue();
    daiDebt = daiDebt.toNumber();
    const maxDebt = await calcMaxDebtInCDP(this.maker, this.cdp);
    let calculatedMaxDebt = maxDebt-daiDebt;
    calculatedMaxDebt = Math.max(calculatedMaxDebt, 0);
    const maxDebtFromWallet = await calcMaxDebtFromWallet(this.maker, this.cdp);
    const maxDebtCombined = calculatedMaxDebt + maxDebtFromWallet;

    this.setState({
      maxDebt: Math.round(calculatedMaxDebt*100)/100,
      maxDebtCombined: Math.round(maxDebtCombined*100)/100
    });
  }

  componentDidUpdate(prevProps, prevState) {
    console.log(prevState)
    console.log(this.state)
    if(prevState.isVerified !== this.state.isVerified){
      console.log('scrollClick');
      this.smoothScroll2();
      // this.scrollClick();
    }
  }

  smoothScroll = () => {
    document.querySelector('#app-head-container').scrollIntoView({
      block: "start",
      inline: "nearest",
      behavior: 'smooth'
    });
  }

  smoothScroll2 = () => {
    document.querySelector('#testing').scrollIntoView({
      block: "start",
      inline: "nearest",
      behavior: 'smooth'
    });
  }

  handleRangeChange(e) {
    const newValue = e.target.value;
    this.setState(() => ({
      percentage: Number(newValue),
      valueToSubmit: parseFloat(Number(newValue) / 100 * this.state.maxDebtCombined).toFixed(2)
    }));
  }

  render() {

    //console.log(this.state)

    return (

      <div className="App">
        <header className="App-header">
          < h1 className = "App-title" > 🎉LendingParty🎉 </h1>
        </header>
          <br/>
          <a onClick={this.smoothScroll} className="arrow-down">
            <Lottie options={{ animationData: downArrow }} width={50} />
          </a>
          <Lottie options={{ animationData: animation }} width={'100%'} />
          <div id="app-head-container">
            <div id="turquoise" className="ui raised very padded text container segment">
              <h1 className="App-subtitle">Personal loans. Sign up with just your Bloom ID</h1>
              <div id="qr-container">
                {<BloomQRComponent/>}
              </div>
            </div>
          </div>
          <br/>
          <div id="testing" className="ui raised very padded text container segment" ref={(section) => { this.resultPage = section; }}>
            <h1 className="ui header lendContainer">Your Collatoralized Debt Positions</h1>
            <Divider/>
            <div>
              <div className="lendContainer firstContainer">
              <Lottie options={{ animationData: smallTree }} width={450} />
                <div class="ui card">
                  <div class="content">
                    <div class="meta">TOTAL AMOUNT IN CDP</div>
                    <br />
                    <div class="header">${this.state.maxDebt}</div>
                  </div>
                </div>
              </div>
              <div className = "lendContainer firstContainer">
                <Lottie options={{ animationData: bigTree }} width={450} />
                <div class="ui card">
                  <div class="content">
                    <div class="meta">TOTAL AMOUNT LOANABLE </div>
                    <br />
                    <div class="header">${this.state.maxDebtCombined}</div>
                  </div>
                </div>
              </div>
            </div>
            <br />
            <div className>
                <PieChart
                style={{ height: '250px' }}
                data={[{ value: 1, key: 1, color: 'turquoise' }]}
                reveal={this.state.percentage}
                lineWidth={20}
                animate
                />
                Collatoralize: ${(this.state.percentage/100 * this.state.maxDebtCombined).toFixed(2)}
                <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={this.state.percentage}
                style={{ width: '100%' }}
                onChange={(e) => this.handleRangeChange(e)}
                />
                <div className="lendContainer">
                  <Button size="massive" color="teal" onClick={()=>this.handleClick(this.state.valueToSubmit)}>Go</Button>
                  {this.state.isFirstTime && <div className="firstTimeContainer"></div>}
                  {this.state.isLoading && <Lottie options={{ animationData: loadingJson }} width={'10%'} />}
                  {!this.state.isFirstTime && !this.state.isLoading && <Lottie options={{ animationData: checkJson, loop: false }} width={'10%'} />}
                </div>
            </div>

            <FundFromWalletDialog show={this.state.showDialog} neededEth={this.state.neededEth} usd={this.state.usd} onClose={this.handleCloseDialog} onConfirm={this.handleConfirmTransfer}/>
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
