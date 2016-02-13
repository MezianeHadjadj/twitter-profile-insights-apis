var request = require("request");
var app_file = require("../app.js")
var base_url = "http://localhost:5000/"
var posts=require("../routes/posts.js");
var popular_hashtags=null;


describe("Twitter insights  Popular Hashtags API", function() {
    describe("GET /", function() {
        it("returns status code 200", function(done) {
            request.get(base_url+"details", function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });
        //Testing Popular Hashtags function
        it("Popular Hashtags should return ordered result", function(done){
            popular_hashtags=Popular_Hashtags(["startup", "twitter","startup"]);
            expect(String(popular_hashtags)).toBe("startup,2,twitter,1")
            done();
        });
        it("Popular Hashtags should return ordered array", function(done){
            popular_hashtags=Popular_Hashtags(["google"]);
           expect(String(popular_hashtags)).toBe("google,1")
           done();
        });

        it("Popular Hashtags should return ordered array", function(done){
            popular_hashtags=Popular_Hashtags([]);
            expect(String(popular_hashtags)).toBe("")
            app_file.closeServer();
            done();
        });


    });
});
