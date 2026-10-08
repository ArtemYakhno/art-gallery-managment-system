const { execSync } = require('child_process');
const { readEditedApp, report, commandOutput } = require('./lib');

readEditedApp(({ filePath, app, appDir }) => {
  try {
    execSync('pnpm run typecheck', { cwd: appDir, stdio: 'pipe' });
  } catch (err) {
    report(`TypeScript errors after editing ${filePath} (${app}):\n${commandOutput(err)}`);
  }
  process.exit(0);
});
