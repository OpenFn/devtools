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
  `for use with ${colors.blue('OpenFn/platform')} and ${colors.blue(
    'OpenFn/microservice'
  )}.`
);

const another = thing => ({
  another: {
    description: colors.blue(`Would you like to add another ${thing}? (y/n)`),
    type: 'string',
    message: 'please enter "y" or "n"',
  },
});

const jobForm = {
  properties: {
    name: {
      description: colors.magenta('Job name'),
      type: 'string',
      required: true,
    },
    expression: {
      description: colors.magenta(
        'Path to the job (probably a job.js file) or the expression itself'
      ),
      type: 'string',
      required: true,
    },
    adaptor: {
      description: colors.magenta('Adaptor'),
      default: '@openfn/language-http',
      type: 'string',
      required: true,
    },
    trigger: {
      description: colors.magenta('Trigger'),
      type: 'string',
      required: true,
    },
    credential: {
      description: colors.magenta('Credential'),
      type: 'string',
      required: true,
    },
    ...another('job'),
  },
};

const triggerForm = {
  properties: {
    name: {
      description: colors.magenta('Trigger name'),
      type: 'string',
      required: true,
    },
    type: {
      description: colors.magenta(
        'Trigger type (cron | message | success | failure)'
      ),
      conform: value =>
        ['cron', 'message', 'success', 'failure'].includes(value),
      type: 'string',
      required: true,
      message: 'please enter "cron", "message", "success", or "failure"',
    },
    cron: {
      description: colors.magenta('Trigger cron'),
      type: 'string',
      ask: () => prompt.history('type').value === 'cron',
    },
    criteria: {
      description: colors.magenta('Message criteria'),
      type: 'string',
      ask: () => prompt.history('type').value === 'message',
    },
    success: {
      description: colors.magenta('Triggering job (on success)'),
      type: 'string',
      ask: () => prompt.history('type').value === 'success',
    },
    failure: {
      description: colors.magenta('Triggering job (on failure)'),
      type: 'string',
      ask: () => prompt.history('type').value === 'failure',
    },
    ...another('trigger'),
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
      description: colors.red('Where do you want to save the generated yaml?'),
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
    console.log('wrote yaml:\n', data);
    fs.writeFileSync(outputPath, data);
  })
  .catch(err => {
    console.log('\n', "That didn't work. Error:", err.message);
  });
