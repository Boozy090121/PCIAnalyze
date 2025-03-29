# Pharmaceutical Process Analytics Dashboard

This project implements a comprehensive dashboard for pharmaceutical manufacturing process analytics, featuring intelligent data processing, statistical analysis, pattern recognition, and interactive visualizations.

## Features

- **Intelligent Excel File Processing**: Automatic schema detection and pattern analysis
- **Advanced Analytics**: KPI calculations, statistical analysis, pattern recognition, and predictive analytics
- **Interactive Visualizations**: Various chart types including bar/column charts, line charts, heat maps, and Sankey diagrams
- **Performance Optimized**: Web Workers for background processing, chunked data handling, and virtualized components
- **Multi-Tab Interface**: Overview, Process Analysis, Pattern Analysis, and Predictive Analytics

## Technical Stack

- **Frontend Framework**: Next.js with React
- **Data Visualization**: D3.js, Recharts
- **Excel Processing**: SheetJS (xlsx)
- **Performance Optimization**: Web Workers, chunked processing, virtualization
- **UI Components**: Tailwind CSS with shadcn/ui components

## Project Structure

```
/pharma_dashboard/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── dashboard/          # Dashboard pages
│   │   │   └── page.tsx        # Main dashboard page
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── charts/             # Chart components
│   │   │   ├── chart-factory.tsx       # Chart type factory
│   │   │   ├── heat-map.tsx            # Heat map visualization
│   │   │   ├── optimized-chart.tsx     # Performance-optimized chart
│   │   │   └── sankey-diagram.tsx      # Sankey diagram for process flow
│   │   ├── dashboard/          # Dashboard-specific components
│   │   │   ├── dashboard-overview.tsx  # Overview tab
│   │   │   ├── file-upload.tsx         # Excel file upload
│   │   │   ├── kpi-card.tsx            # KPI display card
│   │   │   ├── pattern-analysis.tsx    # Pattern analysis tab
│   │   │   ├── predictive-analytics.tsx # Predictive analytics tab
│   │   │   └── process-analysis.tsx    # Process analysis tab
│   │   ├── data-display/       # Data display components
│   │   │   └── virtualized-table.tsx   # Virtualized table for large datasets
│   │   └── layout/             # Layout components
│   │       ├── dashboard-content-container.tsx # Content container
│   │       ├── dashboard-grid.tsx      # Dashboard grid layout
│   │       ├── dashboard-layout.tsx    # Main dashboard layout
│   │       ├── dashboard-tabs.tsx      # Tab navigation
│   │       └── filter-controls.tsx     # Data filtering controls
│   ├── context/                # React context
│   │   └── dashboard-context.tsx       # Dashboard state management
│   ├── hooks/                  # Custom React hooks
│   │   └── use-memoized-analytics.ts   # Memoized analytics hook
│   ├── lib/                    # Utility libraries
│   │   ├── analytics/          # Analytics modules
│   │   │   ├── analytics-service.ts    # Unified analytics service
│   │   │   ├── kpi-calculator.ts       # KPI calculation module
│   │   │   └── process-analytics.ts    # Process analytics module
│   │   └── data-processing/    # Data processing modules
│   │       ├── data-processing-manager.ts  # Processing coordination
│   │       ├── excel-parser.ts         # Excel file parser
│   │       └── pattern-analyzer.ts     # Pattern analysis module
│   ├── tests/                  # Test files
│   │   ├── dashboard-test-runner.js    # JavaScript test runner
│   │   └── dashboard-tests.ts          # TypeScript tests
│   └── workers/                # Web Workers
│       └── excel-processor.worker.ts   # Excel processing worker
└── public/                     # Static assets
```

## Getting Started

1. Install dependencies:
   ```
   pnpm install
   ```

2. Run the development server:
   ```
   pnpm dev
   ```

3. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) in your browser.

## Usage

1. Upload an Excel file containing pharmaceutical process data.
2. The dashboard will automatically detect the schema and analyze the data.
3. Navigate between tabs to explore different aspects of the data:
   - **Overview**: Key metrics and high-level insights
   - **Process Analysis**: Detailed process performance metrics
   - **Pattern Analysis**: Pattern recognition and correlation analysis
   - **Predictive Analytics**: Forecasts and predictions

## Performance Optimizations

The dashboard includes several performance optimizations to handle large datasets:

- **Web Workers**: Excel file processing runs in a background thread
- **Chunked Processing**: Large datasets are processed in smaller chunks
- **Progressive Updates**: UI updates progressively during long operations
- **Virtualized Tables**: Only visible rows are rendered for large datasets
- **Optimized Charts**: Charts use memoization and progressive rendering
- **Memoized Analytics**: Expensive calculations are cached

## Testing

Run the tests to verify dashboard functionality:

```
node src/tests/dashboard-test-runner.js
```
