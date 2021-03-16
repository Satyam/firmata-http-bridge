# firmata-http-bridge
Makes Firmata commands available through HTTP requests

This is a work in progress, meant for didactical purposes.

Currently it just reads and writes digital ports.

## Description

This package installs a web server which accepts several commands and sends them through the Firmata protocol to a connected microcontroler, such as an Arduino board.

## Installation

The package is not published to **npm** since it is not meant for production but to teach programming.  Thus, it is provided only as source code.

If you have [`git`](https://git-scm.com/) client installed, you can do:

```sh
git clone https://github.com/Satyam/firmata-http-bridge.git
```

Otherwise you can download the ZIP file containing the code from: [https://github.com/Satyam/firmata-http-bridge/archive/main.zip](https://github.com/Satyam/firmata-http-bridge/archive/main.zip)


Once copied and/or expanded to a local drive, you must install dependencies and compile it before it is run, as described in the following section.

## Commands

This package expects [`NodeJS`](https://nodejs.org/) to be installed, which will also install [`npm`](https://www.npmjs.com/).

All commands can be run within the directory where the package was installed.

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

* `*.js`: Plain JavaScript executable files
* `*.js.map`: Map files used in debugging to associate each line in the `*.js` files to the original source code in `*.ts` files. Debuggers handle this automatically.  They are not required in a production environment.
* `*.d.ts`: type declaration files, they contain the type declarations extracted from the original `*.ts` without the actual code, which is now in the `*.js` files.  IDEs like VSCode use these files to provide code hints and type checking on the fly while using these files.

### Execute

Once installed and compiled, you may run the package in node with:

```
node .
```

### Compile and execute

Somewhat slower, though mostly favoured when in development, is to compile and run all at once.  This way, you don't need to compile it first, but when in production, it will always incur in the cost of compiling everything all the time.

```
npm start
```

#### Watch 

Also used in development, it automatically re-compiles and relaunches the app whenever any of the files in the `src` folder changes.  

```
npm run watch
```

#### Inspect

In development, it will compile and launch the application in debug mode.

```
npm run inspect
```

Then, if using Google Chrome you can debug the app by going to the following URL:

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

The tests current tests were written for an Arduino Uno board.  Many will fail if used with another board or if a board is not actually connected.  In this sense, they are *integration tests* rather than *unit tests* which would usually resort to *mocks* for Firmata instead of the real thing.

### Coverage

It measures how well the tests cover all the possibilities of the board.  100% coverage is the desired goal, though often unfeasible. At least all modules should reach a green level of coverage.  

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

The program accepts several configuration parameters from the environment. All the parameters have defaults as documented below.  If you want to change any of them, you could do:
In Linux:

```
HTTP_PORT=3000 npm start
```
In Windows:
```
set HTTP_PORT=3000 && npm start
```

However it is much easier to create a file `.env` with the new settings.

* `HTTP_PORT`: Defaults to 8000, sets the port to be used for the web server.
* `USB_PORT`: Defaults to `/dev/ttyACM0` which is the standard port used by Firmata for Linux.  The correct value can be found by letting the Arduino IDE find it for you.
  
