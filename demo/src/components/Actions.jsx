import React, { PropTypes } from 'react'

class Actions extends React.Component {
  render() {
    const { dispatches } = this.props;
    return (
      <div>
        <ul>
          {
            dispatches.map(actionType => <li key={actionType}>{actionType}</li>)
          }
        </ul>
      </div>
    );
  }
}

export default Actions;
