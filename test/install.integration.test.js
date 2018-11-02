const stripAnsi = require('strip-ansi');
const {main} = require('../src/install');

const fakeStream = () => {
  const content = [];
  return {
    write(chunk) {
      content.push(chunk);
    },
    getContent() {
      return content.join('');
    }
  };
};
const fakeExec = () => {
  let runCommand;
  const exec = cmd => {
    runCommand = cmd;
  };
  exec.retrieveCmd = () => runCommand;
  return exec;
};

describe('Integrations tests', () => {
  it('install just a single package and fail', done => {
    const stream = fakeStream();
    const exec = fakeExec();
    // had to pin version for test stability
    return main({argv: {_: ['lodash@4.12.0']}, stream, exec})
      .catch(err => {
        expect(err.message).toEqual('Install was canceled.');
        const output = stream.getContent();
        expect(stripAnsi(output)).toEqual(
          `- Fetching stats for package lodash@4.12.0
ℹ Could not install for following reasons:
✖ lodash@4.12.0: size over threshold (64652 > 10000)
`
        );

        return done();
      })
      .catch(done);
  });
  it('install just a single package and succeed', done => {
    const stream = fakeStream();
    const exec = fakeExec();
    // had to pin version for test stability
    return main({argv: {_: ['bytes@3.0.0']}, stream, exec})
      .then(() => {
        const output = stream.getContent();
        expect(stripAnsi(output)).toEqual(
          `- Fetching stats for package bytes@3.0.0
ℹ Proceed to installation of package bytes@3.0.0
`
        );
        expect(exec.retrieveCmd()).toEqual('npm install bytes@3.0.0');

        return done();
      })
      .catch(done);
  });
});