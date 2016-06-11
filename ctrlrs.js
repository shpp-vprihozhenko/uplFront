var ngAppMod = angular.module("myApp",['ngRoute']);
var serverPath = "http://54.213.253.8:1337";

ngAppMod.service('commonData', function($http) {
    console.log("in service");
    this.arrUserLinks = [];
    var _this=this;
    this.updateLinks = function(cb) {
        console.log("update list in service");
        $http.get(serverPath+"/files/find").then(function(response) {
            console.log("response", response);
            _this.arrUserLinks = response.data.slice(0);
            console.log("arUserLinks", _this.arrUserLinks);
            if (cb) {
                cb(_this.arrUserLinks)
            }
        }, function(err) {
            console.log("error on file list request", err);
        });
    }
});

ngAppMod.config(['$locationProvider','$routeProvider', function($locationProvider, $routeProvider) {
    console.log("in conf");
    $routeProvider
        .when("/", {
            templateUrl: 'templates/home.html',
            controller: 'UplCtrlr'
        })
        .when("/signin", {
            templateUrl: 'templates/signin.html',
            controller: 'UplCtrlr'
        })
        .when("/login", {
            templateUrl: 'templates/login.html',
            controller: 'UplCtrlr'
        })
        .when("/uploadPage", {
            templateUrl: 'templates/uploadpage.html',
            controller: 'UplCtrlr'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

ngAppMod.controller("UplCtrlr", ['$scope', '$location', '$http', "commonData", function($scope, $location, $http, commonData){

    $scope.serverPath = "http://54.213.253.8:1337";
    $scope.username = localStorage.getItem("username");

    $scope.userfiles = function() {
        return commonData.arrUserLinks;
    };

    console.log("controller. uf", $scope.userfiles());

    $scope.signIn = function() {
        $location.path("/signin");
        localStorage.setItem("username", $scope.username);
    };

    $scope.logIn = function() {
        $location.path("/login");
        localStorage.setItem("username", $scope.username);
        console.log("$scope.a in login", $scope.a);
    };

    $scope.updateFileList = function () {
        console.log("updating file list");
        commonData.updateLinks();
    };

    $scope.testUF = function() {
        console.log("uf", $scope.userfiles());
        $scope.updateFileList();
    };

    $scope.uploadFile = function() {
        var _files=document.getElementById("userfile").files;
        console.log("uploading data file", _files[0]);

        if (!_files[0]) {
            return;
        }

        var formData = new FormData();
        formData.append("username", $scope.username);
        formData.append("anyfile", _files[0]); //$scope.userfile); //

        $http.post($scope.serverPath+"/files/upload", formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).then(function(response){
            console.log("response", response);
            $scope.updateFileList();
        })
    };

    $scope.moveToUploadPage = function() {
        $scope.a=5;
        $location.path("/uploadPage");
        $scope.updateFileList();
    };

    $scope.checkUserAndGoToUploadPage = function() {
        function checkUser (username, pwd, cb) {
            console.log("checking username");
            $http.get($scope.serverPath+"/users/login?username="+username+"&password="+pwd).then(function(response) {
                console.log("response", response);
                cb(response);
            }, function(err) {
                console.log("error", err);
                cb(err);
            })
        }
        console.log("check && try moving to upload page");
        checkUser($scope.username, $scope.password, function(res) {
            console.log("res", res);
            if(res.status==200) {
                console.log("moving to upload page");
                $scope.moveToUploadPage();
            }
        })
    };

    $scope.registryNewAndGoToUploadPage = function() {
        function checkIsUsed (username, cb) {
            console.log("checking username");
            $http.get($scope.serverPath+"/users/login?username="+username).then(function(response) {
                console.log("response", response);
                cb(response);
            }, function(err) {
                console.log("error", err);
                cb(err);
            })
        }
        function registryNewUser(username, password, cb) {
            console.log("reg new user");
            $http.post($scope.serverPath+"/users", {username: username, password: password}).then(function(response) {
                console.log("response", response);
                cb(response);
            }, function(err) {
                console.log("error", err);
                cb(err);
            })
        }

        console.log("registryNew && moving to upload page");

        checkIsUsed($scope.username, function(res){
            console.log("ret from http with", res);
            if (res.status==404) {
                registryNewUser($scope.username, $scope.password, function() {
                    alert("new user registered");
                    $scope.moveToUploadPage();
                })
            } else {
                $scope.errorMsg = 'Username is used. Choose another';
                alert($scope.errorMsg);
            }
        });

    };

}]);
