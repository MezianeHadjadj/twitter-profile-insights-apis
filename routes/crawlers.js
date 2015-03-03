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
//M Hadjadj 15-02-2015
//insert tweet in elasticsearch 
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
//M Hadjadj 15-02-2015
// Stream api on twitter
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
			    organization:[crawler.organization]
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

//CrawlerEngine.launchCrawlers();


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
				//CrawlerEngine.listenToTwitter();
				
				//CrawlerEngine.searchOnTwitter(req.query.keyword);
		    }
		    else{
		    	console.log('this keyword exist');
		    	elasticSearchClient.search({
					  index: 'twitter',
					  type: 'crawlers',
					  q: 'keyword:'+ req.query.keyword
					}).then(function (resp) {
						console.log("ressss"+JSON.stringify(resp.hits.hits[0]._source.organization));
						var organizations=resp.hits.hits[0]._source.organization;
						if (organizations.indexOf(req.query.organization)==-1 ){
							
								elasticSearchClient.update({
							  index: 'twitter',
							  type: 'crawlers',
							  id:resp.hits.hits[0]._id,
							  body: {
							    // put the partial document under the `doc` key
							    doc: {
							      organization: organizations.concat([req.query.organization])
							    }
							  }
							}, function (error, response) {
							  console.log(error+"ddd");
							})

						}else{
							console.log("orga exist");
						}
						
					}, function (err) {
					    // console.trace(err.message);
					});


		    	

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
router.get('/check', function(req, res) {
	console.log("yes checked");
  res.send('check', { title: 'check' });
});
/* delete existing crawler */
router.get('/delete', function(req, res) {

	keyword=req.query.keyword;
		//delete crawler
		elasticSearchClient.search({
			  index: 'twitter',
			  type: 'crawlers',
			  q: 'keyword:'+ req.query.keyword
			}).then(function (resp) {
				console.log("ressss"+JSON.stringify(resp.hits.hits[0]._source.organization));
				var organizations=resp.hits.hits[0]._source.organization;

				if (organizations.length==1){
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
		
				}else{
					console.log("more"+organizations);
					var index = organizations.indexOf(req.query.organization);
					if (index > -1) {
					    organizations.splice(index, 1);
					}
					
					
						elasticSearchClient.update({
					  index: 'twitter',
					  type: 'crawlers',
					  id:resp.hits.hits[0]._id,
					  body: {
					    // put the partial document under the `doc` key
					    doc: {
					      organization: organizations
					    }
					  }
					}, function (error, response) {
					  console.log(error+"ddd");
					  res.send('update', { title: 'Deleted' });
					})

				}
				
				
			}, function (err) {
			    // console.trace(err.message);
			});



		

				


});
router.get('/crawlers', function(req, res) {

elasticSearchClient.search({
		  index: 'twitter',
		  type: 'crawlers',
		  size: 400
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
		  index: 'twitter',
		  type: 'posts',
		  q: 'id: '+req.query.id
		 // body: {
	  //   query: {
	  //     term: { keyword: keyword }
	  //   }
	  // }
		}) .then(function (resp) {
			console.log(resp);
			
				console.log("yesss");
				res.send('update', { title: 'Deleted' });
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

router.get('/stats', function(req, res) {
	
elasticSearchClient.count(function (error, response, status) {
  // check for and handle error
  var count = response.count;
  res.send('update', { title: count });
});
});


router.get('/list_to_train', function(req, res) {
keyword=req.query.keyword;
	page=req.query.page;
	//CrawlerEngine.train(tweet,kind,res);

		
	if (req.query.spam_name){
		//tweet=req.query.spam_text
		console.log( req.query.spam_name+"dddddelt"+req.query.spam_text);
		
	}
elasticSearchClient.search({
		  index: 'twitter',
		  size:20,
		  sort : 'id:desc',
		  type: 'posts',
		  from: (page-1)*20,

		  q: 'text:'+keyword,		 
		}).then(function (resp) {
			console.log("###"+resp.hits.hits[0]._source.text+"####")
			res.render('list_to_train', { tweets: resp.hits.hits,keyword:keyword,page:page});
			 //res.json({ "results" :resp.hits.hits});
		}, function (err) {
		     console.trace("dddd"+err.message);
		});
	


});

router.get('/spam', function(req, res) {
console.log("clicccccc");
var newWindow = window.open("http://www.google.com/", '_blank');
newWindow.focus();
//window.location = "http://www.google.com/"
//res.json({ "results" :resp.hits.hits});
});

router.get('/train', function(req, res) {
tweet=req.query.tweet;
	kind=req.query.kind;
	CrawlerEngine.train(tweet,kind,res);	

});

CrawlerEngine.train= function(tweet,kind,res){

	var PythonShell = require('python-shell');
		PythonShell.defaultOptions = {
	        scriptPath: './python'
	    };
	var pyshell = new PythonShell('python_shell_test.py');

	// i will give them a tweet
	tweet=tweet;
	kind=kind;
	console.log(tweet);
	
	pyshell.send(tweet);
	pyshell.send(kind);
	//in return probabilite to be spam
	var result=""
	pyshell.on('message', function (message) {
	  // received a message sent from the Python script (a simple "print" statement) 
	  console.log("#"+message+"#");
	  result=message;
	});
	//close the connection to python file
	pyshell.end(function (err) {
	  if (err) throw err;
	  console.log('finished');
res.send('training', { title: result });
	});

}

module.exports = router;
	