# dva-ast
dva static analysis based on javascript ast

## usage

```
require('dva-ast').parse({
  sourcePath: './demo/user-dashboard',  // your dva project path
}).then(({ transformInfo }) => {
  // transformInfo is currently an array which contains dva infrastructure infos.
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
```
