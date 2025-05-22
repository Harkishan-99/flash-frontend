"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowDownToLine, ExternalLink, Code } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BacktestResults, BacktestStatus, backtestService } from "@/lib/backtest-service"
import { Progress } from "@/components/ui/progress"

interface BacktestResultsProps {
  backtestId: string
  onClose: () => void
  backtestResults: BacktestResults
}

export function BacktestResultsView({ backtestId, onClose, backtestResults }: BacktestResultsProps) {
  const [status, setStatus] = useState<BacktestStatus | null>(null)
  const [results, setResults] = useState<BacktestResults>(backtestResults)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const downloadReport = (format: 'csv' | 'html') => {
    const url = backtestService.getBacktestReportUrl(backtestId, format);
    window.open(url, '_blank');
  };

  const openDebugView = () => {
    const url = backtestService.getBacktestDebugUrl(backtestId);
    window.open(url, '_blank');
  };

  // Render results
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Backtest Results</CardTitle>
        <CardDescription>
          Results and analysis for your trading strategy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="improvements">Improvements</TabsTrigger>
            <TabsTrigger value="code">Strategy Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="metrics" className="space-y-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MetricCard 
                title="Total Return" 
                value={results.metrics.total_return} 
                format="percent" 
              />
              <MetricCard 
                title="Annual Return" 
                value={results.metrics.annual_return} 
                format="percent" 
              />
              <MetricCard 
                title="Sharpe Ratio" 
                value={results.metrics.sharpe} 
                format="number" 
              />
              <MetricCard 
                title="Sortino Ratio" 
                value={results.metrics.sortino} 
                format="number" 
              />
              <MetricCard 
                title="Max Drawdown" 
                value={results.metrics.max_drawdown} 
                format="percent" 
                isNegative
              />
              <MetricCard 
                title="Volatility" 
                value={results.metrics.volatility} 
                format="percent" 
              />
              <MetricCard 
                title="Win Rate" 
                value={results.metrics.win_rate} 
                format="percent" 
              />
              <MetricCard 
                title="Alpha" 
                value={results.metrics.alpha} 
                format="percent" 
              />
              <MetricCard 
                title="Beta" 
                value={results.metrics.beta} 
                format="number" 
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => downloadReport('csv')}>
                Download CSV <ArrowDownToLine className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => downloadReport('html')}>
                Download HTML <ArrowDownToLine className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="py-4">
            <div className="p-4 bg-muted rounded-lg whitespace-pre-line">
              {results.insights || "No insights available"}
            </div>
          </TabsContent>
          
          <TabsContent value="improvements" className="py-4">
            <div className="p-4 bg-muted rounded-lg whitespace-pre-line">
              {results.improvements || "No improvement suggestions available"}
            </div>
          </TabsContent>
          
          <TabsContent value="code" className="py-4">
            <div className="p-4 bg-muted rounded-lg overflow-auto max-h-96">
              <pre className="text-xs">
                {results.strategy_code || "No strategy code available"}
              </pre>
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={openDebugView}>
                Debug View <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button variant="default" onClick={openDebugView}>
          Full Analysis <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

interface MetricCardProps {
  title: string
  value: number
  format: 'percent' | 'number'
  isNegative?: boolean
}

function MetricCard({ title, value, format, isNegative = false }: MetricCardProps) {
  const formattedValue = format === 'percent' 
    ? `${value.toFixed(2)}%` 
    : value.toFixed(2);
    
  // Determine color based on value and whether it's a metric where negative is bad
  const getTextColorClass = () => {
    // Some metrics like drawdown are negative by nature
    const adjustedValue = isNegative ? -value : value;
    
    if (adjustedValue > 0) return "text-green-500";
    if (adjustedValue < 0) return "text-red-500";
    return "text-gray-500";
  };
  
  return (
    <div className="bg-muted p-3 rounded-lg">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className={`text-2xl font-bold ${getTextColorClass()}`}>
        {formattedValue}
      </p>
    </div>
  );
}
