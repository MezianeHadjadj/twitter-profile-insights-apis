var express = require('express');

var router = express.Router();
var ParserEngine = {};
var Twitter = require('node-twitter');
var config=require("konfu");

var raven = require('raven');
var client = new raven.Client('https://f7a9731801754c73ab93218e3415c798:76a60223f15a40069a8d9eb6dd0c98dc@app.getsentry.com/67675');
client.patchGlobal();
try {
	var i=z/0;
} catch(e) {
	client.captureException(e)
}
global.test=function  (){
	return "test_api";
}

global.Popular_Tweets=function(popular){
	var sortable_popular=[];
	for (var twt in popular)
		sortable_popular.push([twt, popular[twt]])
	sortable_popular.sort(function(a, b) {return a[1] - b[1]})
	return sortable_popular.reverse();

}
global.Popular_Hashtags=function(hashtags) {
	var popular_hashtags = [];

	hashtags_counted = {}

	for (ele in hashtags) {
		hashtags_counted[hashtags[ele]] = (hashtags_counted[hashtags[ele]] || 0) + 1
	};
	//sort hashtags
	var sortable_hashtags = [];

	for (var hash in hashtags_counted){
		sortable_hashtags.push([hash, hashtags_counted[hash]])
	}
	sortable_hashtags.sort(function(a, b) {return a[1] - b[1]})

	popular_hashtags=sortable_hashtags.reverse()
	return popular_hashtags;
};
router.get('/details', function(req, res) {


		var Twitter = require('twitter');

	var client = new Twitter({
		consumer_key: config.consumer_key,
		consumer_secret: config.consumer_secret,
		access_token_key: config.access_token_key,
		access_token_secret: config.access_token_secret
	});

		var results={};
		var hashtags=[];
		var popular={};
		var params = {screen_name: req.param('screen_name'),count: 1};
		client.get('statuses/user_timeline', params, function(error, tweets, response){
		  if (!error) {
		  	//get a picture
		  	results["profile_image"]=tweets[0]["user"]["profile_image_url_https"]
			//get tweets and hashtags
			for (var i=0, length=tweets.length; i<length; i++ ){
				popular[""+i]=tweets[i]["retweet_count"]+tweets[i]["favorite_count"]
				for ( var j=0, size=tweets[i]["entities"]["hashtags"].length; j<size; j++ ){
					hashtags.push(tweets[i]["entities"]["hashtags"][j]["text"])
					}			
			}
			//sort popular tweets:

			var sortable_popular=global.Popular_Tweets(popular)
			results["popular_tweets"]=sortable_popular
			for (var ele in sortable_popular)
			{
				results["popular_tweets"].push(tweets[sortable_popular[ele][0]])
			}

			//count hashtags
			results["popular_hashtags"]=global.Popular_Hashtags(hashtags);
			
			//Overview of profile
			

			res.json({ "results" :results});
		  }
		});


		//search on tweets
		// client.get('search/tweets', {q: 'Hadjadj'}, function(error, tweets, response){
		//    console.log("deee"+JSON.stringify(tweets));
		// });


		 // get tweets
		// var params = {screen_name: 'MezianeHadjadj',count: 3};
		// client.get('statuses/user_timeline', params, function(error, tweets, response){
		//   if (!error) {
		//   	console.log("jj"+JSON.stringify(tweets));
		//   }
		// });


		




	// var twitterSearchClient = new Twitter.SearchClient(
 //    'n4h3onsHHB6B9MdiPTbuU3zvf',
 //    'Hugy2DD3kZXvAVg2MFXIL2506Rzk1qiRIPvGbuvnZVWkywxC2N',
 //    '1157418127-VdrrfNdZi3hXs7GqSrRRHbplY2bZUqe388gFBQ2',
 //    'LCmHESrWFKvhAmLM9FhO5CaN3V90n8O6W9EjAJT2va9B0'
	// );
	// twitterSearchClient.search({'q': "MezianeHadjadj",'count':1}, function(error, result) {
	//     if (error)
	//     {
	//         console.log('Error: ' + (error.code ? error.code + ' ' + error.message : error.message));
	//     }
	 
	//     if (result)
	//     {
	//     	console.log(JSON.stringify(result));
	//     			console.log("lennnn"+result["statuses"].length+"nellll");

	// 		      for(var i=0, length=result["statuses"].length;i<length;i++){
	// 		      			tweet=result["statuses"][i];
	// 		      			console.log("################"+JSON.stringify(tweet));
			      			
	    	      					


	// 		      }

	//     }
	// });

			
	//	console.log(req.param('twitter_id'));

		
				
		//res.render('index', { title: 'Welcome' });
		
});




module.exports = router;
	