# Source maps to a code linking middleware

Tells to a browser where Source Maps for CSS and JavaScript code are located using `SourceMap` HTTP header or using an injection of annotations into a web servers response on the fly. This could be usefull when an injection of a source map annotations into a compiled code is not applicable or it is needed to use a source maps which are located in other place.

## Installation

```
npm install connect-sourcemaps
```

## Usage

This middleware should be used before any CSS and JavaScript serving middlewares to be able to post-process thiers response.

```javascript
var connect = require('connect');
var connectSourceMaps = require('connect-sourcemaps');
var http = require('http');

var app = connect();

app.use(connectSourceMaps());
app.use(connect.static('public'));

http.createServer(app).listen(3000);
```

This assumes that compiled files and source map files with the same name (plus .map) in the same directory.

### Respond with a `SourceMap` header

`SourceMap` header is used to tell a browser about a source maps location without any changes in a compiled files.

```javascript
var connectSourceMaps = require('connect-sourcemaps');

app.use(connectSourceMaps({
  sourceMapHeader: true
}));
```

### Respond with a deprecated `X-SourceMap` header

`X-SourceMap` header is used to tell a browser about a source maps location without any changes in a compiled files. Although this header had [deprecated][2] a few years ago.

```javascript
var connectSourceMaps = require('connect-sourcemaps');

app.use(connectSourceMaps({
  xSourceMapHeader: true
}));
```

### Respond with an annotation injected into a content on the fly

A [sourceMappingURL][3] comment will be appended to CSS and JavaScript files. Any existing annotations will be overrided.

```javascript
var connectSourceMaps = require('connect-sourcemaps');

app.use(connectSourcemaps({
  annotate: true
}));
```

## API

```javascript
var connectSourceMaps = require('connect-sourcemaps');

connectSourceMaps(options)
```

### options

- `sourceMapHeader`

  Set this to `true` to respond source maps location using the `SourceMap` header. Default `true`.

- `xSourceMapHeader`

  Set this to `true` to respond source maps location using the deprecated `X-SourceMap` header. Default `false`.

- `annotate`

  Set this to `true` to inject an comment to the response. Default `false`.

- `suffix`

  String to append to the requested URL to resolve a URL of source map file. Default `.map`. This assumes that source map files with the same name (plus .map) in the same directory.

- `sourceMapUrl`

  This option gives full control over the source map URLs resolving. It takes a function that receives the object with a requested url as a parameter and returns URL of Source Map.

```javascript
var connectSourceMaps = require('connect-sourcemaps');
var urlParse = require('url').parse;

app.use(connectSourceMaps({
  sourceMapUrl: function(file) {
    return 'http://hostname' + urlParse(file.url).pathname + this.suffix;
  }
}));
```

## License

MIT

[1]: https://github.com/mozilla/gecko/search?utf8=%E2%9C%93&q=x-sourcemap
[2]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.lmz475t4mvbx
[3]: https://github.com/generalov/connect-sourcemaps/wiki/Linking-generated-code-to-source-maps#annotation
