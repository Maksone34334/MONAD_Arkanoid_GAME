import { CanvasView } from './view/CanvasView';
import { Ball } from './sprites/Ball';
import { Brick } from './sprites/Brick';
import { Paddle } from './sprites/Paddle';
import { Collision } from './Collison';
// Images
import PADDLE_IMAGE from './images/paddle.png';
import BALL_IMAGE from './images/ball.png';
// Level and colors
import {
  PADDLE_SPEED,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_STARTX,
  BALL_SPEED,
  BALL_SIZE,
  BALL_STARTX,
  BALL_STARTY
} from './setup';
// Helpers
import { createBricks } from './helpers';
// Leaderboard
import { submitScoreToLeaderboard } from './leaderboard';

let gameOver = false;
let score = 0;

async function setGameOver(view: CanvasView) {
  view.drawInfo('Game Over!');
  
  // Submit score to leaderboard
  if (score > 0) {
    view.drawInfo('Game Over! Submitting score...');
    const success = await submitScoreToLeaderboard(score);
    if (success) {
      view.drawInfo('Game Over! Score submitted!');
    } else {
      view.drawInfo('Game Over! Failed to submit score.');
    }
  } else {
    view.drawInfo('Game Over!');
  }
  
  gameOver = false;
}

async function setGameWin(view: CanvasView) {
  view.drawInfo('Game Won!');
  
  // Submit score to leaderboard
  if (score > 0) {
    view.drawInfo('Game Won! Submitting score...');
    const success = await submitScoreToLeaderboard(score);
    if (success) {
      view.drawInfo('Game Won! Score submitted!');
    } else {
      view.drawInfo('Game Won! Failed to submit score.');
    }
  } else {
    view.drawInfo('Game Won!');
  }
  
  gameOver = false;
}

function gameLoop(
  view: CanvasView,
  bricks: Brick[],
  paddle: Paddle,
  ball: Ball,
  collision: Collision
) {
  console.log('draw!');
  view.clear();
  view.drawBricks(bricks);
  view.drawSprite(paddle);
  view.drawSprite(ball);
  // Move Ball
  ball.moveBall();

  // Move paddle and check so it won't exit the playfield
  if (
    (paddle.isMovingLeft && paddle.pos.x > 0) ||
    (paddle.isMovingRight && paddle.pos.x < view.canvas.width - paddle.width)
  ) {
    paddle.movePaddle();
  }

  collision.checkBallCollision(ball, paddle, view);
  const collidingBrick = collision.isCollidingBricks(ball, bricks);

  if (collidingBrick) {
    score += 1;
    view.drawScore(score);
  }

  // Game Over when ball leaves playField
  if (ball.pos.y > view.canvas.height) gameOver = true;
  // If game won, set gameOver and display win
  if (bricks.length === 0) {
    gameOver = true;
    setGameWin(view);
    return;
  }
  // Return if gameover and don't run the requestAnimationFrame
  if (gameOver) {
    setGameOver(view);
    return;
  }

  requestAnimationFrame(() => gameLoop(view, bricks, paddle, ball, collision));
}

function startGame(view: CanvasView) {
  // Reset displays
  score = 0;
  view.drawInfo('');
  view.drawScore(0);
  // Create a collision instance
  const collision = new Collision();
  // Create all bricks
  const bricks = createBricks();
  // Create a Ball
  const ball = new Ball(
    BALL_SPEED,
    BALL_SIZE,
    { x: BALL_STARTX, y: BALL_STARTY },
    BALL_IMAGE
  );
  // Create a Paddle
  const paddle = new Paddle(
    PADDLE_SPEED,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    {
      x: PADDLE_STARTX,
      y: view.canvas.height - PADDLE_HEIGHT - 5
    },
    PADDLE_IMAGE
  );

  gameLoop(view, bricks, paddle, ball, collision);
}

// Create a new view
const view = new CanvasView('#playField');
view.initStartButton(startGame);

// Leaderboard functionality
import { getTopScores } from './leaderboard';

// Connect wallet button functionality
const connectWalletButton = document.getElementById('connect-wallet');
if (connectWalletButton) {
  connectWalletButton.addEventListener('click', async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Update button text
        connectWalletButton.textContent = 'Wallet Connected';
        
        // Load leaderboard data
        await updateLeaderboard();
      } else {
        alert('Ethereum wallet not found. Please install MetaMask or another wallet.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  });
}

// Function to update the leaderboard display
async function updateLeaderboard() {
  const leaderboardContent = document.getElementById('leaderboard-content');
  if (!leaderboardContent) return;
  
  try {
    const scores = await getTopScores(10);
    
    if (scores.length === 0) {
      leaderboardContent.innerHTML = '<p>No scores available yet.</p>';
      return;
    }
    
    // Create table for scores
    let tableHTML = `
      <table>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Score</th>
        </tr>
    `;
    
    // Add each score to the table
    scores.forEach((score, index) => {
      // Truncate the address for display
      const shortAddress = score.address.substring(0, 6) + '...' + score.address.substring(score.address.length - 4);
      
      tableHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${shortAddress}</td>
          <td>${score.score}</td>
        </tr>
      `;
    });
    
    tableHTML += '</table>';
    leaderboardContent.innerHTML = tableHTML;
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    leaderboardContent.innerHTML = '<p>Failed to load leaderboard data.</p>';
  }
}
