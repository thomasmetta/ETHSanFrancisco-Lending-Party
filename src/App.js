import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {RequestQRCode, RequestData} from '@bloomprotocol/share-kit'

const MyComponent: React.SFC = props => {
  const requestData: RequestData = {
  token: '0x8f31e48a585fd12ba58e70e03292cac712cbae39bc7eb980ec189aa88e24d043',
  url: 'https://bloom.co/api/receiveData',
  org_logo_url: 'https://bloom.co/images/notif/bloom-logo.png',
  org_name: 'Bloom',
  org_usage_policy_url: 'https://bloom.co/legal/terms',
  org_privacy_policy_url: 'https://bloom.co/legal/privacy',
  types: ['full-name', 'phone', 'email'],
}
  return <RequestQRCode requestData={requestData} size={200} />
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MyComponent/>
          </a>
        </header>
      </div>
    );
  }
}

export default App;
