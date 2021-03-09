const run = require('inquirer-test');
const { UP, DOWN, ENTER } = run;
const expect = require('chai').expect;
const fs = require('fs');

const cliPath = './scripts/generate-project.js';

const expectedMono = fs.readFileSync('./test/fixtures/test-mono-output.yaml');
const expectedURI = fs.readFileSync('./test/fixtures/test-uri-output.yaml');

describe('generate-project.js', function () {
  this.timeout(15000);
  it('should create a uri-based project.yaml', async () => {
    const testOutputPath = './_test-URI-project.yaml';
    expect(fs.existsSync(testOutputPath)).to.be.false;

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
        DOWN, // nav to success
        ENTER, // enter success
        'job-87',
        ENTER, // enter criteria
        DOWN,
        ENTER, // enter "more triggers"
        'trigger-2',
        ENTER,
        ENTER, // enter cron
        ENTER, // enter '* * * *'
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
        DOWN, // select second adaptor
        ENTER, // enter second adaptor
        ENTER, // enter first trigger
        ENTER, // enter first credential
        ENTER, // enter no more jobs
        'job-87',
        ENTER,
        'test/fixtures/sampleExpression.js',
        ENTER, // enter expression path
        ENTER, // enter default adaptor
        ENTER, // enter first trigger
        ENTER, // enter first credential
        ENTER, // enter no more jobs
      ],
      120
    );

    const lines = result.split(/\r?\n/);
    expect(lines[lines.length - 2]).to.eq('Done. Happy integrating.');

    const file = fs.readFileSync(testOutputPath);
    fs.unlinkSync(testOutputPath);
    expect(file.equals(expectedURI)).to.be.true;
  });

  it('should create a monolith-based project.yaml', async () => {
    const testOutputPath = './_test-MONO-project.yaml';
    expect(fs.existsSync(testOutputPath)).to.be.false;

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
      120
    );

    const lines = result.split(/\r?\n/);
    expect(lines[lines.length - 2]).to.eq('Done. Happy integrating.');

    const file = fs.readFileSync(testOutputPath);

    fs.unlinkSync(testOutputPath);
    expect(file.equals(expectedMono)).to.be.true;
  });
});
