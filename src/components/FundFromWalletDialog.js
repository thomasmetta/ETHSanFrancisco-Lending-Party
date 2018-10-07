import React, { Component } from 'react';
import { Button, Modal } from 'semantic-ui-react';

class FundFromWalletDialog extends Component {

  constructor(props) {
    super(props);
    this.state = {
      show: false
    }
  }

  close = () => {
    this.props.onClose(true);
    this.setState({show:false})
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show !== this.state.show) {
      this.setState({ show: nextProps.show });
    }
  }

  confirm = () => {
    this.props.onConfirm(true);
    this.setState({
      show: false
    })
  }

  render() {
    return (
      <Modal open={this.state.show}>
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
