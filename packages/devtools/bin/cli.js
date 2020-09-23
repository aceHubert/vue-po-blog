#!/usr/bin/env node

require('yargs').usage('$0 <cmd> [args]').command(require('./devtools')).command(require('./build')).help().argv;
