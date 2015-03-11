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
	var q2=""
	for( var i = 0,length = keywords.length; i < length; i++ ) {

		//console.log(crawlerr.CrawlerEngine.testt()+"cra");
		console.log("require:"+require('./crawlers'));

		 q2=q2+ '(text: '+keywords[i].split(" ")[0]
		words=keywords[i].split(" ")
		for (var j = 1,lengthj = words.length; j < lengthj; j++ ){
			
			q2=q2+' AND text: '+words[j]
		}
		if (i+1!=length){
			q2=q2+") OR " ;
		}else{
			q2=q2+')'
		}

		
	}
	
	
	//q2=q2+')'+'OR ( text :'+[keywords[keywords.length-1].split(" ")][0]
	// console.log("qqqqqqqqqqqqqqq"+q2+"qqqqqqqq");
	// console.log("text: قطر AND text: أودي");

	if(req.query.language){
		q2='(language: '+req.query.language+') AND ' +'('+q2+')';
	}
	console.log("q2 tweets"+q2+"");
	var more=true;
	elasticSearchClient.search({
		  index: 'twitter',
		  size: req.query.limit,
		  //size: 5,
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

router.get('/delete_duplicate_tweets', function(req, res) {





		elasticSearchClient.search({
					  index: 'twitter',
					  
					  type: 'posts',
					  body: {

					aggs: {
			                touchdowns: {
			                    terms: {
			                    	size:400,
			                        field: "id",
			                        // order by quarter, ascending
			                        order: { "_term" : "desc" }
			                    }
			                }
			            }
			           }
					}).then(function (resp) {
						results=resp.aggregations.touchdowns.buckets
						//console.log(results[0]["doc_count"]+"ddddddddddd");
						 for( var i = 0,length = results.length; i < length; i++ ) {
						 	console.log(results[i]["doc_count"]);
						 	if(results[i]["doc_count"]>1){

						 		res.json({ "results" :results[i]});
						 		break
						 	}
						 }
						 
							
					}, function (err) {
					     console.trace(err.message);
					});








		// elasticSearchClient.search({
		//   index: 'twitter',

		//   type: 'posts',

		//   q: "id: "+req.query.id
		//  //q: "(text: للمجوهرات AND text: قطر AND text: معرض) OR (text: قطر AND text: أودي)  "
		//  // q: "text: قطر AND text: أودي"
		// }).then(function (resp) {
			


		// 	}

		// 	 res.json({ "results" :resp.hits.hits,"more":more});
		// }, function (err) {
		//      console.trace(err.message);
		// });




});


module.exports = router;
	