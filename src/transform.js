import uniq from 'lodash.uniq';
import RouteComponent from './collections/RouteComponent';
import Model from './collections/Model';
import Router from './collections/Router';

const ID_SEP = '^^';

export default function transform(file, api) {
  const j = api.jscodeshift;
  RouteComponent.register(j);
  Model.register(j);
  Router.register(j);

  const root = j(file.source);

  const ret = {
    models: root.findModels().getModelInfo(),
    router: root.findRouters().getRouterInfo(),
    routeComponents: root.findRouteComponents().getRouteComponentInfo(root),
  };

  // Only one router.
  if (ret.router && ret.router.length) {
    ret.router = ret.router[0];
  } else {
    ret.router = null;
  }

  return normalizeResult(ret, file.path);
};

export function normalizeResult(obj, filePath) {
  const dispatches = {};

  function addDispatch(names, { input: newInput, output: newOutput }) {
    for (let name of names) {
      const dispatch = dispatches[name] || {};
      const input = dispatch.input || [];
      const output = dispatch.output || [];
      dispatches[name] = {
        input: uniq(input.concat(newInput || [])),
        output: uniq(output.concat(newOutput || [])),
      };
    }
  }

  if (obj.routeComponents) {
    for (let rc of obj.routeComponents) {
      rc.filePath = filePath;
      rc.id = `RouteComponent${ID_SEP}${filePath}${ID_SEP}${rc.name}`;
      addDispatch(rc.dispatches, { input: [rc.id] });
    }
  }

  if (obj.models) {
    const reducerByIds = {};
    const effectByIds = {};
    const subscriptionByIds = {};

    for (let model of obj.models) {
      const reducerNames = model.reducers.map(item => item.name);
      const effectNames = model.effects.map(item => item.name);
      const actionMap = reducerNames.concat(effectNames)
        .reduce((memo, key) => {
          memo[key] = true;
          return memo;
        }, {});

      const namespace = model.namespace;
      model.id = `Model${ID_SEP}${filePath}${ID_SEP}${model.namespace}`;
      model.filePath = filePath;

      model.reducers = model.reducers.map(reducer => {
        const id = `Reducer${ID_SEP}${filePath}${ID_SEP}${reducer.name}`;
        addDispatch([`${namespace}/${reducer.name}`], { output: [id] });
        reducerByIds[id] = { ...reducer, id, filePath, modelId: model.id };
        return id;
      });
      model.effects = model.effects.map(effect => {
        const id = `Effect${ID_SEP}${filePath}${ID_SEP}${effect.name}`;
        addDispatch([`${namespace}/${effect.name}`], { output: [id] });
        const dispatches = effect.dispatches.map(name => {
          const newName = actionMap[name] ? `${model.namespace}/${name}` : name;
          addDispatch([newName], { input: [id] });
          return newName;
        });
        effectByIds[id] = { ...effect, id, filePath, dispatches, modelId: model.id };
        return id;
      });
      model.subscriptions = model.subscriptions.map(subscription => {
        const id = `Subscription${ID_SEP}${filePath}${ID_SEP}${subscription.name}`;
        const dispatches = subscription.dispatches.map(name => {
          const newName = actionMap[name] ? `${model.namespace}/${name}` : name;
          addDispatch([newName], { input: [id] });
          return newName;
        });
        subscriptionByIds[id] = { ...subscription, id, filePath, dispatches, modelId: model.id };
        return id;
      });
    }
    obj.models = {
      data: obj.models,
      reducerByIds,
      effectByIds,
      subscriptionByIds,
    };
  }

  if (obj.router) {
    obj.router.filePath = filePath;
  }

  obj.dispatches = dispatches;

  return obj;
}
