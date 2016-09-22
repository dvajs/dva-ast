import assert from 'assert';
import { uniqDispatches } from '../utils/utils';

import infrastructureUtils from '../utils/InfrastructureUtils';
import modelReducerParserFactory from './model-reducers';
import modelEffectParserFactory from './model-effects';
import modelSubscriptionParserFactory from './model-subscriptions';

export default function (j) {
  const u = infrastructureUtils(j);
  const modelReducerParser = modelReducerParserFactory(j);
  const modelEffectParser = modelEffectParserFactory(j);
  const modelSubscriptionParser = modelSubscriptionParserFactory(j);

  const getModelBoilerplate = () => ({
    id: '',                 // namespace
    node: null,             // ast node
    source: null,           // source code
    filePath: '',
    namespace: '',
    state: {},
    effects: [],
    reducers: [],
    subscriptions: [],
  });

  const parseSubscriptions = (node, filePath, modelId) => {
    assert(node.type === 'ObjectExpression', 'Subscriptions should be ObjectExpression');

    let dispatches = [];
    const subIds = [];

    const subscriptions = node.properties.map(curr => {
      const subName = u.getPropertyKeyName(curr.key);
      const subId = `${modelId}_subscription_${subName}`;

      const sub = modelSubscriptionParser.parse({
        node: curr.value,
        jscodeshift: j,
        filePath,
        modelId,
        subscriptionName: subName,
      });

      subIds.push(subId);
      if (sub.dispatches.length) {
        dispatches = [...dispatches, ...sub.dispatches];
      }

      return sub;
    });

    return {
      subscriptions,
      dispatches,
      subscriptionIds: subIds,
    };
  };

  const parseEffects = (node, filePath, modelId) => {
    assert(node.type === 'ObjectExpression', 'Effects should be ObjectExpression');

    let dispatches = [];
    const effectIds = [];

    const effects = node.properties.map(curr => {
      let actionType = u.getPropertyKeyName(curr.key);
      const effectId = `${modelId}_effect_${actionType}`;

      const effect = modelEffectParser.parse({
        node: curr.value,
        jscodeshift: j,
        filePath,
        actionType,
        modelId,
        effectId,
      });

      effectIds.push(effectId);
      if (effect.dispatches.length) {
        dispatches = dispatches.concat(effect.dispatches);
      }

      return effect;
    });

    return {
      effectIds,
      effects,
      dispatches,
    };
  };

  const parseReducers = (node, filePath, modelId) => {
    assert(node.type === 'ObjectExpression', 'Reducers should be ObjectExpression');

    const reducerIds = [];
    const reducers = node.properties.map(curr => {
      let actionType = u.getPropertyKeyName(curr.key);
      const reducerId = `${modelId}_reducer_${actionType}`;
      reducerIds.push(reducerId);
      return modelReducerParser.parse({
        node: curr.value,
        jscodeshift: j,
        filePath,
        actionType,
        modelId,
      });
    });

    return {
      reducerIds,
      reducers,
    };
  };

  const getModelNamespace = (node) => {
    const namespaceNode = node.properties.filter(
      n => u.getPropertyKeyName(n.key) === 'namespace'
    )[0] || {};

    if (namespaceNode.value.type !== 'Literal') {
      console.error('unsupported type of dva model namespace');
      return '';
    }
    return namespaceNode.value.value;
  };

  const parse = ({ filePath, nodePath }) => {
    if (nodePath.node.type !== 'ObjectExpression') return null;

    const parseResult = {
      dispatches: [],
    };

    const model = getModelBoilerplate();
    model.node = nodePath.node;
    model.source = u.getSourceFromNode(model.node);
    model.filePath = filePath;
    model.namespace = getModelNamespace(model.node);
    model.id = model.namespace;

    model.node.properties.forEach(n => {
      const propertyName = u.getPropertyKeyName(n.key);
      if (propertyName === 'namespace') {
        // skip
      } else if (propertyName === 'state') {
        model.state = u.recursiveParse(n.value);
      } else if (propertyName === 'subscriptions') {
        const {
          subscriptions,
          dispatches,
          subscriptionIds
        } = parseSubscriptions(n.value, model.filePath, model.id);
        model.subscriptions = subscriptionIds;
        parseResult.subscriptions = subscriptions;
        parseResult.dispatches = parseResult.dispatches.concat(dispatches);
      } else if (propertyName === 'effects') {
        const {
          effects = [],
          effectIds = [],
          dispatches = [],
        } = parseEffects(n.value, model.filePath, model.id);

        model.effects = effectIds;
        parseResult.effects = effects;
        parseResult.dispatches = parseResult.dispatches.concat(dispatches);
      } else if (propertyName === 'reducers') {
        const { reducers = [], reducerIds = [] } = parseReducers(n.value, model.filePath, model.id);
        model.reducers = reducerIds;
        parseResult.reducers = reducers;
      } else {
        throw new Error(`Unrecognized property of dva model: ${propertyName}`);
      }
    });

    parseResult.model = model;
    parseResult.dispatches = uniqDispatches(parseResult.dispatches);
    return parseResult;
  };

  return {
    parse,
  };
}
