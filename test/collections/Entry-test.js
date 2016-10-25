import expect from 'expect';
import j from 'jscodeshift';
import Entry from '../../src/collections/Entry';

// Register methods.
Entry.register();

describe('collections/Entry', () => {

  it('findModelInjectPoints', () => {
    expect(j(`
      import dva from "dva";const app = dva();app.model("");
    `).findModelInjectPoints().size()).toEqual(1);
    expect(j(`
      import dva from "dva";const a = dva();a.model("");
    `).findModelInjectPoints().size()).toEqual(1);
    expect(j(`
      import dva from "dvax";const a = dva();a.model("");
    `).findModelInjectPoints().size()).toEqual(0);
    expect(j(`
      app.model("");
    `).findModelInjectPoints().size()).toEqual(0);
  });

  it('addModel', () => {
    const root = j(`
import dva from "dva";
const app = dva();
app.model(require("./models/app"));
app.router();
    `);
    root.addModel('./models/count');
    expect(root.toSource()).toEqual(`
import dva from "dva";
const app = dva();
app.model(require("./models/app"));
app.model(require("./models/count"));
app.router();
    `);
  });

  it('addModel throw if exists', () => {
    const root = j(`
import dva from "dva";
const app = dva();
app.model(require("./models/app"));
app.router();
    `);
    expect(() => {
      root.addModel('./models/app');
    }).toThrow(/addModel: model .\/models\/app exists/);
  });

});
