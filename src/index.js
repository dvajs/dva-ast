import Runner from 'dva-jscodeshift/dist/Runner';
import path from 'path';

export default function parse({ sourcePath, options }) {
  return Runner.run(
    path.resolve(path.join(__dirname, './transform.js')),
    [sourcePath],
    {
      extensions: 'js,jsx',
      dry: true,
      ...options,
    },
  ).then(({ transformInfo }) => {
    return transformInfo.reduce((prev, curr) => {
      return {
        models: curr.models ? prev.models.concat(curr.models) : prev.models,
        components: curr.components ? prev.components.concat(curr.components) : prev.components,
      }
    }, {
      models: [],
      components: [],
    });
  });
}
