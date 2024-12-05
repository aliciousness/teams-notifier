import { debug, warning } from '@actions/core';

async function payloadMessageCard(status, message, buildUrl) {
  let color;
  let title;
  let summary;

  // Check if the status is a string and lowercase
  const isSuccess = status.toString().toLowerCase();
  debug(`status type: ${typeof isSuccess}`);
  debug(`is this process Successful?: ${isSuccess}`);

  // Set a warning if isSuccess is not one of the expected values
  if (typeof isSuccess === 'string' && !['success', 'failure', 'skipped', 'cancelled'].includes(isSuccess)) {
    warning(`The variable isSuccess is not one of the expected values: ${isSuccess}`);
    warning("The status input should be success, failure, skipped, or cancelled.");
  }

  // Determine the payload based on the status
  switch (isSuccess) {
    case 'success':
      color = "00FF00"; // Green color
      title = "✅ Success!";
      summary = "Success Message";
      debug(`Success`);
      break;
    case 'failure':
      color = "FF0000"; // Red color
      title = "❌ Failure!";
      summary = "Failure Message";
      debug(`Failure`);
      break;
    case 'skipped':
      color = "FFA500"; // Orange color
      title = "🟠 Skipped!";
      summary = "Skipped Message";
      debug(`Skipped`);
      break;
    case 'cancelled':
      color = "FFA500"; // Orange color
      title = "🟠 Cancelled!";
      summary = "Cancelled Message";
      debug(`Cancelled`);
      break;
    default:
      throw new Error(
        'Invalid status. Try using the needs.<job_id>.result found here: https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/accessing-contextual-information-about-workflow-runs#needs-context'
      );
  }

  debug(`Payload color: ${color}`);
  debug(`Payload title: ${title}`);
  debug(`Payload summary: ${summary}`);
  
  // Return the message card payload
  const payload = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "themeColor": color,
    "summary": summary,
    "sections": [
      {
        "activityTitle": title,
        "text": message
      }
    ],
    "potentialAction": [
      {
        "@type": "OpenUri",
        "name": "View Build",
        "targets": [
          {
            "os": "default",
            "uri": buildUrl
          }
        ]
      }
    ]
  };

  return payload;
}

export { payloadMessageCard };