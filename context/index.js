'use strict';

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var process = require('process');
var TapParser = require('tap-out').Parser;
var Transform = require('readable-stream').Transform;
var extend = require('xtend');
var mutableExtend = require('xtend/mutable');

var getTapFolderInfo = require('./get-tap-folder.js');

var testRunner = path.join(__dirname,
    '_instrument-tape-and-run.js');

module.exports = Context;

function Context(argv) {
    if (!(this instanceof Context)) {
        return new Context(argv);
    }

    var tapFolder = getTapFolderInfo();
    var cacheFolder = tapFolder.cacheFolder;
    var packageFolder = tapFolder.packageFolder;

    this._extraEnv = {};
    this._stdoutFilter = null;
    this._debugMode = false;
    this._breakpoints = null;
    this._argv = [];

    this._lastFilePathFile = path.join(cacheFolder,
        'last-run-file.log');
    this._lastRunTapFile = path.join(cacheFolder, 'last-run.tap');

    this.options = {
        trace: argv.trace,
        fail: argv.fail,
        debug: argv.debug,
        shortHelp: argv.h,
        help: argv.help,
        leakedHandles: argv['leaked-handles'],
        formatStack: argv['format-stack'],
        color: argv.color === undefined ? true : argv.color
    };
    this.testProgram = argv._[0];
    this.lastFilePath = safeReadFile(this._lastFilePathFile);
    this.lastRunTap = safeReadFile(this._lastRunTapFile);
    this.packageFile = path.join(packageFolder, 'package.json');

    var parser = TapParser();
    this.lastRunTap.split('\n')
        .forEach(parser.handleLine.bind(parser));

    this.tapOutput = parser.results;
}

var proto = Context.prototype;

proto.setCLIArg = function setCLIArg(key, value) {
    this._argv = this._argv.concat(['--' + key, value]);
};

proto.setTestEnvironment = function setTestEnvironment(obj) {
    mutableExtend(this._extraEnv, obj);
};

proto.setStdoutFilter = function setStdoutFilter(filter) {
    this._stdoutFilter = filter;
};

proto.setDebugMode = function setDebugMode(bool) {
    this._debugMode = bool;
};

proto.setBreakPoints = function setBreakPoints(points) {
    this._breakpoints = points;
};

proto.spawnTest = function spawnTest() {
    fs.writeFileSync(this._lastFilePathFile, this.testProgram);

    var child = startChildTest(this);
    reportChildTest(this, child);
    setBreakPoints(this, child);

    return child;
};

function startChildTest(ctx) {
    // trick eslint.
    var $process = process;

    var args = [testRunner].concat(ctx._argv);
    if (ctx._debugMode) {
        args.unshift('debug');
    }

    args.push('--color=' + ctx.options.color);

    var child = spawn('node', args, {
        cwd: $process.cwd(),
        env: extend($process.env, {
            ITAPE_NPM_TEST_PROGRAM:
                path.resolve(ctx.testProgram)
        }, ctx._extraEnv)
    });

    return child;
}

function reportChildTest(ctx, child) {
    var stdout = child.stdout;

    if (ctx._stdoutFilter) {
        stdout = filterStream(stdout, ctx._stdoutFilter);
    }

    if (ctx._debugMode) {
        process.stdin.pipe(child.stdin);
    }

    stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    if (!ctx._debugMode) {
        // TODO. do not write to TAP file for invalid TAP.
        // i.e. a crashed uncaught exception child process.
        var writeStream = fs.createWriteStream(ctx._lastRunTapFile);
        child.stdout.pipe(writeStream, {
            end: false
        });

        child.on('exit', function onErr(code) {
            if (code === 8) {
                writeStream.write('not ok 999 process crashed\n');
            }

            writeStream.end();
        });
    }
}

function waitUntil(stream, phrase, listener) {
    var lines = '';
    stream.on('data', function checkLine(buf) {
        lines += String(buf);

        if (lines.indexOf(phrase) >= 0) {
            listener();
            stream.removeListener('data', checkLine);
        }
    });
}

function setBreakPoints(ctx, child) {
    if (!ctx._breakpoints) {
        return;
    }

    waitUntil(child.stdout, 'break in', flushBreakpoints);

    function flushBreakpoints() {
        ctx._breakpoints.forEach(function set(bp) {
            var cmd = 'sb(' +
                JSON.stringify(bp.file) + ',' +
                JSON.stringify(bp.line) + ');\n';

            child.stdin.write(cmd);
        });

        child.stdin.write('cont\n');
    }
}

function filterStream(stream, lambda) {
    var filter = new Transform();
    filter._transform = function filter(chunk, _, cb) {
        if (lambda(chunk)) {
            this.push(chunk);
        }
        cb();
    };

    return stream.pipe(filter);
}

function safeReadFile(fileName) {
    if (fs.existsSync(fileName)) {
        return fs.readFileSync(fileName, 'utf8');
    } else {
        return '';
    }
}
