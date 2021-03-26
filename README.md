# firmata-http-bridge
Makes Firmata commands available through a web server connected to the board.

This is a work in progress meant as a teaching example and it is intentionally incomplete.

Currently it just reads and writes digital ports.

## Description

This package installs a web server which accepts several commands and sends them through the Firmata protocol to a supported microcontroler, such as an Arduino board.

- [firmata-http-bridge](#firmata-http-bridge)
  - [Description](#description)
  - [Installation](#installation)
  - [`npm` Commands](#npm-commands)
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
    - [HTTP GETs](#http-gets)
      - [GET Firmata Version](#get-firmata-version)
      - [GET Analog Pins](#get-analog-pins)
      - [GET Digital Pins](#get-digital-pins)
      - [GET pinMode](#get-pinmode)
      - [GET digitalWrite](#get-digitalwrite)
      - [GET digitalRead](#get-digitalread)
      - [Public folder](#public-folder)
    - [HTTP POSTs](#http-posts)
      - [FSA](#fsa)
      - [pinMode](#pinmode)
      - [digitalWrite](#digitalwrite)
      - [digitalRead](#digitalread)
    - [Sockets](#sockets)

## Installation

This package expects [`NodeJS`](https://nodejs.org/) to be installed, which will also install [`npm`](https://www.npmjs.com/).

The package is not published to **npm** since it is not meant for production but to teach programming a dedicated web server that serves as a bridge from arbitrary web clients (browsers) to a microcontroller.  Thus, it is provided only as source code.

If you have [`git`](https://git-scm.com/) client installed, you can do:

```sh
git clone https://github.com/Satyam/firmata-http-bridge.git
cd firmata-http-bridge
```

Otherwise you can download the ZIP file containing the code from: [https://github.com/Satyam/firmata-http-bridge/archive/main.zip](https://github.com/Satyam/firmata-http-bridge/archive/main.zip)

However, if you plan to edit it and back it up on Github, it is better to have your own copy or *fork* to work with as the original cannot be changed except by the author.  In order to do that, in [GitHub](https://github.com/Satyam/firmata-http-bridge), on the top right corner, there is a button labeled `fork` with a number, which represents the number of copies of this repository made by others.  You can click on that button to get your own personal copy of it.  Then, to download this copy into your computer, you can do the following replacing the asterisks with your GitHub user name:

```sh
git clone https://github.com/****/firmata-http-bridge.git
cd firmata-http-bridge
```

You cannot download a ZIP copy of this fork if you plan to upload your changes to the repository.  The ZIP download lacks the synchronization information git needs to keep track of changes.

Once copied and/or expanded to a local drive, you must install dependencies and compile it before it is run, as described in the following section.

## [`npm`](https://www.npmjs.com/) Commands


All commands can be run within the directory where the package was installed, by default `firmata-http-bridge`.

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
* `*.d.ts`: type declaration files, they contain the type declarations extracted from the original `*.ts` without the actual code, which is now in the `*.js` files.  IDEs like VSCode use these files to provide code hints and type checking on the fly while editing.

If the original TypeScript files feel cumbersome, the `dist/*.js` files are plain JavaScript.  

### Execute

Please check the [configuration options](#configuration) before executing.

Once installed and compiled, as indicated the sections above, you may run the package in node with:

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

It will automatically stop at a breakpoint before the first executable line to give you enough time to start the debugging client, such as Google Chrome which you can use to debug the app by going to the following URL:

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

The current tests were written for an [Arduino Uno](https://store.arduino.cc/arduino-uno-rev3) board.  Many will fail if used with another board or if a board is not actually connected.  In this sense, they are *integration tests* rather than *unit tests* which would usually resort to *mocks* for Firmata instead of the real thing.

### Coverage

It measures how well the tests cover all the possibilities of the app.  100% coverage is the desired goal, though often unfeasible. At least all modules should reach a green level of coverage.  

```
npm run coverage
```

It will provide a summary once it has run all the tests successfully. To know which parts of the code are not covered by the tests, once the command is run, a folder `coverage` is created.  You can browse the `coverage/index.html` file which will show each of the files tested and highlight in color the parts that have never been tested. This allows for further tests to be added to cover those cases.

### Documentation

API documentation can be produced automatically by running:

```
npm run docs
```

A folder called `docs` will be created.  Open the file `docs/index.html` with any browser and it will provide the documentation for this package.

Documentation comments (usually called *doc-comments*) can be found in the source files, they are the comments started with `/**`.

Keeping the documentation updated in parallel with the code has always been an issue. The idea is that, if you can generate part of the documentation from the code itself, making the documentation is much easier. By adding a few doc-comments along the code, it is easier to update the docs when and if you update the code. The words starting with an `@` are keywords, whose meaning can be found in the [JsDoc](https://jsdoc.app/) documentation, which became the most popular such API documentation generator, but does not deal with TypeScript.  That is why I used [TypeDoc](https://typedoc.org/).  

TypeScript actually provides lots of documentation on its own, even without any doc-comments.  With descriptive identifier names and type declarations in TypeScript, much can be learned right away.

Documentation generators don't always get it right. Sometimes they get confused but, overall, they do a good job.

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

API stands for Application Programming Interface and, with a web server, it is represented by the type of the communication in between clients and server and the format of the messages in between them.

This server supports three ways of communication.

1. [HTTP gets with textual responses](#http-gets)
2. [HTTP posts with FSA message](#http-posts)
3. [Sockets with FSA message](#sockets)

The web server is also configured to serve the example pages that use these APIs.  It also allows clients to access the helper functions to be used in the client.

All commands should be sent to `http://localhost:8000` if run from the same machine (*`localhost`*).  The port can be the default `8000` or whatever was [configured](#configuration).

### HTTP GETs

Most commands can be issued from the location bar on any browser, there is no need to do any programming. It is as if you were asking for a regular web page but the server reads the information from the URL and assembles the reply on the fly.  

It is not really practical for programming purposes, as the replies are simple text or html, which makes them harder to understand (that is *parse*) by a program. 

Also, the commands implemented are very simple requiring at most two parameters.  If more options were to be needed, concatenating more and more parameters into the URL becomes a nightmare.  That is why, in some web sites, you see long URLs with very long strings of seemingly random characters.  Sometimes they are JSON-encoded objects containing the parameters which are then [Base64 encoded](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs#encoding_data_into_base64_format) or [url-encoded](https://www.w3schools.com/tags/ref_urlencode.ASP) to avoid conflicting characters, or some other means of packing all the parameters into a string, for example [Google Maps StreetView images](https://www.google.com/maps/@41.2430273,1.8120463,3a,75y,111.63h,88.29t/data=!3m7!1e1!3m5!1sceei56sWBpNMz0J9o64Ogg!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fpanoid%3Dceei56sWBpNMz0J9o64Ogg%26cb_client%3Dmaps_sv.tactile.gps%26w%3D203%26h%3D100%26yaw%3D232.36258%26pitch%3D0%26thumbfov%3D100!7i16384!8i8192)

The parameters needed for each command are appended to the base URL, separated with forward slashes. Thus, the server responds in various ways:

| URL                                       | Response                                                                                                                | Source                                                                                           |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `http://localhost:8000`                   | web page located at `public/index.html`                                                                                 | [:octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/server.ts#L53-L58)       |
| `http://localhost:8000/something.txt`     | text file located at `public/something.txt`                                                                             | [:octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/server.ts#L60-L65)       |
| `http://localhost:8000/dist/index.js`     | Javascript file located at `dist/index.js`                                                                              | [:octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/server.ts#L34-L39)       |
| `http://localhost:8000/version`           | HTML page assembled by the server with the reply to the `version` command send to the board.                            | [:octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/simple/index.ts#L34-L36) |
| `http://localhost:8000/digitalWrite/13/1` | HTML page assembled by the server with the reply to the `digitalWrite` of a `HIGH` on pin 13 command send to the board. | [:octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/simple/index.ts#L75-L91) |

All those `app.get(url, ...)` calls tell the web server application `app` to listen for HTTP GET commands on the given URLs and respond with whatever content is required.  The second row in the table above is served by a wildcard URL `app.get('*', ...)` which is the fallback the end of the chain of choices.  The [Express](http://expressjs.com/) web server checks the received URLs against all those `app.get` in sequence, in the order they are found in the source code and branches off on the first match.  You have to list all those `app.get` in decreasing order of specificity, the most specific first and the `app.get('*')` as the very least, being the catch all for all the rest of the HTTP GET and if even that one fails, it will respond with the classic `404 Page not found`.

The responses are sent via the `res.send` for textual or HTML pages assembled on the fly or by `res.sendFile` when we mean to send a static file.  The `path` to the file to be send is taken from the request `req` which is resolved to the path given in the `root` option to `res.sendFile`. 

While the `version` command takes no parameters because it applies to the whole board, other commands as the `digitalWrite`, the last one on the table above, requires a `pin` and an `output` value to be send to the board.  These extra parameters are specified by the colons in the URL path:  [`app.get('/digitalWrite/:pin/:output, ....`](https://github.com/Satyam/firmata-http-bridge/blob/main/src/simple/index.ts#L75).  This means that the `pin` and `output` appear as *folders* in the URL path.  

You can get the values of those parameters via `req.param.pin` or `req.param.output` which are strings and thus need to be converted to actual numbers via `parseInt`.

One final twist on parameters is the *optional* one such as in [`app.get('/digitalPins/:pin?', ... ` ](https://github.com/Satyam/firmata-http-bridge/blob/main/src/simple/index.ts#L42).  The question mark at the end of the `/:pin?` indicates an optional parameter.

The HTTP GET commands are:

#### GET Firmata Version

`GET` on `http://localhost:8000/version` will return the version information of Firmata software running in the microcontroller board.  A typical response (on an Arduino with the most current version at the time or writing this document) is:
```
{
  "name": "StandardFirmata.ino",
  "version": {
    "major": 2,
    "minor": 5,
  },
}
```

#### GET Analog Pins

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

#### GET Digital Pins

`GET` on `http://localhost:8000/DigitalPins` will return the number of digital pins available.  A sample reply might show:
```
20
```
It means that the board supports digital pins from 1 to 20.  Further information can then be requested for each individual pin, by issuing the same command followed by a slash and a number, for example `http://localhost:8000/DigitalPins/10` for pin 10 might show:

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
<a name="supported-modes" ></a>
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

The `report` option shows whether there is a subscription to read values from the pin or not.

#### GET pinMode

An HTTP GET on `http://localhost:8000/pinMode/2/11` will set pin 2 as an input with a pull up resistor.  The first parameter `2` is the pin number and the second `11` is the value from the [table above](#supported-modes).  The server would reply with:

```
Pin 2 set to mode 11
```

Or an error message either if the pin is not within the number of pins of the board or the mode is not one of the modes supported by that pin as reported by [`digitalPins`](#digital-pins).

#### GET digitalWrite

An HTTP GET on `http://localhost:8000/digitalWrite/13/1` would send the pin 13 (the built-in led in Arduino Uno) to HIGH, whatever the +V voltage might be on the board tried. It would respond with:

```
Pin 13 set to 1
```

Or an error message either if the pin is not a pin within the range of the board or the output is not a 0 or 1. (note to self, or others...: check the pin is set to OUTPUT and reply with a suitable error)

#### GET digitalRead

An HTTP GET on `http://localhost:8000/digitalRead/2` would read a single value from from pin 2.  It would reply with:

```
Pin 2 returned 1
// or: 
Pin 2 returned 0
```

Or an error message.

#### Public folder

Any other request will return with the contents of the `public` folder.  Thus, the server can respond like a regular web server.  

A request to `http://localhost:8000`  will return the file `public/index.html` which contains an example of remote access.
A request to `http://localhost:8000/someFile.txt`  will return the file `public/someFile.txt` if there is any.

If no such file is found, it will return with a `404 -- Page Not Found` error.

The existing `public/index.html` provides a means to try out some sample commands. 

It also provides links to other files and folders in the server:

* `dist/` is a folder containing the files compiled by the `npm run build` command. 
* `docs/` links to `docs/index.html` which is generated by the `npm run docs` command, and links to all the API docs.
* `coverage/` links to `coverage/index.html` which is generated by the `npm run coverage` command and links to the detailed coverage report for the tests.
* `post.html` is an HTML file to try out the HTTP POST commands in the [next section](#http-posts).
* `sockets.html` is an HTML file to try out the commands via *sockets* as shown in thein the [corresponding section](#sockets).

### HTTP POSTs

There are two mechanism to send commands to the microcontroller, via a web browser or programmatically.

The programmatic way, via the web [`Fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) will be covered elsewhere (*pending*).  The `public/index.html` file can serve as an example of this.

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


### Sockets