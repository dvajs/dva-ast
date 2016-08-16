import React, { PropTypes } from 'react'

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
  render() {
    const { models } = this.props;
    const reducers = this.getReducers(models);
    return (
      <div>
        <ul>
          {
            reducers.map(reducer =>
              <li key={`${reducer.action}${reducer.model}`}>{reducer.action} from {reducer.model}</li>
            )
          }
        </ul>
      </div>
    )
  }
}

export default Reducers;
