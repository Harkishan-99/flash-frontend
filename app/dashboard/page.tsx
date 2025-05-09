"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/date-picker"
import { MultiSelect } from "@/components/multi-select"
import { BacktestResults } from "@/components/backtest-results"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Zap } from "lucide-react"

const backtestSchema = z.object({
  prompt: z.string().min(10, { message: "Please enter a detailed investment idea" }),
  tickers: z.array(z.string()).min(1, { message: "Please select at least one ticker" }),
  startDate: z.date(),
  endDate: z.date(),
  initialCapital: z.coerce.number().min(1000, { message: "Initial capital must be at least 1000" }),
  commission: z.coerce.number().min(0).max(5, { message: "Commission must be between 0 and 5%" }),
})

type BacktestFormValues = z.infer<typeof backtestSchema>

// Sample tickers for the multi-select
const availableTickers = [
  { value: "AAPL", label: "Apple Inc. (AAPL)" },
  { value: "MSFT", label: "Microsoft Corporation (MSFT)" },
  { value: "GOOGL", label: "Alphabet Inc. (GOOGL)" },
  { value: "AMZN", label: "Amazon.com Inc. (AMZN)" },
  { value: "META", label: "Meta Platforms Inc. (META)" },
  { value: "TSLA", label: "Tesla Inc. (TSLA)" },
  { value: "NVDA", label: "NVIDIA Corporation (NVDA)" },
  { value: "JPM", label: "JPMorgan Chase & Co. (JPM)" },
  { value: "V", label: "Visa Inc. (V)" },
  { value: "JNJ", label: "Johnson & Johnson (JNJ)" },
]

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backtestResults, setBacktestResults] = useState<any | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BacktestFormValues>({
    resolver: zodResolver(backtestSchema),
    defaultValues: {
      prompt: "",
      tickers: [],
      startDate: new Date(2020, 0, 1),
      endDate: new Date(),
      initialCapital: 10000,
      commission: 0.1,
    },
  })

  const onSubmit = async (data: BacktestFormValues) => {
    setIsLoading(true)
    setError(null)
    setBacktestResults(null)

    try {
      // In a real app, you would make an API call to run the backtest
      // For demo purposes, we'll simulate a backtest with a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate mock backtest results
      const mockResults = generateMockBacktestResults(data)
      setBacktestResults(mockResults)
    } catch (err) {
      setError("An error occurred while running the backtest. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Flash</h1>
        <p className="text-muted-foreground">Test your investment ideas in minutes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backtest Parameters</CardTitle>
          <CardDescription>Enter your investment idea and parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="backtest-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="prompt">Investment Idea</Label>
              <Textarea
                id="prompt"
                placeholder="Describe your investment idea in detail. For example: Buy stocks with positive momentum and hold for 30 days..."
                className="min-h-[100px]"
                {...register("prompt")}
              />
              {errors.prompt && <p className="text-sm text-red-500">{errors.prompt.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tickers">Tickers</Label>
                <MultiSelect
                  name="tickers"
                  control={control}
                  options={availableTickers}
                  placeholder="Select tickers..."
                />
                {errors.tickers && <p className="text-sm text-red-500">{errors.tickers.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Backtest Period</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-xs">
                      Start Date
                    </Label>
                    <DatePicker name="startDate" control={control} />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-xs">
                      End Date
                    </Label>
                    <DatePicker name="endDate" control={control} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="initialCapital">Initial Capital ($)</Label>
                <Input id="initialCapital" type="number" {...register("initialCapital")} />
                {errors.initialCapital && <p className="text-sm text-red-500">{errors.initialCapital.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="commission">Commission (%)</Label>
                <Input id="commission" type="number" step="0.01" {...register("commission")} />
                {errors.commission && <p className="text-sm text-red-500">{errors.commission.message}</p>}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form="backtest-form" disabled={isLoading}>
            {isLoading ? "Running Backtest..." : "Run Backtest"}
          </Button>
        </CardFooter>
      </Card>

      {backtestResults && <BacktestResults results={backtestResults} />}
    </div>
  )
}

// Function to generate mock backtest results
function generateMockBacktestResults(data: BacktestFormValues) {
  const startDate = data.startDate
  const endDate = data.endDate
  const initialCapital = data.initialCapital

  // Generate dates between start and end date
  const dates = []
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      // Skip weekends
      dates.push(new Date(currentDate))
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Generate equity curve data
  let equity = initialCapital
  const equityCurve = dates.map((date, index) => {
    // Add some randomness to the equity curve
    const dailyReturn = Math.random() * 0.02 - 0.005 // Random daily return between -0.5% and 1.5%
    equity = equity * (1 + dailyReturn)

    return {
      date: date.toISOString().split("T")[0],
      equity: equity,
    }
  })

  // Calculate drawdown
  let peak = initialCapital
  const drawdown = equityCurve.map((point) => {
    if (point.equity > peak) {
      peak = point.equity
    }
    const drawdownValue = ((peak - point.equity) / peak) * 100
    return {
      date: point.date,
      drawdown: drawdownValue,
    }
  })

  // Calculate returns
  const finalEquity = equityCurve[equityCurve.length - 1].equity
  const totalReturn = ((finalEquity - initialCapital) / initialCapital) * 100

  // Calculate annualized return
  const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
  const annualizedReturn = (Math.pow(finalEquity / initialCapital, 1 / years) - 1) * 100

  // Calculate max drawdown
  const maxDrawdown = Math.max(...drawdown.map((d) => d.drawdown))

  // Calculate Sharpe ratio (simplified)
  const dailyReturns = equityCurve
    .slice(1)
    .map((point, i) => (point.equity - equityCurve[i].equity) / equityCurve[i].equity)
  const avgDailyReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length
  const stdDailyReturn = Math.sqrt(
    dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgDailyReturn, 2), 0) / dailyReturns.length,
  )
  const sharpeRatio = (avgDailyReturn / stdDailyReturn) * Math.sqrt(252) // Annualized

  // Generate monthly returns
  const monthlyReturns = []
  let currentMonth = startDate.getMonth()
  let currentYear = startDate.getFullYear()
  let monthStartEquity = initialCapital

  equityCurve.forEach((point, index) => {
    const date = new Date(point.date)
    if (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear || index === equityCurve.length - 1) {
      // Month has changed or we're at the last point
      const monthEndEquity = equityCurve[index - 1]?.equity || point.equity
      const monthlyReturn = ((monthEndEquity - monthStartEquity) / monthStartEquity) * 100

      monthlyReturns.push({
        month: `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}`,
        return: monthlyReturn,
      })

      currentMonth = date.getMonth()
      currentYear = date.getFullYear()
      monthStartEquity = point.equity
    }
  })

  // Generate trade list
  const trades = []
  const numTrades = Math.floor(Math.random() * 15) + 5 // Random number of trades between 5 and 20

  for (let i = 0; i < numTrades; i++) {
    const ticker = data.tickers[Math.floor(Math.random() * data.tickers.length)]
    const entryDate = dates[Math.floor(Math.random() * (dates.length - 10))]
    const exitDate = new Date(entryDate)
    exitDate.setDate(exitDate.getDate() + Math.floor(Math.random() * 30) + 5) // Hold between 5 and 35 days

    const entryPrice = Math.random() * 200 + 50 // Random price between 50 and 250
    const exitPrice = entryPrice * (1 + (Math.random() * 0.2 - 0.05)) // Random price change between -5% and 15%
    const shares = Math.floor(Math.random() * 100) + 10 // Random shares between 10 and 110

    trades.push({
      id: i + 1,
      ticker,
      entryDate: entryDate.toISOString().split("T")[0],
      exitDate: exitDate <= endDate ? exitDate.toISOString().split("T")[0] : endDate.toISOString().split("T")[0],
      entryPrice: entryPrice.toFixed(2),
      exitPrice: exitPrice.toFixed(2),
      shares,
      pnl: ((exitPrice - entryPrice) * shares).toFixed(2),
      returnPct: (((exitPrice - entryPrice) / entryPrice) * 100).toFixed(2),
    })
  }

  return {
    summary: {
      initialCapital,
      finalCapital: finalEquity,
      totalReturn,
      annualizedReturn,
      maxDrawdown,
      sharpeRatio,
      winRate: (trades.filter((t) => Number.parseFloat(t.pnl) > 0).length / trades.length) * 100,
      numTrades: trades.length,
    },
    equityCurve,
    drawdown,
    monthlyReturns,
    trades,
    explanation: [
      `Your idea investing in ${data.tickers.join(", ")} generated a total return of ${totalReturn.toFixed(2)}% over the backtest period.`,
      `The annualized return was ${annualizedReturn.toFixed(2)}%, with a maximum drawdown of ${maxDrawdown.toFixed(2)}%.`,
      `The strategy had a Sharpe ratio of ${sharpeRatio.toFixed(2)}, indicating the risk-adjusted performance.`,
      `You executed ${trades.length} trades with a win rate of ${((trades.filter((t) => Number.parseFloat(t.pnl) > 0).length / trades.length) * 100).toFixed(2)}%.`,
      `The strategy performed particularly well during ${monthlyReturns.sort((a, b) => b.return - a.return)[0].month}, with a monthly return of ${monthlyReturns.sort((a, b) => b.return - a.return)[0].return.toFixed(2)}%.`,
      `The worst performing month was ${monthlyReturns.sort((a, b) => a.return - b.return)[0].month}, with a monthly return of ${monthlyReturns.sort((a, b) => a.return - b.return)[0].return.toFixed(2)}%.`,
    ],
  }
}
