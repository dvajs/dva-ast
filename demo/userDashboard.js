import parse from '../src/index';

export default function getDvaSegments() {
  return parse({
    sourcePath: './demo/user-dashboard',
    transformInfo: true,
  }).then(({ transformInfo }) => {
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
