/**
 * Chart Factory Module
 * 
 * This module provides a factory for creating different types of charts
 * for the pharmaceutical process analytics dashboard.
 */

import React from 'react';
import { 
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Scatter,
  ScatterChart,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Chart type definitions
export type ChartType = 
  | 'bar' 
  | 'column' 
  | 'line' 
  | 'pie' 
  | 'heatmap' 
  | 'pareto' 
  | 'sankey' 
  | 'radar';

export interface ChartDimension {
  name: string;
  accessor: string;
  label?: string;
}

export interface ChartMeasure {
  name: string;
  accessor: string;
  label?: string;
  color?: string;
}

export interface ChartOptions {
  title?: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  stacked?: boolean;
  horizontal?: boolean;
  colors?: string[];
  height?: number;
  width?: number;
}

export interface ChartProps {
  type: ChartType;
  data: any[];
  dimensions: ChartDimension[];
  measures: ChartMeasure[];
  options?: ChartOptions;
}

// Default chart colors
const DEFAULT_COLORS = [
  '#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0',
  '#4895ef', '#560bad', '#b5179e', '#f15bb5', '#00bbf9'
];

// Default chart options
const DEFAULT_OPTIONS: ChartOptions = {
  showLegend: true,
  showGrid: true,
  showTooltip: true,
  stacked: false,
  horizontal: false,
  height: 400,
  width: undefined, // Responsive by default
  colors: DEFAULT_COLORS
};

/**
 * Chart Factory component for creating different types of charts
 */
export const ChartFactory: React.FC<ChartProps> = ({ 
  type, 
  data, 
  dimensions, 
  measures, 
  options 
}) => {
  // Merge default options with provided options
  const chartOptions: ChartOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // Ensure we have data
  if (!data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No data available</p>
      </div>
    );
  }
  
  // Ensure we have dimensions and measures
  if (!dimensions || dimensions.length === 0 || !measures || measures.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>Invalid chart configuration</p>
      </div>
    );
  }
  
  // Create chart based on type
  switch (type) {
    case 'bar':
    case 'column':
      return renderBarChart(data, dimensions, measures, chartOptions);
    case 'line':
      return renderLineChart(data, dimensions, measures, chartOptions);
    case 'pie':
      return renderPieChart(data, dimensions, measures, chartOptions);
    case 'heatmap':
      return renderHeatMap(data, dimensions, measures, chartOptions);
    case 'pareto':
      return renderParetoChart(data, dimensions, measures, chartOptions);
    case 'radar':
      return renderRadarChart(data, dimensions, measures, chartOptions);
    case 'sankey':
      return renderSankeyDiagram(data, dimensions, measures, chartOptions);
    default:
      return (
        <div className="chart-placeholder">
          <p>Unsupported chart type: {type}</p>
        </div>
      );
  }
};

/**
 * Render a bar or column chart
 */
