'use strict';

var $process = require('process');

var env = $process.env;
var testProgram = env.ITAPE_NPM_TEST_PROGRAM;

var leakedHandles = env.ITAPE_NPM_LEAKED_HANDLES;
if (leakedHandles) {
    leakedHandles = JSON.parse(leakedHandles);
    leakedHandles = typeof leakedHandles === 'object' ?
        leakedHandles : {};
    require('leaked-handles').set(leakedHandles);
}

var formatStack = env.ITAPE_NPM_FORMAT_STACK;
if (formatStack) {
    formatStack = JSON.parse(formatStack);
    require('format-stack');
}

var whiteList = env.ITAPE_NPM_TAPE_WHITELIST;
if (whiteList) {
    whiteList = JSON.parse(whiteList);
    instrumentTape(whiteList);
}

require(testProgram);

function instrumentTape(whiteList) {
    var tapeTest = require('tape/lib/test');

    var $run = tapeTest.prototype.run;
    tapeTest.prototype.run = function fakeRun() {
        if (whiteList.indexOf(this.name) === -1) {
            this._skip = true;
        }
        $run.apply(this, arguments);
    };
}
