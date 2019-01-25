'use strict';

var process = require('process');
var parents = require('parents');
var fs = require('fs');
var path = require('path');
var getHomePath = require('home-path');
var mkdirp = require('mkdirp');

var _cache;

module.exports = getTapFolderInfo;

function getTapFolderInfo() {
    if (_cache) {
        return _cache;
    }

    var regex;
    if (path.sep === "\\") {
        regex = new RegExp("\\\\", 'g');
    } else {
        regex = new RegExp(path.sep, 'g');
    }

    var packageFolder = findPackage();
    var cacheFolder = path.join(
        getHomePath(),
        '.config',
        'itape',
        packageFolder.replace(regex, '%')
            .replace(new RegExp(":", 'g'), '%')
    );
    mkdirp.sync(cacheFolder);

    var result = {
        cacheFolder: cacheFolder,
        packageFolder: packageFolder
    };

    _cache = result;

    return result;
}

function findPackage() {
    var folders = parents(process.cwd());
    var packages = folders.map(function toFile(folder) {
        return path.join(folder, 'package.json');
    });

    var packageFolder = null;
    packages.some(function findpackage(packageFile) {
        var exists = fs.existsSync(packageFile);
        if (exists) {
            packageFolder = path.dirname(packageFile);
        }
        return exists;
    });

    if (!packageFolder) {
        throw new Error('could not find package.json');
    }
    return packageFolder;
}
