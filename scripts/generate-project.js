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
  'Welcome to the project spec generator. This wizard will help you generate project.yaml files for use with OpenFn platform and microservices.'
);

let destination_path = '';

const jobForm = {
  properties: {
    name: {
      description: colors.magenta('Job name'),
      type: 'string',
      required: true,
    },
    trigger: {
      description: colors.magenta('Trigger'),
      type: 'string',
      required: true,
    },
    adaptor: {
      description: colors.magenta('Adaptor'),
      type: 'string',
      required: true,
    },
    credential: {
      description: colors.magenta('Credential'),
      type: 'string',
      required: true,
    },
    expression: {
      description: colors.magenta(
        'Path to expression (probably a job.js file)'
      ),
      type: 'string',
      required: true,
    },
    another: {
      description: colors.red('Would you like to add another job? (y/n)'),
      type: 'string',
      message: 'please enter "y" or "n"',
    },
  },
};

const triggerForm = {
  properties: {
    name: {
      description: colors.magenta('Trigger name'),
      type: 'string',
      required: true,
    },
    cron: {
      description: colors.magenta('Trigger cron'),
      type: 'string',
      required: true,
    },
    another: {
      description: colors.red('Would you like to add another trigger? (y/n)'),
      type: 'string',
      message: 'please enter "y" or "n"',
    },
  },
};

const credentialForm = {
  properties: {
    name: {
      description: colors.magenta('Credential name'),
      type: 'string',
      required: true,
    },
    body: {
      description: colors.magenta('Path to credential.json'),
      type: 'string',
      required: true,
    },
    another: {
      description: colors.red(
        'Would you like to add another credential? (y/n)'
      ),
      type: 'string',
      message: 'please enter "y" or "n"',
    },
  },
};

prompt.start();

async function setDest() {
  const { dest } = await prompt.get([
    {
      name: 'dest',
      required: true,
      description: colors.red('Where do you want to save the generated yaml?'),
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
  triggers[name] = { ...rest };

  if (another === 'y') {
    return addTrigger();
  } else {
    console.log('OK. Triggers written.');
  }
}

async function addCredential() {
  const { name, another, ...rest } = await prompt.get(credentialForm);
  credentials[name] = { ...rest };

  if (another === 'y') return addCredential();
  console.log('OK. Credentials written.');
}

let jobs = {};
let triggers = {};
let credentials = {};
let outputPath = '';

setDest()
  .then(dest => {
    outputPath = dest;
    return addJob();
  })
  .then(() => {
    return addTrigger();
  })
  .then(() => {
    return addCredential();
  })
  .then(() => {
    const data = yaml.dump({ jobs, triggers, credentials });
    console.log('wrote yaml:\n', data);
    fs.writeFileSync(outputPath, data);
  })
  .catch(err => {
    console.log('\n', "That didn't work. Error:", err.message);
  });