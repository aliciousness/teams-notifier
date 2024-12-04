import core from '@actions/core'

const name = core.getInput('name', { required: true });

core.setOutput('greeting', `Hello, ${name}!`);