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


  const parseState = (node) => {
    if (node.type !== 'ObjectExpression') {
      console.error('unsupported type of dva model state');
      return {};
    }
    return u.recursiveParse(node);
  };
  const parseSubscriptions = (node, filePath, modelId) => {
    if (node.type !== 'ArrayExpression') {
      console.error('unsupported type of dva model subscriptions');
      return null;
    }
    let dispatches = [];
    const subscriptions = node.elements.map(
      (n, index) => {
        const s = modelSubscriptionParser.parse({
          node: n,
          jscodeshift: j,
          filePath,
          modelId,
          index,
        });
        dispatches = dispatches.concat(s.dispatches);
        return s;
      }
    );
    return {
      subscriptions,
      dispatches,
    };
  };
  const parseEffects = (node, filePath, modelId) => {
    if (node.type !== 'ObjectExpression') {
      console.error('unsupported type of dva model effects');
      return {};
    }
    let dispatches = [];
    const effectIds = [];
    const effects = node.properties.map(curr => {
      let actionType;
      if (curr.key.type === 'Literal') {
        actionType = curr.key.value;
      } else if (curr.key.type === 'Identifier') {
        actionType = curr.key.name;
      }

      const effectId = `${modelId}_effect_${actionType}`;
      effectIds.push(effectId);

      const effect = modelEffectParser.parse({
        node: curr.value,
        jscodeshift: j,
        filePath,
        actionType,
        modelId,
        effectId,
      });

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
    if (node.type !== 'ObjectExpression') {
      console.error('unsupported type of dva model reducers');
      return {};
    }

    const reducerIds = [];
    const reducers = node.properties.map(curr => {
      let actionType;
      if (curr.key.type === 'Literal') {
        actionType = curr.key.value;
      } else if (curr.key.type === 'Identifier') {
        actionType = curr.key.name;
      }

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
        model.state = parseState(n.value);
      } else if (propertyName === 'subscriptions') {
        const { subscriptions, dispatches } = parseSubscriptions(n.value, model.filePath, model.id);
        model.subscriptions = subscriptions;
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
        console.error('unrecognized property of dva model: %s', propertyName);
      }
    });

    parseResult.model = model;
    return parseResult;
  };

  return {
    parse,
  };
}
