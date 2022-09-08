import './style.css';
import { createAndPlaceShips } from './ship.js';
import { gameplayLoop } from './gameplayLoop';

const battleshipGame = ( async () => {
  createAndPlaceShips();
  gameplayLoop();
})();
