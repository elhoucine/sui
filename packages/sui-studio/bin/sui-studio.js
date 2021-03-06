#!/usr/bin/env node
/* eslint no-console:0 */

require('fs.realpath').monkeypatch()

const program = require('commander')
const { getSpawnPromise } = require('@s-ui/helpers/cli')
const {join} = require('path')
const pkg = require('../package.json')

const version = pkg.version

program
  .version(version, '    --version')

program
  .command('start').alias('s')
  .option('-d, --dir-base [dir]', 'Setup base dir where live src and demo folders', '.')
  .action(({dirBase}) => {
    const devServerExec = require.resolve('@s-ui/bundler/bin/sui-bundler-dev')
    getSpawnPromise(devServerExec, [], {shell: false, cwd: join(__dirname, '..'), env: process.env})
      .then(process.exit, process.exit)
  })

program
  .command('generate <category> <component>', 'Create a component and her demo files').alias('g')

program
  .command('build', 'Generate a static version ready to be deploy to now.sh or GH-Pages').alias('b')

program
  .command('deploy', 'Generate a static version and deploys it to now.sh').alias('d')

program
  .command('commit', 'Commit with semantic messages.').alias('co')

program
  .command('release', 'Release whatever need to be release').alias('r')

program
  .command('check-release', 'Which packages must be updates').alias('cr')

program
  .command('run-all <command>', 'Run, in series, the same command in each component').alias('ra')

program
  .command('run-parallel <command>', 'Run, in parallel, the same command in each component').alias('rp')

program
  .command('link-all <command>', 'Link all components between each other').alias('la')

program
  .command('link <origin> <destination>', 'Link components between them').alias('l')

program
  .command('init <project>', 'Create a new project').alias('i')

program
  .command('clean-modules', 'Remove node_module folder in each component').alias('cm')

program.parse(process.argv)
