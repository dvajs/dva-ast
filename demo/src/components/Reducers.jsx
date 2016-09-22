import React, { PropTypes } from 'react';
import { connect } from 'dva';
import Editor from './Editor';

class Reducers extends React.Component {
  saveReducer(reducer) {
    this.props.dispatch({
      type: 'ast/saveReducer',
      payload: reducer,
    })
  }
  removeReducer(reducer) {
    this.props.dispatch({
      type: 'ast/removeReducer',
      payload: reducer,
    });
  }
  addReducer(reducer) {
    this.props.dispatch({
      type: 'ast/addReducer',
      payload: {
        actionType: `newReducer_${Math.random()}`,
        modelId: 'users',
        source: 'function(state) { return {...state, hello: 1}}',
      }
    });
  }
  render() {
    const { reducers } = this.props;
    return (
      <div>
        <button onClick={ () => this.addReducer() }>add a reducer</button>
        <ul>
          {
            reducers.map(reducer =>
              <li key={reducer.id}>
                {reducer.actionType} from {reducer.modelId}
                <button onClick={ () => this.removeReducer(reducer) }>delete</button>
                <Editor
                  source={reducer.source}
                  onChange={(val) => this.saveReducer({ ...reducer, source: val })}
                />
              </li>
            )
          }
        </ul>
      </div>
    )
  }
}

export default connect(() => ({}))(Reducers);
