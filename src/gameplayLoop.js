// ERROR User can keep clicking on same spot and then the computer takes its turn
// TODO make it so CPU doesn't pick a spot that doesn't make sense with the ships left ex pick a spot in the corner with no open spots around it

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
                     if (allShipsSunk(enemyShips)) {
                        declareWinner();
                     }
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
};


// Computer
// CPU randomly picks spots until it finds a ship
// Randomly picks spots around the ship until it finds another
// Then it chooses one of the two spots in line with the two hits
const cpuShot = () => {
    let selectedSquare;
    if (checkForHitShips(player1Ships) === false) {
        while(player2Shots.includes(selectedSquare) || typeof(selectedSquare) !== 'number') {
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
}


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
        } else if ((lastSpotHit + 10) < 101  && !player2Shots.includes(lastSpotHit + 10)) {
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

const allSurroundingSpotsFree = (spotHit) => {
    // Check to see if all spots around chosen spot aren't in player2Shots array or if they are inside the gameboard
    if (((spotHit - 10) > 0) && ((spotHit + 10) < 101) && (findLastDigit(spotHit) !== 0) 
    && (findLastDigit(spotHit) !== 1) && !player2Shots.includes(spotHit + 10) && !player2Shots.includes(spotHit - 10)
    && !player2Shots.includes(spotHit + 1) && !player2Shots.includes(spotHit - 1)) {
        return true;
    } else {
        return false
    }
};

const northAndSouthSpotsFree = (firstSpotHit, lastSpotHit) => {
    if ((firstSpotHit - 10) > 0 && (lastSpotHit + 10) < 101  && !player2Shots.includes(firstSpotHit - 10)
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

function checkForHitShips (enemyShips) {
    for (let i=0; i < enemyShips.length; i++) {
        if (enemyShips[i].hit.length !== 0 && enemyShips[i].sunk === false) {
            return i;
        }
    }
    return false;
};

const convertNumberToDomSquare = (dataIndex) => {
    let stringCounter = "'" + dataIndex.toString() + "'";
    return document.querySelector(`[data=${stringCounter}]`);
};

const markHitOnBoard = (shotPosition, enemyShips, event) => {
    let selectedSquare;
    if (playerTurn === 'player1') {
        selectedSquare = event.target;
    } else {
        selectedSquare = convertNumberToDomSquare(event);
    }
    for (let i=0; i < enemyShips.length; i++) {
        if (enemyShips[i].position.includes(shotPosition)) {
            selectedSquare.textContent = 'X';
            return selectedSquare.style.color = '#8b0000';
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
    let playerTurnHeading = document.querySelector('#playerTurnHeading');
    if (playerTurn === 'player1') {
      return playerTurnHeading.textContent = 'Player 1 Wins!!';
    } else if (playerTurn === 'player2') {
      return playerTurnHeading.textContent = 'Player 2 Wins!!'
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

export { gameplayLoop, checkForHit }