import React, { PropTypes } from 'react'

class Effects extends React.Component {
  getEffects(models = []) {
    const effects = [];
    models.forEach(m => {
      Object.keys(m.data.effects).forEach(action => {
        effects.push({
          ...m.data.effects[action],
          model: m.data.namespace,
          action,
        });
      })
    });
    return effects;
  }
  render() {
    const { models } = this.props;
    const effects = this.getEffects(models);
    return (
      <div>
        should consider one action has multiple effects in different models
        <ul>
          {
            effects.map(effect =>
              <li key={`${effect.action}${effect.model}`}>{effect.action} from {effect.model}</li>
            )
          }
        </ul>
      </div>
    );
  }
}

export default Effects;