const renderBarChart = (
  data: any[], 
  dimensions: ChartDimension[], 
  measures: ChartMeasure[], 
  options: ChartOptions
) => {
  const dimension = dimensions[0];
  const isHorizontal = options.horizontal === true;
  
  return (
    <div className="chart-container">
      {options.title && <h3 className="chart-title">{options.title}</h3>}
      {options.subtitle && <p className="chart-subtitle">{options.subtitle}</p>}
      
      <ResponsiveContainer width={options.width || '100%'} height={options.height || 400}>
        <RechartsBarChart
          data={data}
          layout={isHorizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          {options.showGrid && <CartesianGrid strokeDasharray="3 3" />}
          
          {isHorizontal ? (
            <>
              <XAxis type="number" />
              <YAxis dataKey={dimension.accessor} type="category" />
            </>
          ) : (
            <>
              <XAxis dataKey={dimension.accessor} />
              <YAxis />
            </>
          )}
          
          {options.showTooltip && <Tooltip />}
          {options.showLegend && <Legend />}
          
          {measures.map((measure, index) => (
            <Bar
              key={measure.name}
              dataKey={measure.accessor}
              name={measure.label || measure.name}
              fill={measure.color || options.colors?.[index % (options.colors?.length || 1)]}
              stackId={options.stacked ? 'stack' : undefined}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Render a line chart
 */
const renderLineChart = (
  data: any[], 
  dimensions: ChartDimension[], 
  measures: ChartMeasure[], 
  options: ChartOptions
) => {
  const dimension = dimensions[0];
  
  return (
    <div className="chart-container">
      {options.title && <h3 className="chart-title">{options.title}</h3>}
      {options.subtitle && <p className="chart-subtitle">{options.subtitle}</p>}
      
      <ResponsiveContainer width={options.width || '100%'} height={options.height || 400}>
        <RechartsLineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          {options.showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey={dimension.accessor} 
            label={options.xAxisLabel ? { value: options.xAxisLabel, position: 'insideBottom', offset: -5 } : undefined} 
          />
          <YAxis 
            label={options.yAxisLabel ? { value: options.yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} 
          />
          {options.showTooltip && <Tooltip />}
          {options.showLegend && <Legend />}
          
          {measures.map((measure, index) => (
            <Line
              key={measure.name}
              type="monotone"
              dataKey={measure.accessor}
              name={measure.label || measure.name}
              stroke={measure.color || options.colors?.[index % (options.colors?.length || 1)]}
              activeDot={{ r: 8 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Render a pie chart
 */
const renderPieChart = (
  data: any[], 
  dimensions: ChartDimension[], 
  measures: ChartMeasure[], 
  options: ChartOptions
) => {
  const dimension = dimensions[0];
  const measure = measures[0]; // Pie chart typically uses one measure
  
  return (
    <div className="chart-container">
      {options.title && <h3 className="chart-title">{options.title}</h3>}
      {options.subtitle && <p className="chart-subtitle">{options.subtitle}</p>}
      
      <ResponsiveContainer width={options.width || '100%'} height={options.height || 400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={80}
            fill="#8884d8"
            dataKey={measure.accessor}
            nameKey={dimension.accessor}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={options.colors?.[index % (options.colors?.length || 1)]} 
              />
            ))}
          </Pie>
          {options.showTooltip && <Tooltip />}
          {options.showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Render a heat map
 */
const renderHeatMap = (
  data: any[], 
  dimensions: ChartDimension[], 
  measures: ChartMeasure[], 
  options: ChartOptions
) => {
  // Heat map requires two dimensions and one measure
  if (dimensions.length < 2) {
    return (
      <div className="chart-placeholder">
        <p>Heat map requires two dimensions</p>
      </div>
    );
  }
  
  const xDimension = dimensions[0];
  const yDimension = dimensions[1];
  const measure = measures[0];
  
  // Transform data for heat map
  const uniqueXValues = [...new Set(data.map(item => item[xDimension.accessor]))];
  const uniqueYValues = [...new Set(data.map(item => item[yDimension.accessor]))];
  
  const transformedData = uniqueXValues.flatMap(x => 
    uniqueYValues.map(y => {
      const matchingItem = data.find(item => 
        item[xDimension.accessor] === x && item[yDimension.accessor] === y
      );
      
      return {
        x,
        y,
        value: matchingItem ? matchingItem[measure.accessor] : 0
      };
    })
  );
  
  // Calculate value range for color scale
  const values = transformedData.map(item => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  return (
    <div className="chart-container">
      {options.title && <h3 className="chart-title">{options.title}</h3>}
      {options.subtitle && <p className="chart-subtitle">{options.subtitle}</p>}
      
      <ResponsiveContainer width={options.width || '100%'} height={options.height || 400}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid />
          <XAxis 
            type="category" 
            dataKey="x" 
            name={xDimension.label || xDimension.name} 
            allowDuplicatedCategory={false} 
          />
          <YAxis 
            type="category" 
            dataKey="y" 
            name={yDimension.label || yDimension.name} 
            allowDuplicatedCategory={false} 
          />
          <ZAxis 
            type="number" 
            dataKey="value" 
            range={[50, 500]} 
            name={measure.label || measure.name} 
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            formatter={(value: any) => [value, measure.label || measure.name]}
          />
          <Scatter 
            data={transformedData} 
            fill="#8884d8" 
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Render a Pareto chart (combination of bar and line)
 */
const renderParetoChart = (
  data: any[], 
  dimensions: ChartDimension[], 
  measures: ChartMeasure[], 
  options: ChartOptions
) => {
  const dimension = dimensions[0];
  const measure = measures[0];
  
  // Sort data by measure value in descending order
  const sortedData = [...data].sort((a, b) => b[measure.accessor] - a[measure.accessor]);
  
  // Calculate cumulative percentage
  let total = sortedData.reduce((sum, item) => sum + item[measure.accessor], 0);
  let cumulative = 0;
  
  const paretoData = sortedData.map(item => {
    cumulative += item[measure.accessor];
    return {
      ...item,
      cumulativePercentage: (cumulative / total) * 100
    };
  });
  
  return (
    <div className="chart-container">
      {options.title && <h3 className="chart-title">{options.title}</h3>}
      {options.subtitle && <p className="chart-subtitle">{options.subtitle}</p>}
      
      <ResponsiveContainer width={options.width || '100%'} height={options.height || 400}>
        <RechartsBarChart
          data={paretoData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          {options.showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={dimension.accessor} />
          <YAxis yAxisId="left" orientation="left" />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            domain={[0, 100]} 
            label={{ value: 'Cumulative %', angle: 90, position: 'insideRight' }} 
          />
          {options.showTooltip && <Tooltip />}
          {options.showLegend && <Legend />}
          
          <Bar
            yAxisId="left"
            dataKey={measure.accessor}
            name={measure.label || measure.name}
            fill={measure.color || options.colors?.[0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulativePercentage"
            name="Cumulative %"
            stroke={options.colors?.[1] || "#ff7300"}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Render a radar chart
 */
const renderRadarChart = (
  data: any[], 
  dimensions: ChartDimension[], 
  measures: ChartMeasure[], 
  options: ChartOptions
) => {
  // Radar chart requires one dimension for categories and multiple measures
  const dimension = dimensions[0];
  
  return (
    <div className="chart-container">
      {options.title && <h3 className="chart-title">{options.title}</h3>}
      {options.subtitle && <p className="chart-subtitle">{options.subtitle}</p>}
      
      <ResponsiveContainer width={options.width || '100%'} height={options.height || 400}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey={dimension.accessor} />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
          
          {measures.map((measure, index) => (
            <Radar
              key={measure.name}
              name={measure.label || measure.name}
              dataKey={measure.accessor}
              stroke={measure.color || options.colors?.[index % (options.colors?.length || 1)]}
              fill={measure.color || options.colors?.[index % (options.colors?.length || 1)]}
              fillOpacity={0.6}
            />
          ))}
          
          {options.showLegend && <Legend />}
          {options.showTooltip && <Tooltip />}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Render a Sankey diagram
 * Note: Recharts doesn't have a built-in Sankey diagram, so this is a placeholder
 * that would need to be implemented with D3.js directly
 */
const renderSankeyDiagram = (
  data: any[], 
  dimensions: ChartDimension[], 
  measures: ChartMeasure[], 
  options: ChartOptions
) => {
  return (
    <div className="chart-container">
      {options.title && <h3 className="chart-title">{options.title}</h3>}
      {options.subtitle && <p className="chart-subtitle">{options.subtitle}</p>}
      
      <div className="sankey-placeholder">
        <p>Sankey diagram implementation requires D3.js directly.</p>
        <p>This would be implemented as a custom D3 visualization component.</p>
      </div>
    </div>
  );
};

export default ChartFactory;
