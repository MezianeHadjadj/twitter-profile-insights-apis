var express = require('express');
var elasticsearch = require('elasticsearch');
var elasticSearchClient = new elasticsearch.Client({
	host: '104.154.66.240:9200',
	log: 'trace'
});
var router = express.Router();
var ParserEngine = {};
var Twitter = require('node-twitter');




router.get('/list', function(req, res) {
		keyword=req.query.keywords
		console.log(keyword);
		var list_influencers=[];
		var indice=0;
		for ( var k=0, lengthk=keyword.length;k <lengthk; k++){
		var more=true;
		elasticSearchClient.search({
		  index: 'twitter',
		  size:20,
		  sort : 'user.followers_count:desc',
		  type: 'posts',
		  from: (req.query.page-1)*20,

		  q: 'text:'+keyword[k],		 
		}).then(function (resp) {
			indice=indice+1;
			if (JSON.stringify(resp.hits.total)==0){
				more=false;

			}
		
			if(indice==keyword.length){

				res.json({ "results" :resp.hits.hits,"more":more});
			}
			
		}, function (err) {
		     console.trace(err.message);
		});
}

			
});









module.exports = router;
