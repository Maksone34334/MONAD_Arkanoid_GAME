import { Brick } from "./sprites/Brick"
import { BRICK_IMAGES, LEVEL, STAGE_COLS, STAGE_PADDING, BRICK_PADDING, BRICK_ENERGY } from "./setup"

export function createBricks(canvas: HTMLCanvasElement): Brick[] {
  const BRICK_WIDTH = Math.floor((canvas.width - STAGE_PADDING * 2) / STAGE_COLS) - BRICK_PADDING
  const BRICK_HEIGHT = 20

  return LEVEL.reduce((ack, element, i) => {
    const row = Math.floor(i / STAGE_COLS)
    const col = i % STAGE_COLS

    const x = STAGE_PADDING + col * (BRICK_WIDTH + BRICK_PADDING)
    const y = STAGE_PADDING + row * (BRICK_HEIGHT + BRICK_PADDING)

    if (element === 0) return ack

    return [...ack, new Brick(BRICK_WIDTH, BRICK_HEIGHT, { x, y }, BRICK_ENERGY[element], BRICK_IMAGES[element])]
  }, [] as Brick[])
}
