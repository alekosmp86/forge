const fs = require('fs');
const path = require('path');
const { askQuestion } = require('./prompt-helper');

const MODULES_DIR = path.resolve(__dirname, '..', 'modules');

/**
 * Scans modules catalog directory and loads all valid module manifests.
 */
function listAvailableModules() {
  if (!fs.existsSync(MODULES_DIR)) return [];

  const entries = fs.readdirSync(MODULES_DIR);
  const modules = [];

  for (const entry of entries) {
    const manifestPath = path.join(MODULES_DIR, entry, 'module.json');
    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        modules.push({ ...manifest, folderName: entry });
      } catch (err) {
        console.warn(`⚠️  Failed to parse module manifest at ${manifestPath}:`, err.message);
      }
    }
  }

  return modules;
}

/**
 * Interactive prompt to let user select modules via readline.
 */
async function promptSelectModules(rl, targetStack) {
  const available = listAvailableModules().filter(
    (m) => !targetStack || !m.targets || m.targets.includes(targetStack)
  );

  if (available.length === 0) {
    console.log('ℹ️  No modules available for installation.');
    return [];
  }

  console.log('\n📦 \x1b[35mAvailable Feature Modules:\x1b[0m');
  available.forEach((mod, idx) => {
    console.log(`  [${idx + 1}] \x1b[36m${mod.name}\x1b[0m (${mod.id}) - ${mod.description}`);
  });
  console.log('  [A] Select All Modules');
  console.log('  [N] Skip Modules (None)');

  const answer = await askQuestion(
    rl,
    'Enter module numbers separated by commas (e.g. 1,2), "A" for all, or "N" to skip',
    'N'
  );

  const cleanAnswer = answer.toUpperCase().trim();
  if (cleanAnswer === 'N' || cleanAnswer === '') {
    return [];
  }

  if (cleanAnswer === 'A') {
    return available;
  }

  const selectedIndices = cleanAnswer
    .split(',')
    .map((s) => parseInt(s.trim(), 10) - 1)
    .filter((idx) => !isNaN(idx) && idx >= 0 && idx < available.length);

  return selectedIndices.map((idx) => available[idx]);
}

/**
 * Helper to recursively copy directory contents ignoring build artifacts.
 */
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    const parentDir = path.dirname(dest);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

/**
 * Patches Prisma schema (nexcore) with direct User column additions and model snippets.
 */
function patchPrismaSchema(targetDir, manifest, moduleDir) {
  const prismaSchemaPath = path.join(targetDir, 'prisma', 'schema.prisma');
  if (!fs.existsSync(prismaSchemaPath)) return;

  let schemaContent = fs.readFileSync(prismaSchemaPath, 'utf8');

  // 1. Direct field additions to model User
  if (manifest.schemaExtensions && Array.isArray(manifest.schemaExtensions.userFieldsPrisma)) {
    const userModelRegex = /(model\s+User\s*\{[\s\S]*?)(\n\})/m;
    const match = schemaContent.match(userModelRegex);

    if (match) {
      const existingModelBody = match[1];
      const newFields = manifest.schemaExtensions.userFieldsPrisma
        .filter((field) => !schemaContent.includes(field.trim().split(/\s+/)[0]))
        .map((field) => `  ${field.trim()}`)
        .join('\n');

      if (newFields) {
        const patchedModelBody = `${existingModelBody}\n  // Extension fields from module: ${manifest.id}\n${newFields}\n}`;
        schemaContent = schemaContent.replace(userModelRegex, patchedModelBody);
      }
    }
  }

  // 2. Append model snippet if schema.prisma.snippet exists
  const snippetPath = path.join(moduleDir, 'nexcore', 'schema.prisma.snippet');
  if (fs.existsSync(snippetPath)) {
    const snippetContent = fs.readFileSync(snippetPath, 'utf8');
    if (!schemaContent.includes(snippetContent.trim())) {
      schemaContent += `\n\n// Module Extension: ${manifest.id}\n${snippetContent.trim()}\n`;
    }
  }

  fs.writeFileSync(prismaSchemaPath, schemaContent);
  console.log(`   └─ Patched Prisma schema with module \x1b[36m${manifest.id}\x1b[0m`);
}

