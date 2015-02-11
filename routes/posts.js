var express = require('express');
var elasticsearch = require('elasticsearch');
var elasticSearchClient = new elasticsearch.Client({
	host: '104.154.66.240:9200',
	log: 'trace'
});
var router = express.Router();
var ParserEngine = {};

ParserEngine.listTweets = function(params){
	
			var from=(params.page-1)*params.limit;
// list tweets from elasticsearch nodes


			elasticSearchClient.search({
				  index: 'twitter',
				  size: params.limit,
				  type: 'posts',
				  from: from,
				  q: 'keywords: '+params.keyword
				}).then(function (resp) {
					//var re=JSON.parse(resp.hits.hits);
					//console.log("jsonnnnnnnnnnnnnn"+JSON.stringify(resp));

					return JSON.stringify(resp);
					 
				}, function (err) {
				     console.trace(err.message);
				});

}

/* list existing crawlers */
router.get('/list', function(req, res) {
	
	//var result=ParserEngine.listTweets(params);
	
	var from=(req.query.page-1)*req.query.limit;
// list tweets from elasticsearch nodes
	

	elasticSearchClient.search({
		  index: 'twitter',
		  size: req.query.limit,
		  type: 'posts',
		  from: from,
		  q: 'keywords: '+req.query.keyword
		}).then(function (resp) {

			 res.json( resp);
		}, function (err) {
		     console.trace(err.message);
		});

});

module.exports = router;
	