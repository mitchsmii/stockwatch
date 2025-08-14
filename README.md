# Stock Tracker Dashboard

A modern, real-time stock tracking dashboard built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Real-time Stock Data**: Live prices and company information via Alpha Vantage API
- **Three Analysis Views**: Performance & Intrinsic Value, Market Valuation, Research & Analysis
- **Interactive Tables**: Sortable columns with gradient color coding
- **Bulk Operations**: Select and remove multiple stocks at once
- **Stock Details**: Click any stock to view detailed information in a drawer
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stocktracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   # Alpha Vantage API Key
   # Get your free API key from: https://www.alphavantage.co/support/#api-key
   NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```

4. **Get an Alpha Vantage API Key**
   - Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
   - Sign up for a free account
   - Copy your API key
   - Add it to your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001)

## API Setup

### Alpha Vantage API

The app uses Alpha Vantage for real-time stock data:

- **Free Tier**: 500 requests per day
- **Rate Limits**: 5 requests per minute for free tier
- **Data Available**: Real-time quotes, company overviews, fundamentals

### API Endpoints Used

- `GLOBAL_QUOTE`: Get real-time stock quotes
- `OVERVIEW`: Get company information and fundamentals

## Usage

### Adding Stocks
1. Click "Add Stock" button
2. Enter the ticker symbol (e.g., AAPL, MSFT, GOOGL)
3. Click "Add Stock" to add it to your dashboard

### Refreshing Data
1. Click "Refresh Data" button to update all stock prices
2. The button shows loading state during updates
3. Error messages display if API calls fail

### Editing Stocks
1. Click "Edit / Remove" to enter edit mode
2. Select stocks using checkboxes
3. Click "Remove Selected" to delete multiple stocks
4. Click "Cancel" to exit edit mode

### Viewing Stock Details
1. Click on any stock row (when not in edit mode)
2. A drawer opens with detailed stock information
3. View price history, fundamentals, and analysis

## Project Structure

```
src/
├── app/
│   └── dashboard/
│       └── page.tsx          # Main dashboard
├── components/
│   └── ui/                   # Reusable UI components
├── hooks/
│   └── useStockData.ts       # Real-time data management
├── lib/
│   ├── api/
│   │   └── stockApi.ts       # Alpha Vantage API integration
│   └── utils/
│       └── getColorForChange.ts # Color coding utilities
└── data/
    └── stocks.json           # Sample stock data
```

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI components
- **Alpha Vantage API**: Real-time stock data
- **Lucide React**: Icon library

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY` | Alpha Vantage API key | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
