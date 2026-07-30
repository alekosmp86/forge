const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');
const { askQuestion, tryCreatePostgresDatabase, tryRunDatabaseMigrations } = require('./prompt-helper');
const { promptSelectModules, installModules } = require('./module-installer');

async function main() {
  const args = process.argv.slice(2);
  const targetArg = args.find((a) => !a.startsWith('-'));
  const isNonInteractive = args.includes('--non-interactive') || args.includes('-y');

  if (!targetArg) {
    console.error('\x1b[31mError: Please specify a target directory.\x1b[0m');
    console.log('\nUsage:');
    console.log('  npm run create-javacore <target-directory> [--non-interactive]');
    console.log('Example:');
    console.log('  npm run create-javacore ../my-java-service\n');
    process.exit(1);
  }

  const rootDir = path.resolve(__dirname, '..');
  const targetDir = path.resolve(process.cwd(), targetArg);
  const appName = path.basename(targetDir).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');

  console.log(`\n🚀 Bootstrapping new \x1b[33mjavacore\x1b[0m project \x1b[36m${appName}\x1b[0m at:\n   ${targetDir}\n`);

  let dbHost = 'localhost';
  let dbPort = '5432';
  let dbName = `${appName}_db`;
  let dbUser = 'postgres';
  let dbPassword = 'postgres';
  let jwtSecret = crypto.randomBytes(32).toString('hex');
  let serverPort = '8080';
  let selectedModules = [];

  let rl = null;
  if (!isNonInteractive) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // 1. Select modules first
    selectedModules = await promptSelectModules(rl, 'javacore');

    console.log('📋 \x1b[35mInteractive Configuration Setup:\x1b[0m (Press Enter for defaults)\n');
    dbHost = await askQuestion(rl, 'Database Host', dbHost);
    dbPort = await askQuestion(rl, 'Database Port', dbPort);
    dbName = await askQuestion(rl, 'Database Name', dbName);
    dbUser = await askQuestion(rl, 'Database User', dbUser);
    dbPassword = await askQuestion(rl, 'Database Password', dbPassword);
    serverPort = await askQuestion(rl, 'Backend Server Port', serverPort);
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  function copyRecursive(src, dest) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      const baseName = path.basename(src);
      if (['target', '.idea', '.mvn', '.git'].includes(baseName)) return;

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

  // 1. Copy javacore template
  console.log('\n📦 Copying javacore Spring Boot 3 template...');
  const javacoreSrc = path.join(rootDir, 'javacore');
  copyRecursive(javacoreSrc, targetDir);

  // 2. Customize pom.xml artifactId
  console.log('⚙️  Customizing pom.xml project metadata...');
  const pomPath = path.join(targetDir, 'pom.xml');
  if (fs.existsSync(pomPath)) {
    let pomContent = fs.readFileSync(pomPath, 'utf8');
    pomContent = pomContent.replace('<artifactId>javacore</artifactId>', `<artifactId>${appName}</artifactId>`);
    pomContent = pomContent.replace('<name>javacore</name>', `<name>${appName}</name>`);
    fs.writeFileSync(pomPath, pomContent);
  }

  // 3. Generate tailored .env & application.yml files
  console.log('🔑 Generating configured .env & application.yml...');
  const jdbcUrl = `jdbc:postgresql://${dbHost}:${dbPort}/${dbName}`;

  const envContent = `# Database Configuration for ${appName}
DATABASE_URL="${jdbcUrl}"
DB_USERNAME="${dbUser}"
DB_PASSWORD="${dbPassword}"

# JWT Authentication Session Secret
SESSION_SECRET="${jwtSecret}"
PORT=${serverPort}
`;

  fs.writeFileSync(path.join(targetDir, '.env'), envContent);

  const ymlPath = path.join(targetDir, 'src', 'main', 'resources', 'application.yml');
  const ymlContent = `spring:
  application:
    name: ${appName}
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
  port: \${PORT:${serverPort}}

logging:
  level:
    root: INFO
    com.forge.javacore: DEBUG
    org.hibernate.SQL: WARN
`;
  fs.writeFileSync(ymlPath, ymlContent);

  const localYmlPath = path.join(targetDir, 'src', 'main', 'resources', 'application-local.yml');
  const localYmlContent = `# Local Development Overrides (Ignored by git)
spring:
  datasource:
    url: ${jdbcUrl}
    username: ${dbUser}
    password: ${dbPassword}

app:
  security:
    jwt-secret: ${jwtSecret}

server:
  port: ${serverPort}
`;
  fs.writeFileSync(localYmlPath, localYmlContent);

  // 4. Install selected modules into target project
  if (selectedModules.length > 0) {
    await installModules(targetDir, 'javacore', selectedModules, rl);
  }
  if (rl) {
    rl.close();
  }

  // 5. Attempt auto-creating PostgreSQL database & running Flyway migrations
  tryCreatePostgresDatabase(dbName, dbUser, dbHost, dbPort, dbPassword);
  tryRunDatabaseMigrations(targetDir, dbName, dbUser, dbHost, dbPort, dbPassword);

  console.log(`\n🎉 \x1b[32mSuccess!\x1b[0m javacore template bootstrapped for \x1b[36m${appName}\x1b[0m!`);
  if (selectedModules.length > 0) {
    console.log(`   Installed modules: \x1b[36m${selectedModules.map((m) => m.name).join(', ')}\x1b[0m`);
  }
  console.log('\n🗄️  \x1b[33mDatabase & Environment Configured:\x1b[0m');
  console.log(`   - JDBC DB URL: \x1b[34m${jdbcUrl}\x1b[0m`);
  console.log(`   - Server Port: \x1b[35m${serverPort}\x1b[0m`);
  console.log('   - Flyway SQL migrations applied from: \x1b[36msrc/main/resources/db/migration/\x1b[0m');
  console.log('\nNext steps:');
  console.log(`  cd ${targetArg}`);
  console.log('  mvn clean compile');
  console.log('  mvn spring-boot:run');
}

main().catch((err) => {
  console.error('\x1b[31mBootstrapping failed:\x1b[0m', err);
  process.exit(1);
});
