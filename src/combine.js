import j from 'jscodeshift';
//import Runner from 'jscodeshift/dist/Runner';
import { join } from 'path';
import { sync as globSync } from 'glob';
import { readFileSync } from 'fs';
import transform from './transform';

export default function combine(infos) {
  return Object.keys(infos).reduce((memo, filePath) => {
    return merge(memo, infos[filePath]);
  }, {});
}

function merge(oldInfo, newInfo) {
  return {
    models: combineModels(oldInfo.models, newInfo.models),
    router: combineRouter(oldInfo.router, newInfo.router),
    dispatches: combineDispatches(oldInfo.dispatches, newInfo.dispatches),
    routeComponents: combineRouteComponents(oldInfo.routeComponents, newInfo.routeComponents),
  };
}

function combineModels(oldModels, newModels) {
  if (!oldModels) return newModels;
  return {
    data: [ ...oldModels.data, ...newModels.data ],
    reducerByIds: { ...oldModels.reducerByIds, ...newModels.reducerByIds },
    effectByIds: { ...oldModels.effectByIds, ...newModels.effectByIds },
    subscriptionByIds: { ...oldModels.subscriptionByIds, ...newModels.subscriptionByIds },
  }
}

function combineRouter(oldRouter, newRouter) {
  return oldRouter || newRouter;
}

function combineDispatches(oldDispatches, newDispatches) {
  const ret = { ...oldDispatches };
  for (let key in newDispatches) {
    if (newDispatches.hasOwnProperty(key)) {
      if (!ret[key]) {
        ret[key] = newDispatches[key];
      } else {
        ret[key] = {
          input: [ ...ret[key].input, ...newDispatches[key].input ],
          output: [ ...ret[key].output, ...newDispatches[key].output ],
        };
      }
    }
  }
  return ret;
}

function combineRouteComponents(oldRC = [], newRC) {
  return [ ...oldRC, ...newRC ];
}
