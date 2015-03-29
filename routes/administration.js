var express = require('express');
var elasticsearch = require('elasticsearch');
var elasticSearchClient = new elasticsearch.Client({
	host: '104.197.12.112:9200',
	log: 'trace'
});
var router = express.Router();
var ParserEngine = {};
var Twitter = require('node-twitter');

var Administration = {};

router.get('/home', function (req, res) {
res.render('home', { title: 'ejs' });
});

router.get('/list_keywords', function (req, res) {

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

			Administration.count_tweets(crawlers,results[i]["_source"]["keyword"],res,finish);	
			
			


		}
			//res.render('index', { crawlers: crawlers});
			//res.send('update', JSON.stringify(crawlers));
			
		}, function (err) {
		    // console.trace(err.message);
		});


//res.render('list_keywords', { title: 'ejs',  });
});



Administration.count_tweets=function(crawlers,keyword,res,finish){
	
	res.render('list_keywords', { title: 'ejs' });
		elasticSearchClient.count({
			  index: 'twitter',
			  type:'posts',
			  q: 'keywords: '+keyword
			}, function (error, response) {
			  
			  crawlers.push({"keyword":keyword,"number_of_posts":response["count"]});
				if (finish){
					//res.render('crawlers', { crawlers: crawlers});
					console.log("crwlets:"+crawlers+"crawlerss");
					Administration.show(res);
					//res.render('list_keywords', { title: 'ejs', crawlers: crawlers });
				}	
			
			});
}

Administration.show=function(res){
res.render('list_keywords', { title: 'ejs',  });
}




module.exports = router;