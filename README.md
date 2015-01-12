# itape

An interactive tape runner.

## Concept

Interactive tape (`itape` for short) is a modal test runner.

It behaves exactly like node except it has a few more features.
The main trick it uses is to remember your last test run.

Because it knows your test history it can easily re-run
    your tests and print just the failures or jump straight into
    the debugger.

## Usage

 - `itape test/index.js` Use `itape` just like `node`.
 - `itape --fail test/index.js` Print only failures
 - `itape --trace test/index.js` Print only failures and trace!
 - `itape --debug test/index.js` Print only failures and debug!

## Trace mode

The trace mode uses the `itape` key in your package.json.
You should configure it like:

```
  "itape": {
    "trace": {
      "debuglog": [
        "typedrequesthandler"
      ],
      "leakedHandles": true,
      "formatStack": true
    }
  }
```

Here we enable `debuglog` and `leaked-handles` only when
    trace is on.

The `--trace` utility means you do not have to remember which
    debuglog modules to enable.

## Debug mode

The debug mode uses will re-run your tests with the debugger on.
It will place a breakpoint at EVERY failed assertion.

This means you can just hit `repl` and inspect the state around
    your failed assertion without changing the code of your tests!
