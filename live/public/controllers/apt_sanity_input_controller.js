myApp.controller('AptSanityInputController', ['$scope', '$http', function($scope, $http) {
    console.log("Hello World from apts sanity input");
   
   $scope.test = 'janne'
   $scope.apt = {};
   $scope.ResPricePerM2 = "";

    $scope.update = function(){
   		$scope.computePricePerM2();
   		$scope.visualizeProximityApt();
    }
    $scope.computePricePerM2 = function(){
    	res = $scope.apt.price/$scope.apt.m2;
    	$scope.ResPricePerM2 = Math.round(res*1000)/1000;
    }

 }]);