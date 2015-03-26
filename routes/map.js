var express = require('express');
var elasticsearch = require('elasticsearch');
var elasticSearchClient = new elasticsearch.Client({
	host: '104.154.66.240:9200',
	log: 'trace'
});
var router = express.Router();
var ParserEngine = {};
var Twitter = require('node-twitter');

var MapEngine = {};
var geocoder = require('geocoder');
router.get('/list', function(req, res) {
console.log("begin"+req.query.keywords);



var keywords=req.query.keywords;
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


console.log("qqqq"+q2);



elasticSearchClient.search({
					  index: 'twitter',
					  
					  type: 'posts',
					  q: q2,
					  body: {

					aggs: {
			                touchdowns: {
			                    terms: {
			                    	size:10,
			                        field: "user.location",
			                        // order by quarter, ascending
			                        //order: { "_term" : "asc" }
			                    }
			                }
			            }
			           }
					}).then(function (resp) {
						//console.log("rsppppppppppppp"+JSON.stringify(resp.aggregations.touchdowns.buckets[0]["key"]))
						var crawlers=resp.aggregations.touchdowns.buckets;
						var i=0;
						var j=0
						var list_locations=[];
						var finish=false;

						for( var i = 0,length = crawlers.length; i < length; i++ ) {
								//console.log(i+crawlers[i]["key"]+"oo");
							if (i+1==crawlers.length){
								finish=true;
								console.log("true");
							}
							
							MapEngine.location_function(crawlers,i,
								finish,res);
							


						//while(i<crawlers.length){	
						 	//var address = '885 6th Ave #15D New York, NY 10001';
						    //var sensor = false;
						    //MapEngine.insert_location(list_locations,crawlers,crawlers[i],i,false,res);

						   // console.log("zz"+JSON.stringify(crawlers[i]));
						    // if(i+1==crawlers.length){
						    // 	MapEngine.insert_location(list_locations,crawlers,crawlers[i],i,true,res);

						    // }

						    // var lo="London"
						    // geo.geocoder(geo.google, lo, false,
						    // function(formattedAddress, latitude, longitude, details) {
						    // 	console.log("lla"+latitude+lo);
						    // 	crawlers[j]["latitude"]=latitude;
						    // 	crawlers[j]["longitude"]=longitude;
						    //     console.log("####Formatted Address: " + formattedAddress);
						    //     console.log("Latitude: " + latitude);
						    //     console.log("Longitude: " + longitude);
						    //     console.log("Address details:", details);
						    //     j=j+1;
						    //  	if(j+1==crawlers.length){
						    //  		res.json({ "results" :crawlers});
						    //  	}

						    // });

					




						}


						
						
						//res.send('update', { title: crawlers });
					}, function (err) {
					     console.trace("rrr"+err.message);
					});

});


router.get('/map_tweets', function(req, res) {
var keywords=req.query.keywords;
		req.query.location=req.query.location.replace(" ","_")
						req.query.location=req.query.location.trim();


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
	q2='('+'( user.location: '+req.query.location+

		') OR ( user.location: _'+req.query.location+
		') OR ( user.location: '+req.query.location
		+'_ ) )'+' AND ' +'('+q2+')';

	elasticSearchClient.search({
		  index: 'twitter',
		  sort : 'id:desc',
		  type: 'posts',
		  size: 150,

		  q: q2
		}).then(function (resp) {
			
			

			 res.json({ "results" :resp.hits.hits});
		}, function (err) {
		     console.trace(err.message);
		});




});




MapEngine.location_function=function(crawlers,i,finish,res){
		

		crawlers[i]["key"]=crawlers[i]["key"].replace("_"," ")
						crawlers[i]["key"]=crawlers[i]["key"].trim();
						
						geocoder.geocode(crawlers[i]["key"], function ( err, data ) {
							
							if(data["results"][0]){
								
								//console.log("ii"+i+crawlers[i]["key"]);
								crawlers[i]["latitude"]=data["results"][0]["geometry"]["location"]["lat"];
								crawlers[i]["longitude"]=data["results"][0]["geometry"]["location"]["lng"]
								console.log(i+"__"+JSON.stringify(crawlers[i]));
								if(finish){
										res.json({ "results" :crawlers});
								}

					

							}else{
								console.log("nosthingfor: "+JSON.stringify(crawlers[i]));
								if(finish){
										res.json({ "results" :crawlers});
								}
							}
							


						});

}

// MapEngine.insert_location=function(crawlers,element,i,finish,res){
// 	element["key"]=element["key"].replace("_"," ")
// 	element["key"]=element["key"].trim();
// 	geo.geocoder(geo.google, "London", false,
// 						    function(formattedAddress, latitude, longitude, details) {
// 						    	console.log("dd"+JSON.stringify(element));
// 						    	element["latitude"]=latitude;
// 						    	element["longitude"]=longitude;
// 						        console.log("####Formatted Address: " + formattedAddress);
// 						        console.log("Latitude: " + latitude);
// 						        console.log("Longitude: " + longitude);
// 						        console.log("Address details:", details);
// 						        console.log(element["key"]+"####")
// 						        //return element
// 						        console.log("fff"+finish+i);
// 						        // if(finish){

// 						        // res.json({ "results" :crawlers});
// 						        // }
// 						        // list_locations.push(element);
// 						        // if(list_locations.length==50){
// 						        // 	res.json({ "results" :list_locations});
// 						        // }
// 						        if(i+1=crawlers.length){
// 						        	res.json({ "results" :list_locations});
// 						        }

// 						    });

// }





module.exports = router;
