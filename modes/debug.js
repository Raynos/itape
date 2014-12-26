'use strict';

module.exports = debugMode;

function debugMode(ctx) {
    ctx.setDebugMode(true);

    var tapOutput = ctx.tapOutput;
    var fail = tapOutput.fail;

    var errors = fail.map(function getError(x) {
        return x.error.at;
    });

    var locations = errors.map(function parse(x) {
        var line = x.line;
        var parts = x.file.split(' ');

        var fileName = null;
        if (parts[1]) {
            fileName = parts[1].substr(1);
        } else {
            fileName = x.file;
        }

        return {
            file: fileName, line: line
        };
    });

    ctx.setBreakPoints(locations);
}
