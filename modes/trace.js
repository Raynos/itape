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

    // null out traceConfig if not opted into trace
    if (!ctx.options.trace) {
        traceConfig = {};
    }

    if (traceConfig.debuglog) {
        ctx.setTestEnvironment({
            NODE_DEBUG: ($process.env.NODE_DEBUG || '') + ' ' +
                traceConfig.debuglog.join(' ')
        });
    }

    if (traceConfig.leakedHandles || ctx.options.leakedHandles) {
        var leakedHandlesValue = configOrCli(
            traceConfig.leakedHandles, ctx.options.leakedHandles
        );

        ctx.setTestEnvironment({
            ITAPE_NPM_LEAKED_HANDLES: leakedHandlesValue
        });
    }

    if (traceConfig.formatStack || ctx.options.formatStack) {
        if (ctx.options.formatStack === 'long') {
            ctx.options.formatStack = '{"traces":"long"}';
        }

        var formatStackValue = configOrCli(
            traceConfig.formatStack, ctx.options.formatStack
        );

        ctx.setTestEnvironment({
            ITAPE_NPM_FORMAT_STACK: formatStackValue
        });
        ctx.setCLIArg('color', true);
    }
}

function configOrCli(configValue, cliValue) {
    var jsonValue = null;
    if (configValue) {
        jsonValue = JSON.stringify(
            configValue
        );
    }
    if (cliValue === true) {
        jsonValue = 'true';
    }
    if (typeof cliValue === 'string') {
        jsonValue = cliValue;
    }

    return jsonValue;
}
