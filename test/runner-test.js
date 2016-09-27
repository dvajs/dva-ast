import runner from '../src/runner';
import { join } from 'path';
import expect from 'expect';

const fixtures = join(__dirname, 'fixtures');

describe('runner', () => {

  it.only('normal', (done) => {

    runner(join(fixtures, 'projects/normal/actual'));

    //runner(join(fixtures, 'projects/normal/actual'), {
    //  babel: true,
    //  silent: false,
    //}).then(result => {
    //  expect(1).toEqual(1);
    //  done();
    //});
  });
});
