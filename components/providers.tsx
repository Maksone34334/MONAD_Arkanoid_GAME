"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { WagmiProvider, createConfig, http } from "wagmi"
import { injected } from "@wagmi/connectors"          // v2 путь
import { defineChain } from "viem"                    // ✨ здесь
import type { Chain } from "viem"

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Public Testnet",
  network: "monad-testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet.monad.xyz"] } },
}) satisfies Chain

const config = createConfig({
  chains: [monadTestnet],
  connectors: [injected()],
  transports: {
    [monadTestnet.id]: http(monadTestnet.rpcUrls.default.http[0]),
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>{children}</WagmiProvider>
    </QueryClientProvider>
  )
}
