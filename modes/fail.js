'use strict';

module.exports = failMode;

function failMode(ctx) {
    var whiteList = getFailingTests(ctx.tapOutput);
    var env = {};

    if (whiteList.length > 0) {
        env.ITAPE_NPM_TAPE_WHITELIST = JSON.stringify(whiteList);
    }
    ctx.setTestEnvironment(env);

    ctx.setStdoutFilter(function stdoutFilter(chunk) {
        chunk = String(chunk);
        if (chunk.indexOf('ok ') === 0) {
            return false;
        }
        return true;
    });
}

function getFailingTests(tapOutput) {
    var fails = tapOutput.fail;

    var tests = uniq(fails.map(function getTests(fail) {
        return tapOutput.tests[fail.test - 1];
    })).filter(Boolean);

    return tests.map(function toName(test) {
        return test.name;
    });
}

function uniq(arr) {
    return arr.reduce(function check(acc, x) {
        if (acc.indexOf(x) === -1) {
            acc.push(x);
        }
        return acc;
    }, []);
}
