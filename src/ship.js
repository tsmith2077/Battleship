import { gameBoardEnemy, displayGameBoard } from "./dom";
const axisBtn = document.querySelector('#axisBtn');
let playerTurn = 'player1';
let player1Ships = "";
let player2Ships = "";
let finishedPlacingShips = false;

const createAndPlaceShips = () => {


player1Ships = ship();
player2Ships = ship();
let axis = 'row';

// export default 
function ship () {
  // The 5 ships are: Carrier (occupies 5 spaces), Battleship (4), Cruiser (3), Submarine (3), and Destroyer (2).
  // Create ship objects
    let playerShipsArr = [];

    function createShipObj (shipName, shipSize, sunk=false, position=null, hit=[]) {
        return {
            shipName: shipName,
            shipSize: shipSize,
            position: position,
            hit: hit,
            sunk: sunk
        }
    };

    playerShipsArr.push(createShipObj('carrier', 5));
    playerShipsArr.push(createShipObj('battleship', 4));
    playerShipsArr.push(createShipObj('cruiser', 3));
    playerShipsArr.push(createShipObj('submarine', 3));
    playerShipsArr.push(createShipObj('destroyer', 2));

    return playerShipsArr;
  };

  // Check to see if any ships are missing position coordinates
  // If missing return index from array
  function checkShipsPlaced (playerShips) {
    for (let i=0; i < playerShips.length; i++) {
        if (playerShips[i].position === null) {
            return i;
        }
    }
    return 5;
  };

  // Placing Ships
  function placeAllShips (event, playerShips) {
    let currentShipIndex = checkShipsPlaced(playerShips);
    let shipLength = playerShips[currentShipIndex].shipSize;
    let squareHover = findSquareHover(event, playerShips);
    if (!checkRoomForShip(shipLength, squareHover, playerShips) && playerTurn == 'player1') {
      let playerTurnHeading = document.querySelector('#playerTurnHeading');
      playerTurnHeading.textContent = 'Not enough room for ship. Please try again.'
    } else if ((checkRoomForShip(shipLength, squareHover, playerShips) && shipLength > 1)) {
      changePlayerTurnHeading();
      placeCurrentShip(playerShips, shipLength, squareHover, currentShipIndex);
    }
  };

  function placeCurrentShip (playerShips, shipLength, squareHover, currentShipIndex) {
    playerShips[currentShipIndex].position = createArrForPosition(shipLength, squareHover);
    for (let i=0; i<(playerShips[currentShipIndex].position.length); i++) {
      changeSquareColor(playerShips[currentShipIndex].position[i], 'black');
    }
    // Check if player has placed all ships
    if (checkShipsPlaced(playerShips) === 5 && playerTurn === 'player1') {
      changePlayerTurnHeading(true);
      placeComputerShips();
    } else if (checkShipsPlaced(player2Ships) === 5 && playerTurn === 'player2') {
      changePlayerTurnHeading(true);
    }
};

// COMPUTER 
// Computer place ships
function placeComputerShips () {
  while (checkShipsPlaced(player2Ships) != 5) {
    let shipPlacement = randomIntFromInterval(1, 100);
    if (randomIntFromInterval(1,2) == 1) {
        axis = 'row';
    } else {
        axis = 'column';
    }
    placeAllShips(shipPlacement, player2Ships);
  }
  displayGameBoard(gameBoardEnemy, 'enemySquare');
  finishedPlacingShips = true;
};

function createArrForPosition (shipLength, squareHover) {
  let arr = [];
  if (axis == 'row') {
    for (let i=squareHover; i<(shipLength + squareHover); i++) {
      arr.push(i);
    }
  } else if (axis == 'column') {
    for (let i = squareHover; i < (squareHover + (shipLength*10)); i+=10) {
      arr.push(i);
    }
  }
  return arr;
}

function checkRoomForShip (shipLength, squareHover, playerShips) {
  let lastDigit = findLastDigit(squareHover);
  let positionArr = createArrForPosition(shipLength, squareHover);
  // Check to see if spot is taken by another ship
  if (checkForMatchInArr(playerShips, positionArr) === false) {
    // Ensure ship stays inside gameboard
    if (axis == 'row') {
      if ((lastDigit + shipLength) > 11 || lastDigit == 0) {
          return false;
      } else {
        return true;
      }
    } else if (axis == 'column') {
        if ((squareHover + (shipLength*10)) > 110) {
          return false;
        } else {
          return true;
        }
    }
  } else {
    return false;
  }
}

function checkForMatchInArr (playerShips, positionArr) {
  if (playerShips[0].position === null) {
    return false;
  } else {
    for (let i=0; i < playerShips.length; i++) {
      if (playerShips[i].position !== null) {
        if (playerShips[i].position.some( e => positionArr.includes(e) )) {
          return true;
        }
      }
    }
  }
  return false;
};


// EVENT LISTENERS
// Change axis when placing ships
axisBtn.addEventListener('click', function () {
  changeAxis();
});

// Event Listener for placing ships
gameBoardMain.addEventListener('click', function (event) {
  if (player1Ships[4].position === null) {
    placeAllShips(event, findPlayerShips())
  }
});

// Remove adjusted color for mouse hover on placing ships when mouseout
  gameBoardMain.addEventListener('mouseout', function (event) {
    removeHoverPlaceShip(event);
  });


  // Change the color of gameboard squares while placing ships
  gameBoardMain.addEventListener('mouseover', function (event) {
    hoverPlaceShip(event);
  });


  // EVENT LISTENER FUNCTIONS
  const findPlayerShips = () => {
    if (playerTurn == 'player1') {
      return player1Ships;
    }
    else if (playerTurn == 'player2') {
      return player2Ships;
    }
  }

  const hoverPlaceShip = (event) => {
    let playerShips = findPlayerShips();
    let squareHover = parseInt(event.target.getAttribute('data'));
    let currentShipIndex = checkShipsPlaced(playerShips);
    let shipLength = findSquareHoverLength(playerShips, currentShipIndex);
    if (axis == 'row') {
        for (let i = squareHover; i < (squareHover + shipLength); i++) {
            if (i % 10 == 1 && squareHover % 10 != 1) {
                break;
            };
            changeSquareColor(i, 'grey');
        }
    } else if (axis == 'column') {
        for (let i = squareHover; i < (squareHover + (shipLength*10)); i+=10) {
            if (i > 100) {
                break;
            };
            changeSquareColor(i, 'grey');
        };
    }
  };

  const removeHoverPlaceShip = (event) => {
    let playerShips = findPlayerShips();
    let currentShipIndex = checkShipsPlaced(playerShips);
    let shipLength = findSquareHoverLength(playerShips, currentShipIndex);
    let squareHover = parseInt(event.target.getAttribute('data'));
    if (axis == 'row') {
        let lastDigit = findLastDigit(squareHover);
        let adjustedShipLength = shipLength;
        if ((lastDigit + shipLength) > 11) {
            adjustedShipLength = shipLength - (lastDigit + shipLength - 11);
        }
        for (let i = squareHover; i < (squareHover + adjustedShipLength); i++) {
            changeSquareColor(i, "#708090")
        }
    } else if (axis == 'column') {
        for (let i = squareHover; i < (squareHover + (shipLength*10)); i+=10) {
            if (i < 101) {
                changeSquareColor(i, "#708090")
            }
        }
    }
  };


  // Adjust hover length to 1 after all ships have been placed
  const findSquareHoverLength = (playerShips, currentShipIndex) => {
    if (currentShipIndex != 5) {
      return playerShips[currentShipIndex].shipSize;
    } else {
      return 1;
    }
  }

  function changeAxis () {
    if (axis == 'row') {
        return axis = 'column';
    } else if (axis == 'column') {
        return axis = 'row';
    }
  }

  const changeSquareColor = (i, color) => {
    if (playerTurn == 'player1') { 
        let stringCounter = "'" + i.toString() + "'";
        let selectedSquare = document.querySelector(`[data=${stringCounter}]`);
        if (!selectedSquare.classList.contains('ship')) {
          selectedSquare.style.backgroundColor = color;
        }
        if (color == 'black') {
            selectedSquare.classList.add('ship');
        }
    }
  };
};

