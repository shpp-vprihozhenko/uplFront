var ngAppMod = angular.module("myApp",['ngRoute']);

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

ngAppMod.controller("UplCtrlr", ['$scope', '$location', '$http', function($scope, $location, $http){

    $scope.serverPath = "http://54.213.253.8:1337";
    $scope.username = localStorage.getItem("username");
    //$scope.password = "";
    $scope.a=1;

    if (!$scope.userfiles) {
        console.log("reset uf");
        $scope.userfiles = [];
    }
    //$scope.$watch("userfiles");

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
        console.log("update file list");
        console.log("$scope.a in updt", $scope.a);
        $http.get($scope.serverPath+"/files/find").then(function(response) {
            console.log("response", response);
            $scope.userfiles = response.data.slice(0);
            //$scope.$apply($scope.userfiles);
            console.log("files", $scope.userfiles);
            $scope.a=2;
        }, function(err) {
            console.log("error", err);
        })
    };

    $scope.testUF = function() {
        console.log("a", $scope.a);
        console.log("uf", $scope.userfiles);
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
