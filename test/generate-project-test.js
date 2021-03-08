const run = require('inquirer-test');
const { UP, DOWN, ENTER } = run;
const expect = require('chai').expect;
const fs = require('fs');

const cliPath = './scripts/generate-project.js';
const testOutputPath = './testProject.yaml';

const expectedMonoBuffer = fs.readFileSync(
  './test/fixtures/test-mono-output.yaml'
);
const expectedUriBuffer = fs.readFileSync(
  './test/fixtures/test-uri-output.yaml'
);

describe('generate-project.js', function () {
  this.timeout(15000);
  it.only('should create a uri-based project.yaml', async function () {
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
        // DOWN, // pick monolith
        ENTER,
        'trigger-1',
        ENTER,
        DOWN, // nav to message
        ENTER, // enter message
        '{"b": 5}',
        ENTER, // enter criteria
        ENTER, // enter "no more triggers"
        'credential-1',
        ENTER,
        'test/fixtures/sampleCredential.json',
        ENTER,
        ENTER, // enter "no more credentials"
        'job-1',
        ENTER,
        'test/fixtures/sampleExpression.js',
        ENTER, // enter expression path
        ENTER, // enter default adaptor
        ENTER, // enter first trigger
        ENTER, // enter first credential
        ENTER, // enter no more jobs
      ],
      100
    );

    console.log(result);

    const lines = result.split(/\r?\n/);
    expect(lines[lines.length - 2]).to.eq('Done. Happy integrating.');

    const file = fs.readFileSync(testOutputPath);
    fs.unlinkSync(testOutputPath);
    expect(file.equals(expectedUriBuffer)).to.be.true;
  });

  it('should create a monolith-based project.yaml', async function () {
    try {
      fs.accessSync(testOutputPath);
      throw 'test output file already exists';
    } catch (err) {
      console.log('no previous output file, starting test');
    }

    fs.writeFileSync(
      'test/fixtures/sampleCredential.json',
      JSON.stringify({ user: 'secret', pass: 'shhh' }, null, 2)
    );

    const result = await run(
      [cliPath],
      [
        testOutputPath,
        ENTER, // enter path
        DOWN, // pick monolith
        ENTER,
        'trigger-1',
        ENTER,
        DOWN, // nav to message
        ENTER, // enter message
        '{"b": 5}',
        ENTER, // enter criteria
        ENTER, // enter "no more triggers"
        'credential-1',
        ENTER,
        'test/fixtures/sampleCredential.json',
        ENTER,
        ENTER, // enter "no more credentials"
        'job-1',
        ENTER,
        'test/fixtures/sampleExpression.js',
        ENTER, // enter expression path
        ENTER, // enter default adaptor
        ENTER, // enter first trigger
        ENTER, // enter first credential
        ENTER, // enter no more jobs
      ],
      100
    );

    const lines = result.split(/\r?\n/);
    expect(lines[lines.length - 2]).to.eq('Done. Happy integrating.');

    const file = fs.readFileSync(testOutputPath);

    fs.unlinkSync(testOutputPath);
    expect(file.equals(expectedMonoBuffer)).to.be.true;
  });
});
