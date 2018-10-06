import React from 'react';
import { connect } from 'react-redux';
import { startAsync } from '../actions';
import { Button } from 'semantic-ui-react'

const mapStateToProps = state => {
  return {
    started: state.started
  }
}

function mapDispatchToProps(dispatch) {
    return({
        start: () => {
        	dispatch(startAsync());
        }
    })
}

const StartButton = ({ started, start}) => {

  return (
      <Button primary onClick={start}>
        {started ? 'Restart' : 'Start'}
      </Button>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(StartButton);
