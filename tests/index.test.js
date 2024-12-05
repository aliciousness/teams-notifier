import core from '@actions/core';
import axios from 'axios';
import { payloadMessageCard } from '../src/payload.js';
import process from 'process';
import { jest } from '@jest/globals';

jest.mock('@actions/core');
jest.mock('axios');
jest.mock('../src/payload.js');

describe('index.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should retrieve inputs correctly', async () => {
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'webhook_url':
          return 'https://example.com/webhook';
        case 'message':
          return 'Test message';
        case 'status':
          return 'success';
        default:
          return '';
      }
    });

    await import('../index.js');

    expect(core.getInput).toHaveBeenCalledWith('webhook_url', { required: true });
    expect(core.getInput).toHaveBeenCalledWith('message', { required: true });
    expect(core.getInput).toHaveBeenCalledWith('status', { required: true });
  });

  test('should generate correct payload', async () => {
    core.getInput.mockReturnValueOnce('https://example.com/webhook')
      .mockReturnValueOnce('Test message')
      .mockReturnValueOnce('success');

    const buildUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
    const payload = { text: 'payload' };
    payloadMessageCard.mockReturnValue(payload);

    await import('../index.js');

    expect(payloadMessageCard).toHaveBeenCalledWith('success', 'Test message', buildUrl);
  });

  test('should send POST request with correct payload', async () => {
    core.getInput.mockReturnValueOnce('https://example.com/webhook')
      .mockReturnValueOnce('Test message')
      .mockReturnValueOnce('success');

    const payload = { text: 'payload' };
    payloadMessageCard.mockReturnValue(payload);

    axios.post.mockResolvedValue({ status: 200, data: {} });

    await import('../index.js');

    expect(axios.post).toHaveBeenCalledWith('https://example.com/webhook', payload);
  });

  test('should handle successful response', async () => {
    core.getInput.mockReturnValueOnce('https://example.com/webhook')
      .mockReturnValueOnce('Test message')
      .mockReturnValueOnce('success');

    axios.post.mockResolvedValue({ status: 200, data: {} });

    await import('../index.js');

    expect(core.info).toHaveBeenCalledWith('Message sent successfully to Microsoft Teams');
  });

  test('should handle failed response', async () => {
    core.getInput.mockReturnValueOnce('https://example.com/webhook')
      .mockReturnValueOnce('Test message')
      .mockReturnValueOnce('success');

    axios.post.mockResolvedValue({ status: 400, data: {} });

    await import('../index.js');

    expect(core.setFailed).toHaveBeenCalledWith('Failed to send message. HTTP status: 400');
  });

  test('should handle errors', async () => {
    core.getInput.mockReturnValueOnce('https://example.com/webhook')
      .mockReturnValueOnce('Test message')
      .mockReturnValueOnce('success');

    const error = new Error('Network error');
    axios.post.mockRejectedValue(error);

    await import('../index.js');

    expect(core.setFailed).toHaveBeenCalledWith(`Error sending message: ${error.message}`);
  });
});