var sampleapp = angular.module('sampleapp', []);

sampleapp.controller('MainController', function($scope, $http) {

  var model = null;

  $scope.messages = [];

  $http.get('crosswords/guardian_quiptic_89.json').success(function(crosswordDefinition) {

    model = crossword({
      element: document.getElementById('crossword1'),
      crosswordDefinition: crosswordDefinition
    });

    $scope.acrossClues = model.acrossClues;
    $scope.downClues = model.downClues;

    model.onStateChanged = function(message) {

      if(message.message === "clueSelected") {
        $scope.currentClue = model.currentClue;
        $scope.messages.push({
          text: message.message,
          data: JSON.stringify(message.data)
        })
        $scope.$apply();
      }

    };

  });

  $scope.isSelectedClue = function(clue) {
    return clue === $scope.currentClue;
  };

  $scope.selectClue = function(clue) {
    selectClue(model, clue);
  }

});