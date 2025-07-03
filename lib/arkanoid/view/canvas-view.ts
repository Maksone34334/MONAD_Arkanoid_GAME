import type { Brick } from "../sprites/Brick"
import type { Paddle } from "../sprites/Paddle"
import type { Ball } from "../sprites/Ball"

export class CanvasView {
  public canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D | null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.context = this.canvas.getContext("2d")
  }

  clear(): void {
    this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawSprite(sprite: Brick | Paddle | Ball): void {
    if (!sprite) return
    const img = sprite.image
    if (!img.complete || img.naturalWidth === 0) return
    this.context?.drawImage(img, sprite.pos.x, sprite.pos.y, sprite.width, sprite.height)
  }

  drawBricks(bricks: Brick[]): void {
    bricks.forEach((brick) => this.drawSprite(brick))
  }
}
