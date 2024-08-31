#!/usr/bin/env node

const fs = require('fs-extra');
const { exec } = require('child_process');
const path = require('path');
const program = require('commander');


/**
 * Creates a .env file in the current working directory if it doesn't already exist.
 * The file will contain the line `NODE_ENV=development`.
 * @function
 */
function createEnvFile() {
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, 'NODE_ENV=development\n');
        console.log('.env file created.');
    } else {
        console.log('.env file already exists.');
    }
}

/**
 * Creates the following folders in the current working directory if they don't already exist:
 * - src
 * - src/components
 * - src/utils
 * - tests
 * @function
 */
function createFolderStructure() {
    const folders = ['src', 'src/components', 'src/utils', 'tests'];
    folders.forEach(folder => {
        const folderPath = path.join(process.cwd(), folder);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
            console.log(`Folder ${folder} created.`);
        } else {
            console.log(`Folder ${folder} already exists.`);
        }
    });
}


/**
 * Copies the ESLint config file and custom rules from the setup script's folder to the current working directory.
 * @function
 */
function copyESLintConfig() {
    console.log('Copying ESLint config files...');

    const eslintConfigSrc = path.join(__dirname, 'eslint.config.js');
    const eslintConfigDest = path.join(process.cwd(), 'eslint.config.js');
    fs.copySync(eslintConfigSrc, eslintConfigDest);
    console.log('eslint.config.js copied.');

    const customRulesSrc = path.join(__dirname, 'eslint-plugins');
    const customRulesDest = path.join(process.cwd(), 'eslint-plugins');
    fs.copySync(customRulesSrc, customRulesDest);
    console.log('Custom ESLint rules copied.');
}


/**
 * Installs ESLint and the necessary plugins, and then copies the ESLint config file and custom rules
 * from the setup script's folder to the current working directory.
 * @function
 */
function setupESLint() {
    console.log('Installing ESLint and necessary plugins...');
    const eslintInstallCmd = 'npm install eslint @eslint/js eslint-plugin-svelte eslint-config-prettier globals';

    exec(eslintInstallCmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error installing ESLint: ${error.message}`);
            return;
        }
        console.log(stdout);

        // After installing, copy the ESLint config and custom rules
        copyESLintConfig();
    });
}


/**
 * Initializes a new project by creating a .env file, setting up the
 * recommended folder structure, and installing ESLint and the necessary
 * plugins.
 * @function
 */

function initializeProject() {
    createEnvFile();
    createFolderStructure();
    setupESLint();
}


// Commander setup for CLI options
program
    .version('1.0.0')
    .description('Initialize a new project with a .env file, ESLint, and folder structure for custom ESLint rules including custom rules. WARNING: This script assumes that you have installed SvelteKit and Node.js.')
    .action(() => {
        initializeProject();
    });

program.parse(process.argv);
