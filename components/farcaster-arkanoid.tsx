"use client"

import { useRef, useEffect, useState } from "react"
import { CanvasView } from "@/lib/arkanoid/view/canvas-view"
import { Ball } from "@/lib/arkanoid/sprites/Ball"
import type { Brick } from "@/lib/arkanoid/sprites/Brick"
import { Paddle } from "@/lib/arkanoid/sprites/Paddle"
import { Collision } from "@/lib/arkanoid/Collision"
import { PADDLE_SPEED, PADDLE_WIDTH, PADDLE_HEIGHT, BALL_SPEED, BALL_SIZE } from "@/lib/arkanoid/setup"
import { createBricks } from "@/lib/arkanoid/helpers"
import { Button } from "./ui/button"
import { Play, RotateCcw, Share2 } from "lucide-react"

const PADDLE_IMAGE_PATH = "/images/arkanoid/paddle.png"
const BALL_IMAGE_PATH = "/images/arkanoid/ball.png"

type GameStatus = "idle" | "playing" | "over"

export default function FarcasterArkanoid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const gameLoopRef = useRef<number>(0)
  const paddleRef = useRef<Paddle | null>(null)

  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle")
  const [infoText, setInfoText] = useState("Ready to play!")

  // Load best score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("arkanoid-best-score")
    if (saved) {
      setBestScore(Number.parseInt(saved, 10))
    }
  }, [])

  const startNewGame = () => {
    setGameStatus("playing")
  }

  const playAgain = () => {
    setScore(0)
    setInfoText("Ready to play!")
    startNewGame()
  }

  const shareScore = () => {
    const text = `I just scored ${score} points in Arkanoid! Can you beat my score?`
    const url = `${window.location.origin}/farcaster`

    // Try to use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: "Arkanoid Game",
        text,
        url,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${text} ${url}`)
      alert("Score shared! Link copied to clipboard.")
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const view = new CanvasView(canvas)
    let bricks: Brick[]
    let ball: Ball
    let collision: Collision

    const gameLoop = () => {
      if (gameStatus !== "playing") return

      view.clear()
      view.drawBricks(bricks)
      if (paddleRef.current) view.drawSprite(paddleRef.current)
      view.drawSprite(ball)

      ball.moveBall()

      const paddle = paddleRef.current
      if (paddle) {
        if (
          (paddle.isMovingLeft && paddle.pos.x > 0) ||
          (paddle.isMovingRight && paddle.pos.x < view.canvas.width - paddle.width)
        ) {
          paddle.movePaddle()
        }
        collision.checkBallCollision(ball, paddle, view)
      }

      if (collision.isCollidingBricks(ball, bricks)) {
        setScore((s) => s + 1)
      }

      if (ball.pos.y > view.canvas.height) {
        setGameStatus("over")
        setInfoText("Game Over!")
        // Update best score
        setScore((currentScore) => {
          if (currentScore > bestScore) {
            setBestScore(currentScore)
            localStorage.setItem("arkanoid-best-score", currentScore.toString())
          }
          return currentScore
        })
      }
      if (bricks.length === 0) {
        setGameStatus("over")
        setInfoText("You Won!")
        // Update best score
        setScore((currentScore) => {
          if (currentScore > bestScore) {
            setBestScore(currentScore)
            localStorage.setItem("arkanoid-best-score", currentScore.toString())
          }
          return currentScore
        })
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    if (gameStatus === "playing") {
      setInfoText("")

      collision = new Collision()
      bricks = createBricks(canvas)
      ball = new Ball(BALL_SPEED, BALL_SIZE, { x: canvas.width / 2, y: canvas.height - 100 }, BALL_IMAGE_PATH)
      paddleRef.current = new Paddle(
        PADDLE_SPEED,
        PADDLE_WIDTH,
        PADDLE_HEIGHT,
        { x: (canvas.width - PADDLE_WIDTH) / 2, y: canvas.height - PADDLE_HEIGHT - 5 },
        PADDLE_IMAGE_PATH,
      )

      document.addEventListener("keydown", paddleRef.current.handleKeyDown)
      document.addEventListener("keyup", paddleRef.current.handleKeyUp)

      cancelAnimationFrame(gameLoopRef.current)
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      cancelAnimationFrame(gameLoopRef.current)
      if (paddleRef.current) {
        document.removeEventListener("keydown", paddleRef.current.handleKeyDown)
        document.removeEventListener("keyup", paddleRef.current.handleKeyUp)
      }
    }
  }, [gameStatus, bestScore])

  const renderGameControls = () => {
    if (gameStatus === "idle") {
      return (
        <Button onClick={startNewGame} className="bg-green-600 hover:bg-green-700">
          <Play className="mr-2 h-4 w-4" />
          Start Game
        </Button>
      )
    }

    if (gameStatus === "playing") {
      return (
        <div className="text-center">
          <p className="text-sm text-gray-300">Use ← → arrows to move</p>
        </div>
      )
    }

    if (gameStatus === "over") {
      return (
        <div className="flex items-center space-x-3">
          <Button onClick={playAgain} className="bg-blue-600 hover:bg-blue-700">
            <RotateCcw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
          {score > 0 && (
            <Button onClick={shareScore} className="bg-purple-600 hover:bg-purple-700">
              <Share2 className="mr-2 h-4 w-4" />
              Share Score
            </Button>
          )}
        </div>
      )
    }
  }

  return (
    <div className="w-full max-w-[800px] mx-auto p-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Arkanoid</h1>
        <p className="text-gray-400">Classic brick-breaking game for Farcaster</p>
      </div>

      <div className="relative w-full aspect-[4/3] mb-4">
        <canvas
          ref={canvasRef}
          id="playField"
          width="800"
          height="600"
          className="absolute top-0 left-0 z-10 border border-gray-600 bg-black/50 w-full h-full"
        ></canvas>
        <img
          src="/images/arkanoid/background.png"
          alt="Game background"
          className="absolute top-0 left-0 w-full h-[calc(100%_-_50px)] object-cover z-0"
        />
        <div className="absolute bottom-0 left-0 w-full h-[50px] flex justify-between items-center px-4 bg-gray-800 z-20">
          <div className="text-sm">
            <div>
              Score: <span className="font-bold">{score}</span>
            </div>
            <div>
              Best: <span className="font-bold text-yellow-400">{bestScore}</span>
            </div>
          </div>
          <div className="flex-1 flex justify-center">{renderGameControls()}</div>
          <div className="text-sm text-right font-bold">{infoText}</div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-400">
        <p>Built for Farcaster • Share your high scores with friends!</p>
      </div>
    </div>
  )
}
