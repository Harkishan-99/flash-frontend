"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { PerformanceChart } from "@/components/performance-chart"
import { DrawdownChart } from "@/components/drawdown-chart"
import { MonthlyReturnsHeatmap } from "@/components/monthly-returns-heatmap"

interface BacktestResultsProps {
  results: any
}

export function BacktestResults({ results }: BacktestResultsProps) {
  const { summary, equityCurve, drawdown, monthlyReturns, trades, explanation } = results

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Backtest Results</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalReturn.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Initial: ${summary.initialCapital.toLocaleString()} | Final: ${summary.finalCapital.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Annualized Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.annualizedReturn.toFixed(2)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.maxDrawdown.toFixed(2)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.sharpeRatio.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Returns</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Equity Curve</CardTitle>
              <CardDescription>Growth of initial capital over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <PerformanceChart data={equityCurve} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Drawdown</CardTitle>
              <CardDescription>Percentage decline from peak equity</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <DrawdownChart data={drawdown} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Initial Capital</TableCell>
                    <TableCell>${summary.initialCapital.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">Final Capital</TableCell>
                    <TableCell>${summary.finalCapital.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total Return</TableCell>
                    <TableCell>{summary.totalReturn.toFixed(2)}%</TableCell>
                    <TableCell className="font-medium">Annualized Return</TableCell>
                    <TableCell>{summary.annualizedReturn.toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Max Drawdown</TableCell>
                    <TableCell>{summary.maxDrawdown.toFixed(2)}%</TableCell>
                    <TableCell className="font-medium">Sharpe Ratio</TableCell>
                    <TableCell>{summary.sharpeRatio.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Win Rate</TableCell>
                    <TableCell>{summary.winRate.toFixed(2)}%</TableCell>
                    <TableCell className="font-medium">Number of Trades</TableCell>
                    <TableCell>{summary.numTrades}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades">
          <Card>
            <CardHeader>
              <CardTitle>Trade List</CardTitle>
              <CardDescription>Individual trades executed during the backtest</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Entry Date</TableHead>
                    <TableHead>Exit Date</TableHead>
                    <TableHead>Entry Price</TableHead>
                    <TableHead>Exit Price</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>P&L</TableHead>
                    <TableHead>Return</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade: any) => (
                    <TableRow key={trade.id}>
                      <TableCell>{trade.id}</TableCell>
                      <TableCell>{trade.ticker}</TableCell>
                      <TableCell>{trade.entryDate}</TableCell>
                      <TableCell>{trade.exitDate}</TableCell>
                      <TableCell>${trade.entryPrice}</TableCell>
                      <TableCell>${trade.exitPrice}</TableCell>
                      <TableCell>{trade.shares}</TableCell>
                      <TableCell className={Number.parseFloat(trade.pnl) >= 0 ? "text-green-500" : "text-red-500"}>
                        ${trade.pnl}
                      </TableCell>
                      <TableCell
                        className={Number.parseFloat(trade.returnPct) >= 0 ? "text-green-500" : "text-red-500"}
                      >
                        {trade.returnPct}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Returns</CardTitle>
              <CardDescription>Performance breakdown by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <MonthlyReturnsHeatmap data={monthlyReturns} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle>Backtest Report</CardTitle>
              <CardDescription>Analysis and explanation of backtest results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Backtest Summary</AlertTitle>
                <AlertDescription>
                  This is an automated analysis of your backtest results. Please note that past performance is not
                  indicative of future results.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {explanation.map((paragraph: string, index: number) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
