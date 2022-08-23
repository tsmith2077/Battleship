// Computer can attack, make it smarter

import { player1Ships, player2Ships, finishedPlacingShips, 
    playerTurn, findSquareHover, changePlayerTurnHeading, randomIntFromInterval } from "./ship"

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
                if (isShipSunk(enemyShips[i].hit, enemyShips[i].position) && enemyShips[i].sunk === false) {
                    enemyShips[i].sunk = true;
                    allShipsSunk(findEnemyShips());
                }
            }
        }
    }
    markHitOnBoard(shotPosition, enemyShips, event);
    if (playerTurn === 'player1') {
        setTimeout(() => {
            changePlayerTurnHeading(true);
            cpuShot();
        }, 1000);
    }
};


// Computer Attack

// Make cpu shoot, then make it smarter
const cpuShot = () => {
    let selectedSqaure = randomIntFromInterval(1, 100);
    checkForHit(selectedSqaure);
    changePlayerTurnHeading(true);
}

const convertNumberToDomSquare = (number) => {
    let stringCounter = "'" + number.toString() + "'";
    return document.querySelector(`[data=${stringCounter}]`);
}



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