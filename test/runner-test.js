import runner from '../src/runner';
import { join } from 'path';
import expect from 'expect';
import { readFileSync } from 'fs';

const fixtures = join(__dirname, 'fixtures');

describe('runner', () => {

  it('normal', () => {
    const result = runner(join(fixtures, 'projects/normal/actual'));
    const expected = readFileSync(join(fixtures, 'projects/normal/expected.json'), 'utf-8');
    expect(JSON.stringify(result, null, 2))
      .toEqual(expected);
  });
});
