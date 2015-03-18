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
console.log("begin");
elasticSearchClient.search({
					  index: 'twitter',
					  
					  type: 'posts',
					  q:'keywords: '+req.query.keyword,
					  body: {

					aggs: {
			                touchdowns: {
			                    terms: {
			                    	size:2000,
			                        field: "user.location"
			                        // order by quarter, ascending
			                        //order: { "_term" : "asc" }
			                    }
			                }
			            }
			           }
					}).then(function (resp) {
						//console.log("rsppppppppppppp"+JSON.stringify(resp.aggregations.touchdowns.buckets[0]["key"]))
						var crawlers=resp.aggregations.touchdowns.buckets;
						//res.render('index', { crawlers: crawlers});
						res.send('update', { title: crawlers });
					}, function (err) {
					     console.trace("rrr"+err.message);
					});




});





module.exports = router;
