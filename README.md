# dva-ast

[![NPM version](https://img.shields.io/npm/v/dva-ast.svg?style=flat)](https://npmjs.org/package/dva-ast)
[![Build Status](https://img.shields.io/travis/dvajs/dva-ast.svg?style=flat)](https://travis-ci.org/dvajs/dva-ast)

dva static analysis based on javascript ast.

## Development Workflow

After cloning this repo.

```bash
$ npm install
$ npm run debug
```

## API

### runner

- runner(sourcePath, options)

### transform

- transform({ source, path }, { jscodeshift })

### api

#### models

All apis of models contains `sourcePath` and `filePath`.

- `create({ namespace, entry?, modelPath? })`
- `remove({ namespace })`
- `updateNamespace({ namespace, newNamespace })`
- `updateState({ namespace, source })`
- `addReducer({ namespace, name, [source] })`
- `updateReducer({ namespace, name, source })`
- `removeReducer({ namespace, name })`
- `addEffect({ namespace, name, [source] })`
- `updateEffect({ namespace, name, source })`
- `removeEffect({ namespace, name })`
- `addSubscription({ namespace, name, [source] })`
- `updateSubscription({ namespace, name, source })`
- `removeSubscription({ namespace, name })`

#### routeComponents

All apis of routeComponents contains `sourcePath` and `filePath`.

- `create({ componentName })`
- `remove()`
- `update()`
- `addDispatch({ actionType })`

#### project

- `loadAll({ sourcePath })`
- `loadAll({ sourcePath, filePath })`

#### router

- `createRoute({ path, component, [parentId] })`
  - component `<object>`
  - componentName
  - filePath, if file is not exist, dva-ast will create a new component for you
- `createIndexRoute({ component, [parentId] })`
- `createRedirect({ from, to, [parentId] })`
- `createIndexRedirect({ to, [parentId] })`
- `remove({ id })`
- `moveTo({ id, parentId })`

#### entry

- `addModel({ entry, modelPath })`

## LICENSE

MIT
