var request = require("request");
var app_file = require("../app.js")
var base_url = "http://localhost:5000/"
var posts=require("../routes/posts.js");

var popular_tweets=null;

describe("Twitter insights Popular Tweets API", function() {
    describe("GET /", function() {
        //Testing Popular Tweets function

        it("Popular Tweets should return ordered values", function(done){
            popular_tweets=Popular_Tweets({"0": 16,"1": 9});
            expect(String(popular_tweets)).toBe("0,16,1,9")
            done();
        });

        it("Popular Tweets should return ordered values", function(done){
            popular_tweets=Popular_Tweets({"1": 9});
            expect(String(popular_tweets)).toBe("1,9")
            done();
        });

        it("Popular Tweets should return ordered values", function(done){
            popular_tweets=Popular_Tweets({});
            expect(String(popular_tweets)).toBe("")
            app_file.closeServer();
            done();
        });

        it("Popular Tweets should return ordered values", function(done){
            popular_tweets=Popular_Tweets({"0": 16,"1": 9});
            expect(String(popular_tweets)).toBe("0,16,1,9")
            app_file.closeServer();
            done();
        });

        it("Popular Tweets should return ordered values", function(done){
            popular_tweets=Popular_Tweets({"0":4,"1":4001,"2":1482,"3":4896,"4":1472});
            expect(String(popular_tweets)).toBe("3,4896,1,4001,2,1482,4,1472,0,4")

            done();
        });



    });
});
