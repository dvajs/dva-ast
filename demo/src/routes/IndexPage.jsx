import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import Components from '../components/Components';
import Actions from '../components/Actions';
import Effects from '../components/Effects';
import Reducers from '../components/Reducers';
import States from '../components/States';

class IndexPage extends Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'ast/query',
    });
  }
  render() {
    const { ast } = this.props;
    const { components, models, effects, reducers, dispatches, loading } = ast;
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
              <Actions dispatches={dispatches} />
              <h3>Effects</h3>
              <hr />
              <Effects effects={effects} />
              <h3>reducers</h3>
              <hr />
              <Reducers reducers={reducers} />
              <h3>states</h3>
              <hr />
              <States models={models} />
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
