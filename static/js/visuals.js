function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function normalize([x, y]) {
  const det = Math.sqrt(x*x + y*y);
  return [x / det, y / det];
}
function getRandomVel() {
  return normalize([Math.random() * 2 - 1, Math.random() * 2 - 1]);
}

function dot([x1, y1], [x2, y2]){
  return x1 * x2 + y1 * y2;
}

function reflect(vector1, vector2) {
  const dot2 = 2 * dot(vector1, vector2);
  const [x1, y1] = vector1;
  const [x2, y2] = vector2;
  return [x1 - dot2 * x2, y1 - dot2 * y2]
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
    paddleHeight: 18,
    lockPaddle: false,
    ballPosition: [vw / 2, vh / 2],
    ballVelocity: getRandomVel(),
    ballSpeed: 3.2,
    ballRadius: 10,
    bricks: []
  }

  function clearCanvas(ctx) {
    ctx.clearRect(0,0, vw, vh);
  }

  function updatePaddle({ clientX, touchList }) {
    if(gameState.lockPaddle) return;
    let targetX = clientX;
    if(!clientX) targetX = touchList.item(0).clientX
    const [viewportWidth] = getViewportDimensions();
    const halfPaddle = gameState.paddleWidth / 2;
    const newPos = targetX - halfPaddle;
    gameState.paddlePosition = Math.max(0, Math.min(newPos, viewportWidth - gameState.paddleWidth));
  }

  function drawPaddle(ctx) {
    const [viewportWidth, viewportHeight] = getViewportDimensions();
    ctx.fillRect(gameState.paddlePosition, viewportHeight - gameState.paddleHeight, gameState.paddleWidth, gameState.paddleHeight);
  }

  function updateBall(gameover){
    const [x, y] = gameState.ballPosition;
    const [vx, vy] = gameState.ballVelocity;
    const {paddleHeight, ballRadius, ballSpeed, paddlePosition, paddleWidth} = gameState;
    const paddleStart = paddlePosition;
    const paddleEnd = paddlePosition + paddleWidth;
    const newXPos = x+vx * ballSpeed;
    const newYPos = y+vy * ballSpeed;
    if((newXPos + ballRadius > paddleEnd || newXPos - ballRadius < paddleStart) && newYPos + ballRadius > vh - paddleHeight) {
      gameover();
      return;
    }

    if(newXPos + ballRadius > vw || newXPos - ballRadius < 0) {
      gameState.ballVelocity = reflect(gameState.ballVelocity, [-1,0]);
    }
    if(newYPos + ballRadius > vh - paddleHeight
      || newYPos - ballRadius < 0) {
      gameState.ballVelocity = reflect(gameState.ballVelocity, [0,-1]);
    }
    const updatedX = x + gameState.ballVelocity[0] * ballSpeed;
    const updatedY = y + gameState.ballVelocity[1] * ballSpeed;
    gameState.ballPosition = [updatedX, updatedY];
  }

  function drawBall(ctx) {
    ctx.beginPath();
    ctx.arc(...gameState.ballPosition, gameState.ballRadius, 0, 2 * Math.PI);
    ctx.fill();
  }

  document.addEventListener('mousemove', updatePaddle);
  document.addEventListener('touchmove', updatePaddle);

  let frameReq;
  function gameLoop(){
    clearCanvas(context);
    updateBall(() => {
      cancelAnimationFrame(frameReq);
      console.log("Game Over");
      gameState.lockPaddle = true;
      setTimeout(() => {
        gameState.ballPosition = [vw / 2, vh / 2];
        gameState.ballVelocity = []
        gameState.lockPaddle = false;
      }, 2000)
    });
    drawPaddle(context);
    drawBall(context);
    frameReq = requestAnimationFrame(gameLoop);
  }
  gameLoop();
}

(function (){
  /* Based on this http://jsfiddle.net/brettwp/J4djY/*/
  function detectDoubleTapClosure() {
    let lastTap = 0;
    let timeout;
    return function detectDoubleTap(event) {
      const curTime = new Date().getTime();
      const tapLen = curTime - lastTap;
      if (tapLen < 500 && tapLen > 0) {
        loadGame();
        event.preventDefault();
      } else {
        timeout = setTimeout(() => {
          clearTimeout(timeout);
        }, 500);
      }
      lastTap = curTime;
    };
  }

  /* Regex test to determine if user is on mobile */
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      document.body.addEventListener('touchend', detectDoubleTapClosure(), { passive: false });
  }
  function loadGame() {
    const context = getCanvasContext();
    runGame(context);
  }

  document.body.addEventListener('dblclick', loadGame);
})();
