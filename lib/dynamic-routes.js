/**
 * Copyright 2013 Ahmed (OneOfOne) W.
 * License : Apache License v2.0
**/
"use strict";
var fs = require('fs'),
	path = require('path');

var methods = [
    "ALL",
    "GET", "HEAD", "POST", "PUT", "DELETE", "TRACE", "OPTIONS", "PATCH"
];

var findFiles = function(dir, options) {
	var files = [];
	options = options || {};
	options.pattern = options.pattern || /./;
	options.ignore = options.ignore || [];

	return (function walk(parent) {
		fs.readdirSync(parent).forEach(function(fn){
			var fp = parent ? path.join(parent, fn) : fn;
			for(var i = 0; i < options.ignore.length; ++i) {
				if(fn.match(options.ignore[i])) return;
			}
			if(fs.statSync(fp).isDirectory()) {
				walk(fp);
				return null;
			}
			if(options.pattern.test(fp)) {
				if(typeof options.cb === 'function') {
					options.cb(fp);
				}
				files.push(fp);
			}
		});
		return files;
	})(dir);
};

var routePathFromFilename = function(base, fn) {
	var re = new RegExp('^' + base + '/?(.*?).js$'),
		route = re.exec(fn);

	return route ? '/' + route[1] : undefined;
};

module.exports = (function() {
	var DynamicRoutes = function(options) {
		options = options || {};
		if (typeof options === 'string') {
			options = { src: options };
		}
		options.ignore = [];

		this.options = options;
		this.routes = [];
	};

	DynamicRoutes.prototype = {
		load: function() {
			var self = this, src = self.options.src;
			findFiles(src, {
				pattern: /\.js$/,
				ignore: this.options.ignore,
				cb: function(fn) {
					console.warn('load', fn);
					var route = require(fn);

					if(typeof route === 'function') {
						route = {
							path: route.path,
							priority: route.priority,
							init: route
						};
					}

					route.path = route.path || routePathFromFilename(src, fn);
					route.priority = typeof route.priority === 'number' ? route.priority : 0;

					self.routes.push(route);
				}
			});
		},

		install: function(app) {
			this.load();
			var routes = this.routes;

			routes.sort(function(a,b) {
				return a.priority < b.priority ? -1 : 1;
			});

			for(var i = 0; i < routes.length; ++i) {
				var route = routes[i];
				if(typeof route.init === 'function') route.init(app);
                
                for(var j = 0; j < methods.length; ++j) {
                    var middleware = route[methods[j]];
                    switch(typeof middleware){
                    case 'function':
                        app[methods[j].toLowerCase()](route.path, middleware);
                        break;
                    case 'object':
                        for(var k in middleware){
                            if(typeof middleware[k] === 'function'){
                                app[methods[j].toLowerCase()](route.path, middleware[k]);
                            }
                        }
                        break;
                    }
                }
			}
		}
	};

	//return DynamicRoutes;
	return function(app, options) {
		var dr = new DynamicRoutes(options);
		dr.install(app);
		return dr;
	}
})();

var exportExample = {
	priority: 0, /* optional */
	before: '/users', /* optional */
	path: 'users/admin', /* optional, it will use the file path as the route */
	route: function(req, res, next) {

	}
};

