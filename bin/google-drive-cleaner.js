#!/usr/bin/env node

'use strict'

const fs = require('fs')
const program = require('commander')
const GoogleDriveCleaner = require('..')

program
  .option('-a, --auth [AUTH_JSON_FILE_PATH]', 'JSON path for Google\'s authentication')
  .option('-q, --query [QUERY]', 'Query string for searching delete files.', '')
  .option('--no-dryrun', 'Delete files')
  .parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
  process.exit(255)
}

if (!fs.existsSync(program.auth)) {
  program.outputHelp()
  process.exit(254)
}

(new GoogleDriveCleaner(program.auth)).clean({
  query: program.query,
  dryrun: program.dryrun
})
