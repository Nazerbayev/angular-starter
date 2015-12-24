(function(){
    "use strict";
    
    require("angular");
    require("angular-route");
    require("angular-animate");
    var mainCtrl = require("./controllers/MainCtrl");
    
    angular.module("SampleApp", ["ngRoute", "ngAnimate"])
        .config(["$locationProvider", "$routeProvider",
            function($locationProvider, $routeProvider){
                $locationProvider.hashPrefix("!");
                $routeProvider.when("/", {
                    templateUrl: "./partials/partial1.html",
                    controller: "MainController"
                })
                .otherwise({
                    redirectTo: "/"
                });
            }
    ]);
    //Load controller
    angular.module("SampleApp").controller("MainController", ["$scope", mainCtrl]);
})();