# Flash Frontend

A modern financial backtest analysis dashboard built with Next.js, allowing users to create and analyze financial strategy backtests.

## Features

- Interactive backtest dashboard with real-time progress tracking
- Strategy vs. benchmark performance comparison
- Monthly returns heatmap visualization
- Trade reports with filtering and performance metrics
- Drawdown analysis and performance metrics display

## Tech Stack

- **Framework**: Next.js 15
- **Styling**: TailwindCSS
- **Charts**: ApexCharts, Chart.js
- **Form Handling**: React Hook Form with Zod validation
- **Component Library**: Shadcn UI components
- **API Client**: Axios

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_API_URL=https://api.quanthive.in
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Vercel Deployment

For detailed instructions on deploying to Vercel, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Project Structure

- `/app` - Next.js application routes
- `/components` - Reusable UI components
- `/lib` - Utility functions and API services
- `/contexts` - React context providers
- `/hooks` - Custom React hooks
- `/styles` - Global styles and theme configuration
- `/public` - Static assets

## License

Proprietary - QuantHive
