var express = require('express');
//var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var router = express.Router();

//Crawle LinkedIn profile.
router.get('/get_linkedin_profile', function(req, res){
    console.log("start getting data");
    url=req.param('url');
    request(url, function(error, response, html){
    //console.log(html)
        if(!error){
            var $ = cheerio.load(html);
            console.log("cheer:");
            var title, release, rating;
            var json_result = { title : "", title : "", description : ""};

            // We'll use the unique header class as a starting point.
            var name=$('.profile-overview-content').children('#name').text();
            var title=$('.profile-overview-content').children('.headline.title').text();
            var description=$('.description').text();
            console.log(title);
            res.json( {"Name": name,"Title": title,"Descriptione":description});
        }else{
            console.log(error)
        }
    })
});

//Search LInkedIn profile.
router.get('/search_linkedin_profile', function(req, res){
    console.log("start getting data");
   var name=req.param('name');
    console.log(name);
    url="https://www.linkedin.com/vsearch/f?type=all&keywords="+name+"&orig=GLHD&rsid=&pageKey=oz-winner&trkInfo=tarId%3A1454402967098&search=Search"
    request(url, function(error, response, html){
        console.log(html);
        if(!error){
            var $ = cheerio.load(html);
            console.log("result:"+$);





        }else{
            console.log("error:"+error)
        }
    })
});

//console.log('scraping LinkedIn Data');
exports = module.exports = router;
//module.exports = router;