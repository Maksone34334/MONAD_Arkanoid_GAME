import type { Brick } from "../model/Brick"
import type { Paddle } from "../model/Paddle"
import type { Ball } from "../model/Ball"

interface ICanvasView {
  clear(): void
  initCanvas(view: IView): void
  drawSprite(sprite: Brick | Paddle | Ball): void
}

interface IView {
  readonly canvas: HTMLCanvasElement
}

export class CanvasView implements ICanvasView {
  private context: CanvasRenderingContext2D | null = null
  private canvas: HTMLCanvasElement | null = null

  constructor() {}

  /**
   * This method initializes the canvas and sets the context.
   * @param view
   */
  initCanvas(view: IView): void {
    this.context = view.canvas.getContext("2d")
    this.canvas = view.canvas
  }

  /**
   * This method clears the canvas.
   */
  clear(): void {
    this.context?.clearRect(0, 0, this.canvas?.width || 0, this.canvas?.height || 0)
  }

  drawSprite(sprite: Brick | Paddle | Ball): void {
    if (!sprite) return

    // Only draw once the image has loaded successfully.
    // `complete` === true and `naturalWidth` > 0 guarantee the image is ready.
    const img = sprite.image
    if (!img.complete || img.naturalWidth === 0) return

    this.context?.drawImage(img, sprite.pos.x, sprite.pos.y, sprite.width, sprite.height)
  }
}
