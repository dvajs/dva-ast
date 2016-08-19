import React, { PropTypes } from 'react'

class Connect extends React.Component {
  render() {
    const { stateMappings = { modelIds: [] } } = this.props;
    return (
      <div>
        stateMappings:
        <ul>
          {
            stateMappings.modelIds ? stateMappings.modelIds.map(modelId =>
              <li key={modelId}>
                {modelId}
              </li>
            ) : null
          }
          <li>
            <input />
            <button>add</button>
          </li>
        </ul>
      </div>
    )
  }
}

export default Connect;
