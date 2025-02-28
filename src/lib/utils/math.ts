interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

export function normalize([x, y]: [number, number]): [number, number] {
  const det = Math.sqrt(x*x + y*y);
  return [x / det, y / det];
}

export function dot([x1, y1]: [number, number], [x2, y2]: [number, number]){
  return x1 * x2 + y1 * y2;
}

export function reflect(vector1: [number, number], vector2: [number, number]): [number, number] {
  const dot2 = 2 * dot(vector1, vector2);
  const [x1, y1] = vector1;
  const [x2, y2] = vector2;
  return [x1 - dot2 * x2, y1 - dot2 * y2]
}

export function isPointWithinRect(point: [number, number], rect: Bounds): boolean {
  return  point[0] > rect.x &&
          point[0] < rect.x + rect.width &&
          point[1] > rect.y &&
          point[1] < rect.y + rect.height
}

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomVel(): [number, number] {
  const directions: [number, number][] = [[-0.75,1], [0.5,-1], [-0.5,-1], [-0.6,1]]
  return normalize(directions[getRandomInt(0, directions.length - 1)]);
}