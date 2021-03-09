#!/usr/bin/env node
// =============================================================================
// Node script to generate a project.yaml for use with microservice or platform
// =============================================================================
var inquirer = require('inquirer');
inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'));

var colors = require('colors/safe');
const gfynonce = require('gfynonce');
const yaml = require('js-yaml');
const fs = require('fs');

let outputPath = '';
let type = '';
let jobs = {};
let triggers = {};
let credentials = {};

console.log(
  'Welcome to the project spec generator.',
  'This wizard will help you generate a project.yaml file',
  `for use with ${colors.brightMagenta(
    'OpenFn/platform'
  )} and ${colors.brightMagenta('OpenFn/microservice')}.`
);

const another = thing => ({
  name: 'another',
  message: `Would you like to add another ${thing}?`,
  type: 'list',
  choices: ['yes', 'no'],
  default: 'no',
});

const duplicateCheck = (val, obj) => !Object.keys(obj).includes(val);

const animalGen = thing =>
  `${gfynonce({
    adjectives: 1,
    separator: '-',
  })}-${thing}`.toLowerCase();

const name = (arr, thing, suggestedName) => ({
  name: 'name',
  message: `${thing} name`,
  type: 'string',
  required: true,
  default: suggestedName,
  // before: value => {
  //   if (value.includes(' ')) {
  //     const safeName = value.replace(/\s+/g, '-');
  //     console.log(
  //       `We are replacing spaces with hyphens. The new name will be "${safeName}".`
  //     );
  //     return safeName;
  //   }
  //   return value;
  // },
  validate: value => duplicateCheck(value, arr),
  error: `${thing} names must be unique; please try something else.`,
});

const jobForm = suggestedName => [
  name(jobs, 'Job', suggestedName),
  {
    name: 'expression',
    message: 'Path to the job expression',
    type: 'fuzzypath',
    excludePath: nodePath => excludeHeavyPaths(nodePath),
    validate: value => {
      if (!value.endsWith('.js')) return 'Please choose a path ending in ".js"';
      if (!fs.existsSync(value))
        return "We can't find a file there, please double-check your path.";
      return true;
    },
    suggestOnly: true,
    filter: value => `file://${value}`,
  },
  {
    name: 'adaptor',
    message: 'Adaptor',
    default: '@openfn/language-http',
    type: 'list',
    choices: [
      // TODO: Pull list from github? Or openfn.org?
      '@openfn/language-http',
      '@openfn/language-commcare',
      '@openfn/language-dhis2',
      '@openfn/language-kobotoolbox',
    ],
    required: true,
  },
  {
    name: 'trigger',
    message: 'Trigger',
    type: 'list',
    choices: () => Object.keys(triggers),
    required: true,
  },
  {
    name: 'credential',
    message: 'Credential',
    type: 'list',
    choices: () => Object.keys(credentials),
    required: true,
  },
  another('job'),
];

const triggerForm = suggestedName => [
  name(triggers, 'Trigger', suggestedName),
  {
    name: 'type',
    choices: ['cron', 'message', 'success', 'failure'],
    message: 'Trigger type',
    validate: value =>
      ['cron', 'message', 'success', 'failure'].includes(value),
    type: 'list',
    default: 'cron',
    required: true,
    error: 'please enter "cron", "message", "success", or "failure"',
  },
  {
    name: 'cron',
    message: 'Trigger cron',
    type: 'string',
    default: '* * * * *',
    when: answers => answers.type === 'cron',
  },
  {
    name: 'criteria',
    message: 'Message criteria',
    type: 'string',
    default: '{"a": 1}',
    when: answers => answers.type === 'message',
  },
  {
    name: 'success',
    message: 'Triggering job (on success)',
    type: 'string',
    // TODO: validate that these jobs exist? How, if we create triggers first?
    when: answers => answers.type === 'success',
  },
  {
    name: 'failure',
    message: 'Triggering job (on failure)',
    type: 'string',
    // TODO: validate that these jobs exist? How, if we create triggers first?
    when: answers => answers.type === 'failure',
  },
  another('trigger'),
];

