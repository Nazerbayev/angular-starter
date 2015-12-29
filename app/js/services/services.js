module.exports = function(app) {
    var svc = require("./main/sample-service");
    
    app.service("SampleService", [svc]);
};