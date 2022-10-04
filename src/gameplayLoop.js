import { axisBtn, gameBoardEnemy, gameBoardMain, setupGame, startGame, startingScreen } from "./dom";
import { player1Ships, player2Ships, finishedPlacingShips, 
    playerTurn, findSquareHover, changePlayerTurnHeading, 
    randomIntFromInterval, findLastDigit } from "./ship"

let player1Shots = [];
let player2Shots = [];

const gameplayLoop = async () => {

    const waitUntil = (condition) => {
        return new Promise((resolve) => {
            let interval = setInterval(() => {
                if (!condition()) {
                    return
                }
                clearInterval(interval)
                resolve()
            }, 100)
        })
    };
    await waitUntil(() => finishedPlacingShips);
};

// Helper Functions
const checkForHit = (event) => {
    let shotPosition;
    if (playerTurn === 'player1') {
        shotPosition = findSquareHover(event);
    } else if (playerTurn === 'player2') {
        shotPosition = event;
    }
    let playerShots = whoShotYa(); 
    let enemyShips = findEnemyShips();
    if (!playerShots.includes(shotPosition))  {
        addPlayerShotToArr(shotPosition);
        for (let i=0; i < enemyShips.length; i++) {
            if (enemyShips[i].position.includes(shotPosition)) {
                enemyShips[i].hit.push(shotPosition);
                enemyShips[i].hit.sort();
                if (isShipSunk(enemyShips[i].hit, enemyShips[i].position) && enemyShips[i].sunk === false) {
                    enemyShips[i].sunk = true;
                    changeColorSunkShip(enemyShips[i].position, playerTurn);
                     if (allShipsSunk(enemyShips)) {
                        declareWinner();
                     }
                }
            }
        }
        markHitOnBoard(shotPosition, enemyShips, event);
        if (!allShipsSunk(enemyShips)) {   
            changePlayerTurnHeading(true);
            if (playerTurn === 'player2') {
                setTimeout(() => {
                    cpuShot();
                }, 1000);
            }
        }
    }
};

function checkForHitShips (enemyShips) {
    for (let i=0; i < enemyShips.length; i++) {
        if (enemyShips[i].hit.length !== 0 && enemyShips[i].sunk === false) {
            return i;
        }
    }
    return false;
};

const changeColorSunkShip = (shipPositionArr, playerTurn) => {
    for (let i=0; i<shipPositionArr.length; i++) {
        let selectedSquare = convertNumberToDomSquare(shipPositionArr[i], playerTurn);
        selectedSquare.textContent = 'X';
        selectedSquare.style.color = '#8b0000';
    }
}

const markHitOnBoard = (shotPosition, enemyShips, event) => {
    let selectedSquare;
    if (playerTurn === 'player1') {
        selectedSquare = event.target;
    } else {
        selectedSquare = convertNumberToDomSquare(event, playerTurn);
    }
    for (let i=0; i < enemyShips.length; i++) {
        if (enemyShips[i].position.includes(shotPosition)) {
            return selectedSquare.textContent = 'X';
        }
    }
    return selectedSquare.textContent = 'O';
};

let allShipsSunk = (enemyShips) =>{ 
    let counter = 0;
    for (let i=0; i < enemyShips.length; i++) {
        if (enemyShips[i].sunk === true) {
            counter++;
        }
    }
    // Check if all ships are sunk and print out winner
    if (counter === 5) {
        return true;       
    } else {
        return false;
    }
};

const declareWinner = () => {
    let winner = document.querySelector('#winner');
    if (playerTurn === 'player1') {
        winner.textContent = 'Player 1!!!';
        return newGameModal.style.display = "flex";
    } else if (playerTurn === 'player2') {
        winner.textContent = 'Player 2!!!';
        return newGameModal.style.display = "flex";
    }
};

let isShipSunk = (shotsArr, shipPositionArr) => shipPositionArr.every(e => shotsArr.includes(e));

const findEnemyShips = () => {
    if (playerTurn === 'player1') {
        return player2Ships;
    } else {
        return player1Ships;
    }
};

const addPlayerShotToArr = (shotPosition) => {
    let playerShots = whoShotYa();
    return playerShots.push(shotPosition);
};

const whoShotYa = () => {
    if (playerTurn === 'player1') {
        return player1Shots;
    } else {
        return player2Shots;
    }
};

const convertNumberToDomSquare = (dataIndex, playerTurn) => {
    let stringCounter = "'" + dataIndex.toString() + "'";
    if (playerTurn === 'player1') {
        return document.querySelector(`[data2=${stringCounter}]`)
    } else {
        return document.querySelector(`[data=${stringCounter}]`);
    }
};

