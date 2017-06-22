"use strict";

$(document).ready(function () {
  var gridMoves = { "00": "", "01": "", "02": "",
    "10": "", "11": "", "12": "",
    "20": "", "21": "", "22": "" };
  var currMove = "X";
  var playerMark = "X";
  var cpuMark = "O";
  var gameOver = false;
  var movesLeft = [];
  for (var key in gridMoves) {
    movesLeft.push(key);
  }

  // draw grid
  function showGrid() {
    var gridHTML = "";

    // i is vertical index, j is horizontal index
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        gridHTML += "<div class='cell' id='" + i + j + "' style='";
        // set top border
        if (i > 0) {
          gridHTML += "border-top:1px; border-top-style:solid; border-top-color:white; ";
        }
        // set bottom border
        if (i < 2) {
          gridHTML += "border-bottom:1px; border-bottom-style:solid; border-bottom-color:white; ";
        }
        // set left border
        if (j > 0) {
          gridHTML += "border-left:1px; border-left-style:solid; border-left-color:white;";
        }
        // set right border
        if (j < 2) {
          gridHTML += "border-right:1px; border-right-style:solid; border-right-color:white;";
        }

        gridHTML += "'></div>";
      }
    }
    $("#game-area").html(gridHTML);
  }

  function reset() {
    var choiceHTML = "<div class='message'>Play as:<br /><a class='choice' id=choose-x'>X</a> <a class='choice' id='choose-o'>O</a></div>";
    $("#game-area").html(choiceHTML);

    $(".choice").click(function () {
      playerMark = $(this).text();
      if (playerMark === "X") {
        cpuMark = "O";
      } else {
        cpuMark = "X";
      }

      for (var key in gridMoves) {
        gridMoves[key] = "";
        movesLeft.push(key);
      }

      currMove = "X";
      gameOver = false;
      showGrid();

      if (playerMark === "X") {
        playerMove();
      } else {
        cpuMove();
      }
    });
  }

  function checkForWin() {
    var win = false;
    // check rows
    for (var i = 0; i < 3; i++) {
      if (gridMoves[i + "0"].length > 0) {
        if (gridMoves[i + "0"] === gridMoves[i + "1"] && gridMoves[i + "1"] === gridMoves[i + "2"]) {
          win = true;
          endGame(currMove);
          return;
        }
      }
    }

    // check columns
    for (var j = 0; j < 3; j++) {
      if (gridMoves["0" + j].length > 0) {
        if (gridMoves["0" + j] === gridMoves["1" + j] && gridMoves["1" + j] === gridMoves["2" + j]) {
          win = true;
          endGame(currMove);
          return;
        }
      }
    }
    // check diagonals
    if (gridMoves["00"].length > 0) {
      if (gridMoves["00"] === gridMoves["11"] && gridMoves["11"] === gridMoves["22"]) {
        win = true;
        endGame(currMove);
        return;
      }
    }
    if (gridMoves["02"].length > 0) {
      if (gridMoves["02"] === gridMoves["11"] && gridMoves["11"] === gridMoves["20"]) {
        win = true;
        endGame(currMove);
        return;
      }
    }

    // draw if no moves left
    var moveCount = 0;
    for (var el in gridMoves) {
      if (gridMoves[el].length > 0) {
        moveCount++;
      }
    }
    if (moveCount === 9) {
      endGame("");
    }
  }

  function endGame(winner) {
    gameOver = true;
    $(".cell").off("click");
    setTimeout(function () {
      if (winner.length > 0) {
        alert(winner + " wins!");
      } else {
        alert("draw");
      }
    }, 2);

    setTimeout(reset, 2000);
  }

  function makeMove(ind) {
    if (gridMoves[ind].length === 0) {
      gridMoves[ind] = currMove;
      $("#" + ind).text(currMove);
      movesLeft = movesLeft.filter(function (el) {
        return el !== ind;
      });

      checkForWin();

      if (currMove === "X") {
        currMove = "O";
      } else {
        currMove = "X";
      }
    }
  }

  function playerMove() {
    $(".cell").click(function () {
      var selection = $(this).attr("id");
      if (movesLeft.indexOf(selection) < 0) {
        return; // ignore invalid selections
      }
      makeMove(selection);
      if (!gameOver) {
        cpuMove();
      }
    });
  }

  function cpuMove() {
    var movesLeft = [];
    for (var key in gridMoves) {
      if (gridMoves[key].length === 0) {
        movesLeft.push(key);
      }
    }

    // optional random mover
    /* let moveInd = Math.floor(Math.random()*movesLeft.length);
    makeMove(movesLeft[moveInd]); */

    // use AI
    var move = findBest(gridMoves);
    makeMove(move);
    if (!gameOver) {
      playerMove();
    }
  }

  function whoWon(board) {
    // check rows
    for (var i = 0; i < 3; i++) {
      if (board[i + "0"].length > 0) {
        if (board[i + "0"] === board[i + "1"] && board[i + "1"] === board[i + "2"]) {
          return board[i + "0"];
        }
      }
    }

    // check columns
    for (var j = 0; j < 3; j++) {
      if (board["0" + j].length > 0) {
        if (board["0" + j] === board["1" + j] && board["1" + j] === board["2" + j]) {
          return board["0" + j];
        }
      }
    }
    // check diagonals
    if (board["00"].length > 0) {
      if (board["00"] === board["11"] && board["11"] === board["22"]) {
        return board["00"];
      }
    }
    if (board["02"].length > 0) {
      if (board["02"] === board["11"] && board["11"] === board["20"]) {
        return board["02"];
      }
    }

    // draw if no moves left
    var moveCount = 0;
    for (var el in board) {
      if (board[el].length > 0) {
        moveCount++;
      }
    }
    if (moveCount === 9) {
      return "draw";
    }
    return "not done";
  }

  function minimaxScore(board, depth, isMaxing) {
    // minimax algorithm

    // end recursion
    var endMessage = whoWon(board);
    if (endMessage !== "not done") {
      var win = 0;
      var loss = 0;
      if (endMessage === cpuMark) {
        win = 10;
      } else if (endMessage === playerMark) {
        loss = 10;
      }
      var score = win - loss - depth;
      return score;
    }

    var availMoves = [];
    for (var key in board) {
      if (board[key].length === 0) {
        availMoves.push(key);
      }
    }

    var currBestScore = undefined;
    if (isMaxing) {
      currBestScore = -Infinity;

      availMoves.forEach(function (move) {
        // create new board object for every move to pass into minimax algorithm
        var newBoard = {};
        for (var key in board) {
          newBoard[key] = board[key];
        }
        newBoard[move] = cpuMark;
        var moveScore = minimaxScore(newBoard, depth + 1, !isMaxing);
        if (moveScore > currBestScore) {
          currBestScore = moveScore;
        }
      });
    } else {
      currBestScore = Infinity;

      availMoves.forEach(function (move) {
        // create new board object for every move to pass into minimax algorithm
        var newBoard = {};
        for (var key in board) {
          newBoard[key] = board[key];
        }
        newBoard[move] = playerMark;
        var moveScore = minimaxScore(newBoard, depth + 1, !isMaxing);
        if (moveScore < currBestScore) {
          currBestScore = moveScore;
        }
      });
    }

    return currBestScore;
  }

  function findBest(board) {
    // search through options for highest scoring

    // generate list of available moves
    var availMoves = [];
    for (var key in board) {
      if (board[key].length === 0) {
        availMoves.push(key);
      }
    }

    // auto choose first 2 moves to avoid long wait
    if (availMoves.length === 9) {
      return "00";
    } else if (availMoves.length === 8) {
      if (availMoves.indexOf("11") >= 0) {
        return "11";
      } else {
        return "00";
      }
    }

    var currBestMove = undefined;
    var currBestScore = -Infinity;
    availMoves.forEach(function (move) {
      // create new board object for every move to pass into minimax algorithm
      var newBoard = {};
      for (var key in board) {
        newBoard[key] = board[key];
      }
      newBoard[move] = cpuMark;
      var moveScore = minimaxScore(newBoard, 0, false);
      if (moveScore >= currBestScore) {
        currBestMove = move;
        currBestScore = moveScore;
      }
    });
    //console.log(currBestScore);
    return currBestMove;
  }

  reset();
});