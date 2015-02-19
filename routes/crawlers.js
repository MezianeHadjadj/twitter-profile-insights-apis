var express = require('express');
var TwitterStreamChannels = require('twitter-stream-channels');
var twitterCrawler = new TwitterStreamChannels({
  consumer_key: 'n4h3onsHHB6B9MdiPTbuU3zvf',
  consumer_secret: 'Hugy2DD3kZXvAVg2MFXIL2506Rzk1qiRIPvGbuvnZVWkywxC2N',
  access_token: '1157418127-VdrrfNdZi3hXs7GqSrRRHbplY2bZUqe388gFBQ2',
  access_token_secret: 'LCmHESrWFKvhAmLM9FhO5CaN3V90n8O6W9EjAJT2va9B0'
});
var elasticsearch = require('elasticsearch');
var Twitter = require('node-twitter');
var elasticSearchClient = new elasticsearch.Client({
	host: '104.154.66.240:9200',
	log: 'trace'
});
var router = express.Router();
var CrawlerEngine = {};
CrawlerEngine.indexTweet = function(tweet){
	
	var tweetDocument = {
		from: "Stream",
    	id:tweet.id_str,
    	date_of_storage :new Date(),
    	text:tweet.text,
    	created_at:tweet.created_at,
    	retweet_count:tweet.retweet_count,
    	favorite_count:tweet.favorite_count,
    	language: tweet.lang,
    	user:{
    		id:tweet.user.id,
    		name:tweet.user.name,
    		screen_name:tweet.user.screen_name,
    		location:tweet.user.location,
    		description:tweet.user.description,
    		followers_count:tweet.user.followers_count,
    		favourites_count:tweet.user.favourites_count,
    		statuses_count:tweet.user.statuses_count,
    		profile_image_url:tweet.user.profile_image_url
    	},
    	keywords:tweet.$keywords
    }
    try{
		elasticSearchClient.create({
			index: 'twitter',
			type: 'posts',
			body: tweetDocument
		}, function (error, response) {
			  	
		});
	} catch(ex){
		console.log(ex);
	}
}
CrawlerEngine.listenToTwitter= function(){
	try {
		var stream = twitterCrawler.streamChannels({track:twitterCrawler.keywords});
		console.log('stream invoked');
		twitterCrawler.currentStream = stream;
		stream.on('channels', function(tweet) {
			
			CrawlerEngine.indexTweet(tweet);
		});
		stream.on('error', function(error) {
		    console.log(error);
		});
	} catch(ex){
		console.log(ex);
	}
}
CrawlerEngine.searchOnTwitter=function(keyword){
	

	var twitterSearchClient = new Twitter.SearchClient(
    'n4h3onsHHB6B9MdiPTbuU3zvf',
    'Hugy2DD3kZXvAVg2MFXIL2506Rzk1qiRIPvGbuvnZVWkywxC2N',
    '1157418127-VdrrfNdZi3hXs7GqSrRRHbplY2bZUqe388gFBQ2',
    'LCmHESrWFKvhAmLM9FhO5CaN3V90n8O6W9EjAJT2va9B0'
);
twitterSearchClient.search({'q': keyword,'count':100}, function(error, result) {
    if (error)
    {
        console.log('Error: ' + (error.code ? error.code + ' ' + error.message : error.message));
    }
 
    if (result)
    {
    	//result=JSON.stringify(result)

		      for(var i=0, length=result["statuses"].length;i<length;i++){
		      			tweet=result["statuses"][i];
		      			console.log("################"+JSON.stringify(tweet));
		      			
    	      					CrawlerEngine.insertTweet(tweet,keyword);


		      }

    }
});

}
CrawlerEngine.insertTweet =function(tweet,keyword){
	elasticSearchClient.search({
								  index: 'twitter',
								  size: 1,
								  type: 'posts',
								  q: 'id: '+tweet.id_str
									}).then(function (resp) {
										if( (resp.hits.hits).length==0) {
											var tweetDocument = {
					      				from:"Search",
								    	id:tweet.id_str,
								    	date_of_storage : new Date(),
								    	text:tweet.text,
								    	retweet_count:tweet.retweet_count,
								    	favorite_count:tweet.favorite_count,
								    	created_at:tweet.created_at,
								    	language: tweet.metadata["iso_language_code"],
								    	user:{
								    		id:tweet.user.id,
								    		name:tweet.user.name,
								    		screen_name:tweet.user.screen_name,
								    		location:tweet.user.location,
								    		description:tweet.user.description,
								    		followers_count:tweet.user.followers_count,
								    		friends_count:tweet.user.friends_count,
								    		favourites_count:tweet.user.favourites_count,
								    		time_zone:tweet.user.time_zone,
								    		language:tweet.user.lang,
								    		statuses_count:tweet.user.statuses_count,
								    		profile_image_url:tweet.user.profile_image_url
								    	},
								    	keywords:[keyword]
								    }
								    try{
										elasticSearchClient.create({
											index: 'twitter',
											type: 'posts',
											body: tweetDocument
										}, function (error, response) {
											  	
										});
									} catch(ex){
										
									}

		      							}else{
											console.log("exist");
										}
										 
									}, function (err) {
									     console.trace(err.message);
									});

}

