import axios from './axios';

export interface BacktestRequest {
  prompt: string;
  tickers: string[];
  initial_cash: number;
  start_date: string;
  end_date: string;
  commission: number;
}

export interface BacktestStatus {
  backtest_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message: string;
}

export interface BacktestMetrics {
  total_return: number;
  annual_return: number;
  volatility: number;
  sharpe: number;
  sortino: number;
  max_drawdown: number;
  win_rate: number;
  beta: number;
  alpha: number;
  [key: string]: any; // For additional_metrics
}

export interface BacktestResults {
  backtest_id: string;
  metrics: BacktestMetrics;
  insights: string;
  improvements: string;
  strategy_code: string;
}

export const backtestService = {
  // Run a new backtest
  async runBacktest(request: BacktestRequest): Promise<BacktestStatus> {
    const response = await axios.post<BacktestStatus>('/backtest/run', request);
    return response.data;
  },

  // Get status of a backtest
  async getBacktestStatus(backtestId: string): Promise<BacktestStatus> {
    const response = await axios.get<BacktestStatus>(`/backtest/status/${backtestId}`);
    return response.data;
  },

  // Get results of a completed backtest
  async getBacktestResults(backtestId: string): Promise<BacktestResults> {
    const response = await axios.get<BacktestResults>(`/backtest/results/${backtestId}`);
    return response.data;
  },

  // Get all backtests for the user
  async getUserBacktests(): Promise<BacktestStatus[]> {
    const response = await axios.get<BacktestStatus[]>('/backtest/user/backtests');
    return response.data;
  },

  // Delete a backtest
  async deleteBacktest(backtestId: string): Promise<{ message: string }> {
    const response = await axios.delete<{ message: string }>(`/backtest/${backtestId}`);
    return response.data;
  },

  // Get downloadable backtest report URL
  getBacktestReportUrl(backtestId: string, format: 'csv' | 'html' = 'csv'): string {
    return `/api/backtest/download/${backtestId}?format=${format}`;
  },

  // Get debug URL
  getBacktestDebugUrl(backtestId: string): string {
    return `/api/backtest/debug/${backtestId}`;
  }
};

// Database service
export interface TickerResponse {
  tickers: string[];
}

export interface DatabaseInfo {
  database_path: string;
  start_date: string | null;
  end_date: string | null;
}

export interface BenchmarkReturns {
  returns: {
    dates: string[];
    values: number[];
  };
}

export const databaseService = {
  // Get available tickers
  async getAvailableTickers(): Promise<string[]> {
    const response = await axios.get<TickerResponse>('/database/tickers');
    return response.data.tickers;
  },

  // Get database info
  async getDatabaseInfo(): Promise<DatabaseInfo> {
    const response = await axios.get<DatabaseInfo>('/database/info');
    return response.data;
  },

  // Get benchmark returns
  async getBenchmarkReturns(startDate: string, endDate: string): Promise<BenchmarkReturns> {
    const response = await axios.get<BenchmarkReturns>(`/database/benchmark-returns/${startDate}/${endDate}`);
    return response.data;
  }
}; 