function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getViewportDimensions() {
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  return [vw,vh];
}

function getCanvasContext() {
  const canvasId = 'game-canvas';
  const canvas = document.getElementById(canvasId);
  if(canvas !== null) {
    return canvas.getContext('2d');
  }
  const [viewportWidth, viewportHeight] = getViewportDimensions();
  const canvasElem = document.createElement('canvas');
  canvasElem.setAttribute('width', viewportWidth);
  canvasElem.setAttribute('height', viewportHeight);
  canvasElem.setAttribute('id', canvasId);
  document.body.appendChild(canvasElem);

  const context = canvasElem.getContext('2d');
  return context;
}

function runGame(context){
  const [vw, vh] = getViewportDimensions();
  const gameState = {
    paddlePosition: 0,
    paddleWidth: 140,
    paddleHeight: 25,
    ballPosition: [vw / 2, vh / 2],
    ballVelocity: [0.2, -0.2],
    bricks: []
  }

  function updatePaddle({ clientX }) {
    gameState.paddlePosition = clientX - gameState.paddleWidth / 2;
  }

  function drawPaddle(ctx) {
    const [viewportWidth, viewportHeight] = getViewportDimensions();
    ctx.clearRect(0,viewportHeight - gameState.paddleHeight , viewportWidth, gameState.paddleHeight);
    ctx.fillRect(gameState.paddlePosition, viewportHeight - gameState.paddleHeight / 2, gameState.paddleWidth, gameState.paddleHeight);
  }

  function drawBall(ctx) {
    const ballRadius = 10;
    ctx.beginPath();
    ctx.arc(...gameState.ballPosition, ballRadius, 0, 2 * Math.PI);
    ctx.fill();
  }

  document.addEventListener('mousemove', updatePaddle);

  function gameLoop(){
    drawPaddle(context);
    drawBall(context);
    requestAnimationFrame(gameLoop);
  }
  gameLoop();
}

(function (){

  function loadGame() {
    const context = getCanvasContext();
    runGame(context);
  }

  document.body.addEventListener('dblclick', loadGame);
})();
