// Types
import { Brick } from '../sprites/Brick';
import { Paddle } from '../sprites/Paddle';
import { Ball } from '../sprites/Ball';

export class CanvasView {
  canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D | null;
  private scoreDisplay: HTMLObjectElement | null;
  private start: HTMLObjectElement | null;
  private info: HTMLObjectElement | null;

  constructor(canvasName: string) {
    this.canvas = document.querySelector(canvasName) as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d');
    this.scoreDisplay = document.querySelector('#score');
    this.start = document.querySelector('#start');
    this.info = document.querySelector('#info');
  }

  clear(): void {
    this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  initStartButton(startFunction: (view: CanvasView) => void): void {
    this.start?.addEventListener('click', () => startFunction(this));
  }

  drawScore(score: number): void {
    if (this.scoreDisplay) this.scoreDisplay.innerHTML = score.toString();
  }

  drawInfo(text: string): void {
    if (this.info) this.info.innerHTML = text;
  }

  drawSprite(sprite: Brick | Paddle | Ball): void {
    if (!sprite) return;

    this.context?.drawImage(
      sprite.image,
      sprite.pos.x,
      sprite.pos.y,
      sprite.width,
      sprite.height
    );
  }

  drawBricks(bricks: Brick[]): void {
    bricks.forEach(brick => {
      if (this.context) {
        // Save the current context state
        this.context.save();
        
        // Set the opacity based on the brick's energy
        if ('energy' in brick) {
          const maxEnergy = 3; // Maximum energy a brick can have
          const opacity = 0.4 + (0.6 * brick.energy / maxEnergy); // Scale opacity from 0.4 to 1.0
          this.context.globalAlpha = opacity;
          
          // Draw a crack overlay for damaged bricks
          if (brick.energy < maxEnergy) {
            // Draw the brick first
            this.context.drawImage(
              brick.image,
              brick.pos.x,
              brick.pos.y,
              brick.width,
              brick.height
            );
            
            // Draw cracks with a different blend mode
            this.context.globalCompositeOperation = 'multiply';
            this.context.fillStyle = 'rgba(0, 0, 0, ' + (1 - brick.energy / maxEnergy) * 0.5 + ')';
            
            // Draw random cracks
            const crackCount = maxEnergy - brick.energy;
            for (let i = 0; i < crackCount; i++) {
              const x = brick.pos.x + Math.random() * brick.width;
              const y = brick.pos.y + Math.random() * brick.height;
              const width = 2 + Math.random() * 5;
              const height = 2 + Math.random() * 5;
              this.context.fillRect(x, y, width, height);
            }
          } else {
            // Draw the brick normally if it's not damaged
            this.context.drawImage(
              brick.image,
              brick.pos.x,
              brick.pos.y,
              brick.width,
              brick.height
            );
          }
        } else {
          // For non-brick sprites, just draw them normally
          this.context.drawImage(
            brick.image,
            brick.pos.x,
            brick.pos.y,
            brick.width,
            brick.height
          );
        }
        
        // Restore the context to its original state
        this.context.restore();
      }
    });
  }
}
