import { uniqDispatches } from '../utils/utils';
import infrastructureUtils from '../utils/InfrastructureUtils';

export default function (j) {
  const u = infrastructureUtils(j);

  const getEffectBoilerplate = () => ({
    id: '',                 // model's id + actionType
    node: null,             // ast node
    source: null,           // source code
    filePath: '',
    modelId: '',
    actionType: '',
    dispatches: [],
  });

  const parse = ({ filePath, node, modelId, effectId, actionType }) => {
    if (node.type !== 'FunctionExpression') {
      console.error('unsupported type of dva model effects');
      return null;
    }

    const effect = getEffectBoilerplate();
    effect.filePath = filePath;
    effect.node = node;
    effect.source = u.getSourceFromNode(effect.node);
    effect.modelId = modelId;
    effect.actionType = actionType;
    effect.id = effectId;

    u.findActionTypeByCallee(node, 'put', (action) => {
      effect.dispatches.push({
        type: action,
        modelId,
      });
    });
    effect.dispatches = uniqDispatches(effect.dispatches);
    return effect;
  };

  return {
    parse,
  };
}
