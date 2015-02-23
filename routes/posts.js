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
	console.log(typeof req.query.keywords);
	var from=(req.query.page-1)*req.query.limit;
// list tweets from elasticsearch nodes
	var language="";
	var keywords=req.query.keywords;
	var list=[];
			for( var i = 0,length = keywords.length; i < length; i++ ) {
				list =list.concat(keywords[i].split(" "));
				//q=q+' OR '+keywords[i]
			}
			//'language:'+language+' AND keywords: '+q
	var q=list[0];
			for( var i = 1,length = list.length; i < length; i++ ) {
				
				q=q+' OR text: '+list[i];
			}
	if(req.query.language){
		query='language:'+req.query.language+' AND text: ' +q;
	}else{
		query='text:'+q;
	}
	var more=true;

	elasticSearchClient.search({
		  index: 'twitter',
		  size: req.query.limit,
		  sort : 'id:desc',
		  type: 'posts',
		  from: from,

		  q: query,
		  //q: "keywords: happyfeet OR keywords: long"
		  //q: 'favorite_count: '+ 0,

		   // body: {
			  //   query: {
				 //      match: {
				 //        keywords: q 	  
				 //      }
			  //   }
			  // }


		   //'language: ar'
		  // query_string : {
    //     fields : ["keywords", "language"],
    //     query : q+ "AND "+language
    // 	}

		 
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
	