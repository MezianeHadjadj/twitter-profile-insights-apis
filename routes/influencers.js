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
		keywords=req.query.keywords
		console.log(keywords+"keyword");
		var list_influencers=[];
		var indice=0;


		console.log(keywords.length+"len");		

		var q2=""
	for( var i = 0,length = keywords.length; i < length; i++ ) {
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


		console.log("q2"+q2);
		var more=true;
		elasticSearchClient.search({
		  index: 'twitter',
		  size:30,
		  sort : 'user.followers_count:desc',
		  type: 'posts',
		  from: (req.query.page-1)*30,

		  //q: 'keywords:'+keyword[k],	
		  q: q2	 
		}).then(function (resp) {
			indice=indice+1;
			if (JSON.stringify(resp.hits.total)==0){
				more=false;

			}
		
			

				res.json({ "results" :resp.hits.hits,"more":more});
			
			
		}, function (err) {
		     console.trace(err.message);
		});


			
});









module.exports = router;
