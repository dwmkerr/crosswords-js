const sampleapp = angular.module("sampleapp", []);

sampleapp.controller("MainController", ($scope, $http) => {
  let cwModel = null;
  let cwController = null;

  $http.get("../data/ftimes_17095.json").success((crosswordDefinition) => {
    //  Set the crossword info.
    $scope.info = crosswordDefinition.info;

    //  Create the crossword model.
    cwModel = CrosswordsJS.compileCrossword(crosswordDefinition);
    cwController = new CrosswordsJS.Controller(
      cwModel,
      document.getElementById("crossword1"),
    );
    $scope.cwController = cwController;
    $scope.acrossClues = cwModel.acrossClues;
    $scope.downClues = cwModel.downClues;

    cwController.currentClue = cwModel.acrossClues[0];
    $scope.currentClue = cwModel.acrossClues[0];

    cwController.addEventsListener(["clueSelected"], (data) => {
      $scope.currentClue = cwController.currentClue;
      $scope.$apply();
    });
  });

  $scope.isHighlightedClue = function (clue) {
    const { currentClue } = $scope;
    const { parentClue } = currentClue;

    // The trivial case is that the clue is selected.
    if (clue === currentClue) {
      return true;
    }

    //  We might also be a clue which is part of a multi-segment clue.
    return (
      currentClue &&
      parentClue &&
      (parentClue === clue || parentClue.connectedClues.indexOf(clue) !== -1)
    );
  };

  $scope.selectClue = function (clue) {
    $scope.cwController.currentClue = clue;
  };

  $scope.revealCell = function () {
    $scope.cwController.revealCurrentCell;
  };

  $scope.checkClue = function () {
    $scope.cwController.checkCurrentClue;
  };

  $scope.revealClue = function () {
    $scope.cwController.revealCurrentClue;
  };

  $scope.clearClue = function () {
    $scope.cwController.clearCurrentClue;
  };

  $scope.checkCrossword = function () {
    $scope.cwController.checkCrossword;
  };

  $scope.revealCrossword = function () {
    $scope.cwController.revealCrossword;
  };

  $scope.clearCrossword = function () {
    $scope.cwController.clearCrossword;
  };
});
