// =============================================================================
// Node script to generate a project.yaml for use with microservice or platform
// =============================================================================

var prompt = require('prompt');
var colors = require('colors/safe');
const yaml = require('js-yaml');
const fs = require('fs');

prompt.colors = false;
prompt.message = '';

let outputPath = '';
let type = '';
let jobs = {};
let triggers = {};
let credentials = {};

console.log(
  'Welcome to the project spec generator.',
  'This wizard will help you generate a project.yaml file',
  `for use with ${colors.brightCyan('OpenFn/platform')} and ${colors.brightCyan(
    'OpenFn/microservice'
  )}.`
);

const another = thing => ({
  another: {
    description: colors.brightCyan(
      `Would you like to add another ${thing}? (y/n)`
    ),
    type: 'string',
    message: 'please enter "y" or "n"',
  },
});

const duplicateCheck = (val, obj) => !Object.keys(obj).includes(val);

const name = (arr, thing) => ({
  name: {
    description: colors.brightCyan(`${thing} name`),
    type: 'string',
    required: true,
    conform: value => duplicateCheck(value, arr),
    message: `${thing} names must be unique; please try something else.`,
  },
});

const jobForm = {
  properties: {
    ...name(jobs, 'Job'),
    expression: {
      description: colors.brightCyan(
        'Path to the job (./my-job.js) or the expression itself'
      ),
      type: 'string',
      required: true,
    },
    adaptor: {
      description: colors.brightCyan('Adaptor'),
      default: '@openfn/language-http',
      type: 'string',
      required: true,
    },
    trigger: {
      description: colors.brightCyan('Trigger'),
      type: 'string',
      required: true,
    },
    credential: {
      description: colors.brightCyan('Credential'),
      type: 'string',
      required: true,
    },
    ...another('job'),
  },
};

const triggerForm = {
  properties: {
    ...name(triggers, 'Trigger'),
    type: {
      description: colors.brightCyan(
        'Trigger type (cron | message | success | failure)'
      ),
      conform: value =>
        ['cron', 'message', 'success', 'failure'].includes(value),
      type: 'string',
      required: true,
      message: 'please enter "cron", "message", "success", or "failure"',
    },
    cron: {
      description: colors.brightCyan('Trigger cron'),
      type: 'string',
      ask: () => prompt.history('type').value === 'cron',
    },
    criteria: {
      description: colors.brightCyan('Message criteria'),
      type: 'string',
      ask: () => prompt.history('type').value === 'message',
    },
    success: {
      description: colors.brightCyan('Triggering job (on success)'),
      type: 'string',
      ask: () => prompt.history('type').value === 'success',
    },
    failure: {
      description: colors.brightCyan('Triggering job (on failure)'),
      type: 'string',
      ask: () => prompt.history('type').value === 'failure',
    },
    ...another('trigger'),
  },
};

const credentialForm = {
  properties: {
    ...name(credentials, 'Credential'),
    body: {
      description: colors.brightCyan('Path to credential.json'),
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

async function setType() {
  const { type } = await prompt.get([
    {
      name: 'type',
      required: true,
      description: colors.brightCyan(
        'Do you want to generate a monolith project.yaml or a URI-based project.yaml?\n',
        '(monolith | uri)'
      ),
      conform: value => value === 'uri',
      message: 'Sorry, only "uri" is supported right now.',
      default: 'uri',
    },
  ]);

  return type;
}

async function setDest() {
  const { dest } = await prompt.get([
    {
      name: 'dest',
      required: true,
      description: colors.brightCyan(
        'Where do you want to save the generated yaml?'
      ),
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

prompt.start();

setDest()
  .then(dest => {
    outputPath = dest;
    return setType();
  })
  .then(type => {
    type = type;
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
    if (type === 'monolith') {
      // TODO: open the files, grab the JSON, write it as yaml.
    } else {
      const data = yaml.dump({ jobs, triggers, credentials });
      console.log('Project yaml configuration complete:');
      console.log(data);
      console.log(`Writing to ${outputPath}`);
      fs.writeFileSync(outputPath, data);
    }
    console.log(`Done.`);
  })
  .catch(err => {
    console.log('\n', "That didn't work. Error:", err.message);
  });
