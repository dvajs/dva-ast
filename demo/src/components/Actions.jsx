import React, { PropTypes } from 'react'

class Actions extends React.Component {
  getActionObject() {
    const { ast } = this.props;
    const actionObj = {};
    ast.components.forEach(c => {
      c.dispatches.forEach(d => {
        actionObj[d] = actionObj[d] || { components: [], effects: [], subscriptions: [] };
        actionObj[d].components.push({
          componentName: c.componentName,
          filePath: c.filePath,
        })
      });
    });
    ast.models.forEach(m => {
      const { effects = {}, subscriptions = [] } = m.data;
      Object.keys(effects).forEach(k => {
        if (effects[k] && effects[k].dispatches) {
          effects[k].dispatches.forEach(effectDispatch => {
            actionObj[effectDispatch] =
              actionObj[effectDispatch] || { components: [], effects: [], subscriptions: [] };
            actionObj[effectDispatch].effects.push({
              effect: k,
              model: m.data.namespace,
            });
          });
        }
      });

      subscriptions.forEach(subscription => {
        if (subscription.dispatches) {
          subscription.dispatches.forEach(subscriptionDispatch => {
            actionObj[subscriptionDispatch] =
              actionObj[subscriptionDispatch] || { components: [], effects: [], subscriptions: [] };
            actionObj[subscriptionDispatch].subscriptions.push({
              subscription: true,
              model: m.data.namespace,
            });
          });
        }
      });
    });

    return actionObj;
  }
  render() {
    const actions = this.getActionObject();
    return (
      <div>
        <ul>
        {
          Object.keys(actions).map(key =>
            <li key={key}>
              {key} from:
              <ul>
              {
                actions[key].components.length ?
                  <li>
                    components: &nbsp;
                    { actions[key].components.map(c => c.componentName) }
                  </li> :
                  null
              }
              {
                actions[key].effects.length ?
                  <li>
                    effects: &nbsp;
                    { actions[key].effects.map(c => `${c.effect}(model: ${c.model})`) }
                  </li> :
                  null
              }
              {
                actions[key].subscriptions.length ?
                  <li>
                    subscriptions: &nbsp;
                    { actions[key].subscriptions.map(c => `from subscription of model: ${c.model}`) }
                  </li> :
                  null
              }
              </ul>
            </li>
          )
        }
        </ul>
      </div>
    );
  }
}

export default Actions;
