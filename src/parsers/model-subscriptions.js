import infrastructureUtils from '../utils/InfrastructureUtils';

export default function (j) {
  const u = infrastructureUtils(j);

  const getSubscriptionBoilerplate = () => ({
    id: '',                 // `${modelId}_subscription_${index}`
    node: null,             // ast node
    source: null,           // source code
    filePath: '',
    modelId: '',
    dispatches: [],
  });


  const parse = ({ filePath, node, modelId, index }) => {
    if (node.type !== 'FunctionExpression' && node.type !== 'ArrowFunctionExpression') {
      console.error('unsupported type of dva model subscriptions');
      return null;
    }

    const subscription = getSubscriptionBoilerplate();
    subscription.filePath = filePath;
    subscription.node = node;
    subscription.source = u.getSourceFromNode(subscription.node);
    subscription.modelId = modelId;
    subscription.index = index;
    subscription.id = `${modelId}_subscription_${index}`;
    u.findActionTypeByCallee(node, 'dispatch', (action) => {
      subscription.dispatches.push(action);
    });
    return subscription;
  };

  return {
    parse,
  };
}
