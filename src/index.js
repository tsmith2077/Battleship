import './style.css';
import {createAndPlaceShips, playerTurn, player1Ships, player2Ships, finishedPlacingShips} from './ship.js';
import { gameplayLoop } from './gameplayLoop';

const battleshipGame = ( async () => {
  createAndPlaceShips();
  gameplayLoop();
})();



