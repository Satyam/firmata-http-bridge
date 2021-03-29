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
      - [Fetch API](#fetch-api)
      - [POST pinMode](#post-pinmode)
      - [POST digitalWrite](#post-digitalwrite)
      - [POST digitalRead](#post-digitalread)
    - [Sockets](#sockets)
      - [Socket.io](#socketio)
      - [digitalReadSubscribe](#digitalreadsubscribe)
      - [digitalRead_reply](#digitalread_reply)
      - [digitalReadUnsubscribe](#digitalreadunsubscribe)
  - [Tests](#tests)
    - [Types of tests](#types-of-tests)
    - [Structure of a test.](#structure-of-a-test)

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

There is a step by step guide on how to [*fork* a repository](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) in the GitHub docs which goes through all the steps.

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

There will be references to the bits of code relevant to the part being explained, signaled by the *octocat* [ :octocat: ](https://github.com/Satyam/firmata-http-bridge) emoji, which is the emoji for GitHub, where the code resides.   The references usually point to highlighted pieces of code.  However, as the code may change, the lines pointed out might move around and the highlight might get offset.  If so, please file an issue in GitHub Issues [ :octocat: ](https://github.com/Satyam/firmata-http-bridge/issues/new) so it can get fixed.

### HTTP GETs

Most commands can be issued from the location bar on any browser, there is no need to do any programming. It is as if you were asking for a regular web page but the server reads the information from the URL and assembles the reply on the fly.  

It is not really practical for programming purposes, as the replies are simple text or html, which makes them easier for people to read but harder to understand (that is *parse*) by a program. 

Also, the commands implemented are very simple requiring at most two parameters.  If more options were to be needed, concatenating more and more parameters into the URL becomes a nightmare.  That is why, in some web sites, you see URLs with very long strings of seemingly random characters.  Sometimes they are JSON-encoded objects containing the parameters which are then [Base64 encoded](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs#encoding_data_into_base64_format) or [url-encoded](https://www.w3schools.com/tags/ref_urlencode.ASP) to avoid conflicting characters, or some other means of packing all the parameters into a string, for example [Google Maps StreetView images](https://www.google.com/maps/@41.2430273,1.8120463,3a,75y,111.63h,88.29t/data=!3m7!1e1!3m5!1sceei56sWBpNMz0J9o64Ogg!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fpanoid%3Dceei56sWBpNMz0J9o64Ogg%26cb_client%3Dmaps_sv.tactile.gps%26w%3D203%26h%3D100%26yaw%3D232.36258%26pitch%3D0%26thumbfov%3D100!7i16384!8i8192)

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

`GET` on `http://localhost:8000/version` will return the version information of Firmata software running in the microcontroller board [ :octocat: ](https://github.com/Satyam/firmata-http-bridge/blob/main/src/simple/index.ts#L34-L36). A typical response (on an Arduino with the most current version at the time or writing this document) is:
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

`GET` on `http://localhost:8000/AnalogPins` will return an array with a list of pin numbers available for analog input [ :octocat: ](https://github.com/Satyam/firmata-http-bridge/blob/main/src/simple/index.ts#L38-L40).    A sample response might show: 
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

`GET` on `http://localhost:8000/DigitalPins` will return the number of digital pins available [ :octocat: ](https://github.com/Satyam/firmata-http-bridge/blob/main/src/simple/index.ts#L42-L55).  A sample reply might show:
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

An HTTP GET on `http://localhost:8000/pinMode/2/11` will set pin 2 as an input with a pull up resistor [ :octocat: ](https://github.com/Satyam/firmata-http-bridge/blob/main/src/simple/index.ts#L57-L68).  The first parameter `2` is the pin number and the second `11` is the value from the [table above](#supported-modes).  The server would reply with:

```
Pin 2 set to mode 11
```

Or an error message either if the pin is not within the number of pins of the board or the mode is not one of the modes supported by that pin as reported by [`digitalPins`](#digital-pins).

#### GET digitalWrite

An HTTP GET on `http://localhost:8000/digitalWrite/13/1` would send the pin 13 (the built-in led in Arduino Uno) to HIGH, whatever the +V voltage might be on the board tried [ :octocat: ](https://github.com/Satyam/firmata-http-bridge/blob/main/src/simple/index.ts#L75-L91). It would respond with:

```
Pin 13 set to 1
```

Or an error message either if the pin is not a pin within the range of the board or the output is not a 0 or 1. (note to self, or others...: check the pin is set to OUTPUT and reply with a suitable error)

#### GET digitalRead

An HTTP GET on `http://localhost:8000/digitalRead/2` would read a single value from from pin 2 [ :octocat: ](https://github.com/Satyam/firmata-http-bridge/blob/main/src/simple/index.ts#L93-L112).  It would reply with:

```
Pin 2 returned 1
// or: 
Pin 2 returned 0
```

Or an error message.

#### Public folder

Any other request will return with the contents of the `public` folder.  Thus, the server can respond like a regular web server.  

A request to `http://localhost:8000`  will return the file `public/index.html` which contains an example of remote access [ :octocat: ](https://github.com/Satyam/firmata-http-bridge/blob/main/src/server.ts#L53-L58).
A request to `http://localhost:8000/someFile.txt`  will return the file `public/someFile.txt` if there is any [ :octocat: ](https://github.com/Satyam/firmata-http-bridge/blob/main/src/server.ts#L60-L65). In general, any request not fulfilled by any of the previous paths, will be tried on the `public/` folder.

If no such file is found, it will return with a `404 -- Page Not Found` error.

The existing `public/index.html` provides a means to try out some sample commands. 

It also provides links to other files and folders in the server:

* `dist/` is a folder containing the files compiled by the `npm run build` command.  [ :octocat: ](https://github.com/Satyam/firmata-http-bridge/blob/main/src/server.ts#L34-L39)
* `docs/` links to `docs/index.html` which is generated by the `npm run docs` command, and links to all the API docs. [ :octocat: ](https://github.com/Satyam/firmata-http-bridge/blob/main/src/server.ts#L41-L46)
* `coverage/` links to `coverage/index.html` which is generated by the `npm run coverage` command and links to the detailed coverage report for the tests. [ :octocat: ](https://github.com/Satyam/firmata-http-bridge/blob/main/src/server.ts#L47-L52)
* `post.html` is an HTML file to try out the HTTP POST commands in the [next section](#http-posts).
* `sockets.html` is an HTML file to try out the commands via *sockets* as shown in the [corresponding section](#sockets).

### HTTP POSTs

As mentioned before, using HTTP GET has the problem of the size of the URL that can be sent safely.  Originally there was a 2kByte limit but most browsers now support [longer URLs](https://stackoverflow.com/questions/812925/what-is-the-maximum-possible-length-of-a-query-string) and different servers also have their limits. 

Using HTTP GET also brings the issue of confusing URLs for the user.  So far, the commands we've issued for Firmata are short and clear enough, not so for other applications, as already mentioned.

The solution has always been there.  Use HTTP POST.  The data part of the request goes into the body of the HTTP message, not along the URL. It doesn't need to be encoded to avoid confusing the URL parser, after all, a URL has a very specific syntax and you don't want to get any of your parameters to be misunderstood for something else. And, crucially, it can be any length and any format you want. Since it goes into the body of the request, it can use the same format as the response that also goes in the body of the reply.

Thus, it allows us to use stringified JSON for both request and reply.

We could assemble an ad-hoc format for each and every message, but, if we can recognize some pattern within every message, it can help us standardize it.  A message will, in general, have the following parts:

* The *type* of message.  It states what is this all about. Furthermore, is it a request or a reply?
* The *body* of the message, the actual information we are carrying.  What are we requesting, what is our reply.
* The *error* information, if there is any.  
* Any *extra* information.  

This is what the **FSA** message format provides.

#### FSA

[FSA](https://www.npmjs.com/package/flux-standard-action), for *Flux Standard Action*, is a message format to transmit *actions* to be performed.  The Firmata protocol uses MIDI because it is very compact and thus suitable for devices with very little processing resources.  However, in the web environment, both clients and servers have plenty of resources and the transmission networks have high bandwidth, thus, a more verbose protocol, much easier to produce and read, is preferred which is much less prone to errors and easier to debug since it is human-readable. Compact, bit-oriented protocols, like MIDI, are harder to debug because you have to break up the bytes into different bit groups.

We adopted the convention of using an object with the following properties:

* `type`: a string specifying the action requested or replied to.  This is the only mandatory field.
* `payload`: an object containing the parameters required for the requested action, as properties.
* `meta`: additional information not directly related to the action
* `error`: an object containing a numerical `code` and a human readable `msg`.
  
The actual standard is somewhat lax in what the last three, optional, properties might be.  They can all be simple values (for example, if the action requires just one parameter, the `payload` might contain its value instead of an object with a property containing its value). In the standard, the `error` property must be a boolean, with the error detail in the `payload`, but that would either replace the parameters, which are important to determine what the error is about, or mix up with them, making it somewhat confusing.   The format presented above is the one we adopted for this app.

Being a JavaScript object, an FSA is easy to transmit as a JSON string both for commands and replies.

We have also adopted the convention that all replies will have the same `type` as the request, suffixed with either `_reply` if successful or `_error` if not.  All replies will have a `meta.date` property set to an ISO date precise to the millisecond.  Error replies will have the `error` property containing a numerical `code` and a human-readable `msg`.  The answer, if any, will be merged within the `payload`.

To help with the FSAs, the file [`actionBuilders.ts`](https://github.com/Satyam/firmata-http-bridge/blob/main/src/actionBuilders.ts) contains functions that build the various FSAs listed below.  It also contains the function [`makeReply`](https://github.com/Satyam/firmata-http-bridge/blob/main/src/actionBuilders.ts#L178-L206) that helps transform the requests into replies.

#### Fetch API

To send and receive HTTP messages from a web client, the most standard way is the [`Fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), which is available in almost all modern browser, or can be *polyfilled* in others.  It can also be used in servers communicating with other servers.

There are other non-standard solutions like the very popular [axios](https://www.npmjs.com/package/axios) which works in all browsers or [jQuery](https://api.jquery.com/category/ajax/) which was the obvious option if you were already using jQuery.

Since we will always be receiving JSON via HTTP POST, to a specific virtual *folder* on the server, the functionality on the client side is condensed into the [`postCommand` :octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/public/post.html#L115-L120) function.  This command sends a POST to `http://localhost:8000/command` with the FSA message *stringified* into the body, and expects the reply to also be in JSON, which it decodes via `res.json()`. (`req` and `res` are common short names for *request* and *response*, this last name being preferred over `reply` because `req` and `rep` are too similar).

Fetching something from a server is an *asynchronous* operation, meaning that you don't know when the reply might arrive, even at its fastest, which might seem instantaneous to a user, it takes ages for a program.  Thus, the `Fetch` request returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) which is a standard object in most browsers and can be *polyfilled* in Internet Explorer, the only one that doesn't have it.

On the server side, the request from the client is handled [here :octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/post/index.ts#L36-L52).  Instead of an `app.get()` call as we had before, we now use an `app.post('/command', ... ` meaning we will respond to HTTP POST messages sent to the `/command` virtual path.  The FSA is already decoded from the `res.body` of the message and we use the `type` part of the FSA to call a function of the same name as the action.  We then wait for the return value of that function and send it back to the client with `res.json()` instead of `res.send()` as we did before. The latter expected text (plain or HTML) while the former expects an object which it serializes into JSON and puts it in the body of the reply.


In the following list, the commands will be represented by their FSA messages as will the replies, counting on a function such as `postCommand`, discussed above, to send it and wait for the reply.

The can all be tried out via the [post.html :octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/post/index.ts) which is available from the server itself when it is running at: [`http://localhost:8000/post.html`](http://localhost:8000/post.html) and via a link in the home page.

#### POST pinMode

A `POST` to `http://localhost:8000/command` with the following FSA will set the pin 13 (the builtin led in the Arduino Uno board) to output mode.   

```json
{
  "type":"pinMode",
  "payload": {
    "pin":13,
    "mode":1
  }
}
```

The mode that should be one of:

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

And it would be answered with the following reply:

```json
{
  "type":"pinMode_reply",
  "payload": {
    "pin":13,
    "mode":1
  },
  "meta": {
    "date":"2021-03-16T17:08:01.041Z"
  }
}
```

The `type` property has now a suffix of `_reply` and a `meta.date` property has been added with the ISO 8601 date when the command was executed, possibly for logging purposes or whatever.

If the URL has an invalid pin or mode the server would reply with a type suffix of `_error` and an `error` property:

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

#### POST digitalWrite

The following FSA would set pin 13 to a low voltage:

```json
{
  "type":"digitalWrite",
  "payload": {
    "pin":13,
    "output":0
  }
}
```

It would be answered with:

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

#### POST digitalRead

An input pin can be read via the following FSA:

```json
{
  "type":"digitalRead",
  "payload":{
    "pin":2,
  }
}
```

Which would get a reply such as the following, with the `value` property added to the payload:

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

Just like [GET digitalRead](#get-digitalread), this API only reads a single value.

### Sockets

Something that all HTTP methods have in common is that it is up to the client to initiate something.  The server can only reply to requests made, and that within a limited time, otherwise the browser will show an error page saying that the connection timed out.  The server cannot contact the client out of its own initiative.  That is why the `digitalRead` operations, both for `GET` and `POST` can only read one value.  You can't ask the server to keep an eye on a certain pin and notify the client when it changes, the client has to keep asking.  If the client asks too much, it hogs bandwidth, if it asks to little, it misses changes.

It is fair to say that the WWW wouldn't be what it is if the HTTP protocol wasn't limited in that way.  If the millions of servers in the WWW had to keep track of who is connected and what is each one doing, it would not be capable of processing so many requests.  The basis of the HTTP protocol is that after the server replies to each request, it immediately and totally forgets that the client ever existed.  Each client request has to be complete on its own, that is also why *server farms* are possible.  Since each HTTP request is complete, any server can handle a follow-up request, it does not need to go back to the same server that handled the first request, it is *context-free*.  It is the client that, via *cookies*, provides the server with the context needed, such as your login status.

Some applications can do with periodical requests for status.  If you are on a chat, the client might be *polling* at regular intervals and the users might *perceive* it as fast enough. Not so with a group video game were delays would be unacceptable.

That is why we have [*sockets*](https://en.wikipedia.org/wiki/Network_socket).  With sockets, both client and server can *listen* to each other.  Whenever either one has news, it can send a message to the other, without any need for either one to request anything. They just keep listening to each other.  

Sockets don't come for free.  As we said, the HTTP protocol was designed to be context-free so a minimal number of servers could handle very many requests.  Sockets require servers to keep the connection to the client alive and retain some information from each and every client.  Server farms handling multi-user games need far more servers per number of users than regular server farms handling only HTTP pages.

#### Socket.io
We are using the very popular and solid [socket.io](https://www.npmjs.com/package/socket.io) library which has both libraries suitable to run on a node.js server and in a web browser.  The protocol is the same, but the environment is different in each.

We won't go deep into how Socket.io is setup, it is just a recipe that can be read from their [documentation](https://socket.io/).  We will just highlight an important concept.  Socket.io relies on *events*, not hardware events like mouse clicks or keystrokes but software events, which are triggered not by physical events but by programs.

When either side wants to send something to the other side, the emitter calls the `emit` method of the socket both in the [client :octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/public/sockets.html#L174-L177) or in the [server :octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/sockets/index.ts#L69-L77).  The first argument to the `emit` method is the *event-type*.  In hardware events, that would me `mouseclick` or `keypress`, but in software events, it is whatever the developer wants.  In this case, the messages going from client to server are `'command'` and the ones from the server to the client `'reply'` mostly as a throwback to the POST commands since in this case, the server can emit events to the client at any time, not only as a reply to some request.

On the receiving side, be it the [client :octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/public/sockets.html#L180) or the [server :octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/sockets/index.ts#L56) you subscribe to those events by calling the `on` method and giving the *event-type* you mean to listen to.  Just like in hardware events, where you set listeners for `onClick` or `onKeyPress`, here you set listeners for software events defined by the developer.

The second parameter in the `emit` call is the message being sent, which is a stringified JSON representation of the FSAs which is received at the other end at the `on` listener function as its single parameter.

This change is somewhat reflected in the [test page](http://localhost:8000/sockets.html). While in the previous test page for [post](http://localhost:8000/post.html) you have a section of the page devoted to each command, with the request FSA and reply FSA shown side by side, in the sockets version, the replies might come at any time and not associated with the requests.  Thus, they are both logged in a table at the bottom of the page and, as a matter of fact, on initialization, a few messages will be logged in the table without the user doing anything at all.

So now that we have the ability to send messages from the server to the client at will, just as the client can subscribe to events emitted by the server, the server can subscribe to *read* events emitted by the Firmata software.

Thus, we have added two FSAs actions.

#### digitalReadSubscribe

The [digitalReadSubscribe :octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/pinCommands.ts#L165-L187) FSA tells the server that we want to listen to value changes on the given pin.

```json
{
  "type":"digitalReadSubscribe",
  "payload": {
    "pin": 2
  } 
}
```

Which will be replied to with:

```json
{
  "type":"digitalReadSubscribe_reply",
  "payload": {
    "pin": 2
  },
  "meta": {
    "date":"2021-03-16T17:08:01.041Z"
  }
}
```

On an error reply if the pin does not exist.  Either way, the value of the pin will not be sent yet.

#### digitalRead_reply

Once subscribed, the server will emit message with the value of the pin whenever it changes.  This is done by the [callback function :octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/sockets/index.ts#L68-L79) and has the same format as the FSA for the single `digitalRead` as used in the [POST `digitalRead`](#post-digitalread):

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

Those replies will keep coming any time there is a change in the state of the pin.

#### digitalReadUnsubscribe

The [digitalReadUnsubscribe :octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/pinCommands.ts#L199-L216) command tells the server that we don't want pay any further attention to the given pin.

```json
{
  "type":"digitalReadUnsubscribe",
  "payload": {
    "pin": 2
  } 
}
```
No further [`digitalRead_reply`](#digitalread_reply) messages will be received at the client unless a `digitalRead` command is sent (which is still available) or a new read subscription is made.

## Tests

There is a good set of test files, identified by their double extension `.test.ts`.  Thus. for `server.ts` we have `server.test.ts`.  They all use [Jest](https://jestjs.io/) and are launched by both the `npm t` command and the `npm run coverage` which runs the tests but monitoring which parts of the code are being executed and thus produce a coverage report, as indicated [above](#npm-commands).

There are meant to try out all aspects of your code, both the good and the bad.  You test both for the good responses and also for the bad outcomes so that you are sure the app is capable of detecting an error and reporting it properly.

Tests also allow you to test things that would be hard to try out manually.  It is easy to test the [GET commands](#http-gets), because you can write the URL for the *get* right in the browser navigation bar, but it is not so easy to tests POSTs or Sockets, since they require some code to be run.

A test is also a sort of specification.  Your test estates what your app should do, and makes sure it does it consistently. Over time, the application might change significantly.  Files moved around, optimized, bugs fixed, and you want to make sure that all along the process, nothing breaks.

They are also great when responding to bug reports filed by users.  If a report says that an error happens when you do such and such sequence, you can write a brief test with that specific sequence and verify that the error is indeed there, as reported.  That gives you a sort of benchmark to work with and dig deep into the code and see what went wrong.  Once the fault is found, it can be fixed and then the tests run again to check not only that the reported bug is gone but that, by adding a fix, nothing else got broken.

Tests are so important that developers put badges in the library catalogs like npm, for example, the  [axios](https://www.npmjs.com/package/axios) package shows, right after the title a set of gray and green, or gray and orange badges for various tests that it has passed.  For example, there is a gray and green badge for *coverage* which, as of this writing, shows a 94%.  This, of course, also means that it passes all the tests, as the coverage reporter would only produce a report on a complete test.  You can actually click on many of those badges and see a more detailed view of what was covered in those tests.

Where do those badges come from?  There are CI/CD servers, *Continuous Integration/Continuous Delivery* services, many of them public and free just as GitHub or npm (and in case you are wondering, npm is a brand and is written all lowercase). You can configure your GitHub repository to link to one of these sites and it will trigger a re-run of the tests for you automatically in their servers.  The result will be a badge you can link to. The badge is not static, it is generated on the fly by the service based on the result of the latest tests.  And they are often a factor in deciding whether to use a particular package or not.

The best part about those services is that none of the developers can get away with bad code.  As a team leader you might ask your team to always run tests on the code before uploading it to GitHub.  Some might fail to do so for all sorts of reasons.  But with the CI/CD service configured, no matter whether the individual developer does run a test or not, the server itself will do it.  There is no way to avoid it.

Firmata has some badges in its [`readme.md`](https://github.com/firmata/firmata.js#firmatajs) which show some issues with some bug fixes that have not succeeded but it has 100% coverage, which is good.

### Types of tests

Tests can be *Unit Tests* or *Integration Tests* (besides various other categories).  In a Unit Test, you try out each and every module, every function within each module, instantiate every class and test every method within it.  You bombard every function with all combinations of parameters and even absurd values and check that their response is as expected.

However, some functions might need to reach other resources beyond the function itself.  For example, this app itself is meant to control an actual microcontroller board.  In Unit Tests you want to avoid this kind of dependency, after all, your CI/CD service will not have an Arduino connected to their servers to run your tests.  That is why you can use *mocks*, pieces of code that mimic the behavior of whatever it is that you are testing.

To do unit testing on this app, we cannot mock the microcontroller board because it is a piece of hardware outside of our computer so we cannot run a software-only emulator.  We could emulate the Firmata library itself, since it runs within the computer and it is just a piece of software.

The problem is that I don't fully understand and trust the Firmata library.  The documentation is a bit scarce so I wasn't sure what its behavior might be.  So, I opted for an Integration Test.

An Integration Test goes all the way from end to end.  It tests the app as a whole, trying out its public interfaces and checking its responses with everything connected.  In this case, I tested it on an Arduino Uno board.

Thus, for example, there is no `actionBuilders.test.ts` file, however, by doing integration tests, the code in `actionBuilders.ts` has been almost fully tested, just because they were called by other tests.

### Structure of a test.

We will use the [`pinCommands.test.ts` :octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/pinCommands.test.ts) as a sample.  This is called a *test suite*, that is, a collection of related individual tests.  So, there is not just a big tests, there can be dozens or hundreds of individual tests, grouped into *suites*.

After importing the various pieces we need to perform the tests, we do some [basic setup :octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/pinCommands.test.ts#L19-L35).  Jest makes available automatically some functions that register some code to run at specific times:

* `beforeAll`  runs once before any test,
* `afterAll` runs once after all tests have been run and
* `afterEach` runs multiple times, once after each individual test.
  
There is obviously a `beforeEach` as well, but we didn't have a need for that one.

Then, you start grouping your tests with `describe` calls in any way you want.  `describe` is not required and only serves to get your individual tests organized and to provide a descriptive message if anyone fails.  

For example, for the [`digitalWrite` :octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/pinCommands.test.ts#L69-L109) function, we have tests to check when it is set high, when it is set low, when we give an incorrect pin number and when we try to set the output to an invalid value (not 0 nor 1).

Tests are actually performed by the functions registered via the `test` function.  It takes a descriptive text, to help the developer locate a failed test, and a function that runs the test.

For [`pin High` :octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/pinCommands.test.ts#L70-L78) we set the pin to output mode, using the `pinMode` function we tested in the previous lines.  We then use `digitalWriteActionBuilder` to build the FSA for the `digitalWrite` action. We then call [`digitalWrite` :octocat:](digitalWriteActionBuilder) with the `writeHigh` FSA we have just built.  This line is particularly important so we'll analyze it in detail:

```js
expect(digitalWrite(writeHigh)).toBeFSAReply(writeHigh);
```

We call the `expect` function, which is a Jest global function just as `describe` or the `beforeXxxx` and `afterXxx` functions. This function allows us to tell the test what is it that we expect.  Then we call `digitalWrite(writeHigh)` with the FSA we built a couple of lines before.  That function will return with an FSA and it is that returned FSA which we *expect* it *to be and FSA reply* based on the original FSA.  

This whole line can be read

> expect the return value of calling `digitalWrite` with the `writeHigh` FSA to be an FSA derived from that same FSA.

The reply FSA to a `digitalWrite` is the same `type` with the text `_reply` appended, and a `meta.date` property set to a valid date.

So, if this expectation is fulfilled, the test passes.

Does Jest have checks specific for FSAs?  Not really, but you can extend the testing library with your own tests and once a group of tests is repeated over and over, you are likely to extend it on your own to make your life easier.  Both `toBeFSAReply` and `toHaveErrorCode` are extensions created for this set of tests.

Jest provides a whole set of various [expectations](https://jestjs.io/docs/expect), such as those used on the lines before and after the line we analyzed. 

```js
expect(board.pins[LED_BUILTIN].value).toEqual(board.LOW);
expect(digitalWrite(writeHigh)).toBeFSAReply(writeHigh);
expect(board.pins[LED_BUILTIN].value).toEqual(board.HIGH);
```
In the top and bottom lines above, we tell Jest to check on the board status for the pin we are testing, first expecting it to be equal to `board.LOW` and, once we set it high, to `board.HIGH`.

In another test we check for an error reply to a [bad pin :octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/pinCommands.test.ts#L90-L98).  In this case, we build an FSA with an outrageous pin number and expect the reply to be a proper FSA and to have an error code of `ErrorCodes.BAD_PIN`.

In tests such as [`server.test.ts` :octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/server.test.ts) or [`simple.test.ts` :octocat:](https://github.com/Satyam/firmata-http-bridge/blob/main/src/simple/simple.test.ts) we actually start the server and use a slightly modified version of `postCommand` to send actual HTTP request to that server, thus fully testing the app from end to end.

Not everything has tests, though it can and should.  I meant to do all the tests but then, it is interesting to show how the coverage report show the code that has no tests.  Thus, I left it for homework. It is also interesting to make a test fail, by messing up with an expectation and see how a bad test is reported.
