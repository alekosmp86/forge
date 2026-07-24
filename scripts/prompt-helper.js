const readline = require('readline');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Helper function to prompt user in CLI with an optional default value.
 */
function askQuestion(rl, query, defaultValue) {
  return new Promise((resolve) => {
    const promptText = defaultValue ? `${query} \x1b[36m[${defaultValue}]\x1b[0m: ` : `${query}: `;
    rl.question(promptText, (answer) => {
      const trimmed = answer.trim();
      resolve(trimmed !== '' ? trimmed : defaultValue);
    });
  });
}

/**
 * Finds PostgreSQL executable binary ('createdb', 'psql') by searching PATH and standard installation paths.
 */
function findPostgresExecutable(exeName) {
  // 1. Check if command is in system PATH
  try {
    const cmd = process.platform === 'win32' ? `where ${exeName}` : `which ${exeName}`;
    const result = execSync(cmd, { stdio: 'pipe' }).toString().trim().split(/[\r\n]+/)[0];
    if (result && fs.existsSync(result)) {
      return `"${result}"`;
    }
  } catch (err) {
    // Executable not in system PATH
  }

  // 2. Search common Windows PostgreSQL installation paths (e.g. C:\Program Files\PostgreSQL\<version>\bin)
  if (process.platform === 'win32') {
    const candidateDirs = ['C:\\Program Files\\PostgreSQL', 'C:\\Program Files (x86)\\PostgreSQL'];
    for (const baseDir of candidateDirs) {
      if (fs.existsSync(baseDir)) {
        try {
          const versions = fs.readdirSync(baseDir).sort().reverse();
          for (const version of versions) {
            const binPath = path.join(baseDir, version, 'bin', `${exeName}.exe`);
            if (fs.existsSync(binPath)) {
              return `"${binPath}"`;
            }
          }
        } catch (dirErr) {
          // Ignore directory access error
        }
      }
    }
  }

  return exeName; // Default bare command
}

/**
 * Attempts to automatically create a PostgreSQL database if createdb/psql is available.
 */
function tryCreatePostgresDatabase(dbName, dbUser, dbHost, dbPort, dbPassword) {
  const cleanDbName = (dbName || '').trim();
  const cleanDbUser = (dbUser || 'postgres').trim();
  const cleanDbHost = (dbHost || 'localhost').trim();
  const cleanDbPort = (dbPort || '5432').trim();

  console.log(`\n🗄️  Attempting to auto-create PostgreSQL database '\x1b[33m${cleanDbName}\x1b[0m'...`);
  const env = { ...process.env, PGPASSWORD: dbPassword };

  const createdbExe = findPostgresExecutable('createdb');
  const psqlExe = findPostgresExecutable('psql');

  // Try createdb first
  try {
    execSync(`${createdbExe} -h ${cleanDbHost} -p ${cleanDbPort} -U ${cleanDbUser} ${cleanDbName}`, { env, stdio: 'pipe' });
    console.log(`✅ Database '\x1b[32m${cleanDbName}\x1b[0m' created successfully!`);
    return true;
  } catch (err) {
    const errOutput = (err.stderr ? err.stderr.toString() : err.message) || '';
    if (errOutput.includes('already exists')) {
      console.log(`ℹ️  Database '\x1b[36m${cleanDbName}\x1b[0m' already exists.`);
      return true;
    }

    // Try psql fallback
    try {
      execSync(`${psqlExe} -h ${cleanDbHost} -p ${cleanDbPort} -U ${cleanDbUser} -c "CREATE DATABASE \\"${cleanDbName}\\";"`, { env, stdio: 'pipe' });
      console.log(`✅ Database '\x1b[32m${cleanDbName}\x1b[0m' created successfully!`);
      return true;
    } catch (psqlErr) {
      const psqlErrOutput = (psqlErr.stderr ? psqlErr.toString() : psqlErr.message) || '';
      if (psqlErrOutput.includes('already exists')) {
        console.log(`ℹ️  Database '\x1b[36m${cleanDbName}\x1b[0m' already exists.`);
        return true;
      }

      console.log(`⚠️  Could not auto-create database (Make sure PostgreSQL service is running and credentials are valid):`);
      console.log(`👉 Please manually create the database using: \x1b[33mcreatedb -U ${cleanDbUser} ${cleanDbName}\x1b[0m`);
      return false;
    }
  }
}

/**
 * Executes Flyway SQL migrations on the newly created database during setup phase.
 */
function tryRunDatabaseMigrations(targetDir, dbName, dbUser, dbHost, dbPort, dbPassword) {
  const cleanDbName = (dbName || '').trim();
  const cleanDbUser = (dbUser || 'postgres').trim();
  const cleanDbHost = (dbHost || 'localhost').trim();
  const cleanDbPort = (dbPort || '5432').trim();

  console.log(`\n🔄 Executing Flyway database migrations on '\x1b[33m${cleanDbName}\x1b[0m'...`);
  const env = { ...process.env, PGPASSWORD: dbPassword };
  const migrationDir = path.join(targetDir, 'src', 'main', 'resources', 'db', 'migration');

  if (!fs.existsSync(migrationDir)) {
    console.log('ℹ️  No migration SQL directory found.');
    return false;
  }

  const psqlExe = findPostgresExecutable('psql');
  const migrationFiles = fs.readdirSync(migrationDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let psqlSuccess = true;
  for (const file of migrationFiles) {
    const filePath = path.join(migrationDir, file);
    try {
      execSync(`${psqlExe} -h ${cleanDbHost} -p ${cleanDbPort} -U ${cleanDbUser} -d ${cleanDbName} -f "${filePath}"`, { env, stdio: 'pipe' });
      console.log(`   └─ Migration applied: \x1b[36m${file}\x1b[0m`);
    } catch (err) {
      psqlSuccess = false;
      break;
    }
  }

  if (psqlSuccess && migrationFiles.length > 0) {
    console.log(`✅ All Flyway SQL migrations applied & test accounts seeded!`);
    return true;
  }

  // Fallback to Maven flyway:migrate
  const pomPath = path.join(targetDir, 'pom.xml');
  if (fs.existsSync(pomPath)) {
    try {
      const jdbcUrl = `jdbc:postgresql://${cleanDbHost}:${cleanDbPort}/${cleanDbName}`;
      execSync(`mvn flyway:migrate -Dflyway.url="${jdbcUrl}" -Dflyway.user="${cleanDbUser}" -Dflyway.password="${dbPassword}"`, {
        cwd: targetDir,
        env,
        stdio: 'pipe',
      });
      console.log(`✅ Flyway database migration completed successfully via Maven!`);
      return true;
    } catch (mvnErr) {
      // Fallback message
    }
  }

  console.log(`ℹ️  Note: Flyway migrations will run automatically on first app startup (\x1b[33mmvn spring-boot:run\x1b[0m).`);
  return false;
}

module.exports = {
  askQuestion,
  findPostgresExecutable,
  tryCreatePostgresDatabase,
  tryRunDatabaseMigrations,
};
