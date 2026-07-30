const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');
const { askQuestion, tryCreatePostgresDatabase } = require('./prompt-helper');
const { promptSelectModules, installModules } = require('./module-installer');

async function runNexcoreInstaller() {
  const args = process.argv.slice(2);
  const targetArg = args.find((a) => !a.startsWith('-'));
  const isNonInteractive = args.includes('--non-interactive') || args.includes('-y');

  if (!targetArg) {
    console.error('\x1b[31mError: Please specify a target directory.\x1b[0m');
    console.log('\nUsage:');
    console.log('  npm run create-nexcore <target-directory> [--non-interactive]');
    console.log('Example:');
    console.log('  npm run create-nexcore ../my-new-app\n');
    process.exit(1);
  }

  const rootDir = path.resolve(__dirname, '..');
  const targetDir = path.resolve(process.cwd(), targetArg);
  const appName = path.basename(targetDir).toLowerCase().replace(/[^a-z0-9_-]/g, '_');

  console.log(`\n🚀 Bootstrapping new \x1b[35mnexcore\x1b[0m project \x1b[36m${appName}\x1b[0m at:\n   ${targetDir}\n`);

  let dbHost = 'localhost';
  let dbPort = '5432';
  let dbName = `${appName}_db`;
  let dbUser = 'postgres';
  let dbPassword = 'postgres';
  let selectedModules = [];

  let rl = null;
  if (!isNonInteractive) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // 1. Select modules first
    selectedModules = await promptSelectModules(rl, 'nexcore');

    console.log('📋 \x1b[35mInteractive Database Configuration:\x1b[0m (Press Enter for defaults)\n');
    dbHost = await askQuestion(rl, 'Database Host', dbHost);
    dbPort = await askQuestion(rl, 'Database Port', dbPort);
    dbName = await askQuestion(rl, 'Database Name', dbName);
    dbUser = await askQuestion(rl, 'Database User', dbUser);
    dbPassword = await askQuestion(rl, 'Database Password', dbPassword);
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  function copyRecursive(src, dest) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      const baseName = path.basename(src);
      if (['node_modules', '.next', '.git', 'dist'].includes(baseName)) return;

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

  // 1. Copy nexcore template
  console.log('\n📦 Copying nexcore template...');
  const nexcoreSrc = path.join(rootDir, 'nexcore');
  copyRecursive(nexcoreSrc, targetDir);

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

  // 4. Update tsconfig.json path mappings
  const tsconfigPath = path.join(targetDir, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    tsconfig.compilerOptions = tsconfig.compilerOptions || {};
    tsconfig.compilerOptions.paths = tsconfig.compilerOptions.paths || {};
    tsconfig.compilerOptions.paths['@forge/shared-types'] = ['./packages/shared-types/src/index.ts'];
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  }

  // 5. Generate base kernel .env with database URL
  console.log('🔑 Generating local .env configuration & DATABASE_URL...');
  const dbUrl = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=public`;

  const envContent = `# Database Configuration
DATABASE_URL="${dbUrl}"
`;

  fs.writeFileSync(path.join(targetDir, '.env'), envContent);

  // 6. Install selected modules into target project (handles module code, schema, packages, env vars & module prompts)
  if (selectedModules.length > 0) {
    await installModules(targetDir, 'nexcore', selectedModules, rl);
  }

  if (rl) {
    rl.close();
  }

  // 7. Auto-create PostgreSQL database if createdb/psql is available
  tryCreatePostgresDatabase(dbName, dbUser, dbHost, dbPort, dbPassword);

  // 8. Run npm install & build steps
  console.log('\n📥 Installing dependencies in new project...');
  try {
    execSync('cmd /c npm install', { cwd: targetDir, stdio: 'inherit' });
    console.log('\n✅ Compiling shared-types & Prisma client...');
    execSync('cmd /c npm run build', { cwd: sharedTypesDest, stdio: 'inherit' });
    execSync('cmd /c npx prisma generate', { cwd: targetDir, stdio: 'inherit' });

    console.log('\n🎉 \x1b[32mSuccess!\x1b[0m nexcore template bootstrapped for \x1b[36m' + appName + '\x1b[0m!');
    if (selectedModules.length > 0) {
      console.log(`   Installed modules: \x1b[36m${selectedModules.map((m) => m.name).join(', ')}\x1b[0m`);
    }
    console.log('\n🗄️  \x1b[33mDatabase Setup Summary:\x1b[0m');
    console.log(`   - Local DB URL set in .env: \x1b[34m${dbUrl}\x1b[0m`);
    console.log('   - To push local migrations: \x1b[36mnpx prisma migrate dev --name init\x1b[0m');
    console.log('   - For Vercel/Cloud DB: Set DATABASE_URL in Vercel environment variables.');
    console.log('\nNext steps:');
    console.log(`  cd ${targetArg}`);
    console.log('  npm run dev');
  } catch (err) {
    console.error('\x1b[31mInstallation failed:\x1b[0m', err.message);
  }
}

runNexcoreInstaller();
