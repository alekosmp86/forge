const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');
const { execSync } = require('child_process');
const { askQuestion, tryCreatePostgresDatabase, tryRunDatabaseMigrations } = require('./prompt-helper');
const { promptSelectModules, installModules } = require('./module-installer');

async function main() {
  const args = process.argv.slice(2);
  const targetArg = args.find((a) => !a.startsWith('-')) || 'my-app';
  const isNonInteractive = args.includes('--non-interactive') || args.includes('-y');

  const rootDir = path.resolve(__dirname, '..');
  const targetDir = path.resolve(process.cwd(), targetArg);
  const stackName = path.basename(targetDir).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');

  console.log(`\n======================================================`);
  console.log(`🚀 \x1b[1mForge Full-Stack Bootstrapper (\x1b[33mjavacore\x1b[0m + \x1b[36mvitacore\x1b[0m)\x1b[0m`);
  console.log(`======================================================\n`);
  console.log(`Target stack directory: \x1b[35m${targetDir}\x1b[0m\n`);

  let backendPort = '8080';
  let frontendPort = '5173';
  let dbHost = 'localhost';
  let dbPort = '5432';
  let dbName = `${stackName}_db`;
  let dbUser = 'postgres';
  let dbPassword = 'postgres';
  let jwtSecret = crypto.randomBytes(32).toString('hex');
  let selectedModules = [];

  if (!isNonInteractive) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('📋 \x1b[35mFull-Stack Interactive Configuration:\x1b[0m (Press Enter for defaults)\n');
    backendPort = await askQuestion(rl, 'Backend Server Port', backendPort);
    frontendPort = await askQuestion(rl, 'Frontend Dev Server Port', frontendPort);
    dbHost = await askQuestion(rl, 'PostgreSQL Database Host', dbHost);
    dbPort = await askQuestion(rl, 'PostgreSQL Database Port', dbPort);
    dbName = await askQuestion(rl, 'PostgreSQL Database Name', dbName);
    dbUser = await askQuestion(rl, 'PostgreSQL User', dbUser);
    dbPassword = await askQuestion(rl, 'PostgreSQL Password', dbPassword);
    jwtSecret = await askQuestion(rl, 'JWT Session Secret (min 32 chars)', jwtSecret);

    // Prompt for module selection
    selectedModules = await promptSelectModules(rl);
    rl.close();
  }

  const backendDir = path.join(targetDir, 'backend');
  const frontendDir = path.join(targetDir, 'frontend');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  function copyRecursive(src, dest) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      const baseName = path.basename(src);
      if (['target', '.idea', '.mvn', '.git', 'node_modules', 'dist'].includes(baseName)) return;

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

  // --- A. BOOTSTRAP BACKEND (javacore) ---
  console.log(`\n\x1b[33m[1/2] Bootstrapping Backend (javacore) in ${backendDir}...\x1b[0m`);
  const javacoreSrc = path.join(rootDir, 'javacore');
  copyRecursive(javacoreSrc, backendDir);

  const pomPath = path.join(backendDir, 'pom.xml');
  if (fs.existsSync(pomPath)) {
    let pomContent = fs.readFileSync(pomPath, 'utf8');
    pomContent = pomContent.replace('<artifactId>javacore</artifactId>', `<artifactId>${stackName}-backend</artifactId>`);
    pomContent = pomContent.replace('<name>javacore</name>', `<name>${stackName}-backend</name>`);
    fs.writeFileSync(pomPath, pomContent);
  }

  const jdbcUrl = `jdbc:postgresql://${dbHost}:${dbPort}/${dbName}`;
  const backendEnv = `# Database Configuration
DATABASE_URL="${jdbcUrl}"
DB_USERNAME="${dbUser}"
DB_PASSWORD="${dbPassword}"

# JWT Secret & Port
SESSION_SECRET="${jwtSecret}"
PORT=${backendPort}
`;
  fs.writeFileSync(path.join(backendDir, '.env'), backendEnv);

  const ymlPath = path.join(backendDir, 'src', 'main', 'resources', 'application.yml');
  const ymlContent = `spring:
  application:
    name: ${stackName}-backend
  datasource:
    url: \${DATABASE_URL:${jdbcUrl}}
    username: \${DB_USERNAME:${dbUser}}
    password: \${DB_PASSWORD:${dbPassword}}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration

app:
  security:
    jwt-secret: \${SESSION_SECRET:${jwtSecret}}
    jwt-expiration-ms: 86400000 # 24 hours
    refresh-token-expiration-ms: 604800000 # 7 days

server:
  port: \${PORT:${backendPort}}

logging:
  level:
    root: INFO
    com.forge.javacore: DEBUG
    org.hibernate.SQL: WARN
`;
  fs.writeFileSync(ymlPath, ymlContent);

  const localYmlPath = path.join(backendDir, 'src', 'main', 'resources', 'application-local.yml');
  const localYmlContent = `# Local Development Overrides
spring:
  datasource:
    url: ${jdbcUrl}
    username: ${dbUser}
    password: ${dbPassword}

app:
  security:
    jwt-secret: ${jwtSecret}

server:
  port: ${backendPort}
`;
  fs.writeFileSync(localYmlPath, localYmlContent);

  // Install selected modules into backend
  if (selectedModules.length > 0) {
    installModules(backendDir, 'javacore', selectedModules);
  }

  // Auto-create database & run Flyway migrations
  tryCreatePostgresDatabase(dbName, dbUser, dbHost, dbPort, dbPassword);
  tryRunDatabaseMigrations(backendDir, dbName, dbUser, dbHost, dbPort, dbPassword);

  // --- B. BOOTSTRAP FRONTEND (vitacore) ---
  console.log(`\n\x1b[36m[2/2] Bootstrapping Frontend (vitacore) in ${frontendDir}...\x1b[0m`);
  const vitacoreSrc = path.join(rootDir, 'vitacore');
  copyRecursive(vitacoreSrc, frontendDir);

  const sharedTypesSrc = path.join(rootDir, 'packages', 'shared-types');
  const sharedTypesDest = path.join(frontendDir, 'packages', 'shared-types');
  copyRecursive(sharedTypesSrc, sharedTypesDest);

  const frontendPkgPath = path.join(frontendDir, 'package.json');
  const frontendPkg = JSON.parse(fs.readFileSync(frontendPkgPath, 'utf8'));
  frontendPkg.name = `${stackName}-frontend`;
  frontendPkg.workspaces = ['packages/*'];
  frontendPkg.dependencies['@forge/shared-types'] = 'file:packages/shared-types';
  fs.writeFileSync(frontendPkgPath, JSON.stringify(frontendPkg, null, 2));

  const tsconfigPath = path.join(frontendDir, 'tsconfig.json');
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

  const backendUrl = `http://localhost:${backendPort}`;
  const frontendEnv = `# Backend Target API
VITE_BACKEND_URL="${backendUrl}"
PORT=${frontendPort}
`;
  fs.writeFileSync(path.join(frontendDir, '.env'), frontendEnv);
  fs.writeFileSync(path.join(frontendDir, '.env.local'), frontendEnv);

  // Install selected modules into frontend
  if (selectedModules.length > 0) {
    installModules(frontendDir, 'vitacore', selectedModules);
  }

  console.log('\n📥 Installing frontend dependencies...');
  try {
    execSync('cmd /c npm install', { cwd: frontendDir, stdio: 'inherit' });
    console.log('\n✅ Compiling shared-types...');
    execSync('cmd /c npx typescript tsc', { cwd: sharedTypesDest, stdio: 'inherit' });
  } catch (err) {
    console.error('\x1b[31mFrontend installation warning:\x1b[0m', err.message);
  }

  console.log(`\n======================================================`);
  console.log(`🎉 \x1b[32mFull-Stack Bootstrap Completed Successfully!\x1b[0m`);
  console.log(`======================================================`);
  if (selectedModules.length > 0) {
    console.log(`   Installed Modules: \x1b[36m${selectedModules.map((m) => m.name).join(', ')}\x1b[0m`);
  }
  console.log(`\n📂 \x1b[1mCreated Stack Directory Structure:\x1b[0m`);
  console.log(`   - Backend:  \x1b[33m${backendDir}\x1b[0m (Spring Boot 3 on port \x1b[35m${backendPort}\x1b[0m)`);
  console.log(`   - Frontend: \x1b[36m${frontendDir}\x1b[0m (Vite + React SPA on port \x1b[35m${frontendPort}\x1b[0m)`);
  console.log(`   - Database: \x1b[34m${jdbcUrl}\x1b[0m`);
  console.log(`\n🚀 \x1b[1mHow to Run Your Stack:\x1b[0m`);
  console.log(`   1. Start Backend:`);
  console.log(`      \x1b[33mcd ${path.relative(process.cwd(), backendDir)} && mvn spring-boot:run\x1b[0m`);
  console.log(`   2. Start Frontend:`);
  console.log(`      \x1b[36mcd ${path.relative(process.cwd(), frontendDir)} && npm run dev\x1b[0m\n`);
}

main().catch((err) => {
  console.error('\x1b[31mFull-stack bootstrapping failed:\x1b[0m', err);
  process.exit(1);
});
