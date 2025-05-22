"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BacktestResults, backtestService } from "@/lib/backtest-service"
import { BacktestResultsView } from "@/components/backtest-results"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BacktestPageProps {
  params: {
    id: string
  }
}

export default function BacktestPage({ params }: BacktestPageProps) {
  const [backtestResults, setBacktestResults] = useState<BacktestResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchBacktestResults = async () => {
      try {
        setLoading(true)
        const results = await backtestService.getBacktestResults(params.id)
        setBacktestResults(results)
      } catch (err: any) {
        console.error("Error fetching backtest results:", err)
        setError(err.response?.data?.detail || err.message || "Failed to fetch backtest results")
      } finally {
        setLoading(false)
      }
    }

    fetchBacktestResults()
  }, [params.id])

  const handleClose = () => {
    router.push("/dashboard/history")
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading backtest results...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleClose}>Return to History</Button>
      </div>
    )
  }

  return (
    <div>
      {backtestResults && (
        <BacktestResultsView 
          backtestId={params.id} 
          onClose={handleClose} 
          backtestResults={backtestResults} 
        />
      )}
    </div>
  )
} 