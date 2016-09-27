import expect from 'expect';
import j from 'dva-jscodeshift';
import Helper from '../../src/collections/Helper';

// Register methods.
Helper.register();

describe('collections/Helper', () => {

  // Tested in other collections

  it('hasModule', () => {
    expect(j('import "a"').hasModule('a')).toEqual(true);
    expect(j('import "a"').hasModule('b')).toEqual(false);
    expect(j('const a = require("b")').hasModule('b')).toEqual(true);
    // require 了未使用, 不算
    expect(j('require("b")').hasModule('b')).toEqual(false);
  });

});
