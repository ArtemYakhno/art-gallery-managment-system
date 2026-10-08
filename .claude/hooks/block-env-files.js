let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let filePath;
  try {
    const data = JSON.parse(input);
    filePath = data.tool_input?.file_path || '';
  } catch {
    process.exit(0);
  }

  const normalized = filePath.replace(/\\/g, '/');
  const base = normalized.split('/').pop() || '';

  const isEnvFile = /^\.env(\..+)?$/.test(base);
  const isExample = /^\.env\.example$/.test(base);

  if (isEnvFile && !isExample) {
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason:
            `File "${base}" contains environment variables/secrets and must not be read or edited by the agent directly. ` +
            `If a specific value is needed, ask the user to confirm or show it manually.`,
        },
      }),
    );
  }
  process.exit(0);
});
