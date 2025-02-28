import {
  detectDoubleTapClosure,
  isMobileBrowser,
  getCanvasContext,
  getViewportDimensions,
} from "./lib/utils/browser";
import { getRandomVel, isPointWithinRect, reflect } from "./lib/utils/math";

const DRAW_BOUNDING_BOXES = false;

type Brick = {
  x: number;
  y: number;
  width: number;
  height: number;
  isHit: boolean;
  touch: Function;
};

type State = {
  paddlePosition: number;
  paddleWidth: number;
  paddleHeight: number;
  lockPaddle: boolean;
  ballPosition: [number, number];
  ballVelocity: [number, number];
  ballSpeed: number;
  ballRadius: number;
  bricks: Brick[];
};

type Style = {
  fill: CanvasGradient | CanvasPattern | string
  stroke: CanvasGradient | CanvasPattern | string
}

function createStyles(ctx: CanvasRenderingContext2D, gameState: State): {paddleStyle: Style, ballStyle: Style} {
  const [_, viewportHeight] = getViewportDimensions();
  const ballStyle = {
    fill: ctx.createRadialGradient(
      gameState.ballPosition[0] - 2,
      gameState.ballPosition[1] - 3,
      2,
      gameState.ballPosition[0],
      gameState.ballPosition[1],
      gameState.ballRadius
    ),
    stroke: "transparent",
  };
  const paddleStyle = {
    // fill: ctx.createLinearGradient(
    //   0,
    //   gameState.paddleHeight,
    //   0,
    //   viewportHeight - gameState.paddleHeight
    // ),
    fill: ctx.createLinearGradient(
      0,
      viewportHeight - gameState.paddleHeight,
      0,
      viewportHeight
    ),
    stroke: ctx.createLinearGradient(
      0,
      viewportHeight - gameState.paddleHeight,
      0,
      viewportHeight - gameState.paddleHeight + 5
    ),
  };

  paddleStyle.fill.addColorStop(0.0, "#727273");
  paddleStyle.fill.addColorStop(0.06, "#E0E0E0");
  paddleStyle.fill.addColorStop(0.1, "#5F5F61");
  paddleStyle.fill.addColorStop(1.0, "#252528");
  paddleStyle.stroke.addColorStop(0.0, "#5F5F61");
  paddleStyle.stroke.addColorStop(1.0, "#252528");
  ballStyle.fill.addColorStop(0.0, "#E0E0E0");
  ballStyle.fill.addColorStop(0.03, "#ABABAB");
  ballStyle.fill.addColorStop(1.0, "#252528");
  return {
    ballStyle,
    paddleStyle,
  };
}