CrawlerEngine.insertCrawler =function(crawler){
	try{
		elasticSearchClient.create({
			index: 'twitter',
			type: 'crawlers',
			body: {
			    keyword: crawler.keyword,
			    machine: '127.0.0.1',
			    organization:crawler.organization
			}
		}, function (error, response) {
		  	
		});
	} catch(ex){
		console.log(ex);
	}
}
CrawlerEngine.extractExistingKeywords = function(hits){
	var keywords = [];
	var keys = Object.keys( hits );
	for( var i = 0,length = keys.length; i < length; i++ ) {
		keywords.push(hits[keys[i]]._source['keyword']);
	}
	return keywords;
}
CrawlerEngine.launchCrawlers = function(){
	elasticSearchClient.search({
		  index: 'twitter',
		  size: 400,
		  type: 'crawlers'
		}).then(function (resp) {
		    var currentKeywords = CrawlerEngine.extractExistingKeywords(resp.hits.hits);
		    twitterCrawler.keywords = {"keywords":currentKeywords};
		    CrawlerEngine.listenToTwitter();
		   
		}, function (err) {
		     console.trace(err.message);
	});
}

CrawlerEngine.launchCrawlers();


/* insert a new crawler */
router.get('/insert', function(req, res) {
	// list all existing crawlers
	elasticSearchClient.search({
		  index: 'twitter',
		  type: 'crawlers'
		}).then(function (resp) {
		    var currentKeywords = CrawlerEngine.extractExistingKeywords(resp.hits.hits);
		    twitterCrawler.keywords = {"keywords":currentKeywords};
		    if (twitterCrawler.keywords['keywords'].indexOf(req.query.keyword) == -1){
		    	twitterCrawler.keywords['keywords'].push(req.query.keyword);
		    	// index the crawler for the requested keyword
		    	CrawlerEngine.insertCrawler({keyword:req.query.keyword,organization:req.query.organization});
		    	if(twitterCrawler.currentStream){
					twitterCrawler.currentStream.stop();
				}
				// Start the crawling job
				CrawlerEngine.listenToTwitter();
				
				CrawlerEngine.searchOnTwitter(req.query.keyword);
		    }
		    else{
		    	console.log('this keyword exist');
		    }
		}, function (err) {
		    //console.trace(err.message);
		});
  	res.send('insert', { title: 'Express' });
});
/* update existing crawler */
router.put('/update', function(req, res) {
  res.send('update', { title: 'Express' });
});
/* delete existing crawler */
router.get('/delete', function(req, res) {

	keyword=req.query.keyword;
		//delete crawler
		
		elasticSearchClient.deleteByQuery({
		  index: 'twitter',
		  type: 'crawlers',
		  q: 'keyword: '+keyword
		 // body: {
	  //   query: {
	  //     term: { keyword: keyword }
	  //   }
	  // }
		}) .then(function (resp) {
			twitterCrawler.currentStream.stop();
			setTimeout(function(){ CrawlerEngine.launchCrawlers(); }, 3000);
			
				console.log("yesss");
	},function (error, response) {
		  console.log("erorr:"+error+JSON.stringify(response));
		});
		var siz=1;
		elasticSearchClient.count({
			  index: 'twitter',
			  type:'posts',
			  q: 'keywords: '+keyword
			}, function (error, response) {
			  siz=siz+response["count"]/50;

			  elasticSearchClient.deleteByQuery({
					  index: 'twitter',
					  type:'posts',
			 		 q: 'keywords: '+keyword
					}, function (error, response) {
					  console.log("###########"+error);
					});
			  

				res.send('update', { title: 'Deleted' });



			});
		

		
		
	// elasticSearchClient.search({
	// 	  index: 'twitter',
	// 	  type: 'crawlers'
	// 	}).then(function (resp) {
	// 	    var currentKeywords = CrawlerEngine.extractExistingKeywords(resp.hits.hits);
	// 	    console.log(currentKeywords);
	// 	}, function (err) {
	// 	    //console.trace(err.message);
	// 	});

});
router.get('/crawlers', function(req, res) {

elasticSearchClient.search({
		  index: 'twitter',
		  type: 'crawlers',
		  size: 100
		}).then(function (resp) {
			results=resp.hits.hits;
		var crawlers=[];
		var finish=false;
		for(var i=0, length=results.length;i<length;i++){
			if (i+1==length){
				finish=true;
			}
			CrawlerEngine.count_tweets(crawlers,results[i]["_source"]["keyword"],res,finish);	
			
		}
			//res.render('index', { crawlers: crawlers});
			//res.send('update', JSON.stringify(crawlers));
			
		}, function (err) {
		    // console.trace(err.message);
		});

		});


