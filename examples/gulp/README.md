# Gulp example

This is an example of usage of `connect-sourcemaps` together with `gulp-connect`
and simple build pipe line.

## Installation

```
npm install -g gulp-cli@1.2.2
npm install
```

## Usage

Run the `gulp serve` command to start a web server. A sample web site is written
a SCSS stylesheet and ES6 JS script. It is builded to the `public/` folder
using node sass and babel compillers.

```sh
gulp serve
```

Open [http://localhost:8080/](http://localhost:8080/) in you browser and check
the usage of source maps.

Then look into the gulpfile.js and try to tweak `options.sourcemaps` settings to
check a different methods of the linking source maps to the code.
