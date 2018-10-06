import React from 'react';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    authenticated: state.maker_authenticated
  }
}

const AuthenticateMaker = ({authenticated}) => {

  return (
      <div >
        {authenticated? 'Maker Authenticated' : ''}
      </div>
    );
}

export default connect(mapStateToProps)(AuthenticateMaker);
