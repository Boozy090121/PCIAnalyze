/**
 * Heat Map Component
 * 
 * This component implements a heat map for multi-variable analysis
 * using D3.js directly for more customization than Recharts provides.
 */

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export interface HeatMapDataPoint {
  x: string | number;
  y: string | number;
  value: number;
}

export interface HeatMapProps {
  data: HeatMapDataPoint[];
  width?: number;
  height?: number;
  title?: string;
  subtitle?: string;
  xLabel?: string;
  yLabel?: string;
  colorRange?: [string, string];
  margin?: { top: number; right: number; bottom: number; left: number };
}

/**
 * Heat Map component for multi-variable analysis
 */
export const HeatMap: React.FC<HeatMapProps> = ({
  data,
  width = 800,
  height = 500,
  title,
  subtitle,
  xLabel,
  yLabel,
  colorRange = ['#f7fbff', '#08306b'],
  margin = { top: 50, right: 50, bottom: 70, left: 70 }
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || !data.length) return;
    
    // Clear previous rendering
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Extract unique x and y values
    const xValues = Array.from(new Set(data.map(d => d.x)));
    const yValues = Array.from(new Set(data.map(d => d.y)));
    
    // Calculate value range
    const valueExtent = d3.extent(data, d => d.value) as [number, number];
    
    // Set up scales
    const xScale = d3.scaleBand()
      .domain(xValues.map(String))
      .range([margin.left, width - margin.right])
      .padding(0.05);
    
    const yScale = d3.scaleBand()
      .domain(yValues.map(String))
      .range([height - margin.bottom, margin.top])
      .padding(0.05);
    
    const colorScale = d3.scaleSequential()
      .domain(valueExtent)
      .interpolator(d3.interpolate(colorRange[0], colorRange[1]));
    
    // Create the SVG container
    const svg = d3.select(svgRef.current);
    
    // Add cells
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(String(d.x)) || 0)
      .attr('y', d => yScale(String(d.y)) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.value))
      .append('title')
      .text(d => `${d.x}, ${d.y}: ${d.value}`);
    
    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em');
    
    // Add y-axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));
    
    // Add x-axis label
    if (xLabel) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .style('text-anchor', 'middle')
        .text(xLabel);
    }
    
    // Add y-axis label
    if (yLabel) {
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(height / 2))
        .attr('y', 15)
        .style('text-anchor', 'middle')
        .text(yLabel);
    }
    
    // Add color legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = width - margin.right - legendWidth;
    const legendY = margin.top / 2;
    
    // Create gradient for legend
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'heatmap-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colorRange[0]);
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colorRange[1]);
    
    // Add legend rectangle
    svg.append('rect')
      .attr('x', legendX)
      .attr('y', legendY)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#heatmap-gradient)');
    
    // Add legend axis
    const legendScale = d3.scaleLinear()
      .domain(valueExtent)
      .range([0, legendWidth]);
    
    svg.append('g')
      .attr('transform', `translate(${legendX},${legendY + legendHeight})`)
      .call(d3.axisBottom(legendScale).ticks(5));
    
  }, [data, width, height, margin, colorRange, xLabel, yLabel]);
  
  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};

export default HeatMap;
