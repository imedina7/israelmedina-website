export function getViewportDimensions() {
  const { clientWidth = 0, clientHeight = 0 } = document.documentElement;
  const { innerWidth = 0, innerHeight = 0 } = window;

  const vw = Math.max(clientWidth, innerWidth);
  const vh = Math.max(clientHeight, innerHeight);

  return [vw,vh];
}

/* Based on this http://jsfiddle.net/brettwp/J4djY/*/
export function detectDoubleTapClosure(callback: Function) {
  let lastTap = 0;
  let timeout: NodeJS.Timeout;
  return function detectDoubleTap(event: Event) {
    const curTime = new Date().getTime();
    const tapLen = curTime - lastTap;
    if (tapLen < 500 && tapLen > 0) {
      callback();
      event.preventDefault();
    } else {
      timeout = setTimeout(() => {
        clearTimeout(timeout);
      }, 500);
    }
    lastTap = curTime;
  };
}

export function isMobileBrowser() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function getCanvasContext(canvasId: string = 'canvas'): CanvasRenderingContext2D {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if(canvas !== null) {
    return canvas.getContext('2d') as CanvasRenderingContext2D;
  }
  const [viewportWidth, viewportHeight] = getViewportDimensions();
  const canvasElem = document.createElement('canvas');
  canvasElem.setAttribute('width', String(viewportWidth));
  canvasElem.setAttribute('height', String(viewportHeight));
  canvasElem.setAttribute('id', canvasId);
  document.body.appendChild(canvasElem);

  const context = canvasElem.getContext('2d') as CanvasRenderingContext2D;
  return context;
}