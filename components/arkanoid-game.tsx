"use client"

import { useRef, useEffect, useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { CanvasView } from "@/lib/arkanoid/view/canvas-view"
import { Ball } from "@/lib/arkanoid/sprites/Ball"
import type { Brick } from "@/lib/arkanoid/sprites/Brick"
import { Paddle } from "@/lib/arkanoid/sprites/Paddle"
import { Collision } from "@/lib/arkanoid/Collision"
import { PADDLE_SPEED, PADDLE_WIDTH, PADDLE_HEIGHT, BALL_SPEED, BALL_SIZE } from "@/lib/arkanoid/setup"
import { createBricks } from "@/lib/arkanoid/helpers"
import { leaderboardContract } from "@/lib/contract"
import { Button } from "./ui/button"
import { Loader2, CheckCircle, AlertTriangle, Save, Play, RotateCcw } from "lucide-react"

const PADDLE_IMAGE_PATH = "/images/arkanoid/paddle.png"
const BALL_IMAGE_PATH = "/images/arkanoid/ball.png"

type GameStatus = "idle" | "playing" | "over"

export default function ArkanoidGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const gameLoopRef = useRef<number>(0)
  const paddleRef = useRef<Paddle | null>(null)

  const [score, setScore] = useState(0)
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle")
  const [infoText, setInfoText] = useState("Ready to play!")

  const { isConnected } = useAccount()
  const { data: hash, writeContract, isPending, error, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const startNewGame = () => {
    setGameStatus("playing")
    reset() // Reset any previous transaction state
  }

  const playAgain = () => {
    setScore(0)
    setInfoText("Ready to play!")
    reset() // Reset transaction state
    startNewGame()
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
      }
      if (bricks.length === 0) {
        setGameStatus("over")
        setInfoText("You Won!")
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
  }, [gameStatus])

  const handleSaveScore = () => {
    if (score > 0) {
      writeContract({
        ...leaderboardContract,
        functionName: "submitScore",
        args: [BigInt(score)],
      })
    }
  }

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
            <div className="border-l border-gray-600 pl-3">
              {isPending && (
                <div className="flex items-center space-x-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Check wallet...</span>
                </div>
              )}
              {isConfirming && (
                <div className="flex items-center space-x-2 text-sm text-blue-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
              {isConfirmed && (
                <div className="flex items-center space-x-2 text-sm text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Saved!</span>
                </div>
              )}
              {error && (
                <div className="flex items-center space-x-2 text-sm text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Error</span>
                </div>
              )}
              {!isPending && !isConfirming && !isConfirmed && !error && (
                <Button
                  onClick={handleSaveScore}
                  disabled={!isConnected}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  title={!isConnected ? "Connect wallet first" : "Save score on-chain"}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isConnected ? "Save Score" : "Connect to Save"}
                </Button>
              )}
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        id="playField"
        width="1000"
        height="600"
        className="absolute top-0 left-0 z-10 border border-gray-600 bg-black/50"
      ></canvas>
      <div
        id="display"
        className="absolute bottom-0 left-0 w-full h-[60px] flex justify-between items-center px-4 bg-gray-800 z-20"
      >
        <div id="score" className="w-32 text-lg font-bold">
          Score: {score}
        </div>
        <div className="flex-1 flex justify-center">{renderGameControls()}</div>
        <div id="info" className="w-32 text-lg text-right font-bold">
          {infoText}
        </div>
      </div>
    </>
  )
}
