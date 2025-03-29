"use client";

/**
 * Sankey Diagram Component
 * 
 * This component provides a Sankey diagram visualization for the pharmaceutical
 * process analytics dashboard, showing process flow relationships.
 */

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

export interface SankeyNode {
  name: string;
  category?: string;
}

export interface SankeyLink {
  source: number | string | SankeyNode;
  target: number | string | SankeyNode;
  value: number;
  color?: string;
}

export interface SankeyDiagramProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  width?: number;
  height?: number;
  nodeWidth?: number;
  nodePadding?: number;
  className?: string;
}

export const SankeyDiagram: React.FC<SankeyDiagramProps> = ({
  nodes,
  links,
  width = 800,
  height = 500,
  nodeWidth = 20,
  nodePadding = 10,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0 || links.length === 0) return;
    
    // Clear previous diagram
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Create a simplified demo version for the live demo
    const svg = d3.select(svgRef.current);
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Process Flow Diagram (Demo)');
    
    // Add placeholder text
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Sankey diagram would display here with actual data');
    
    // Add sample nodes
    const nodeColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];
    const sampleNodes = ['Raw Materials', 'Processing', 'Quality Check', 'Packaging', 'Distribution'];
    
    sampleNodes.forEach((name, i) => {
      const x = 100 + (i * (width - 200) / (sampleNodes.length - 1));
      
      // Add node
      svg.append('rect')
        .attr('x', x - 40)
        .attr('y', height / 2 - 50)
        .attr('width', 80)
        .attr('height', 30)
        .attr('fill', nodeColors[i % nodeColors.length])
        .attr('rx', 5)
        .attr('ry', 5);
      
      // Add label
      svg.append('text')
        .attr('x', x)
        .attr('y', height / 2 - 35)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', 'white')
        .text(name);
      
      // Add flow lines if not the last node
      if (i < sampleNodes.length - 1) {
        svg.append('path')
          .attr('d', `M${x + 40},${height / 2 - 35} L${x + 100},${height / 2 - 35}`)
          .attr('stroke', '#aaa')
          .attr('stroke-width', 10)
          .attr('fill', 'none');
      }
    });
    
  }, [nodes, links, width, height, nodeWidth, nodePadding]);
  
  return (
    <div className={`sankey-diagram-container ${className}`}>
      <svg 
        ref={svgRef}
        width={width}
        height={height}
        className="sankey-diagram"
      />
    </div>
  );
};
