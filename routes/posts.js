var express = require('express');
var elasticsearch = require('elasticsearch');
var elasticSearchClient = new elasticsearch.Client({
	host: '104.154.66.240:9200',
	log: 'trace'
});
var router = express.Router();
var ParserEngine = {};

/* get details of tweets */
router.get('/tweet_details', function(req, res) {
		tweet_id=req.query.tweet_id;
		console.log(tweet_id);

		  elasticSearchClient.search({
		  index: 'twitter',
		  size: 1,
		  type: 'posts',		  
		  q:"id: "+tweet_id
		}).then(function (resp) {
			
			

			 res.json({ "results" :resp.hits.hits});
		}, function (err) {
		     console.trace(err.message);
		});

		
});

/* list existing crawlers */
router.get('/list', function(req, res) {
	
	//var result=ParserEngine.listTweets(params);
	console.log(req.query.keywords);
	console.log(typeof req.query.keywords);
	var from=(req.query.page-1)*req.query.limit;
// list tweets from elasticsearch nodes
	var keywords=req.query.keywords;
	var q=keywords[0];
			for( var i = 1,length = keywords.length; i < length; i++ ) {
				
				q=q+' OR '+keywords[i]
			}
			
	var more=true;


	elasticSearchClient.search({
		  index: 'twitter',
		  size: req.query.limit,
		  type: 'posts',
		  from: from,
		  q: 'keywords: '+q
		}).then(function (resp) {
			
			if (JSON.stringify(resp.hits.total)==0){
				more=false;

			}

			 res.json({ "results" :resp.hits.hits,"more":more});
		}, function (err) {
		     console.trace(err.message);
		});

});

module.exports = router;
	