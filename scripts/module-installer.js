const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');
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
 * Interactive keypress checkbox selector for modules.
 */
function promptCheckboxSelect(available) {
  return new Promise((resolve) => {
    const selectedState = new Array(available.length).fill(false);
    let cursor = 0;

    const stdin = process.stdin;
    if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
      return resolve(null); // Fallback to standard prompt if non-TTY
    }

    readline.emitKeypressEvents(stdin);
    stdin.setRawMode(true);
    stdin.resume();

    function render() {
      console.log('\n📦 \x1b[35mSelect Feature Modules\x1b[0m \x1b[90m(Use ↑/↓ or 1-9 to navigate, Space to toggle, "A" for all, "N" for none, Enter to confirm):\x1b[0m\n');

      available.forEach((mod, idx) => {
        const isCurrent = idx === cursor;
        const isChecked = selectedState[idx];

        const pointer = isCurrent ? '\x1b[36m❯\x1b[0m' : ' ';
        const checkbox = isChecked ? '\x1b[32m[✔]\x1b[0m' : '\x1b[90m[ ]\x1b[0m';
        const num = `\x1b[33m${idx + 1}.\x1b[0m`;
        const name = isCurrent ? `\x1b[1m\x1b[36m${mod.name}\x1b[0m` : `\x1b[36m${mod.name}\x1b[0m`;
        const desc = `\x1b[90m(${mod.id}) - ${mod.description}\x1b[0m`;

        console.log(` ${pointer} ${checkbox} ${num} ${name} ${desc}`);
      });

      const selectedCount = selectedState.filter(Boolean).length;
      console.log(`\n\x1b[90mSelected ${selectedCount} of ${available.length} module(s)\x1b[0m`);
      console.log('\x1b[32m[Press Enter to confirm selection]\x1b[0m\n');
    }

    render();

    function onKeypress(str, key) {
      if (!key) return;

      if (key.name === 'up' || key.name === 'k') {
        cursor = (cursor - 1 + available.length) % available.length;
        render();
      } else if (key.name === 'down' || key.name === 'j') {
        cursor = (cursor + 1) % available.length;
        render();
      } else if (key.name === 'space') {
        selectedState[cursor] = !selectedState[cursor];
        render();
      } else if (key.name === 'return' || key.name === 'enter') {
        cleanup();
        const result = available.filter((_, i) => selectedState[i]);
        console.log(`\n✅ Selected ${result.length} module(s): ${result.map((m) => m.name).join(', ') || 'None'}`);
        resolve(result);
      } else if (str === 'a' || str === 'A') {
        selectedState.fill(true);
        render();
      } else if (str === 'n' || str === 'N') {
        selectedState.fill(false);
        render();
      } else if (/^[1-9]$/.test(str)) {
        const numIdx = parseInt(str, 10) - 1;
        if (numIdx >= 0 && numIdx < available.length) {
          cursor = numIdx;
          selectedState[numIdx] = !selectedState[numIdx];
          render();
        }
      } else if (key.ctrl && key.name === 'c') {
        cleanup();
        process.exit(0);
      }
    }

    function cleanup() {
      stdin.removeListener('keypress', onKeypress);
      if (stdin.isTTY && typeof stdin.setRawMode === 'function') {
        stdin.setRawMode(false);
      }
    }

    stdin.on('keypress', onKeypress);
  });
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

  // Attempt interactive TTY checkbox prompt first
  if (process.stdin.isTTY) {
    const ttyResult = await promptCheckboxSelect(available);
    if (ttyResult !== null) {
      return ttyResult;
    }
  }

  // Fallback for non-TTY or automated inputs
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
 * Handles scalar strings, structured prompts, and autoGenerate strategies.
 */
async function appendEnvVariables(targetDir, manifest, rl) {
  if (!manifest.envVariables) return;

  const envPath = path.join(targetDir, '.env');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  let addedCount = 0;
  for (const [key, spec] of Object.entries(manifest.envVariables)) {
    if (!envContent.includes(`${key}=`)) {
      let val = '';
      if (typeof spec === 'object' && spec !== null) {
        const defaultVal = spec.autoGenerate === 'hex:32' 
          ? crypto.randomBytes(32).toString('hex') 
          : (spec.default || '');

        if (rl && spec.description && process.stdin.isTTY) {
          val = await askQuestion(rl, spec.description, defaultVal);
        } else {
          val = defaultVal;
        }
      } else {
        val = String(spec);
      }

      envContent += `\n# Module: ${manifest.name}\n${key}="${val}"\n`;
      addedCount += 1;
    }
  }

  if (addedCount > 0) {
    fs.writeFileSync(envPath, envContent);
    console.log(`   └─ Appended ${addedCount} environment variables for \x1b[36m${manifest.id}\x1b[0m`);
  }
}

/**
 * Recursively resolves module dependencies so prerequisite modules are installed first.
 */
function resolveModuleDependencies(selectedModules) {
  const availableModules = listAvailableModules();
  const resolvedMap = new Map();

  function addModule(mod) {
    if (resolvedMap.has(mod.id)) return;
    if (Array.isArray(mod.dependencies)) {
      for (const depId of mod.dependencies) {
        const depMod = availableModules.find((m) => m.id === depId);
        if (depMod) {
          addModule(depMod);
        }
      }
    }
    resolvedMap.set(mod.id, mod);
  }

  for (const mod of selectedModules) {
    addModule(mod);
  }

  return Array.from(resolvedMap.values());
}

/**
 * Injects module-specific npm dependencies into target project's package.json.
 */
function patchPackageJsonDependencies(targetDir, manifest) {
  const pkgPath = path.join(targetDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return;

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    let modified = false;

    if (manifest.npmDependencies && typeof manifest.npmDependencies === 'object') {
      pkg.dependencies = pkg.dependencies || {};
      for (const [depName, version] of Object.entries(manifest.npmDependencies)) {
        if (!pkg.dependencies[depName]) {
          pkg.dependencies[depName] = version;
          modified = true;
        }
      }
    }

    if (manifest.npmDevDependencies && typeof manifest.npmDevDependencies === 'object') {
      pkg.devDependencies = pkg.devDependencies || {};
      for (const [depName, version] of Object.entries(manifest.npmDevDependencies)) {
        if (!pkg.devDependencies[depName]) {
          pkg.devDependencies[depName] = version;
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      console.log(`   └─ Injected module package dependencies for \x1b[36m${manifest.id}\x1b[0m into package.json`);
    }
  } catch (err) {
    console.warn(`⚠️  Failed to patch package.json for module ${manifest.id}:`, err.message);
  }
}

/**
 * Main module installer runner.
 */
async function installModules(targetDir, stackType, selectedModules, rl) {
  if (!selectedModules || selectedModules.length === 0) return;

  const modulesToInstall = resolveModuleDependencies(selectedModules);

  console.log(`\n⚙️  Installing ${modulesToInstall.length} module(s) into \x1b[35m${stackType}\x1b[0m...`);

  for (const manifest of modulesToInstall) {
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

    // 2. Append environment variables & patch package.json dependencies
    await appendEnvVariables(targetDir, manifest, rl);
    patchPackageJsonDependencies(targetDir, manifest);

    console.log(`✅ Module \x1b[32m${manifest.name}\x1b[0m installed successfully!`);
  }
}

module.exports = {
  listAvailableModules,
  promptSelectModules,
  installModules,
};
