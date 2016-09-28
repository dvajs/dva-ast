import api from '../../src/api/index';
import expect from 'expect';
import { removeSync, outputFileSync } from 'fs-extra';
import { join, dirname } from 'path';

describe('api/routeComponents', () => {
  const filePath = './tmp/IndexPage.jsx';
  const absFilePath = join(__dirname, filePath);

  afterEach(() => {
    removeSync(dirname(absFilePath));
  });

  it('routeComponents.create', () => {
    const result = api('routeComponents.create', {
      filePath,
      sourcePath: __dirname,
      componentName: 'IndexPage',
    });
    expect(result).toEqual(
      {
        "models":{
          "data":[],
          "reducerByIds":{},
          "effectByIds":{},
          "subscriptionByIds":{}
        },
        "router":null,
        "routeComponents": [
          {
            "dispatches": [],
            "filePath": "./tmp/IndexPage.jsx",
            "id": "RouteComponent^^./tmp/IndexPage.jsx^^IndexPage",
            "name": "IndexPage",
            "source": "import React, { Component } from 'react';\n\nexport default class IndexPage extends Component {\n  render() {\n    return (\n      <div>Component: 'IndexPage'</div>\n    );\n  }\n}\n",
            "stateMappings": []
          }
        ],
        "dispatches":{}
      }
    );
  });

  /*
  it('routeComponents.remove', () => {
    outputFileSync(absFilePath, '', 'utf-8');

    const result = api('routeComponents.remove', {
      filePath: filePath,
      sourcePath: __dirname,
    });

    expect({}).toEqual({});
  });
  */

  it('routeComponents.update', () => {
    const result = api('routeComponents.update', {
      filePath,
      sourcePath: __dirname,
      "source": "import React, { Component } from 'react';\n\nexport default class IndexPage extends Component {\n  render() {\n    return (\n      <div><h1>Hello World!</h1></div>\n    );\n  }\n}\n",
    });
    expect(result).toEqual(
      {
        "models":{
          "data":[],
          "reducerByIds":{},
          "effectByIds":{},
          "subscriptionByIds":{}
        },
        "router":null,
        "routeComponents": [
          {
            "dispatches": [],
            "filePath": "./tmp/IndexPage.jsx",
            "id": "RouteComponent^^./tmp/IndexPage.jsx^^IndexPage",
            "name": "IndexPage",
            "source": "import React, { Component } from 'react';\n\nexport default class IndexPage extends Component {\n  render() {\n    return (\n      <div><h1>Hello World!</h1></div>\n    );\n  }\n}\n",
            "stateMappings": []
          }
        ],
        "dispatches":{}
      }
    );
  });

  it('routeComponents.addDispatch for Class Component', () => {
    api('routeComponents.create', {
      filePath,
      sourcePath: __dirname,
      componentName: 'IndexPage',
    });

    const result = api('routeComponents.addDispatch', {
      filePath,
      sourcePath: __dirname,
      actionType: 'app/initilize'
    });

    expect(result).toEqual({ dispatches: { 'app/initilize': { input: [ 'RouteComponent^^./tmp/IndexPage.jsx^^IndexPage' ], output: [] } }, models: { data: [], effectByIds: {}, reducerByIds: {}, subscriptionByIds: {} }, routeComponents: [ { dispatches: [ 'app/initilize' ], filePath: './tmp/IndexPage.jsx', id: 'RouteComponent^^./tmp/IndexPage.jsx^^IndexPage', name: 'IndexPage', source: 'import React, { Component } from \'react\';\n\nexport default class IndexPage extends Component {\n  ["app/initilize"]() {\n    this.props.dispatch({ type: \'app/initilize\', payload: {} });\n  }\n\n  render() {\n    return (\n      <div><button onClick={() => { this["app/initilize"]; }}>click to dispatch app/initilize</button>Component: \'IndexPage\'</div>\n    );\n  }\n}\n', stateMappings: [] } ], router: null });
  });
});
