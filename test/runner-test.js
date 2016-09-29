import runner from '../src/runner';
import { join } from 'path';
import expect from 'expect';
import { readFileSync } from 'fs';

const fixtures = join(__dirname, 'fixtures');

xdescribe('runner', () => {

  it('count', () => {
    const result = runner(join(fixtures, 'projects/count/actual'));
    const expected = readFileSync(join(fixtures, 'projects/count/expected.json'), 'utf-8');
    expect(JSON.stringify(result, null, 2))
      .toEqual(expected);
  });

  it('user-dashboard', () => {
    const result = runner(join(fixtures, 'projects/user-dashboard/actual'));
    const expected = readFileSync(join(fixtures, 'projects/user-dashboard/expected.json'), 'utf-8');
    expect(JSON.stringify(result, null, 2))
      .toEqual(expected);
  });
});
