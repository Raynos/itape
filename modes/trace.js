'use strict';

var $process = require('process');

module.exports = traceMode;

function traceMode(ctx) {
    var packageFile = ctx.packageFile;
    var packageJson = require(packageFile);

    if (!packageJson.itape) {
        return;
    }

    var itapeConfig = packageJson.itape;
    var traceConfig = itapeConfig.trace;

    if (!traceConfig) {
        return;
    }

    if (traceConfig.debuglog) {
        ctx.setTestEnvironment({
            NODE_DEBUG: ($process.env.NODE_DEBUG || '') + ' ' +
                traceConfig.debuglog.join(' ')
        });
    }
    if (traceConfig.leakedHandles) {
        ctx.setTestEnvironment({
            ITAPE_NPM_LEAKED_HANDLES:
                JSON.stringify(traceConfig.leakedHandles)
        });
    }
    if (traceConfig.formatStack) {
        ctx.setTestEnvironment({
            ITAPE_NPM_FORMAT_STACK:
                JSON.stringify(traceConfig.formatStack)
        });
        ctx.setCLIArg('color', true);
    }
}
