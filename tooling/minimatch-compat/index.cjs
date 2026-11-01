'use strict';
// Every release below 11.0.1 is vulnerable, but eslint 9 and its plugins pin ^3 and call the module
// itself. v11 has no callable export, so this keeps that one shape and adds no matching logic.
const { minimatch } = require('minimatch-patched');

// Assigned by name so cjs-module-lexer exposes them to the ESM `import { Minimatch }` in glob.
module.exports = minimatch;
module.exports.minimatch = minimatch;
module.exports.Minimatch = minimatch.Minimatch;
module.exports.GLOBSTAR = minimatch.GLOBSTAR;
module.exports.sep = minimatch.sep;
module.exports.filter = minimatch.filter;
module.exports.defaults = minimatch.defaults;
module.exports.braceExpand = minimatch.braceExpand;
module.exports.match = minimatch.match;
module.exports.escape = minimatch.escape;
module.exports.unescape = minimatch.unescape;
