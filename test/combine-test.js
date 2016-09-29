import combine from '../src/combine';
import { join } from 'path';
import expect from 'expect';
import { readFileSync } from 'fs';

const fixtures = join(__dirname, 'fixtures');

describe('combine', () => {

  it('count', () => {
    const jsonPath = join(fixtures, 'projects/count/expected.json');
    const infos = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    const result = combine(infos);
    const expected = readFileSync(join(jsonPath, '../combined.json'), 'utf-8');
    expect(JSON.stringify(result, null, 2)).toEqual(expected);
  });

  xit('user-dashboard', () => {
    const result = runner(join(fixtures, 'projects/user-dashboard/actual'));
    const expected = readFileSync(join(fixtures, 'projects/user-dashboard/expected.json'), 'utf-8');
    expect(JSON.stringify(result, null, 2))
      .toEqual(expected);
  });
});
