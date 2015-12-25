(function(){
    "use strict";
    
    require("angular");
    require("angular-route");
    require("angular-animate");
    var mainCtrl = require("./controllers/MainCtrl");
    
    var app = angular.module("SampleApp", ["ngRoute", "ngAnimate"]);
    
    
    //Load controller
    require("./routes")("app");
    require("./controllers/controllers")("app");
})();