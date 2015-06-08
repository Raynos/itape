# itape(1) -- modal test runner

## SYNOPSIS

`itape` [--help] [--fail] [--trace] [--debug]
        [--leaked-handles[=<opts>] [--format-stack[=<opts>]]
        [-h] [--color] <file>

## DESCRIPTION

`itape` is a modal test runner. It works exactly like `node` and
is instrumented to support the `tape` testing framework.

It supports multiple modes; a failure mode; a debugging mode
and a tracing mode.

## EXAMPLES

 - `itape test/index.js`
 - `itape --fail test/index.js`
 - `itape --trace test/index.js`

## OPTIONS

`--fail`
    Runs your tests in failure mode. `itape` will only run test
    blocks that failed last time. It also filters out all TAP
    noise and only shows `not ok`.

`--trace`
    Runs your test in trace mode. Trace mode implies failure mode.
    Trace mode is defined by your package.json `"itape"` 
    configuration.

    For example:

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

`--debug`
    Runs your tests in debug mode. Debug mode implies failure mode.
    When your program is running in debug mode we run your process
    with the node CLI debugger and set a break point on every
    failed assertion

`--leaked-handles[=<opts>]`
    Runs your tests with the `leaked-handles` module included.

    You can pass a value to configure `leaked-handles` itself.
    For example:

    itape --leaked-handles='{"fullStack": true, "timeout": 1000, "debugSockets": true}' test/index.js

`--format-stack[=<opts>]`
    Runs your tests with the `format-stack` module included.

    You can pass a value to configure `format-stack` itself.
    For example:

    itape --format-stack='{"traces":"long"}' test/index.js

`--help`
    Displays help information

`-h`
    Displays short help

## BUGS

Please report any bugs to http://github.com/Raynos/itape

## LICENCE

MIT Licenced

## SEE ALSO

`tape(1), node.js(1)`
