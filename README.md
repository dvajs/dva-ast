# dva-ast
dva static analysis based on javascript ast

## usage

```
require('dva-ast').parse({
  sourcePath: './demo/user-dashboard',  // your dva project path
}).then(({ transformInfo }) => {
  // transformInfo is what you got from parse func.
});
```

## demo

> for details you could run the demo.

```bash
cd ./demo
```

```bash
npm i
```

```bash
npm start
```

open `localhost:8989`
