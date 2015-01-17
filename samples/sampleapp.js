var sampleapp = angular.module('sampleapp', []);

sampleapp.controller('MainController', function($scope, $http) {

  $scope.title = "Test";

  $scope.$watch('crosswordState', function(newState, oldState) {

    console.log(newState);
    console.log(oldState);

  }, true);

});