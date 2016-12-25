var urlParse = require('url').parse;

var detectNewline = require('detect-newline');
var interseptor = require('express-interceptor');
var urlRelative = require('url-relative');


/*
Return new RegExp instance

See http://stackoverflow.com/questions/10229144/bug-with-regexp-in-javascript-when-do-global-search
*/
var sourceMapAnnotationRegEx = function() {
    return /\/[/*][#@] sourceMappingURL=.*/g;
};


function hasSourceMapAnnotation(content) {
    return sourceMapAnnotationRegEx().test(content);
}


function getSourceMapAnnotation(content) {
    return content.match(sourceMapAnnotationRegEx())[0];
}


function CssFile(url) {
    this.url = url;
    this.getAnnotation = function getAnnotation(sourceMappingURL) {
        return "/*# sourceMappingURL=" + sourceMappingURL + " */";
    }
}


function JsFile(url) {
    this.url = url;
    this.getAnnotation = function getAnnotation(sourceMappingURL) {
        return "//# sourceMappingURL=" + sourceMappingURL;
    }
}


function SourceMapping(file, sourceMapUrl) {
    this.file = file;
    this.sourceMapUrl = sourceMapUrl;

    this.getSourceMappingUrl = function getSourceMappingUrl() {
        return sourceMapUrl;
    }

    this.annotate = function(content) {
        var newContent;
        var newline = detectNewline.graceful(content || '');
        var annotation = this.file.getAnnotation(this.getSourceMappingUrl());

        if (hasSourceMapAnnotation(content)) {
            newContent = content.replace(getSourceMapAnnotation(content), annotation);
        } else {
            newContent = content + newline + annotation + newline;
        }

        return newContent;
    }
}


function detectFile(reqUrl) {
    var reqPath = urlParse(reqUrl).pathname;

    if (reqPath.match(/\.css$/)) {
        return new CssFile(reqUrl);
    }
    if (reqPath.match(/\.js$/)) {
        return new JsFile(reqUrl);
    }

    return null;
}


function ConnectSourceMapsMiddleware(options) {
    options || (options = {});

    this.annotate = (options.annotate || false);
    this.sourceMapHeader = (options.sourceMapHeader || true);
    this.xSourceMapHeader = (options.xSourceMapHeader || false);
    this.suffix = (options.suffix || '.map');
    this.sourceMapUrl = (options.sourceMapUrl || function(file) {
        return urlRelative(file.url, urlParse(file.url).pathname + this.suffix);
    });

    this.handle = function hande(req, res, next) {
        var file = detectFile(req.url);

        if (file) {
            var sourceMapping = new SourceMapping(file, this.sourceMapUrl(file));
            this.link(sourceMapping, req, res, next);
        } else {
            next();
        }
    };

    this.link = function link(sourceMapping, req, res, next) {
        if (this.sourceMapHeader) {
            res.setHeader("SourceMap", sourceMapping.getSourceMappingUrl());
        }
        if (this.xSourceMapHeader) {
            res.setHeader("X-SourceMap", sourceMapping.getSourceMappingUrl());
        }
        if (this.annotate) {
            var handle = interseptor(function(req, res) {
                return {
                    isInterceptable: function() {
                        return true;
                    },
                    intercept: function(body, send) {
                        send(sourceMapping.annotate(body));
                    }
                }
            });
            handle(req, res, next);
            return;
        }
        next();
    }
}


function connectSourcemaps(options) {
    var middleware = new ConnectSourceMapsMiddleware(options);

    return function(req, res, next) {
        middleware.handle(req, res, next);
    }
}


module.exports = connectSourcemaps;
