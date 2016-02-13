var request = require("request");
var app_file = require("../app.js")
var base_url = "http://localhost:5000/"

describe("Twitter insights API", function() {
    describe("GET /", function() {
        it("returns status code 200", function(done) {
            request.get(base_url+"details", function(error, response, body) {
                expect(response.statusCode).toBe(200);
                app_file.closeServer();
                done();
            });
        });




    });
});
