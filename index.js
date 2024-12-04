import core from '@actions/core';
import axios from 'axios';
import { payloadMessageCard } from './src/payload.js';
import process from 'process';

const webhookUrl = core.getInput('webhook_url', { required: true });
const message = core.getInput('message', { required: true });
const status = core.getInput('status', { required: true });

(async () => {
  try {
    // Validate the status
    const isSuccess = status.toLowerCase();

    // Dynamically generate the build URL
    const buildUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;

    const payload = payloadMessageCard(isSuccess, message, buildUrl);

    // Send POST request to Teams webhook
    const response = await axios.post(webhookUrl, payload);

    if (response.status === 200) {
      core.info('Message sent successfully to Microsoft Teams');
    } else {
      core.setFailed(`Failed to send message. HTTP status: ${response.status}`);
    }
  } catch (error) {
    core.setFailed(`Error sending message: ${error.message}`);
  }
})();
