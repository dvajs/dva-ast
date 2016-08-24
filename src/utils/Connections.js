export function concatReduce(arr, func) {
  return arr.reduce((collection, item) => collection.concat(func.call(this, item)), []);
}

export function isObject(something) {
  return something && something.constructor === Object;
}

export default class Connections {
  constructor({
    components, dispatches, effects, reducers, models,
  }) {
    this.components = components.filter(c => !c.stateMappings);
    this.dispatches = dispatches;
    this.effects = effects;
    this.models = models;
    this.routes = components.filter(c => c.stateMappings);
    this.reducers = reducers;
  }
  get connections() {
    return [
      ...concatReduce.call(this, this.routes, this.getRouteToActions),
      ...concatReduce.call(this, this.dispatches, this.getActionToEffect),
      ...concatReduce.call(this, this.dispatches, this.getActionToReducer),
      ...concatReduce.call(this, this.effects, this.getEffectToActions),
      ...concatReduce.call(this, this.reducers, this.getReducerToModel),
      ...concatReduce.call(this, this.models, this.getModelToRoutes),
    ];
  }
  getRouteToActions(route) {
    const selector = isObject(route) ? route : this.routes.find(r => r.id === route);
    return (selector.dispatches || []).map(d => ({
      from: {
        id: selector.id,
      },
      to: {
        id: d,
      },
    }));
  }
  getEffectToActions(effect) {
    const selector = isObject(effect) ? effect : this.effects.find(r => r.id === effect);
    return selector.dispatches.map(d => ({
      from: {
        id: selector.id,
      },
      to: {
        id: d,
      },
    }));
  }
  getActionToEffect(action) {
    const selector = this.effects.find(e => e.actionType === action);
    return selector ? [{
      from: {
        id: action,
      },
      to: {
        id: selector.id,
      },
    }] : [];
  }
  getActionToReducer(action) {
    const selector = this.reducers.find(e => e.actionType === action);
    return selector ? [{
      from: {
        id: action,
      },
      to: {
        id: selector.id,
      },
    }] : [];
  }
  getReducerToModel(reducer) {
    const selector = isObject(reducer) ? reducer : this.reducers.find(r => r.id === reducer);
    return {
      from: {
        id: selector.id,
      },
      to: {
        id: selector.modelId,
      },
    };
  }
  getModelToRoutes(model) {
    return this.routes.filter(r =>
      r.stateMappings.modelIds.indexOf(model) !== -1
    ).map(r => ({
      from: {
        id: model,
      },
      to: {
        id: r.id,
      },
    }));
  }
}
