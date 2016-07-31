import Runner from 'jscodeshift/dist/Runner';
import path from 'path';

export default function parse({ sourcePath }) {
  Runner.run(
    path.resolve('./src/transform.js'),
    [sourcePath],
    {
      extensions: 'js,jsx',
    },
  );
}
