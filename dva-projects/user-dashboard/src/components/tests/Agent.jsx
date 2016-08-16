import { connect } from 'dva';
import React, { PropTypes } from 'react';

class Agent extends React.Component {
  render() {
    return (
      <div>Agent</div>
    );
  }
}

export default connect(state => ({ user: state.user }))(Agent);
