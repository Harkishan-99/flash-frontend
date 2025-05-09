"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Download, Trash2 } from "lucide-react"

// Mock data for backtest history
const mockBacktests = [
  {
    id: "BT-001",
    name: "Tech Momentum Strategy",
    date: "2023-07-15",
    tickers: ["AAPL", "MSFT", "GOOGL"],
    return: 12.5,
    sharpe: 1.2,
  },
  {
    id: "BT-002",
    name: "Value Investing Approach",
    date: "2023-07-10",
    tickers: ["JNJ", "PG", "KO"],
    return: 8.3,
    sharpe: 0.9,
  },
  {
    id: "BT-003",
    name: "Growth Stock Selection",
    date: "2023-07-05",
    tickers: ["AMZN", "TSLA", "NVDA"],
    return: 18.7,
    sharpe: 1.5,
  },
  {
    id: "BT-004",
    name: "Dividend Portfolio",
    date: "2023-06-28",
    tickers: ["VZ", "T", "XOM"],
    return: 5.2,
    sharpe: 0.7,
  },
  {
    id: "BT-005",
    name: "Sector Rotation Strategy",
    date: "2023-06-20",
    tickers: ["XLF", "XLK", "XLE", "XLV"],
    return: 9.8,
    sharpe: 1.1,
  },
]

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [backtests, setBacktests] = useState(mockBacktests)

  const filteredBacktests = backtests.filter(
    (backtest) =>
      backtest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      backtest.tickers.some((ticker) => ticker.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleDelete = (id: string) => {
    setBacktests(backtests.filter((backtest) => backtest.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Backtest History</h1>
        <p className="text-muted-foreground">View and manage your previous backtest runs</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Backtests</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search backtests..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>You have run {backtests.length} backtests in total</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Tickers</TableHead>
                <TableHead>Return</TableHead>
                <TableHead>Sharpe</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBacktests.map((backtest) => (
                <TableRow key={backtest.id}>
                  <TableCell className="font-medium">{backtest.id}</TableCell>
                  <TableCell>{backtest.name}</TableCell>
                  <TableCell>{backtest.date}</TableCell>
                  <TableCell>{backtest.tickers.join(", ")}</TableCell>
                  <TableCell className={backtest.return >= 0 ? "text-green-500" : "text-red-500"}>
                    {backtest.return}%
                  </TableCell>
                  <TableCell>{backtest.sharpe}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(backtest.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredBacktests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No backtests found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
