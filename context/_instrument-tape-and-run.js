'use strict';

/*global process*/
var $process = process;

var env = $process.env;
var testProgram = env.ITAPE_NPM_TEST_PROGRAM;

var leakedHandles = env.ITAPE_NPM_LEAKED_HANDLES;
if (leakedHandles) {
    leakedHandles = JSON.parse(leakedHandles);

    var leakedHandlesModule = require('leaked-handles');
    if (typeof leakedHandles === 'object') {
        leakedHandlesModule.set(leakedHandles);
    }
}

var formatStack = env.ITAPE_NPM_FORMAT_STACK;
if (formatStack) {
    formatStack = JSON.parse(formatStack);

    var formatStackModule = require('format-stack');
    if (typeof formatStack === 'object') {
        formatStackModule.set(formatStack);
    } else {
        formatStackModule.set({
            traces: 'short'
        });
    }
}

var resolve = require('resolve');
var whiteList = env.ITAPE_NPM_TAPE_WHITELIST;
if (whiteList) {
    whiteList = JSON.parse(whiteList);
    instrumentTape(whiteList);
}

require(testProgram);

function instrumentTape(whiteList) {
    var tapeTestFile = resolve.sync('tape/lib/test', {
        basedir: process.cwd()
    });
    var tapeTest = require(tapeTestFile);

    var $run = tapeTest.prototype.run;
    tapeTest.prototype.run = function fakeRun() {
        if (whiteList.indexOf(this.name) === -1) {
            this._skip = true;
        }
        $run.apply(this, arguments);
    };
}
