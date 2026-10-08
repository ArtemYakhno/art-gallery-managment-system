let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let command;
  try {
    const data = JSON.parse(input);
    command = data.tool_input?.command || '';
  } catch {
    process.exit(0);
  }

  if (/\bgit\s+push\b/.test(command)) {
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'ask',
          permissionDecisionReason:
            'Command contains "git push" — explicit user confirmation is required before pushing to remote.',
        },
      }),
    );
  }
  process.exit(0);
});