// CPU Opponent 
// CPU randomly picks spots until it finds a ship
// CPU will only pick spots where there is room for player1's smallest afloat ship
// Randomly picks spots around the ship until it finds another
// Then it chooses one of the two spots in line with the two hits
const cpuShot = () => {
    let selectedSquare = randomIntFromInterval(1, 100);
    if (checkForHitShips(player1Ships) === false) {  // Check to see if there are any partially hit ships
        while(player2Shots.includes(selectedSquare) || typeof(selectedSquare) !== 'number' || 
        !(roomForVertShipCPU(selectedSquare) || roomForHorzShipCPU(selectedSquare)) ) {
            selectedSquare = randomIntFromInterval(1, 100);
        }
    } else {
        let enemyShipIndex = checkForHitShips(player1Ships);
        if (player1Ships[enemyShipIndex].hit.length === 1) {
            // If ship has only been hit once, randomly pick a square next to it
            selectedSquare = shootShipHitOnce(enemyShipIndex);
        } else {
            // If ship has been hit multiple times, pick a square in line with the other hits
            selectedSquare = shootShipHitMultipleTimes(enemyShipIndex);
        }
    }
    checkForHit(selectedSquare);
};

// CPU action if ship has only been hit once
const shootShipHitOnce = (enemyShipIndex) => {
    let direction;
    let spotHit = player1Ships[enemyShipIndex].hit[0];
    if (allSurroundingSpotsFree(spotHit)) {
        direction = randomIntFromInterval(1, 4)
            if (direction === 1) {
                // Pick spot North of hit ship
                return spotHit - 10;
            } else if (direction === 2) {
                // Pick spot South of hit ship
                return spotHit + 10;
            } else if (direction === 3) {
                // Pick spot east of hit ship
                return spotHit + 1;
            } else if (direction === 4) {
                // Pick spot west of hit ship
                return spotHit - 1;
            } else {
                return true
            }
    } else {
        if (((spotHit - 10) > 0) && !player2Shots.includes(spotHit - 10)) {
            // Pick spot North of hit ship
            return spotHit - 10;
        } else if ((spotHit + 10) < 101 && !player2Shots.includes(spotHit + 10)) {
            // Pick spot South of hit ship
            return spotHit + 10;
        } else if (findLastDigit(spotHit) !== 0 && !player2Shots.includes(spotHit + 1)) {
            // Pick spot east of hit ship
            return spotHit + 1;
        } else if ((findLastDigit(spotHit) !== 1 && !player2Shots.includes(spotHit - 1))) {
            // Pick spot west of hit ship
            return spotHit - 1;
        }
    }
};

// CPU action if ship is shot multiple times
const shootShipHitMultipleTimes = (enemyShipIndex) => {
    let firstSpotHit = player1Ships[enemyShipIndex].hit[0];
    let lastSpotHit = player1Ships[enemyShipIndex].hit[player1Ships[enemyShipIndex].hit.length - 1];
    if ( (lastSpotHit - firstSpotHit) > 9 ) {        // Check if ship is vertical
        // If both North and South squares are free, randomly pick one
        if (northAndSouthSpotsFree(firstSpotHit, lastSpotHit)) {
            if (randomIntFromInterval(1, 2) === 1)  {
                return firstSpotHit - 10;
            } else if (!player2Shots.includes(lastSpotHit + 10)) {
                return lastSpotHit + 10;
            }
        } else if ((firstSpotHit - 10) > 0 && !player2Shots.includes(firstSpotHit - 10)) {
            // Only the North square is free
            return firstSpotHit - 10;
        } else if ((lastSpotHit + 10) <= 100  && !player2Shots.includes(lastSpotHit + 10)) {
            // Only the South square is free
            return lastSpotHit + 10;
        }
    } else if ( (lastSpotHit - firstSpotHit) < 9 ) {    // Check if ship is horizontal
        // If both East and West squares are free, randomly pick one
        if (checkEastAndWestSpotsFree(firstSpotHit, lastSpotHit)) {
            if (randomIntFromInterval(1, 2) === 1 && !player2Shots.includes(firstSpotHit - 1)) {
                return firstSpotHit - 1;
            } else if (!player2Shots.includes(lastSpotHit + 1)) {
                return lastSpotHit + 1;
            }
        } else if (findLastDigit(firstSpotHit) !== 1 && !player2Shots.includes(firstSpotHit - 1)) {
            // Only the West square is free
            return firstSpotHit - 1;
        } else if (!player2Shots.includes(lastSpotHit + 1)) {
            // Only the East square is free
            return lastSpotHit + 1;
        }
    }
};

