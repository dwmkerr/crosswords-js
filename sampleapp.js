var sampleapp = angular.module("sampleapp", []);

sampleapp.controller("MainController", function ($scope, $http) {
  var crosswordModel = null;
  var crosswordDom = null;

  //$http.get('crosswords/guardian_quiptic_89.json').success(function(crosswordDefinition) {
  $http
    .get("crosswords/albreich_4.json")
    .success(function (crosswordDefinition) {
      //  Set the crossword info.
      $scope.info = crosswordDefinition.info;

      //  Create the crossword model.
      crosswordModel = CrosswordsJS.compileCrossword(crosswordDefinition);
      crosswordDom = new CrosswordsJS.CrosswordDOM(
        crosswordModel,
        document.getElementById("crossword1"),
      );

      $scope.acrossClues = crosswordModel.acrossClues;
      $scope.downClues = crosswordModel.downClues;

      crosswordDom.currentClue = crosswordModel.acrossClues[0];
      $scope.currentClue = crosswordModel.acrossClues[0];

      crosswordDom.onStateChanged = function (message) {
        if (message.message === "clueSelected") {
          $scope.currentClue = crosswordDom.currentClue;
          $scope.$apply();
        }
      };
    });

  $scope.isHighlightedClue = function (clue) {
    const currentClue = $scope.currentClue;
    const parentClue = currentClue.parentClue;

    // The trivial case is that the clue is selected.
    if (clue === currentClue) {
      return true;
    }

    //  We might also be a clue which is part of a non-linear clue.
    if (
      currentClue &&
      parentClue &&
      (parentClue === clue || parentClue.connectedClues.indexOf(clue) !== -1)
    ) {
      return true;
    }

    return false;
  };

  $scope.selectClue = function (clue) {
    crosswordDom.currentClue = clue;
  };
});
