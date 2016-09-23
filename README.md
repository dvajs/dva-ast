# dva-ast
dva static analysis based on javascript ast

## Usage

```javascript
require('dva-ast')
  .parse({
    sourcePath: './demo/user-dashboard',  // your dva project path
  })
  .then(({ transformInfo }) => {
    console.log(transformInfo);
  });
```

## Demo

> for details you could run the demo.

```bash
npm run demo
```

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
