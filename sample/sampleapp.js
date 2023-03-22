var sampleapp = angular.module('sampleapp', []);

sampleapp.controller("MainController", function ($scope, $http) {
  var cwModel = null;
  var cwController = null;

  $http.get("crosswords/ftimes_17095.json").success(function (jsonCrossword) {
    //  Set the crossword info.
    $scope.info = jsonCrossword.info;

    //  Create the crossword model.
    cwModel = CrosswordsJS.compileCrossword(jsonCrossword);
    cwController = new CrosswordsJS.Controller(
      cwModel,
      document.getElementById("crossword1"),
    );
    $scope.cwController = cwController;
    $scope.acrossClues = cwModel.acrossClues;
    $scope.downClues = cwModel.downClues;

    cwController.currentClue = cwModel.acrossClues[0];
    $scope.currentClue = cwModel.acrossClues[0];

    cwController.onStateChanged = function (message) {
      $scope.currentClue = cwController.currentClue;
      $scope.$apply();
    };
  });

    };

  });

  $scope.isHighlightedClue = function(clue) {
    const currentClue = $scope.currentClue;
    const parentClue = currentClue.parentClue;

    // The trivial case is that the clue is selected.
    if (clue === currentClue) {
      return true;
    }

    //  We might also be a clue which is part of a non-linear clue.
    if (currentClue && parentClue && (parentClue === clue || parentClue.connectedClues.indexOf(clue) !== -1)) {
      return true;
    }

    return false;
  };

  $scope.selectClue = function (clue) {
    $scope.cwController.currentClue = clue;
  };

  $scope.revealCell = function () {
    $scope.cwController.revealCell;
  };

  $scope.checkClue = function () {
    $scope.cwController.checkClue;
  };

  $scope.revealClue = function () {
    $scope.cwController.revealClue;
  };

  $scope.clearClue = function () {
    $scope.cwController.clearClue;
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