/**
 * Copies Flyway SQL migration scripts to target javacore directory.
 */
function applyFlywayMigrations(targetDir, manifest, moduleDir) {
  const sourceMigrationDir = path.join(moduleDir, 'javacore', 'resources', 'db', 'migration');
  if (!fs.existsSync(sourceMigrationDir)) return;

  const targetMigrationDir = path.join(targetDir, 'src', 'main', 'resources', 'db', 'migration');
  if (!fs.existsSync(targetMigrationDir)) {
    fs.mkdirSync(targetMigrationDir, { recursive: true });
  }

  const existingFiles = fs.readdirSync(targetMigrationDir).filter((f) => f.endsWith('.sql'));

  // Find current max version number V{N}
  let maxVersion = 1;
  for (const f of existingFiles) {
    const match = f.match(/^V(\d+)__/i);
    if (match) {
      const v = parseInt(match[1], 10);
      if (v > maxVersion) maxVersion = v;
    }
  }

  const sourceFiles = fs.readdirSync(sourceMigrationDir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of sourceFiles) {
    maxVersion += 1;
    const cleanName = file.replace(/^V\d+__/, '');
    const newFileName = `V${maxVersion}__${cleanName}`;
    fs.copyFileSync(path.join(sourceMigrationDir, file), path.join(targetMigrationDir, newFileName));
    console.log(`   └─ Added Flyway migration script: \x1b[36m${newFileName}\x1b[0m`);
  }
}

/**
 * Appends environment variables required by the module to target .env file.
 */
function appendEnvVariables(targetDir, manifest) {
  if (!manifest.envVariables) return;

  const envPath = path.join(targetDir, '.env');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  let addedCount = 0;
  for (const [key, value] of Object.entries(manifest.envVariables)) {
    if (!envContent.includes(`${key}=`)) {
      envContent += `\n# Module: ${manifest.name}\n${key}="${value}"\n`;
      addedCount += 1;
    }
  }

  if (addedCount > 0) {
    fs.writeFileSync(envPath, envContent);
    console.log(`   └─ Appended ${addedCount} environment variables for \x1b[36m${manifest.id}\x1b[0m`);
  }
}

/**
 * Main module installer runner.
 */
function installModules(targetDir, stackType, selectedModules) {
  if (!selectedModules || selectedModules.length === 0) return;

  console.log(`\n⚙️  Installing ${selectedModules.length} selected module(s) into \x1b[35m${stackType}\x1b[0m...`);

  for (const manifest of selectedModules) {
    const moduleDir = path.join(MODULES_DIR, manifest.folderName);
    console.log(`\n🔌 Installing self-contained module \x1b[32m${manifest.name}\x1b[0m (${manifest.id})...`);

    // 1. Copy target stack code (includes local types.ts inside src/modules/<name>/)
    if (stackType === 'nexcore') {
      const sourceCodeDir = path.join(moduleDir, 'nexcore', 'src');
      if (fs.existsSync(sourceCodeDir)) {
        copyRecursive(sourceCodeDir, path.join(targetDir, 'src'));
      }
      patchPrismaSchema(targetDir, manifest, moduleDir);
    } else if (stackType === 'javacore') {
      const sourceCodeDir = path.join(moduleDir, 'javacore', 'src');
      if (fs.existsSync(sourceCodeDir)) {
        copyRecursive(sourceCodeDir, path.join(targetDir, 'src'));
      }
      applyFlywayMigrations(targetDir, manifest, moduleDir);
    } else if (stackType === 'vitacore') {
      const sourceCodeDir = path.join(moduleDir, 'vitacore', 'src');
      if (fs.existsSync(sourceCodeDir)) {
        copyRecursive(sourceCodeDir, path.join(targetDir, 'src'));
      }
    }

    // 2. Append environment variables
    appendEnvVariables(targetDir, manifest);

    console.log(`✅ Module \x1b[32m${manifest.name}\x1b[0m installed successfully!`);
  }
}

module.exports = {
  listAvailableModules,
  promptSelectModules,
  installModules,
};
