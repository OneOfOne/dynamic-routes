//routes/index.js
module.exports = {
	priority: 1000, //this is the `/` handler, should it should be the last route.
	path: '/',

	//this function gets passed the express object one time for any extra setup
	init: function(app) { 
		//app.head(function(req, res) {});
	},

	GET: function(req, res) {
		res.end('GET ');
	},
	
	POST: function(req, res) {
		res.json(req.body);
	}
};
