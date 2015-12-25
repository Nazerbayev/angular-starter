module.exports = function(app) {
    app.config(["$locationProvider", "$routeProvider",
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

};