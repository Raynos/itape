'use strict';

var $process = require('process');

module.exports = traceMode;

function traceMode(ctx) {
    /*eslint complexity: [2, 15]*/
    /*eslint max-statements: [2, 35]*/
    var packageFile = ctx.packageFile;
    var packageJson = require(packageFile);

    var itapeConfig = packageJson.itape || {};
    var traceConfig = itapeConfig.trace || {};

    if (traceConfig.debuglog) {
        ctx.setTestEnvironment({
            NODE_DEBUG: ($process.env.NODE_DEBUG || '') + ' ' +
                traceConfig.debuglog.join(' ')
        });
    }

    if (traceConfig.leakedHandles || ctx.options.leakedHandles) {
        var leakedHandlesValue = null;
        if (traceConfig.leakedHandles) {
            leakedHandlesValue = JSON.stringify(
                traceConfig.leakedHandles
            );
        }
        if (ctx.options.leakedHandles === true) {
            leakedHandlesValue = 'true';
        }
        if (typeof ctx.options.leakedHandles === 'string') {
            leakedHandlesValue = ctx.options.leakedHandles;
        }

        ctx.setTestEnvironment({
            ITAPE_NPM_LEAKED_HANDLES: leakedHandlesValue
        });
    }

    if (traceConfig.formatStack || ctx.options.formatStack) {
        var formatStackValue = null;
        if (traceConfig.formatStack) {
            formatStackValue = JSON.stringify(
                traceConfig.formatStack
            );
        }
        if (ctx.options.formatStack === true) {
            formatStackValue = 'true';
        }
        if (typeof ctx.options.formatStack === 'string') {
            formatStackValue = ctx.options.formatStack;
        }

        ctx.setTestEnvironment({
            ITAPE_NPM_FORMAT_STACK: formatStackValue
        });
        ctx.setCLIArg('color', true);
    }
}

