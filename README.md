# dynamic-routes

> A dynamic router / loader for http://expressjs.com/

## Install

``` bash
npm install dynamic-routes --save
```


## Usage

> **DynamicRoutes(app, path_to_routes, [options])**


## Examples :

#### Express.JS Server :

```js
var express = require('express'),
	http = require('http'),
	path = require('path'),
	DynamicRoutes = require('dynamic-routes'),
	app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.use(express.logger('dev'));
app.use(bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('secrets secrets, we got extra'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

DynamicRoutes(app, __dirname + '/routes/');
// or

/*
DynamicRoutes(app, {
	src: __dirname + '/routes/',
	ignore: [],
	pattern: /\.js$/
});
*/

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

```
#### Creating compatible routes :

##### Using an object :

```js
//routes/index.js
module.exports = {
	priority: 1000, //this is the `/` handler, should it should be the last route.
	path: '/',

	//this function gets passed the express object one time for any extra setup
	init: function(app) {
		//app.head doesn't work with newer express.js 
	},

	GET: function(req, res) {
		res.end('GET ');
	},
	
	POST: function(req, res) {
		res.json(req.body);
	}
};
```

##### Using a function :

```js
var user = module.exports = function(app) {
	"use strict";
	//other setup
	app.get(function(req, res) {
		res.json({'user': [req.params.id, req.params, req.query, req.body]});
	});
};

user.priority = 1;
user.path = '/user/:id?';

```

##### This is equivalent to :


```js
module.exports = {
	path: '/user/:id?',
	priority: 1,
	init: function (app) {
		//setup db
	},
	
	GET: function(req, res) {
		res.json({'user': [req.params.id, req.params, req.query, req.body]});
	}
}
```

## Notes
- As of Express 4.x, it's recommended to use `require('body-parser')()` instead of `express.bodyParser()`, check [`this`](http://stackoverflow.com/questions/5710358/how-to-get-post-query-in-express-node-js/20132867#20132867).