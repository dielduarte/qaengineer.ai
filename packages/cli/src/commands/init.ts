import { intro, outro, log } from '@clack/prompts';
import fs from 'fs';
import path from 'path';

export async function init() {
  intro('Welcome to QAengineer cli');

  log.message('Creating project scaffolding...');

  const projectRoot = process.cwd();
  const qaEngineerDir = path.join(projectRoot, '.qaengineer');

  try {
    if (!fs.existsSync(qaEngineerDir)) {
      fs.mkdirSync(qaEngineerDir);
    }

    const configFilePath = path.join(qaEngineerDir, 'config.md');
    const testExampleFilePath = path.join(qaEngineerDir, 'test-example.md');

    fs.writeFileSync(
      configFilePath,
      '<!-- This is the file you will use to create shared configurations so that the QA engineer can run before all tests. \n\n Example: You can use for describing how to login, or which URL all tests should start. -->\n',
    );
    fs.writeFileSync(
      testExampleFilePath,
      '# Test Example\n go to https://www.google.com and make sure the page is loaded successfully.',
    );

    log.success('Project scaffolding created successfully.');
  } catch (error) {
    log.error("Error running init command, can't create project scaffolding.");
    console.error(error);
  }
}
