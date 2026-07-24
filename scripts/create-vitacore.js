const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');
const { askQuestion } = require('./prompt-helper');

async function main() {
  const args = process.argv.slice(2);
  const targetArg = args.find((a) => !a.startsWith('-'));
  const isNonInteractive = args.includes('--non-interactive') || args.includes('-y');

  if (!targetArg) {
    console.error('\x1b[31mError: Please specify a target directory.\x1b[0m');
    console.log('\nUsage:');
    console.log('  npm run create-vitacore <target-directory> [--non-interactive]');
    console.log('Example:');
    console.log('  npm run create-vitacore ../my-vite-frontend\n');
    process.exit(1);
  }

  const rootDir = path.resolve(__dirname, '..');
  const targetDir = path.resolve(process.cwd(), targetArg);
  const appName = path.basename(targetDir).toLowerCase().replace(/[^a-z0-9_-]/g, '_');

  console.log(`\n🚀 Bootstrapping new \x1b[36mvitacore\x1b[0m project \x1b[35m${appName}\x1b[0m at:\n   ${targetDir}\n`);

  let backendUrl = 'http://localhost:8080';
  let vitePort = '5173';

  if (!isNonInteractive) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('📋 \x1b[35mInteractive Configuration Setup:\x1b[0m (Press Enter for defaults)\n');
    backendUrl = await askQuestion(rl, 'Backend API Target URL', backendUrl);
    vitePort = await askQuestion(rl, 'Vite Dev Server Port', vitePort);
    rl.close();
  }

  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Helper to recursively copy directories ignoring build artifacts
  function copyRecursive(src, dest) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      const baseName = path.basename(src);
      if (['node_modules', 'dist', '.git'].includes(baseName)) return;

      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      for (const child of fs.readdirSync(src)) {
        copyRecursive(path.join(src, child), path.join(dest, child));
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  // 1. Copy vitacore template
  console.log('📦 Copying vitacore React + Vite template...');
  const vitacoreSrc = path.join(rootDir, 'vitacore');
  copyRecursive(vitacoreSrc, targetDir);

  // 2. Copy shared-types package into target packages/shared-types
  console.log('📦 Copying shared-types package...');
  const sharedTypesSrc = path.join(rootDir, 'packages', 'shared-types');
  const sharedTypesDest = path.join(targetDir, 'packages', 'shared-types');
  copyRecursive(sharedTypesSrc, sharedTypesDest);

  // 3. Configure package.json & workspaces
  console.log('⚙️  Configuring package.json & workspace dependencies...');
  const targetPkgPath = path.join(targetDir, 'package.json');
  const targetPkg = JSON.parse(fs.readFileSync(targetPkgPath, 'utf8'));

  targetPkg.name = appName;
  targetPkg.workspaces = ['packages/*'];
  targetPkg.dependencies['@forge/shared-types'] = 'file:packages/shared-types';

  fs.writeFileSync(targetPkgPath, JSON.stringify(targetPkg, null, 2));

  // 4. Update tsconfig.json path mappings safely
  const tsconfigPath = path.join(targetDir, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    let tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
    if (!tsconfigContent.includes('@forge/shared-types')) {
      tsconfigContent = tsconfigContent.replace(
        '"@/*": ["src/*"]',
        '"@/*": ["src/*"],\n      "@forge/shared-types": ["./packages/shared-types/src/index.ts"]'
      );
      fs.writeFileSync(tsconfigPath, tsconfigContent);
    }
  }

  // 5. Generate tailored .env and .env.local
  console.log('🔑 Generating local .env configuration...');
  const envContent = `# Backend API Target URL
VITE_BACKEND_URL="${backendUrl}"
PORT=${vitePort}
`;
  fs.writeFileSync(path.join(targetDir, '.env'), envContent);
  fs.writeFileSync(path.join(targetDir, '.env.local'), envContent);

  // 6. Run npm install & build steps
  console.log('\n📥 Installing dependencies in new project...');
  try {
    execSync('cmd /c npm install', { cwd: targetDir, stdio: 'inherit' });
    console.log('\n✅ Compiling shared-types...');
    execSync('cmd /c npx typescript tsc', { cwd: sharedTypesDest, stdio: 'inherit' });

    console.log('\n🎉 \x1b[32mSuccess!\x1b[0m vitacore React + Vite template bootstrapped for \x1b[36m' + appName + '\x1b[0m!');
    console.log(`   - Backend API URL: \x1b[34m${backendUrl}\x1b[0m`);
    console.log('\nNext steps:');
    console.log(`  cd ${targetArg}`);
    console.log('  npm run dev');
  } catch (err) {
    console.error('\x1b[31mInstallation failed:\x1b[0m', err.message);
  }
}

main().catch((err) => {
  console.error('\x1b[31mBootstrapping failed:\x1b[0m', err);
  process.exit(1);
});
