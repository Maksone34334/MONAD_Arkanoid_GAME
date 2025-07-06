"use client"

import { useEffect, useState } from "react"
import { usePublicClient } from "wagmi"
import { leaderboardContract } from "@/lib/contract"
import { monadTestnet } from "@/components/providers"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ScoreEntry {
  address: string
  score: number
}

function shortAddress(addr: string) {
  return addr.slice(0, 6) + "..." + addr.slice(-4)
}

export default function LeaderboardTable({ limit = 10 }: { limit?: number }) {
  const publicClient = usePublicClient({ chainId: monadTestnet.id })
  const [scores, setScores] = useState<ScoreEntry[]>([])

  useEffect(() => {
    async function loadScores() {
      try {
        if (!publicClient) return
        const total: bigint = await publicClient.readContract({
          ...leaderboardContract,
          functionName: "totalScores",
        })
        const count = Number(total)
        const results: ScoreEntry[] = []
        for (let i = 0; i < count; i++) {
          const [player, s] = (await publicClient.readContract({
            ...leaderboardContract,
            functionName: "getScore",
            args: [BigInt(i)],
          })) as [string, bigint]
          results.push({ address: player, score: Number(s) })
        }
        results.sort((a, b) => b.score - a.score)
        setScores(results.slice(0, limit))
      } catch (err) {
        console.error("Failed to load leaderboard", err)
      }
    }
    loadScores()
  }, [publicClient, limit])

  if (scores.length === 0) {
    return <p className="text-sm text-gray-400">No scores yet.</p>
  }

  return (
    <Table className="text-white bg-gray-800 mt-4">
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">#</TableHead>
          <TableHead>Player</TableHead>
          <TableHead className="text-right">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scores.map((s, idx) => (
          <TableRow key={idx}>
            <TableCell>{idx + 1}</TableCell>
            <TableCell>{shortAddress(s.address)}</TableCell>
            <TableCell className="text-right">{s.score}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
