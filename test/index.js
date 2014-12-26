var test = require('tape');

var itape = require('../index.js');

test('itape is a function', function (assert) {
    assert.equal(typeof itape, 'function');
    assert.end();
});
