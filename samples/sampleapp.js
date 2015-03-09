var sampleapp = angular.module('sampleapp', []);

sampleapp.controller('MainController', function($scope, $http) {

  var crossword = null;

  $http.get('crosswords/guardian_quiptic_89.json').success(function(crosswordDefinition) {

    crossword = CrosswordsJS.buildCrossword({
      element: document.getElementById('crossword1'),
      crosswordDefinition: crosswordDefinition
    });

    $scope.acrossClues = crossword.acrossClues;
    $scope.downClues = crossword.downClues;

    crossword.onStateChanged = function(message) {

      if(message.message === "clueSelected") {
        $scope.currentClue = crossword.currentClue;
        $scope.$apply();
      }

    };

  });

  $scope.isSelectedClue = function(clue) {
    return clue === $scope.currentClue;
  };

  $scope.selectClue = function(clue) {
    selectClue(crossword, clue);
  };

});