// Cross-platform wrapper so "npm run test:live" / "npm run test:record" work
// identically in bash and PowerShell without a shell-specific env var syntax
// or an extra devDependency like cross-env.
const { spawnSync } = require("child_process");

const mode = process.argv[2];
if (!["live", "record", "replay"].includes(mode)) {
    console.error(`Usage: node scripts/run-tests-with-mode.js <live|record|replay>`);
    process.exit(1);
}

const result = spawnSync("npm", ["test"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, ER_TEST_MODE: mode }
});
process.exit(result.status ?? 1);
