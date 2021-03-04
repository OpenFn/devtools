// =============================================================================
// Node script to generate a project.yaml for use with microservice or platform
// =============================================================================

var prompt = require('prompt');
var colors = require('colors/safe');
const yaml = require('js-yaml');
const fs = require('fs');

prompt.colors = false;
prompt.message = '';

console.log(
  'Welcome to the project spec generator.',
  'This wizard will help you generate a project.yaml file',
  `for use with ${colors.cyan('OpenFn/platform')} and ${colors.cyan(
    'OpenFn/microservice'
  )}.`
);

const another = thing => ({
  another: {
    description: colors.cyan(`Would you like to add another ${thing}? (y/n)`),
    type: 'string',
    message: 'please enter "y" or "n"',
  },
});

const jobForm = {
  properties: {
    name: {
      description: colors.cyan('Job name'),
      type: 'string',
      required: true,
    },
    expression: {
      description: colors.cyan(
        'Path to the job (probably a job.js file) or the expression itself'
      ),
      type: 'string',
      required: true,
    },
    adaptor: {
      description: colors.cyan('Adaptor'),
      default: '@openfn/language-http',
      type: 'string',
      required: true,
    },
    trigger: {
      description: colors.cyan('Trigger'),
      type: 'string',
      required: true,
    },
    credential: {
      description: colors.cyan('Credential'),
      type: 'string',
      required: true,
    },
    ...another('job'),
  },
};

const triggerForm = {
  properties: {
    name: {
      description: colors.cyan('Trigger name'),
      type: 'string',
      required: true,
    },
    type: {
      description: colors.cyan(
        'Trigger type (cron | message | success | failure)'
      ),
      conform: value =>
        ['cron', 'message', 'success', 'failure'].includes(value),
      type: 'string',
      required: true,
      message: 'please enter "cron", "message", "success", or "failure"',
    },
    cron: {
      description: colors.cyan('Trigger cron'),
      type: 'string',
      ask: () => prompt.history('type').value === 'cron',
    },
    criteria: {
      description: colors.cyan('Message criteria'),
      type: 'string',
      ask: () => prompt.history('type').value === 'message',
    },
    success: {
      description: colors.cyan('Triggering job (on success)'),
      type: 'string',
      ask: () => prompt.history('type').value === 'success',
    },
    failure: {
      description: colors.cyan('Triggering job (on failure)'),
      type: 'string',
      ask: () => prompt.history('type').value === 'failure',
    },
    ...another('trigger'),
  },
};

const credentialForm = {
  properties: {
    name: {
      description: colors.cyan('Credential name'),
      type: 'string',
      required: true,
    },
    body: {
      description: colors.cyan('Path to credential.json'),
      type: 'string',
      required: true,
    },
    ...another('credential'),
  },
};

const removeFalsy = obj => {
  let newObj = {};
  Object.keys(obj).forEach(prop => {
    if (obj[prop]) {
      newObj[prop] = obj[prop];
    }
  });
  return newObj;
};

async function setDest() {
  const { dest } = await prompt.get([
    {
      name: 'dest',
      required: true,
      description: colors.cyan('Where do you want to save the generated yaml?'),
      default: './tmp/project.yaml',
    },
  ]);

  return dest;
}

async function addJob() {
  const { name, another, ...rest } = await prompt.get(jobForm);
  jobs[name] = { ...rest };

  if (another === 'y') {
    return addJob();
  } else {
    console.log('OK. Jobs written.');
  }
}

async function addTrigger() {
  const { name, another, ...rest } = await prompt.get(triggerForm);
  triggers[name] = { ...removeFalsy(rest) };

  if (another === 'y') {
    return addTrigger();
  } else {
    console.log('OK. Triggers written.');
  }
}

async function addCredential() {
  const { name, another, body } = await prompt.get(credentialForm);
  credentials[name] = body;

  if (another === 'y') return addCredential();
  console.log('OK. Credentials written.');
}

let destination_path = '';
let jobs = {};
let triggers = {};
let credentials = {};
let outputPath = '';

prompt.start();

setDest()
  .then(dest => {
    outputPath = dest;
    console.log("Let's add your first job.");
    return addJob();
  })
  .then(() => {
    console.log("Let's add some triggers.");
    return addTrigger();
  })
  .then(() => {
    console.log("Let's add some credentials.");
    return addCredential();
  })
  .then(() => {
    const data = yaml.dump({ jobs, triggers, credentials });
    console.log('Project yaml configuration complete:');
    console.log(data);
    console.log(`Writing to ${outputPath}`);
    fs.writeFileSync(outputPath, data);
    console.log(`Done.`);
  })
  .catch(err => {
    console.log('\n', "That didn't work. Error:", err.message);
  });
