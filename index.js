import core from '@actions/core';
import axios from 'axios';
import { payloadMessageCard } from './src/payload.js';
import process from 'process';

const webhookUrl = core.getInput('webhook_url', { required: true });
core.debug(`Webhook URL: ${webhookUrl}`);
const message = core.getInput('message', { required: true });
core.debug(`Message: ${message}`);
const status = core.getInput('status', { required: true });
core.debug(`Status: ${status}`);

(async () => {
  try {
    // Validate the status
    const isSuccess = status.toString().toLowerCase();
    core.debug(`DEBUG isSuccess: ${isSuccess}`);

    // Dynamically generate the build URL
    const buildUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
    core.debug(`DEBUG Build URL: ${buildUrl}`);

    const payload = await payloadMessageCard(isSuccess, message, buildUrl);
    core.debug(`DEBUG Payload: ${JSON.stringify(payload)}`);

    // Send POST request to Teams webhook
    const result = await core.group('Sending message to Microsoft Teams', async () => {
      const response = await axios.post(webhookUrl, payload);
      core.debug(`DEBUG Response: ${JSON.stringify(response.data)}`);
      return response;
    });
    if (result.status === 200) {
      core.info('Message sent successfully to Microsoft Teams');
    } else {
      core.setFailed(`Failed to send message. HTTP status: ${result.status}`);
    }
  } catch (error) {
    core.setFailed(`Error sending message: ${error.message}`);
  }
})();