const credentialForm = suggestedName => [
  name(credentials, 'Credential', suggestedName),
  {
    name: 'body',
    message: 'Path to credential.json',
    type: 'fuzzypath',
    excludePath: nodePath => excludeHeavyPaths(nodePath),
    validate: value => {
      if (!value.endsWith('.json'))
        return 'Please choose a path ending in ".json"';
      if (!fs.existsSync(value))
        return "We can't find a file there, please double-check your path.";
      return true;
    },
    suggestOnly: true,
    filter: value => `file://${value}`,
  },
  another('credential'),
];

const removeFalsy = obj => {
  let newObj = {};
  Object.keys(obj).forEach(prop => {
    if (obj[prop]) {
      newObj[prop] = obj[prop];
    }
  });
  return newObj;
};

async function addJob(suggestedName) {
  return inquirer
    .prompt(jobForm(suggestedName))
    .then(({ name, another, ...rest }) => {
      jobs[name] = { ...rest };

      if (another === 'yes') return addJob(animalGen('job'));

      const triggeringJobs = Object.keys(triggers)
        .map(k => [triggers[k].success, triggers[k].failure])
        .flat()
        .filter(k => k);

      const specifiedJobKeys = Object.keys(jobs);

      let missingKey;

      if (
        triggeringJobs.some(j => {
          if (!specifiedJobKeys.includes(j)) {
            console.log(
              `You have built a trigger that relies on ${j}, but have only specified jobs with the following keys: ${specifiedJobKeys}.`
            );
            console.log(`Please add a job called ${j}.`);
            missingKey = j;
            return true;
          }
          return false;
        })
      ) {
        return addJob(missingKey);
      }
      console.log('OK. Jobs written.');
    });
}

function addTrigger(suggestedName) {
  return inquirer
    .prompt(triggerForm(suggestedName))
    .then(({ name, another, ...rest }) => {
      triggers[name] = { ...removeFalsy(rest) };

      if (another === 'yes') return addTrigger(animalGen('trigger'));

      console.log('OK. Triggers written.');
    });
}

async function addCredential(suggestedName) {
  return inquirer
    .prompt(credentialForm(suggestedName))
    .then(({ name, another, body }) => {
      credentials[name] = body;

      if (another === 'yes') return addCredential(animalGen('credential'));

      console.log('OK. Credentials written.');
    });
}

const excludeHeavyPaths = nodePath => {
  return [
    'node_modules',
    '.git',
    'builds',
    'adaptors',
    'core',
    'docs',
  ].some(x => nodePath.startsWith(x));
};

inquirer
  .prompt([
    {
      name: 'dest',
      required: true,
      message: 'Where do you want to save the generated yaml?',
      type: 'fuzzypath',
      excludePath: nodePath => excludeHeavyPaths(nodePath),
      validate: value =>
        value.endsWith('.yaml') || 'Please choose a path ending in ".yaml"',
      suggestOnly: true,
    },
  ])
  .then(({ dest }) => {
    outputPath = dest;
    return inquirer.prompt({
      name: 'outputStyle',
      required: true,
      message:
        'Do you want to generate a monolith project.yaml or a URI-based project.yaml?',
      validate: value => ['uri', 'monolith'].includes(value),
      type: 'list',
      choices: ['monolith', 'uri'],
      default: 'uri',
    });
  })
  .then(({ outputStyle }) => {
    type = outputStyle;
    console.log("Great. Let's add your triggers.");
    return addTrigger(animalGen('trigger'));
  })
  .then(() => {
    console.log("Next let's add your credentials.");
    return addCredential(animalGen('credential'));
  })
  .then(() => {
    console.log("Finally, let's add your jobs.");
    return addJob(animalGen('job'));
  })
  .then(() => {
    if (type === 'monolith') {
      credentials = Object.keys(credentials).reduce((acc, key) => {
        acc[key] = JSON.parse(
          fs.readFileSync(credentials[key].replace('file://', '')).toString()
        );
        return acc;
      }, {});

      Object.keys(jobs).forEach(key => {
        const expressionString = fs
          .readFileSync(jobs[key]['expression'].replace('file://', ''))
          .toString();

        jobs[key]['expression'] = expressionString;
      });
    }

    const jsonProject = { jobs, credentials, triggers };
    const yamlString = yaml.dump(jsonProject);

    console.log('Project yaml configuration complete:');
    console.log(yamlString);

    console.log(`Writing to ${outputPath}`);
    fs.writeFileSync(outputPath, yamlString);
    console.log(`Done. Happy integrating.`);
    return [jsonProject, yamlString];
  });
