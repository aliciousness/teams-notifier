import { vi, describe, test, expect, beforeEach } from 'vitest';
import process from 'process';

vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  setFailed: vi.fn(),
  group: vi.fn((name, fn) => fn()),
}));

vi.mock('axios', () => ({
  default: { post: vi.fn() },
}));

vi.mock('../src/payload.js', () => ({
  payloadMessageCard: vi.fn(),
}));

const { default: axios } = await import('axios');
const core = await import('@actions/core');
const { payloadMessageCard } = await import('../src/payload.js');
const { run } = await import('../index.js');

describe('index.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    payloadMessageCard.mockReturnValue({});
    axios.post.mockResolvedValue({ status: 200, data: {} });

    await run();

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
    axios.post.mockResolvedValue({ status: 200, data: {} });

    await run();

    expect(payloadMessageCard).toHaveBeenCalledWith('success', 'Test message', buildUrl);
  });

  test('should send POST request with correct payload', async () => {
    core.getInput.mockReturnValueOnce('https://example.com/webhook')
      .mockReturnValueOnce('Test message')
      .mockReturnValueOnce('success');

    const payload = { text: 'payload' };
    payloadMessageCard.mockReturnValue(payload);

    axios.post.mockResolvedValue({ status: 200, data: {} });

    await run();

    expect(axios.post).toHaveBeenCalledWith('https://example.com/webhook', payload);
  });

  test('should handle successful response', async () => {
    core.getInput.mockReturnValueOnce('https://example.com/webhook')
      .mockReturnValueOnce('Test message')
      .mockReturnValueOnce('success');

    payloadMessageCard.mockReturnValue({});
    axios.post.mockResolvedValue({ status: 200, data: {} });

    await run();

    expect(core.info).toHaveBeenCalledWith('Message sent successfully to Microsoft Teams');
  });

  test('should handle failed response', async () => {
    core.getInput.mockReturnValueOnce('https://example.com/webhook')
      .mockReturnValueOnce('Test message')
      .mockReturnValueOnce('success');

    payloadMessageCard.mockReturnValue({});
    axios.post.mockResolvedValue({ status: 400, data: {} });

    await run();

    expect(core.setFailed).toHaveBeenCalledWith('Failed to send message. HTTP status: 400');
  });

  test('should handle errors', async () => {
    core.getInput.mockReturnValueOnce('https://example.com/webhook')
      .mockReturnValueOnce('Test message')
      .mockReturnValueOnce('success');

    const error = new Error('Network error');
    payloadMessageCard.mockReturnValue({});
    axios.post.mockRejectedValue(error);

    await run();

    expect(core.setFailed).toHaveBeenCalledWith(`Error sending message: ${error.message}`);
  });
});