router.get('/deleteelement', function(req, res) {
	elasticSearchClient.deleteByQuery({
		  index: '',
		  //type: 'posts',
		  q: 'id: 5716616385921024'
		 // body: {
	  //   query: {
	  //     term: { keyword: keyword }
	  //   }
	  // }
		}) .then(function (resp) {
			console.log(resp);
			
				console.log("yesss");
	},function (error, response) {
		  console.log("erorr:"+error+JSON.stringify(response));
		});


});
CrawlerEngine.count_tweets=function(crawlers,keyword,res,finish){
		elasticSearchClient.count({
			  index: 'twitter',
			  type:'posts',
			  q: 'keywords: '+keyword
			}, function (error, response) {
			  
			  crawlers.push({"keyword":keyword,"number_of_posts":response["count"]});
				if (finish){
					res.render('crawlers', { crawlers: crawlers});
				}	
			
			});
}

/* list existing crawlers */
router.get('/list', function(req, res) {
	

		elasticSearchClient.search({
					  index: 'twitter',
					  
					  type: 'posts',
					  body: {

					aggs: {
			                touchdowns: {
			                    terms: {
			                    	size:400,
			                        field: "keywords",
			                        // order by quarter, ascending
			                        order: { "_term" : "asc" }
			                    }
			                }
			            }
			           }
					}).then(function (resp) {
						console.log("rsppppppppppppp"+JSON.stringify(resp.aggregations.touchdowns.buckets[0]["key"]))
						var crawlers=resp.aggregations.touchdowns.buckets;
						res.render('index', { crawlers: crawlers});
					}, function (err) {
					     console.trace(err.message);
					});



		
	//res.send('list', { title: 'Express' });
});


module.exports = router;
	