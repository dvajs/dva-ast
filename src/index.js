import jscodeshift from 'dva-jscodeshift/dist/core';
import recast from 'recast';
import Runner from 'dva-jscodeshift/dist/Runner';
import path from 'path';
import fs from 'fs';

export default function parse({ sourcePath, options }) {
  const ignoreConfig = [];
  try {
    const exists = fs.statSync(`${sourcePath}/.gitignore`).isFile();
    if (exists) {
      ignoreConfig.push(`${sourcePath}/.gitignore`);
    }
  } catch (e) {
    console.warn('no .gitignore found!');
  }

  return Runner.run(
    path.resolve(path.join(__dirname, './transform.js')),
    [sourcePath],
    {
      extensions: 'js,jsx',
      dry: true,
      ignoreConfig,
      ...options,
    },
  ).then(({ transformInfo }) => {
    const result = transformInfo.reduce((prev, curr) => ({
      models: curr.models.concat(prev.models),
      effects: curr.effects.concat(prev.effects),
      reducers: curr.reducers.concat(prev.reducers),
      components: curr.components.concat(prev.components),
      dispatches: curr.dispatches.concat(prev.dispatches),
    }), {
      models: [],
      effects: [],
      reducers: [],
      components: [],
      dispatches: [],
    });

    const d = {};
    result.dispatches.forEach(actionType => {
      d[actionType] = true;
    });
    result.dispatches = Object.keys(d);
    return result;
  });
}

export function saveReducer(reducer, cb) {
  fs.readFile(reducer.filePath, (err, source) => {
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

    fs.writeFile(reducer.filePath, out.toSource(), (writeError) => {
      if (writeError) {
        cb({ err: writeError });
        return;
      }
      cb();
    });
  });
}