function findLastDigit (squareHover) {
  let lastDigit = String(squareHover).slice(-1);
  return lastDigit = parseInt(lastDigit);
};

const changePlayerTurnHeading = (switchPlayerTurn=false) => {
  let playerTurnHeading = document.querySelector('#playerTurnHeading');
  if (playerTurn === 'player1' && switchPlayerTurn === true) {
    playerTurn = 'player2';
    return playerTurnHeading.textContent = 'Player 2 Turn';
  } else if (playerTurn === 'player1' && switchPlayerTurn === false) {
    return playerTurnHeading.textContent = 'Player 1 Turn';
  } else if (playerTurn === 'player2' && switchPlayerTurn === true) {
    playerTurn = 'player1';
    return playerTurnHeading.textContent = 'Player 1 Turn';
  } else if (playerTurn === 'player2' && switchPlayerTurn === false) {
    return playerTurnHeading.textContent = 'Player 2 Turn';
  } 
};

function findSquareHover (event) {
  if (playerTurn === 'player1' && event.target.hasAttribute('data')) {
    return parseInt(event.target.getAttribute('data'));
  } else if (playerTurn === 'player1' && event.target.hasAttribute('data2')) {
    return parseInt(event.target.getAttribute('data2'));
  } else {
    return event;
  }
};

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
};

export { createAndPlaceShips, playerTurn, player1Ships,
   player2Ships, finishedPlacingShips, findSquareHover, changePlayerTurnHeading, 
   randomIntFromInterval, findLastDigit }