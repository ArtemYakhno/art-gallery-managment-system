const { execSync } = require('child_process');
const { readEditedApp, report, commandOutput } = require('./lib');

// Both apps lint with oxlint; the backend also runs type-aware rules (oxlint-tsgolint).
const LINTERS = {
  backend: 'oxlint --type-aware --fix',
  frontend: 'oxlint --fix',
};

readEditedApp(({ filePath, app, appDir }) => {
  try {
    execSync(`pnpm exec ${LINTERS[app]} "${filePath}"`, { cwd: appDir, stdio: 'pipe' });
  } catch (err) {
    report(`Lint issues in ${filePath} (${app}, some may have been auto-fixed):\n${commandOutput(err)}`);
  }
  process.exit(0);
});
