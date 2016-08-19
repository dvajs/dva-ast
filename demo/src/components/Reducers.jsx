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
  render() {
    const { reducers } = this.props;
    return (
      <div>
        <ul>
          {
            reducers.map(reducer =>
              <li key={reducer.id}>
                {reducer.actionType} from {reducer.modelId}
                <Editor
                  source={reducer.source}
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
