const path = require('path');

// Reads the PostToolUse payload and resolves which app the edited .ts/.tsx file belongs to.
// The app is derived from the path itself, so hooks never depend on package names.
function readEditedApp(callback) {
  let input = '';
  process.stdin.on('data', (chunk) => (input += chunk));
  process.stdin.on('end', () => {
    let filePath;
    try {
      const data = JSON.parse(input);
      filePath = data.tool_input?.file_path || data.tool_response?.filePath;
    } catch {
      process.exit(0);
    }

    if (!filePath || !/\.(ts|tsx)$/.test(filePath)) {
      process.exit(0);
    }

    const normalized = filePath.replace(/\\/g, '/');
    const match = normalized.match(/^(.*\/apps\/(backend|frontend))\//);
    if (!match) {
      process.exit(0);
    }

    callback({ filePath, app: match[2], appDir: path.normalize(match[1]) });
  });
}

// additionalContext is fed back to the agent; systemMessage would only be shown to the user.
function report(message) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: message.slice(0, 4000),
      },
    }),
  );
}

function commandOutput(err) {
  const output = (err.stdout?.toString() || '') + (err.stderr?.toString() || '');
  return output || err.message;
}

module.exports = { readEditedApp, report, commandOutput };
