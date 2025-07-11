export const STAGE_PADDING = 10
export const STAGE_ROWS = 20
export const STAGE_COLS = 10
export const BRICK_PADDING = 5

export const PADDLE_WIDTH = 150
export const PADDLE_HEIGHT = 25
export const PADDLE_STARTX = 450
export const PADDLE_SPEED = 10
export const BALL_SPEED = 5
export const BALL_SIZE = 20

export const BRICK_IMAGES: { [key: number]: string } = {
  1: "/images/arkanoid/brick-red.png",
  2: "/images/arkanoid/brick-green.png",
  3: "/images/arkanoid/brick-yellow.png",
  4: "/images/arkanoid/brick-blue.png",
  5: "/images/arkanoid/brick-purple.png",
}

export const BRICK_ENERGY: { [key: number]: number } = {
  1: 1, // Red brick
  2: 1, // Green brick
  3: 2, // Yellow brick
  4: 2, // Blue brick
  5: 3, // Purple brick
}

// prettier-ignore
export const LEVEL = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3,
  0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 5, 5, 0, 0, 5, 5, 0, 0,
]
