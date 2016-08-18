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
  ).then(({ transformInfo }) =>
    transformInfo.reduce((prev, curr) => ({
      models: curr.models ? prev.models.concat(curr.models) : prev.models,
      components: curr.components ? prev.components.concat(curr.components) : prev.components,
    }), {
      models: [],
      components: [],
    })
  );
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
