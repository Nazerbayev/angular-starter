module.exports = function(app) {
    app.config(["$stateProvider", "$urlRouterProvider",
            function($stateProvider, $urlRouterProvider){
                
                $urlRouterProvider.otherwise("/");
                $stateProvider.state("root", {
                    url: "",
                    abstract: true
                })
                .state("root.home", {
                    url: "/",
                    templateUrl: "partials/home.html"
                })
                .state("root.about", {
                    url: "/about",
                    templateUrl: "partials/partial1.html"
                });
                
            }
    ]);

};