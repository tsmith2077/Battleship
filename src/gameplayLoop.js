// Mark hits on board should work. Haven't tested with cpu attacking yet.
// Get computer to attack

import { player1Ships, player2Ships, finishedPlacingShips, 
    playerTurn, findSquareHover, changePlayerTurnHeading } from "./ship"

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
    console.log(player2Ships)
};

// Helper Functions
const checkForHit = (event) => {
    let shotPosition = findSquareHover(event);
    let playerShots = whoShotYa(); 
    let enemyShips = findEnemyShips();
    if (!playerShots.includes(shotPosition))  {
        addPlayerShotToArr(shotPosition);
        for (let i=0; i < enemyShips.length; i++) {
            if (enemyShips[i].position.includes(shotPosition)) {
                if (isShipSunk(playerShots, enemyShips[i].position) && enemyShips[i].sunk === false) {
                    enemyShips[i].sunk = true;
                    allShipsSunk(findEnemyShips());
                }
            }
        }
    }
    markHitOnBoard(shotPosition, enemyShips, event);
};

const markHitOnBoard = (shotPosition, enemyShips, event) => {
    let selectedSqaure;
    if (playerTurn === 'player1') {
        selectedSqaure = event.target;
    } else {
        selectedSqaure = event;
    }
    console.log(selectedSqaure)
    for (let i=0; i < enemyShips.length; i++) {
        if (enemyShips[i].position.includes(shotPosition)) {
            selectedSqaure.textContent = 'X';
            return selectedSqaure.style.color = '#8b0000';
        }
    }
    return selectedSqaure.textContent = 'O';
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
        delcareWinner();        
    }
}

const delcareWinner = () => {
    let playerTurnHeading = document.querySelector('#playerTurnHeading');
    if (playerTurn === 'player1') {
      return playerTurnHeading.textContent = 'Player 1 Wins!!';
    } else if (playerTurn === 'player2') {
      return playerTurnHeading.textContent = 'Player 2 Wins!!'
    }
  }

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
}

export { gameplayLoop, checkForHit }