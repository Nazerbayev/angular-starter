module.exports = function(app) {
    var mainCtrl = require("./main/MainCtrl");
    
    app.controller("MainController", ["$scope", mainCtrl]);
};