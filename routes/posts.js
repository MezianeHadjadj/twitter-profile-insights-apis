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
	// var list=[];
	// 		for( var i = 0,length = keywords.length; i < length; i++ ) {
	// 			list =list.concat(keywords[i].split(" "));
	// 			//q=q+' OR '+keywords[i]
	// 		}
	// 		//'language:'+language+' AND keywords: '+q
	// var q=keywords[0];
	// 		for( var i = 1,length = keywords.length; i < length; i++ ) {
				
	// 			q=q+' OR text: '+keywords[i];
	// 		}


	var list2=[];
	console.log("MMMMMMMMMMMM"+req.query.keywords.length+"mmmmmmmmmm");
	var q2='text: '+keywords[0].split(" ")[0]
	//for( var i = 0,length = keywords.length; i < length; i++ ) {
		
		words=keywords[0].split(" ")
		for (var j = 1,lengthj = words.length; j < lengthj; j++ ){
			
			q2=q2+' AND text: '+words[j]
		}

		
	//}
	
	//q2=q2+')'+'OR ( text :'+[keywords[keywords.length-1].split(" ")][0]
	// console.log("qqqqqqqqqqqqqqq"+q2+"qqqqqqqq");
	// console.log("text: قطر AND text: أودي");

	if(req.query.language){
		query='language:'+req.query.language+' AND ' +q2;
	}else{
		query=q2;
	}
	var more=true;
	elasticSearchClient.search({
		  index: 'twitter',
		  //size: req.query.limit,
		  size: 3,
		  sort : 'id:desc',
		  type: 'posts',
		  from: from,

		  q: q2
		 //q: "(text: للمجوهرات AND text: قطر AND text: معرض) OR (text: قطر AND text: أودي)  "
		 // q: "text: قطر AND text: أودي"
		}).then(function (resp) {
			
			if (JSON.stringify(resp.hits.total)==0){
				more=false;

			}

			 res.json({ "results" :resp.hits.hits,"more":more});
		}, function (err) {
		     console.trace(err.message);
		});

});


router.get('/total_number_tweets', function(req, res) {
elasticSearchClient.count({
			  index: 'twitter',
			  type:'posts'
			 
			}, function (error, response) {
			  
			  
					res.render('crawlers', { crawlers: response});
				
			
			});
});



module.exports = router;
	