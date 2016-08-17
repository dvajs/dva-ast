import React, { PropTypes } from 'react';
import { connect } from 'dva';
import Editor from './Editor';

class Reducers extends React.Component {
  getReducers(models = []) {
    const reducers = [];
    models.forEach(m => {
      Object.keys(m.data.reducers).forEach(action => {
        reducers.push({
          ...m.data.reducers[action],
          model: m.data.namespace,
          action,
        });
      })
    });
    return reducers;
  }
  saveReducer(reducer) {
    this.props.dispatch({
      type: 'ast/saveReducer',
      payload: reducer,
    })
  }
  render() {
    const { models } = this.props;
    const reducers = this.getReducers(models);
    return (
      <div>
        <ul>
          {
            reducers.map(reducer =>
              <li key={`${reducer.action}${reducer.model}`}>
                {reducer.action} from {reducer.model}
                <Editor
                  source={reducer.data}
                  onChange={(val) => this.saveReducer({ ...reducer, data: val })}
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
