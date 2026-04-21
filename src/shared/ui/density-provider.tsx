"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Density = "comfy" | "compact"

const DensityContext = createContext<{
  density: Density
  setDensity: (d: Density) => void
}>({ density: "comfy", setDensity: () => {} })

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensityState] = useState<Density>("comfy")

  useEffect(() => {
    const stored = localStorage.getItem("budfin-density") as Density | null
    if (stored === "compact" || stored === "comfy") setDensityState(stored)
  }, [])

  function setDensity(d: Density) {
    setDensityState(d)
    localStorage.setItem("budfin-density", d)
    document.documentElement.classList.toggle("density-compact", d === "compact")
  }

  useEffect(() => {
    document.documentElement.classList.toggle("density-compact", density === "compact")
  }, [density])

  return <DensityContext.Provider value={{ density, setDensity }}>{children}</DensityContext.Provider>
}

export function useDensity() {
  return useContext(DensityContext)
}