function runGame(context: CanvasRenderingContext2D) {
  const [initialVw, initialVh] = getViewportDimensions();
  const gameState: State = {
    paddlePosition: 0,
    paddleWidth: 140,
    paddleHeight: 18,
    lockPaddle: false,
    ballPosition: [initialVw / 2, initialVh / 3],
    ballVelocity: getRandomVel(),
    ballSpeed: 5.4,
    ballRadius: 10,
    bricks: [],
  };

  function clearCanvas(ctx: CanvasRenderingContext2D) {
    const [vw, vh] = getViewportDimensions();
    ctx.clearRect(0, 0, vw, vh);
  }

  function updatePaddle({ clientX, touchList }: any) {
    if (gameState.lockPaddle) return;
    let targetX = clientX;
    if (!clientX) targetX = touchList.item(0).clientX;
    const [viewportWidth] = getViewportDimensions();
    const halfPaddle = gameState.paddleWidth / 2;
    const newPos = targetX - halfPaddle;
    gameState.paddlePosition = Math.max(
      0,
      Math.min(newPos, viewportWidth - gameState.paddleWidth)
    );
  }

  function drawPaddle(ctx: CanvasRenderingContext2D, style: Style) {
    const [viewportWidth, viewportHeight] = getViewportDimensions();
    ctx.fillStyle = style.fill;
    ctx.strokeStyle = style.stroke
    ctx.beginPath();
    ctx.roundRect(
      gameState.paddlePosition,
      viewportHeight - gameState.paddleHeight,
      gameState.paddleWidth,
      gameState.paddleHeight,
      2
    );
    ctx.fill()
    ctx.stroke()
  }

  function updateBall(gameover: Function) {
    const [viewportWidth, viewportHeight] = getViewportDimensions();
    const {
      paddleHeight,
      ballRadius,
      ballSpeed,
      paddlePosition,
      paddleWidth,
      ballPosition,
      ballVelocity,
    } = gameState;

    const [x, y] = ballPosition;
    const [vx, vy] = ballVelocity;

    const paddleStart = paddlePosition;
    const paddleEnd = paddlePosition + paddleWidth;

    const newXPos = x + vx * ballSpeed;
    const newYPos = y + vy * ballSpeed;

    if (
      (newXPos > paddleEnd || newXPos < paddleStart) &&
      newYPos + ballRadius > viewportHeight - paddleHeight
    ) {
      gameover();
      return;
    }

    if (newXPos + ballRadius > viewportWidth || newXPos - ballRadius < 0) {
      gameState.ballVelocity = reflect(gameState.ballVelocity, [-1, 0]);
    }
    if (newYPos + ballRadius > viewportHeight - paddleHeight || newYPos - ballRadius < 0) {
      gameState.ballVelocity = reflect(gameState.ballVelocity, [0, -1]);
    }
    const updatedX = x + gameState.ballVelocity[0] * ballSpeed;
    const updatedY = y + gameState.ballVelocity[1] * ballSpeed;
    gameState.ballPosition = [updatedX, updatedY];
  }

  function drawBall(ctx: CanvasRenderingContext2D, style: Style) {
    ctx.fillStyle = style.fill
    ctx.beginPath();
    ctx.arc(...gameState.ballPosition, gameState.ballRadius, 0, 2 * Math.PI);
    ctx.fill();
  }

  function initBricks() {
    gameState.bricks = findBoundingBoxes();
  }

  function updateBricks() {
    const { ballPosition, bricks } = gameState;
    gameState.bricks = bricks.map((brick) => {
      if (isPointWithinRect(ballPosition, brick)) {
        brick.touch();
        brick.isHit = true;
      }
      return brick;
    });
  }

  document.addEventListener("mousemove", updatePaddle);
  document.addEventListener("touchmove", updatePaddle);

  let frameReq: number;

  function gameLoop() {
    let isRunning = true;
    clearCanvas(context);

    if (DRAW_BOUNDING_BOXES) {
      context.fillStyle = "rgba(0,0,0,0.5)";
      gameState.bricks.forEach((brick) => {
        context.strokeRect(brick.x, brick.y, brick.width, brick.height);
      });
    }

    const onGameOver = () => {
      const [viewportWidth, viewportHeight] = getViewportDimensions();
      context.font = "16px serif";
      context.fillStyle = "white";
      context.fillText(
        "Game Over",
        gameState.paddlePosition + 3,
        viewportHeight - 2
      );

      cancelAnimationFrame(frameReq);
      isRunning = false;
      setTimeout(() => {
        runGame(context);
      }, 2000);
      return;
    };

    const styles = createStyles(context, gameState)
    drawPaddle(context, styles.paddleStyle);
    drawBall(context, styles.ballStyle);
    updateBricks();
    updateBall(onGameOver);

    if (isRunning) {
      frameReq = requestAnimationFrame(gameLoop);
    }
  }
  initBricks();
  gameLoop();
}

function findBoundingBoxes(): Brick[] {
  const titleElements = Array.from(
    document.getElementsByTagName("h1")[0].childNodes
  );
  const iconElements = Array.from(document.getElementsByTagName("i"));
  const boundingBoxes = [...titleElements, ...iconElements]
    .filter((elem) => elem.nodeName !== "#text")
    .map((elem) => {
      const { offsetParent, offsetWidth, offsetHeight, offsetTop, offsetLeft } =
        elem as HTMLDivElement;

      const {
        offsetLeft: parentOffsetLeft = 0,
        offsetTop: parentOffsetTop = 0,
      } = offsetParent as HTMLDivElement;

      const x = parentOffsetLeft + offsetLeft;
      const y = parentOffsetTop + offsetTop;
      const width = offsetWidth;
      const height = offsetHeight;
      const touch = () => {
        (elem as HTMLDivElement).classList.add("disabled");
      };
      return { x, y, width, height, touch, isHit: false };
    });

  return boundingBoxes;
}

export default function setupGame() {
  let gameStarted = false;

  function loadGame() {
    if (!gameStarted) {
      const context = getCanvasContext("game-canvas");
      runGame(context);
      gameStarted = true;
      console.log("game started");
    }
  }

  if (isMobileBrowser()) {
    document.body.addEventListener(
      "touchend",
      detectDoubleTapClosure(loadGame),
      { passive: false }
    );
    return;
  }
  document.body.addEventListener("dblclick", loadGame);
}
