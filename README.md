# firmata-http-bridge
Makes Firmata commands available through HTTP requests

This is a work in progress, meant for didactical purposes.

Currently it just reads and writes digital ports.

## Description

This package installs a web server which accepts several commands and sends them through the Firmata protocol to a connected microcontroler, such as an Arduino board.

- [firmata-http-bridge](#firmata-http-bridge)
  - [Description](#description)
  - [Installation](#installation)
  - [Commands](#commands)
    - [Install dependencies](#install-dependencies)
    - [Compilation](#compilation)
    - [Execute](#execute)
    - [Compile, execute and watch](#compile-execute-and-watch)
    - [Inspect](#inspect)
    - [Test](#test)
    - [Coverage](#coverage)
    - [Documentation](#documentation)
  - [Configuration](#configuration)
    - [Settings](#settings)
  - [API](#api)
    - [Firmata Version](#firmata-version)
    - [Analog Pins](#analog-pins)
    - [Digital Pins](#digital-pins)
    - [Public folder](#public-folder)
    - [Commands](#commands-1)
      - [FSA](#fsa)
      - [pinMode](#pinmode)
      - [digitalWrite](#digitalwrite)
      - [digitalRead](#digitalread)

## Installation

The package is not published to **npm** since it is not meant for production but to teach programming.  Thus, it is provided only as source code.

If you have [`git`](https://git-scm.com/) client installed, you can do:

```sh
git clone https://github.com/Satyam/firmata-http-bridge.git
cd firmata-http-bridge
```

Otherwise you can download the ZIP file containing the code from: [https://github.com/Satyam/firmata-http-bridge/archive/main.zip](https://github.com/Satyam/firmata-http-bridge/archive/main.zip)


Once copied and/or expanded to a local drive, you must install dependencies and compile it before it is run, as described in the following section.

## Commands

This package expects [`NodeJS`](https://nodejs.org/) to be installed, which will also install [`npm`](https://www.npmjs.com/).

All commands can be run within the directory where the package was installed, by default `firmata-http-bridge`.

Please check the [configuration options](#configuration) before executing.

### Install dependencies

This is the first step to make everything work. This package relies on several other packages which **must** be installed before compiling it.

Run:

```
npm i
```
This will read the list of dependencies from the `package.json` file and install them.

### Compilation

The source code for the application is written in TypeScript, which NodeJS doesn't understand natively.  Thus, it needs to be compiled, with the following command:

```
npm run build
```

This will result in a `dist/` folder to be created with the original TypeScript files converted to plain JavaScript files.

It will contain three types of files:

* `*.js`: Plain JavaScript executable files.  These are the only ones needed in a production environment.
* `*.js.map`: Map files used in debugging to associate each line in the `*.js` files to the original source code in the `*.ts` files. Debuggers handle this automatically.  They are not required in a production environment.
* `*.d.ts`: type declaration files, they contain the type declarations extracted from the original `*.ts` without the actual code, which is now in the `*.js` files.  IDEs like VSCode use these files to provide code hints and type checking on the fly while using these files.

### Execute

Once installed and compiled, you may run the package in node with:

```
node .
```

### Compile, execute and watch

The best option when in development, is to compile and run all at once.  It will then keep watching the source files to check for changes and, if there is one, it will re-compile and relaunch the app.

This way, you don't need to compile it first, and it will keep the app running updated versions when you change the source files. 

It is not recommended for production.

```
npm start
```

### Inspect

In development, it will compile and launch the application in debug mode.

```
npm run inspect
```

Then, if using Google Chrome, you can debug the app by going to the following URL:

```
chrome://inspect
```
It is a good idea to place `debugger` statements in the source `*.ts` files close to the places you want to inspect.

### Test

Unit tests can be run with the following command:

```
npm t
```

Unit tests are meant to ensure that if you change the code, current behavior is maintained.  Tests should also be expanded to cover new features or added to uncover hidden bugs (usually to test unexpected behavior reported by end users).

The current tests were written for an Arduino Uno board.  Many will fail if used with another board or if a board is not actually connected.  In this sense, they are *integration tests* rather than *unit tests* which would usually resort to *mocks* for Firmata instead of the real thing.

### Coverage

It measures how well the tests cover all the possibilities of the app.  100% coverage is the desired goal, though often unfeasible. At least all modules should reach a green level of coverage.  

```
npm run coverage
```

To know what parts of the code are not covered by the tests, once the command is run, a folder `coverage` is created.  You can browse the `index.html` file which will show each of the files tested and highlight in color the parts that have never been tested. This allows for further tests to be added to cover those cases.
### Documentation

API documentation can be produced automatically by running:

```
npm run docs
```

A folder called `docs` will be created.  Open the file `docs/index.html` with any browser and it will provide the documentation for this package.

## Configuration

The program accepts several configuration parameters from the environment or the command prompt, the later overriding the former. All the parameters have defaults as documented below.  

You can change the settings via the command line like this:

```
node . --HTTP_PORT=3000
# or:
npm start -- --HTTP_PORT=3000
```
Notice the double dash `--` before the options when using `npm start`.  That is because options issued before the `--` are for `npm` and those after are for the program `npm start` runs.

You could also set environment variables by the same name.

Configuration can be set via a file named `.env`  with the new settings.  A sample `.env` file might look like:
```
HTTP_PORT=3000
USB_PORT=/dev/ttyACM1
```

### Settings

* `HTTP_PORT`: Defaults to 8000, sets the port to be used for the web server.
* `USB_PORT`: Defaults to `/dev/ttyACM0` which is the standard port used by Firmata for Linux.  The correct value can be found by letting the Arduino IDE find it for you.
  
## API

All commands should be sent to `http://localhost:8000` if run from the same machine (*`localhost`*).  The port can be the default `8000` or whatever was [configured](#configuration).

Some commands can be issued from the location bar on any browser. Those are listed below under the `GET` method. The only `POST` command can be only used programmatically.

### Firmata Version

`GET` on `http://localhost:8000/version` will return the version information of Firmata software running in the microcontroller board.  A typical response (on an Arduino with the most current version at the time or writing this) is:
```
{
  "name": "StandardFirmata.ino",
  "version": {
    "major": 2,
    "minor": 5,
  },
}
```

### Analog Pins

`GET` on `http://localhost:8000/AnalogPins` will return an array with a list of pin numbers available for analog input.    A sample response might show: 
```
 [
  14,
  15,
  16,
  17,
  18,
  19,
]
```
This would mean, for example, that commands for the first available analog input port should go to physical pin 14.

### Digital Pins

`GET` on `http://localhost:8000/DigitalPins` will return the number of digital pins available.  A sample reply might show:
```
20
```
It means that the board supports digital pins from 1 to 20.  Further information can then be requested for each individual pin, but issuing the same command followed by a slash and a number, for example `http://localhost:8000/DigitalPins/10` for pin 10 might show:

```
{
  "supportedModes":[0,1,3,4,11],
  "value":0,
  "mode":1,
  "report":1,
  "analogChannel":127
}
```
The meaning of the `supportedModes` can be interpreted from this table:
```
  INPUT:    0,
  OUTPUT:   1,
  ANALOG:   2,
  PWM:      3,
  SERVO:    4,
  SHIFT:    5,
  I2C:      6,
  ONEWIRE:  7,
  STEPPER:  8,
  SERIAL:  10
  PULLUP:  11
  IGNORE: 127
  UNKOWN:  16
```

The current mode is shown under `mode`.  It will show nothing if not explicitly set.

The `report` option is not currently supported so the value is not meaningful.

### Public folder

Any other request will return with the contents of the `public` folder.  Thus, the server can respond like a regular web server.  

A request to `http://localhost:8000`  will return the file `public/index.html` which contains an example of remote access.
A request to `http://localhost:8000/someFile.txt`  will return the file `public/someFile.txt` if there is any.

If no such file is found, it will return with a 404 -- Not Found error.

The existing `public/index.html` provides a means to try out the commands.  It contains one framed section for each of the commands, inputs for the parameters for each call and a `Send` button to send the command to the same server, which will act upon the microcontroller.  The reply will be shown on the right.

Before reading or writing to any of the ports, remember to set the correct mode for the command.

### Commands

There are two mechanism to send commands to the microcontroller, via a web browser or programmatically.

The programmatic way, via the web [`Fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) will be covered elsewhere (*pending*)

The commands below can be sent via the browser at the indicated URLs.

All the commands are internally sent as a [Flux Standard Action](https://github.com/redux-utilities/flux-standard-action#flux-standard-action) or **FSA** and so are the possible replies.

#### FSA

FSA is a message format to transmit *actions* to be performed.  The Firmata protocol uses MIDI because it is very compact and thus suitable for devices with very little processing resources.  However, in the web environment, both clients and servers have plenty of resources and the transmission networks have high bandwidth, thus, a more verbose protocol, much easier to produce and read, is preferred which is much less prone to errors and easier to debug.

The FSA is a JavaScript object containing the following properties:

* `type`: a string specifying the action requested or replied to.  This is the only mandatory field.
* `payload`: an object containing the parameters required for the requested action, as properties.
* `meta`: additional information not directly related to the action
* `error`: an object containing a numerical `code` and a human readable `msg`.
  
The actual standard is somewhat lax in what the last three, optional, properties might be.  They can all be simple values (for example, if the action requires just one parameter, the `payload` might contain its value instead of an object with a property containing its value).  The format presented above is the one we adopted for this app.

Being a JavaScript object, an FSA is easy to transmit as a JSON string both for commands and replies.


#### pinMode

A `GET` to `http://localhost:8000/pinMode/13/1` will set the pin 13 (the builtin led in the Arduino Uno board) to output mode.   The first value after `pinMode/` is the pin number and the second after the next slash is the mode that should be one of:

```
  INPUT:    0,
  OUTPUT:   1,
  ANALOG:   2,
  PWM:      3,
  SERVO:    4,
  SHIFT:    5,
  I2C:      6,
  ONEWIRE:  7,
  STEPPER:  8,
  SERIAL:  10
  PULLUP:  11
  IGNORE: 127
  UNKOWN:  16
```
Not all pins support all modes.  To find out which ones are valid, you may ask for `http://localhost:8000/digitalPins/13` and check the `supportedModes` values.

The URL is translated internally to the following FSA:

```json
{
  "type":"pinMode",
  "payload": {
    "pin":13,
    "mode":0
  }
}
```

And it would be answered with the following reply:

```json
{
  "type":"pinMode_reply",
  "payload": {
    "pin":13,
    "mode":0
  },
  "meta": {
    "date":"2021-03-16T17:08:01.041Z"
  }
}
```

The `type` property has now a suffix of `_reply` and a `meta.date` property has been added with the ISO 8601 date when the command was executed, possibly for logging purposes or whatever.

If the URL has an invalid pin or mode, for example:  `http://localhost:8000/pinMode/999/1` the server would reply with a type suffix of `_error` and an `error` property:

```json
{
  "type":"pinMode_error",
  "payload": {
    "pin":999,
    "mode":1
  },
  "meta": {
    "date":"2021-03-16T17:14:09.987Z"
  },
  "error": {
    "code":2,
    "msg":"Invalid pin"
  }
}
```

#### digitalWrite

Once set to output mode via [`pinMode`](#pinmode), values can be set via a `GET` to `http://localhost:8000/digitalWrite/13/0` which would return:

```json
{
  "type":"digitalWrite_reply",
  "payload": {
    "pin":13,
    "output":0
  },
  "meta": {
    "date":"2021-03-16T17:31:14.044Z"
  }
}
```
Or an error reply, similar to the one shown above.

The `digitalWrite` command is followed by the pin number and the value, either `0` or `1`, all separated with slash `/`

To blink the built-in led, the following sequence of requests can be send:

```
http://localhost:8000/pinMode/13/1
http://localhost:8000/digitalWrite/13/0
http://localhost:8000/digitalWrite/13/1
http://localhost:8000/digitalWrite/13/0
http://localhost:8000/digitalWrite/13/1
```
The first would set the pin for output and the following URLs will set the led on and off.

#### digitalRead

An input pin can be read via a `GET` to `http://localhost:8000/digitalRead/2` where the last value can be any of the digital pins.  

After setting the [`pinMode`](#pinmode) for input with pull up with: `http://localhost:8000/pinMode/2/11`, assuming nothing is connected to that pin, the `http://localhost:8000/digitalRead/2`  would produce a reply such as:

```json
{
  "type":"digitalRead_reply",
  "payload":{
    "pin":2,
    "value":1
  },
  "meta": {
    "date":"2021-03-16T17:45:48.305Z"
  }
}
```


