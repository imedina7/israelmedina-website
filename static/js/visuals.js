const DRAW_BOUNDING_BOXES = false;

function findBoundingBoxes() {
  const titleElements = Array.from(document.getElementsByTagName('h1')[0].childNodes);
  const iconElements = Array.from(document.getElementsByTagName('i'));
  const boundingBoxes = [...titleElements, ...iconElements].filter(elem => elem.nodeName !== "#text").map(elem => {
    const {offsetParent, offsetWidth, offsetHeight, offsetTop, offsetLeft} = elem;
    const x = offsetParent.offsetLeft + offsetLeft;
    const y = offsetParent.offsetTop + offsetTop;
    const width = offsetWidth;
    const height = offsetHeight;
    const touch = () => {
      elem.classList.add('disabled');
    }
    return { x, y, width, height, touch };
  });

  return boundingBoxes;
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function normalize([x, y]) {
  const det = Math.sqrt(x*x + y*y);
  return [x / det, y / det];
}
function getRandomVel() {
  return normalize([
    Math.min(0.1, Math.random()) * 2 - 1,
    Math.random() * 2 - 1
  ]);
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
  const { clientWidth = 0, clientHeight = 0 } = document.documentElement;
  const { innerWidth = 0, innerHeight = 0 } = window;

  const vw = Math.max(clientWidth, innerWidth);
  const vh = Math.max(clientHeight, innerHeight);

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
    ballSpeed: 5.4,
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
    gameState.paddlePosition =
      Math.max(0, Math.min(newPos, viewportWidth - gameState.paddleWidth));
  }

  function drawPaddle(ctx) {
    const [viewportWidth, viewportHeight] = getViewportDimensions();
    ctx.fillRect(
      gameState.paddlePosition,
      viewportHeight - gameState.paddleHeight,
      gameState.paddleWidth,
      gameState.paddleHeight
    );
  }

  function updateBall(gameover){
    const { paddleHeight,
            ballRadius,
            ballSpeed,
            paddlePosition,
            paddleWidth,
            ballPosition,
            ballVelocity } = gameState;

    const [x, y] = ballPosition;
    const [vx, vy] = ballVelocity;

    const paddleStart = paddlePosition;
    const paddleEnd = paddlePosition + paddleWidth;

    const newXPos = x + vx * ballSpeed;
    const newYPos = y + vy * ballSpeed;

    if((newXPos > paddleEnd ||
        newXPos < paddleStart)
      && newYPos + ballRadius > vh - paddleHeight) {
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

  function initBricks() {
    gameState.bricks = findBoundingBoxes();
  }

  function updateBricks() {
    const {ballPosition, bricks} = gameState;
    gameState.bricks = bricks.map(brick => {
      if (ballPosition[0] > brick.x && ballPosition[0] < brick.x + brick.width && ballPosition[1] > brick.y && ballPosition[1] < brick.y + brick.height){
        brick.touch();
      }
      return brick;
    })
  }

  document.addEventListener('mousemove', updatePaddle);
  document.addEventListener('touchmove', updatePaddle);

  let frameReq;
  function gameLoop(){
    let isRunning = true;
    clearCanvas(context);

    if(DRAW_BOUNDING_BOXES) {
      context.fillStyle = "rgba(0,0,0,0.5)";
      gameState.bricks.forEach(brick => {
        context.strokeRect(brick.x, brick.y, brick.width, brick.height);
      })
    }

    context.fillStyle = "black";
    drawPaddle(context);
    drawBall(context);
    updateBricks();
    updateBall(() => {
      const [viewportWidth, viewportHeight] = getViewportDimensions();
      context.font = "16px serif";
      context.fillStyle = "white";
      context.fillText("Game Over", gameState.paddlePosition + 3, viewportHeight - 2);

      cancelAnimationFrame(frameReq);
      isRunning = false;
      setTimeout(() => {
        runGame(context)
      }, 2000)
      return;
    });

    if(isRunning){
      frameReq = requestAnimationFrame(gameLoop);
    }
  }
  initBricks();
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
  let gameStarted = false;

  function loadGame() {
    if(!gameStarted){
      const context = getCanvasContext();
      runGame(context);
      gameStarted = true;
    }
  }

  document.body.addEventListener('dblclick', loadGame);
})();
