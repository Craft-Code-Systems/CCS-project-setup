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
 * Creates the necessary folder structure in the current working directory.
 * @function
 */
function createFolderStructure() {
    const folders = ['eslint-plugins', 'eslint-plugins/custom-rules'];
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
 * Copies the ESLint configuration and custom rules files from the setup script's folder to the current working directory.
 * @function
 */
function copyESLintConfig() {
    console.log('Copying ESLint config files...');

    const eslintConfigSrc = path.join(__dirname, 'eslint.config.js');
    const eslintConfigDest = path.join(process.cwd(), 'eslint.config.js');
    console.log(`Copying ESLint config from ${eslintConfigSrc} to ${eslintConfigDest}`);
    fs.copySync(eslintConfigSrc, eslintConfigDest);
    console.log('eslint.config.js copied.');

    const customRulesSrc = path.join(__dirname, 'eslint-plugins');
    const customRulesDest = path.join(process.cwd(), 'eslint-plugins');
    console.log(`Copying custom rules from ${customRulesSrc} to ${customRulesDest}`);

    if (fs.existsSync(customRulesSrc)) {
        fs.copySync(customRulesSrc, customRulesDest);
        console.log('Custom ESLint rules copied.');
    } else {
        console.error(`Error: Directory ${customRulesSrc} does not exist.`);
    }
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
    .version('1.0.9')
    .description('Initialize a new project with a .env file, ESLint, and folder structure for custom ESLint rules including custom rules. WARNING: This script assumes that you have installed SvelteKit and Node.js.')
    .action(() => {
        initializeProject();
    });

program.parse(process.argv);
