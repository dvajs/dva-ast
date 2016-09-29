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

- `create({ namespace })`
- `remove({ namespace })`
- `updateNamespace({ namespace, newNamespace })`
- `updateState({ namespace, source })`
- `addReducer({ namespace, [source] })`
- `updateReducer({ namespace, source })`
- `removeReducer({ namespace })`
- `addEffect({ namespace, [source] })`
- `updateEffect({ namespace, source })`
- `removeEffect({ namespace })`
- `addSubscription({ namespace, [source] })`
- `updateSubscription({ namespace, source })`
- `removeSubscription({ namespace })`

#### routeComponents

- `create({ componentName })`
- `remove()`
- `update()`
- `addDispatch({ actionType })`

#### router

TODO

## LICENSE

MIT
