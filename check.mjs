/**
 * @file
 * @description Runs checks on a students project to ensure that it complies with the requirements.
 * It has some nice colors and stuff.
 * @author Ilya Strugatskiy
 * @version 1.0.0
 * @license MIT
 */

import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { exec } from 'child_process';
import { exit } from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logger = {
    info: (...message) => console.info(`\x1b[0m\x1b[34m[INFO]  ${message}\x1b[0m`),
    warn: (...message) => console.warn(`\x1b[0m\x1b[33m[WARN]  ${message}\x1b[0m`),
    error: (...message) => console.error(`\x1b[0m\x1b[31m[ERROR] ${message}\x1b[0m`),
    fatal: (...message) => console.error(`\x1b[0m\x1b[35m[FATAL] ${message}\x1b[0m`),
    task: (message) => {
        const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        let i = 0;
        const interval = setInterval(() => {
            i++;
            process.stdout.clearLine(1);
            process.stdout.cursorTo(0);
            process.stdout.write(`\x1b[0m\x1b[36m[CHECK] ${message} ${spinner[i % spinner.length]}\x1b[0m`);
        }, 100);
        return (success) => {
            clearInterval(interval);
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(`\x1b[0m\x1b[36m[CHECK] ${message} ${success ? '\x1b[32m✔️' : '\x1b[31m❌'}\x1b[0m\n`);
        };
    },
};

logger.info('Starting checks on student project...');
const checkJSON = logger.task('Checking package.json');
if (!existsSync(join(__dirname, 'package.json'))) {
    checkJSON(false);
    exit(1);
}
checkJSON(true);
const checkTS = logger.task('Checking Typescript');
exec('yarn run tsc --noEmit', (err, stdout) => {
    // Handle errors
    if (err) {
        checkTS(false);
        logger.fatal(err);
        logger.warn(stdout);
        exit(1);
    }
    checkTS(true);

    const checkFormatting = logger.task('Checking formatting');
    exec('yarn run prettier --check .', (err) => {
        if (err) {
            checkFormatting(false);
            logger.fatal(err);
            exit(1);
        }
        checkFormatting(true);
        const checkLint = logger.task('Checking best practices');
        exec('yarn run eslint .', (err, stdout) => {
            if (err) {
                checkLint(false);
                logger.fatal(err);
                logger.fatal(stdout);
                exit(1);
            }
            checkLint(true);
            logger.info('All checks passed!');
            logger.info('You can now submit your project!');
        });
    });
});
