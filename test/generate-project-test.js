const run = require('inquirer-test');
const { UP, DOWN, ENTER } = run;
const expect = require('chai').expect;
const fs = require('fs');

const cliPath = './scripts/generate-project.js';
const testOutputPath = './testProject.js';

const expectedYaml =
  "jobs:\n  job-1:\n    expression: ./tmp/expression.js\n    adaptor: '@openfn/language-http'\n    trigger: trigger-1\n    credential: credential-1\ncredentials:\n  credential-1: ./tmp/some-cred.json\ntriggers:\n  trigger-1:\n    type: message\n";

describe('generate-project.js', function () {
  it('should return create a yaml file', async function () {
    this.timeout(15000);
    try {
      fs.accessSync(testOutputPath);
      throw 'test output file already exists';
    } catch (err) {
      console.log('no previous output file, starting test');
    }

    const result = await run(
      [cliPath],
      [
        testOutputPath,
        ENTER, // enter path
        DOWN, // pick monolith
        ENTER,
        'trigger-1',
        ENTER,
        DOWN, // pick message
        '{b:5}',
        ENTER,
        DOWN,
        ENTER,
        ENTER,
        'credential-1',
        ENTER,
        './tmp/some-cred.json',
        ENTER,
        ENTER,
        'job-1',
        ENTER,
        './tmp/expression.js',
        ENTER,
        ENTER,
        ENTER,
        ENTER,
        ENTER,
      ],
      100
    );
    console.log(result);

    const file = fs.readFileSync(testOutputPath);
    expect(file.toString()).to.eql(expectedYaml);
    fs.unlinkSync(testOutputPath);
  });
});
