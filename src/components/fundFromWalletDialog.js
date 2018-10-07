import React, { Component } from 'react';
import { Button, Modal } from 'semantic-ui-react';

class FundFromWalletDialog extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: true
    }
  }

  close = () => this.setState({ open: false })

  confirm = () => {
    console.log("confirmed");

    this.setState({ open: false })
  }

  render() {
    return (
      <Modal open={this.state.open}>
        <Modal.Header>Transfer funds from Metamask?</Modal.Header>
        <Modal.Content>
         You should transfer {this.props.neededEth} ETH from your wallet in order to take out
         a {this.props.usd} loan (and maintain a safe collatoralization ratio).
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.close} negative content='Cancel'/>
          <Button
            onClick={this.confirm}
            positive
            content='Confirm'
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

export default FundFromWalletDialog;
