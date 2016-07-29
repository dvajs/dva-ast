# dva-ast
dva static analysis based on javascript ast

## try

`npm run transform`

you may see:
```
> dva-ast@1.0.0 transform /Users/Chris/gitlab/dva/dva-ast
> jscodeshift -t src/transform.js demo

Processing 1 files...
Spawning 1 workers...
Sending 1 files to free worker...
---------- models ----------
[ { namespace: 'products',
    state: { list: [Object], loading: false },
    subscriptions: [ [Object] ],
    effects: { 'products/query': [Object], 'products/vote': [Object] },
    reducers:
     { 'products/query': [Object],
       'products/query/success': [Object],
       'products/vote': [Object],
       'products/vote/success': [Object] } } ]
---------- containers ----------
[ { connect: { products: [Object] },
    component: { componentName: 'App' } },
  { connect: { p: [Object] },
    component: { componentName: 'TestApp0' } },
  { connect: { products: [Object], user: [Object] },
    component: { componentName: 'Component' } },
  { connect: { products: [Object], user: [Object] },
    component: { componentName: 'XComponent' } },
  { connect: { p: [Object] },
    component: { componentName: 'TestApp2' } } ]
All done.
Results:
0 errors
1 unmodified
0 skipped
0 ok
Time elapsed: 1.748seconds
```

This code demonstrated how we could do static analysis for infrastructure.

## next

- [ ] dva-specifications-for-ast
- [ ] dav-dev-chart
