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
    	id:tweet.id,
    	text:tweet.text,
    	created_at:tweet.created_at,
    	retweet_count:tweet.retweet_count,
    	favorite_count:tweet.favorite_count,
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
					      	var tweetDocument = {
					      	
					    	id:tweet.id,
					    	text:tweet.text,
					    	retweet_count:tweet.retweet_count,
					    	favorite_count:tweet.favorite_count,
					    	timestamp_ms:tweet.created_at,
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

		      }

    }
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
	elasticSearchClient.deleteByQuery({
	  index: 'twitter',
	 body: {
    query: {
      term: { keyword: keyword }
    }
  }
	}, function (error, response) {
	  console.log(error+response);
	});

		elasticSearchClient.search({
		  index: 'twitter',
		  type: 'posts',
		  
		  q: 'keywords: '+keyword
		}).then(function (resp) {
			
			
			//console.log("dersssssssssssssssss"+resp.hits.hits);
			results=resp.hits.hits;
				for(var i=0, length=results.length;i<length;i++){
					
					  elasticSearchClient.delete({
					  index: 'twitter',
					  type: 'posts',
					  id: results[i]._id
					}, function (error, response) {
					  // ...
					});
				}
			 res.send('update', { title: 'Deleted' });
		}, function (err) {
		     console.trace(err.message);
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

  res.send('delete_crawler', { title: 'Express' });
});
/* list existing crawlers */
router.get('/list', function(req, res) {
	res.send('list', { title: 'Express' });
});


module.exports = router;
	