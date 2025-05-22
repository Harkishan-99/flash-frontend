"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { BacktestRequest, backtestService, databaseService } from "@/lib/backtest-service"

const backtestSchema = z.object({
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
  tickers: z.array(z.string()).min(1, {
    message: "Please select at least one ticker.",
  }),
  initial_cash: z.coerce.number().min(1000, {
    message: "Initial cash must be at least 1000.",
  }),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please enter a valid date in YYYY-MM-DD format.",
  }),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please enter a valid date in YYYY-MM-DD format.",
  }),
  commission: z.coerce.number().min(0).max(100, {
    message: "Commission must be between 0 and 100.",
  }),
}).refine(data => new Date(data.start_date) < new Date(data.end_date), {
  message: "End date must be after start date.",
  path: ["end_date"],
});

type BacktestFormValues = z.infer<typeof backtestSchema>

interface BacktestFormProps {
  onBacktestSubmitted: (backtestId: string) => void
}

export function BacktestForm({ onBacktestSubmitted }: BacktestFormProps) {
  const [availableTickers, setAvailableTickers] = useState<string[]>([])
  const [selectedTickers, setSelectedTickers] = useState<string[]>([])
  const [tickerInput, setTickerInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dbInfo, setDbInfo] = useState<{ start_date: string | null, end_date: string | null} | null>(null)

  const form = useForm<BacktestFormValues>({
    resolver: zodResolver(backtestSchema),
    defaultValues: {
      prompt: "",
      tickers: [],
      initial_cash: 100000,
      start_date: "",
      end_date: "",
      commission: 0.1,
    },
  })

  // Load available tickers and database info
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tickers, dbInfo] = await Promise.all([
          databaseService.getAvailableTickers(),
          databaseService.getDatabaseInfo()
        ]);
        
        setAvailableTickers(tickers);
        setDbInfo({
          start_date: dbInfo.start_date,
          end_date: dbInfo.end_date
        });
        
        // Set default dates if available
        if (dbInfo.start_date && dbInfo.end_date) {
          form.setValue('start_date', dbInfo.start_date);
          form.setValue('end_date', dbInfo.end_date);
        }
      } catch (err: any) {
        console.error("Error loading form data:", err);
        setError(err.message || "Failed to load tickers and database information");
      }
    };
    
    loadData();
  }, [form]);

  const addTicker = () => {
    if (tickerInput && availableTickers.includes(tickerInput) && !selectedTickers.includes(tickerInput)) {
      const newTickers = [...selectedTickers, tickerInput];
      setSelectedTickers(newTickers);
      form.setValue('tickers', newTickers);
      setTickerInput("");
    }
  };

  const removeTicker = (ticker: string) => {
    const newTickers = selectedTickers.filter(t => t !== ticker);
    setSelectedTickers(newTickers);
    form.setValue('tickers', newTickers);
  };

  const onSubmit = async (data: BacktestFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const backtestRequest: BacktestRequest = {
        prompt: data.prompt,
        tickers: data.tickers,
        initial_cash: data.initial_cash,
        start_date: data.start_date,
        end_date: data.end_date,
        commission: data.commission
      };
      
      const response = await backtestService.runBacktest(backtestRequest);
      onBacktestSubmitted(response.backtest_id);
      
      // Reset the form
      form.reset({
        prompt: "",
        tickers: [],
        initial_cash: 100000,
        start_date: dbInfo?.start_date || "",
        end_date: dbInfo?.end_date || "",
        commission: 0.1,
      });
      setSelectedTickers([]);
      
    } catch (err: any) {
      console.error("Backtest submission error:", err);
      setError(err.response?.data?.detail || err.message || "Failed to submit backtest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Run a New Backtest</CardTitle>
        <CardDescription>
          Describe your trading strategy and select parameters to run a backtest
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategy Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your trading strategy here. Example: Buy AAPL when the 50-day moving average crosses above the 200-day moving average and sell when it crosses below."
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe your strategy in plain language. Be as specific as possible.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tickers"
              render={() => (
                <FormItem>
                  <FormLabel>Tickers</FormLabel>
                  <div className="flex space-x-2">
                    <Select 
                      onValueChange={setTickerInput} 
                      value={tickerInput}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select ticker" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTickers
                          .filter(ticker => !selectedTickers.includes(ticker))
                          .map(ticker => (
                            <SelectItem key={ticker} value={ticker}>
                              {ticker}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      onClick={addTicker}
                      disabled={!tickerInput || selectedTickers.includes(tickerInput)}
                    >
                      Add
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTickers.map(ticker => (
                      <Badge key={ticker} variant="secondary" className="py-1">
                        {ticker}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-2"
                          onClick={() => removeTicker(ticker)}
                        >
                          ✕
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  
                  <FormDescription>
                    Select the tickers you want to include in your backtest.
                  </FormDescription>
                  {form.formState.errors.tickers && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.tickers.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="initial_cash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Cash</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Starting capital for the backtest.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="commission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>
                      Trading commission percentage.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      Format: YYYY-MM-DD
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      Format: YYYY-MM-DD
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Running Backtest..." : "Run Backtest"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 