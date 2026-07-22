const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const targetArg = process.argv[2];

if (!targetArg) {
  console.error('\x1b[31mError: Please specify a target directory.\x1b[0m');
  console.log('\nUsage:');
  console.log('  npm run create-javacore <target-directory>');
  console.log('Example:');
  console.log('  npm run create-javacore ../my-java-service\n');
  process.exit(1);
}

const rootDir = path.resolve(__dirname, '..');
const targetDir = path.resolve(process.cwd(), targetArg);
const appName = path.basename(targetDir).toLowerCase().replace(/[^a-z0-9_-]/g, '_');

console.log(`\n🚀 Bootstrapping new \x1b[33mjavacore\x1b[0m project \x1b[36m${appName}\x1b[0m at:\n   ${targetDir}\n`);

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Helper to recursively copy directories ignoring build artifacts
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
console.log('📦 Copying javacore Spring Boot 3 template...');
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

// 3. Generate tailored application.yml & .env
console.log('🔑 Generating local .env & application.yml configuration...');
const randomSecret = crypto.randomBytes(32).toString('hex');
const defaultDbUrl = `jdbc:postgresql://localhost:5432/${appName}_db`;

const envContent = `# Database Configuration for ${appName}
DATABASE_URL="${defaultDbUrl}"
DB_USERNAME="postgres"
DB_PASSWORD="postgres"

# JWT Authentication Session Secret (Auto-generated 64-char hex key)
SESSION_SECRET="${randomSecret}"
PORT=8080
`;

fs.writeFileSync(path.join(targetDir, '.env'), envContent);

console.log('\n🎉 \x1b[32mSuccess!\x1b[0m javacore template bootstrapped for \x1b[36m' + appName + '\x1b[0m!');
console.log('\n🗄️  \x1b[33mDatabase & Environment Setup:\x1b[0m');
console.log(`   - JDBC DB URL set in .env: \x1b[34m${defaultDbUrl}\x1b[0m`);
console.log('   - Flyway SQL migrations: \x1b[36msrc/main/resources/db/migration/V1__init_schema.sql\x1b[0m');
console.log('\nNext steps:');
console.log(`  cd ${targetArg}`);
console.log('  mvn clean compile');
console.log('  mvn spring-boot:run');
