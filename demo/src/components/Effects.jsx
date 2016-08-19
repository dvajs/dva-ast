import React, { PropTypes } from 'react'

class Effects extends React.Component {
  render() {
    const { effects } = this.props;
    return (
      <div>
        should consider one action has multiple effects in different models
        <ul>
          {
            effects.map(effect =>
              <li key={effect.id}>{effect.actionType} from {effect.modelId}</li>
            )
          }
        </ul>
      </div>
    );
  }
}

export default Effects;