// Check to see if there's room for player1's smallest afloat ship on horz axis
const roomForHorzShipCPU = (shotPosition) => {
    let minShipSize = findSmallestShipSize(player1Ships);
    let index = 0; 
    for (let i=1; i<minShipSize; i++) {    //Check to the right of the shotPosition
        // If not enough room right, check where it stops
        if (player2Shots.includes(shotPosition + i) || findLastDigit(shotPosition + i) === 1) {
            index = minShipSize - i;
        }
    }
    if (index === 0) {
        return true;
    } else {   
        for (let i=(index); i>0; i--) {   // Check to the left of the shotPosition
            if (player2Shots.includes(shotPosition - i) || (findLastDigit(shotPosition - i) === 0)) {
                return false
            }
        }
    }
    return true;
}

// Check to see if there's room for player1's smallest afloat ship on vert axis
const roomForVertShipCPU = (shotPosition) => {
    let minShipSize = findSmallestShipSize(player1Ships);
    let index = 0; 
    for (let i=10; i<(minShipSize*10); i+=10) {    //Check below the shotPosition
        // If not enough room below, check where it stops
        if (player2Shots.includes(shotPosition + i) || (shotPosition + i) > 100) {
            index = (minShipSize * 10) - i;
        }
    }
    if (index === 0) {
        return true;
    } else {   
        for (let i=(index); i>0; i-=10) {   // Check above the shotPosition
            if (player2Shots.includes(shotPosition - i) || (shotPosition + i) > 0) {
                return false
            }
        }
    }
    return true;
}

const northAndSouthSpotsFree = (firstSpotHit, lastSpotHit) => {
    if ((firstSpotHit - 10) > 0 && (lastSpotHit + 10) <= 100  && !player2Shots.includes(firstSpotHit - 10)
    && !player2Shots.includes(lastSpotHit + 10)) {
        return true;
    } else {
        return false;
    }
};

const checkEastAndWestSpotsFree = (firstSpotHit, lastSpotHit) => {
    if ((findLastDigit(firstSpotHit) !== 1) && (findLastDigit(lastSpotHit) !== 0) && 
    !player2Shots.includes(firstSpotHit - 1) && !player2Shots.includes(lastSpotHit + 1)) {
        return true;
    } else {
        return false;
    }
};

const allSurroundingSpotsFree = (spotHit) => {
    // Check to see if all spots around chosen spot aren't in player2Shots array or if they are inside the gameboard
    if (((spotHit - 10) > 0) && ((spotHit + 10) <= 100) && (findLastDigit(spotHit) !== 0) 
    && (findLastDigit(spotHit) !== 1) && !player2Shots.includes(spotHit + 10) && !player2Shots.includes(spotHit - 10)
    && !player2Shots.includes(spotHit + 1) && !player2Shots.includes(spotHit - 1)) {
        return true;
    } else {
        return false
    }
};

const findSmallestShipSize = (enemyShips) => {
    for (let i=4; i>=0; i--) {
        if (enemyShips[i].sunk === false) {
            return enemyShips[i].shipSize;
        }
    }
};

// New Game Modal
const playAgainBtn = document.getElementById("playAgainBtn");
const startingScreenBtn = document.getElementById("startingScreenBtn");

startingScreenBtn.addEventListener('click', () => {
    // Reset to title screen
    resetGame();
    let gameContainer = document.querySelector('#gameContainer');
    gameContainer.style.display = 'none';
    startGame.removeEventListener('click',  function () { setupGame(); });
    startingScreen.style.display = 'block';
})

playAgainBtn.addEventListener('click', () => {
    resetGame();
    setupGame();
})

const resetGame = () => {
    resetDisplayToPlaceShips();
    resetPlayershots();
    resetShips();
}

// Remove gameboards and display axis btn
const resetDisplayToPlaceShips = () => {
    gameBoardMain.removeEventListener('click', function (event) {
        if (player1Ships[4].position === null) {
          placeAllShips(event, findPlayerShips())
        }
    })
    gameBoardEnemy.innerHTML = "";
    gameBoardMain.innerHTML = "";
    gameBoardEnemy.style.display = "none";
    newGameModal.style.display = "none";
    axisBtn.style.display = "block";
}

const resetPlayershots = () => {
    player1Shots = [];
    player2Shots = [];
}

const resetShips = () => {
    for (let i=0; i<player1Ships.length; i++) {
        player1Ships[i].position = null;
        player1Ships[i].sunk = false;
        player1Ships[i].hit = [];
        player2Ships[i].position = null;
        player2Ships[i].sunk = false;
        player2Ships[i].hit = [];
    }
}

export { gameplayLoop, checkForHit }
