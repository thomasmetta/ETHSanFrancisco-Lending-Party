import React from 'react'
import { Button, Modal } from 'semantic-ui-react'

class FundFromWalletDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {neededEth: 0, usd: 0};
  }

  render() {
    return (
      <Modal
        trigger={<Button>Show Modal</Button>}
        header='Transfer funds from Metamask!'
        content="You should transfer ${this.state.neededEth} ETH from your wallet in order to take out a ${this.state.usd} \
 loan (and maintain a safe collatoralization ratio)."
        actions={['Cancel', { key: 'done', content: 'Confirm', positive: true }]}
      />
    );
  }

export default FundFromWalletDialog
