import { intro, outro, log, spinner } from '@clack/prompts';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const QAENGINEER_DIR = '.qaengineer';
const CONFIG_FILE_NAME = 'config.md';
const TEST_EXAMPLE_FILE_NAME = 'test-example.md';

function createProjectDirectory(projectRoot: string): string | null {
  const qaEngineerDir = path.join(projectRoot, QAENGINEER_DIR);
  try {
    if (!fs.existsSync(qaEngineerDir)) {
      fs.mkdirSync(qaEngineerDir);
      log.success(`Created directory: ${qaEngineerDir}`);
    } else {
      log.info(`Directory already exists: ${qaEngineerDir}`);
    }
    return qaEngineerDir;
  } catch (error) {
    log.error(`Error creating directory ${qaEngineerDir}`);
    return null;
  }
}

function createConfigurationFiles(qaEngineerDir: string): boolean {
  try {
    const configFilePath = path.join(qaEngineerDir, CONFIG_FILE_NAME);
    const testExampleFilePath = path.join(
      qaEngineerDir,
      TEST_EXAMPLE_FILE_NAME,
    );

    fs.writeFileSync(
      configFilePath,
      '<!-- This is the file you will use to create shared configurations so that the QA engineer can run before all tests. \\n\\n Example: You can use for describing how to login, or which URL all tests should start. -->\\n',
    );
    log.success(`Created configuration file: ${configFilePath}`);

    fs.writeFileSync(
      testExampleFilePath,
      '# Test Example\\n go to https://www.google.com and make sure the page is loaded successfully.',
    );
    log.success(`Created test example file: ${testExampleFilePath}`);
    return true;
  } catch (error) {
    log.error('Error creating configuration files.');
    return false;
  }
}

function updatePackageJson(projectRoot: string): boolean {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  try {
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }

      packageJson.scripts.qaengineer =
        "@qaengineer run --apiKey={your_key} --provider={provider's name} --model={model's name}";

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      log.success(`Updated package.json with qaengineer script.`);
      return true;
    } else {
      log.warn('package.json not found. Skipping script addition.');
      return true;
    }
  } catch (error) {
    log.error('Error updating package.json.');
    return false;
  }
}

function installDependencies(): boolean {
  try {
    log.message('Installing @qaengineer dependency...');
    execSync('npm install @qaengineer', { stdio: 'inherit' });
    log.success('Dependency @qaengineer installed successfully.');
    return true;
  } catch (installError) {
    log.error('Error installing @qaengineer dependency.');
    return false;
  }
}

const welcomeBox = `
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                         │
│   ██████╗  █████╗ ███████╗███╗   ██╗ ██████╗ ██╗███╗   ██╗███████╗███████╗██████╗      │
│  ██╔═══██╗██╔══██╗██╔════╝████╗  ██║██╔════╝ ██║████╗  ██║██╔════╝██╔════╝██╔══██╗     │
│  ██║   ██║███████║█████╗  ██╔██╗ ██║██║  ███╗██║██╔██╗ ██║█████╗  █████╗  ██████╔╝     │
│  ██║▄▄ ██║██╔══██║██╔══╝  ██║╚██╗██║██║   ██║██║██║╚██╗██║██╔══╝  ██╔══╝  ██╔══██╗     │
│  ╚██████╔╝██║  ██║███████╗██║ ╚████║╚██████╔╝██║██║ ╚████║███████╗███████╗██║  ██║     │
│   ╚══▀▀═╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝  ╚═╝     │
│                                                                                         │
│                                      .ai                                               │
│                                                                                         │
│                          🤖 AI-Powered E2E Testing Framework                           │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
`;

export async function init(skipInstall: boolean) {
  console.log(welcomeBox);

  const s = spinner();
  s.start('Initializing project scaffolding...');

  const projectRoot = process.cwd();

  s.message('Creating project directory...');
  const qaEngineerDir = createProjectDirectory(projectRoot);

  if (!qaEngineerDir) {
    s.stop('Failed to create project directory');
    return null;
  }

  s.message('Creating configuration files...');
  createConfigurationFiles(qaEngineerDir);

  s.message('Updating package.json...');
  updatePackageJson(projectRoot);

  if (!skipInstall) {
    s.message('Installing dependencies...');
    installDependencies();
  }

  s.stop('Project scaffolding completed successfully!');
}
