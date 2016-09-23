import jscodeshift from 'dva-jscodeshift/dist/core';
import recast from 'recast';
import Runner from 'dva-jscodeshift/dist/Runner';
import { join } from 'path';
import { statSync, readFile, writeFile } from 'fs';

export default function parse({ sourcePath, options }) {
  const ignoreConfig = [];
  try {
    const exists = statSync(`${sourcePath}/.gitignore`).isFile();
    if (exists) {
      ignoreConfig.push(`${sourcePath}/.gitignore`);
    }
  } catch (e) {
    console.warn('no .gitignore found!');
  }

  return Runner.run(
    join(__dirname, 'transform.js'),
    [sourcePath],
    {
      extensions: 'js,jsx',
      dry: true,
      ignoreConfig,
      ...options,
    }
  ).then(({ transformInfo }) => {
    const result = transformInfo.reduce((prev, curr) => {
      //console.log('curr', curr.dispatches);
      return {
        models: curr.models.concat(prev.models),
        effects: curr.effects.concat(prev.effects),
        reducers: curr.reducers.concat(prev.reducers),
        components: curr.components.concat(prev.components),
        dispatches: curr.dispatches.concat(prev.dispatches),
        routes: (curr.routes || []).concat(prev.routes),
      };
    }, {
      models: [],
      effects: [],
      reducers: [],
      components: [],
      dispatches: [],
      routes: [],
    });

    // TODO:
    // 转化 models 和 dispatches 里的 action 为 String

    //const d = {};
    //result.dispatches.forEach(actionType => {
    //  d[actionType] = true;
    //});
    //result.dispatches = Object.keys(d);
    return result;
  });
}

export function saveReducer(reducer, cb) {
  readFile(reducer.filePath, (err, source) => {
    if (err) {
      cb({ err });
      return;
    }
    const data = source.toString();
    const out = jscodeshift(data);

    try {
      out.find(
        jscodeshift[reducer.node.type], { start: reducer.node.start }
      ).forEach(p => {
        const reducerCollection = jscodeshift(`(${reducer.data})`);
        reducerCollection.forEach(r => {
          p.replace(r.value.program.body[0].expression);
        });
      });
    } catch (e) {
      cb({ err: e });
      return;
    }

    writeFile(reducer.filePath, out.toSource(), (writeError) => {
      if (writeError) {
        cb({ err: writeError });
        return;
      }
      cb();
    });
  });
}
