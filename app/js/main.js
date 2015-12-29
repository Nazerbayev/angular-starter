(function(){
    "use strict";
    var app = angular.module("SampleApp", ["ui.router", "ngAnimate", "ngMessages"]);
    
    
    //Load controller
    require("./routes")(app);
    require("./controllers/controllers")(app);
    require("./services/services")(app);
    require("./directives/directives")(app);
})();