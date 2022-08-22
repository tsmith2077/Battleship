// Game boards and container
const gameBoardCont = document.querySelector('#gameBoardCont');
const gameBoardMain = document.querySelector('#gameBoardMain');
const gameBoardEnemy = document.querySelector('#gameBoardEnemy');
// Starting Screen
const startingScreen = document.querySelector('#startingScreen');
const startGame = document.querySelector('#newGameBtn');
const axisBtn = document.querySelector('#axisBtn');

let player1Shots = [];
let player2Shots = [];

// EVENT LISTENERS
startGame.addEventListener('click', function (event) {
    setupGame(event);
});

// EVENT LISTENER FUNCTIONS
function setupGame () {
    let playerTurnHeading = document.querySelector('#playerTurnHeading');
    playerTurnHeading.textContent = 'Player 1 Turn';
    playerTurnHeading.style.display = 'flex';
    displayGameBoard(gameBoardMain, 'mainSquare');
    startingScreen.style.display = 'none';
    axisBtn.style.display = 'block';
};

// DOM
const displayGameBoard = ((gameBoardDiv, boardClass) => {
    // Loop through until 10x10 box grid is made.
    for (let i = 1; i < 101; i++) {
        let gameBoardSquare = document.createElement('div');
        gameBoardSquare.classList.add('gameBoardSquare', boardClass);
        if (boardClass == 'mainSquare') {
            gameBoardSquare.setAttribute('data', i);
        } else if (boardClass == 'enemySquare') {
            // gameBoardSquare.addEventListener('click', function () {checkForHit(event.currentTarget)});
            gameBoardSquare.setAttribute('data2', i);
        }
        gameBoardDiv.appendChild(gameBoardSquare);
    }
    if (boardClass == 'enemySquare') {
        gameBoardEnemy.style.display = 'grid';
    }
    return gameBoardDiv;
});


export { gameBoardEnemy, displayGameBoard }