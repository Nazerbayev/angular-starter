module.exports = function(app) {
    var sdir = require("./main/sample-directive");
    
    app.directive("sampleDirective", [sdir]);
};