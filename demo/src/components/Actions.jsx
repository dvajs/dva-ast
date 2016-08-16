import React, { PropTypes } from 'react'

class Actions extends React.Component {
  getList() {
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
              model: m.namespace,
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
              model: m.namespace,
            });
          });
        }
      });
    });

    return actionObj;
  }
  render() {
    const actions = this.getList();
    console.log(actions);
    return (
      <div>

      </div>
    );
  }
}

export default Actions;
