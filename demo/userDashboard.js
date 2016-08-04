import parse from '../src/index';

const dvaSegments = parse({
  sourcePath: './demo/user-dashboard',
  transformInfo: true,
}).then(data => {
  console.log(data);
});
