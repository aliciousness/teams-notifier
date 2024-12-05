import {debug, warning} from '@actions/core';

async function payloadMessageCard(status, message, buildUrl) {
  let color;
  let title;
  let summary;

  // Check if the status is a string and lowercase
  const isSuccess = status.toString().toLowerCase();
  debug(`status type: ${typeof isSuccess}`);
  debug(`is this process Successful?: ${isSuccess}`);

  // Set a warning if isSuccess is not lowercase
  if (isSuccess !== 'success' || isSuccess !== 'failure' || isSuccess !== 'skipped' || isSuccess !== 'cancelled') {
    warning(`The variable isSucess is not lowercase: ${isSuccess}`);
    warning("The status input should be 'success', 'failure', 'skipped', or 'cancelled'.");
  }


  // Determine the payload based on the status
  switch (isSuccess) {
    case 'success':
      color = "00FF00"; // Green color
      title = "✅ Success!";
      summary = "Success Message";
      break;
    case 'failure':
      color = "FF0000"; // Red color
      title = "❌ Failure!";
      summary = "Failure Message";
      break;
    case 'skipped':
      color = "FFA500"; // Orange color
      title = "🟠 Skipped!";
      summary = "Skipped Message";
      break;
    case 'cancelled':
      color = "FFA500"; // Orange color
      title = "🟠 Cancelled!";
      summary = "Cancelled Message";
      break;
    default:
      throw new Error(
        'Invalid status. Try using the needs.<job_id>.result found here: https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/accessing-contextual-information-about-workflow-runs#needs-context'
      );
  }

  // Return the message card payload
  return {
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
}

export { payloadMessageCard };