var express = require('express'),
	http = require('http'),
	path = require('path'),
	DynamicRoutes = require('../'),
	app = express(),
	bodyParser = require('body-parser');

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
