import j from 'dva-jscodeshift';
//import Runner from 'dva-jscodeshift/dist/Runner';
import { join } from 'path';
import { sync as globSync } from 'glob';
import { readFileSync } from 'fs';
import transform from './transform';

export default function runner(sourcePath, options) {

  const files = globSync('**/*.js', {
    cwd: sourcePath,
    dot: false,
    ignore: ['node_modules/*']
  });

  let ret = {};
  files.forEach(path => {
    const source = readFileSync(join(sourcePath, path), 'utf-8');
    const file = { path, source };
    const api = { jscodeshift: j };
    const info = transform(file, api);
    console.log(path);
    console.log(info);
    console.log('----------------');
    ret = combine(ret, info);
  });
  console.log(JSON.stringify(ret, null, 2));
  return ret;

  //return Runner.run(
  //    join(__dirname, 'transform.js'),
  //    [sourcePath],
  //    {
  //      extensions: 'js,jsx',
  //      dry: true,
  //      ...options,
  //    }
  //  ).then(({ transformInfo }) => {
  //    console.log('transformInfo', transformInfo);
  //  });

};

export function combine(oldInfo, newInfo) {
  return {
    models: combineModels(oldInfo.models, newInfo.models),
    router: combineRouter(oldInfo.router, newInfo.router),
    dispatches: combineDispatches(oldInfo.dispatches, newInfo.dispatches),
    routeComponents: combineRouteComponents(oldInfo.routeComponents, newInfo.routeComponents),
  };
}

export function combineModels(oldModels, newModels) {
  if (!oldModels) return newModels;
  return {
    data: [ ...oldModels.data, ...newModels.data ],
    reducerByIds: { ...oldModels.reducerByIds, ...newModels.reducerByIds },
    effectByIds: { ...oldModels.effectByIds, ...newModels.effectByIds },
    subscriptionByIds: { ...oldModels.subscriptionByIds, ...newModels.subscriptionByIds },
  }
}

export function combineRouter(oldRouter, newRouter) {
  return oldRouter || newRouter;
}

export function combineDispatches(oldDispatches, newDispatches) {
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

export function combineRouteComponents(oldRC = [], newRC) {
  return [ ...oldRC, ...newRC ];
}
