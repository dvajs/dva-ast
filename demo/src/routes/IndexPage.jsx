import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import Components from '../components/Components';
import Actions from '../components/Actions';

class IndexPage extends React.Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'ast/query',
    });
  }
  render() {
    const { ast } = this.props;
    const { components, loading } = ast;
    return (
      <div>
        {
          !!loading ?
            <div>loading...</div> :
            <div>
              <h3>Components</h3>
              <hr />
              <Components comps={components} />
              <h3>Actions</h3>
              <hr />
              <Actions ast={ast} />
            </div>
        }
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ ast }) => ({ ast }))(IndexPage);
