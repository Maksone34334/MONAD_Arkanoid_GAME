"use client"

import { useEffect } from "react"
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
} from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, LogOut, Coins, Loader2, Trophy } from "lucide-react"
import { leaderboardContract } from "@/lib/contract"
import type { Address } from "viem"

/* ---------- helper: форматирование баланса ---------- */
function formatBalance(value?: string, symbol = "MON") {
  if (!value) return "Loading..."
  return `${Number.parseFloat(value).toFixed(4)} ${symbol}`
}

/* ---------- компонент, когда кошелёк уже коннектed ---------- */
function ConnectedWalletInfo({ address }: { address: Address }) {
  const { disconnect } = useDisconnect()

  /* баланс игрока в MON (Monad Testnet = chainId 10143) */
  const { data: balance } = useBalance({
    address,
    chainId: 10143,
  })

  /* принудительно переключаем кошелёк на Monad Testnet */
  const { switchChain } = useSwitchChain()

  useEffect(() => {
    if (!switchChain) return         // кошелёк ещё не готов
  
    ;(async () => {
      try {
        await switchChain({ chainId: 10143 })
      } catch {
        /* пользователь отклонил запрос - игнорируем */
      }
    })()
  }, [switchChain])
  /* читаем личный high-score */
  const {
    data: highScore,
    error: readError,
    isLoading: isHighScoreLoading,
  } = useReadContract({
    ...leaderboardContract,
    functionName: "highScores",   // убедись, что функция есть в контракте
    args: [address],
    chainId: 10143,
  })

  return (
    <Card className="bg-gray-800 border-gray-700 text-white w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Wallet Connected</span>
          <Button variant="ghost" size="sm" onClick={() => disconnect()}>
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* address */}
        <div className="flex items-center text-sm break-all">
          <Wallet className="mr-2 h-4 w-4 text-green-400 shrink-0" />
          {address}
        </div>

        {/* balance */}
        <div className="flex items-center text-lg font-semibold">
          <Coins className="mr-2 h-5 w-5 text-yellow-400 shrink-0" />
          {formatBalance(balance?.formatted, balance?.symbol)}
        </div>

        {/* high score */}
        <div className="flex items-center text-lg font-semibold">
          <Trophy className="mr-2 h-5 w-5 text-orange-400 shrink-0" />
          {isHighScoreLoading
            ? "Loading..."
            : readError
            ? "Error"
            : (highScore as bigint).toString()}
        </div>

        {readError && (
          <p className="text-xs text-red-400">
            Could not fetch high score. Is the contract address and ABI correct?
          </p>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------- основной Dashboard ---------- */
export default function BlockchainDashboard() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, error, isPending } = useConnect()
  const injected = connectors.find((c) => c.id === "injected") // MetaMask / Rabby …

  if (isConnected && address) {
    return <ConnectedWalletInfo address={address} />
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-800 border-gray-700 text-white w-full max-w-md space-y-3">
      <h3 className="text-lg font-semibold">Play &amp; Compete</h3>
      <p className="text-sm text-gray-400 text-center">
        Connect your wallet to save your high score on-chain!
      </p>

      {injected ? (
        <Button
          onClick={() => connect({ connector: injected })}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting…
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </>
          )}
        </Button>
      ) : (
        <p className="text-sm text-yellow-400 text-center">
          Install MetaMask or another injected wallet to connect.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500">
          type WagmiError = Error & { shortMessage?: string }


        </p>
      )}
    </div>
  )
}
