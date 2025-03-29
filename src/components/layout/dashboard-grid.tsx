/**
 * Dashboard Grid Layout Component
 * 
 * This component provides a responsive grid layout for dashboard widgets
 * with support for different sizes and arrangements.
 */

import React from 'react';

export type GridItemSize = 'small' | 'medium' | 'large' | 'full';

export interface GridItemProps {
  children: React.ReactNode;
  size?: GridItemSize;
  className?: string;
}

export interface DashboardGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}

/**
 * Grid Item component for individual dashboard widgets
 */
export const GridItem: React.FC<GridItemProps> = ({
  children,
  size = 'medium',
  className = '',
}) => {
  const sizeClasses = {
    small: 'grid-item-small',
    medium: 'grid-item-medium',
    large: 'grid-item-large',
    full: 'grid-item-full',
  };
  
  return (
    <div className={`grid-item ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Dashboard Grid component for responsive widget layouts
 */
export const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  columns = 12,
  gap = 16,
  className = '',
}) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`,
  };
  
  return (
    <div className={`dashboard-grid ${className}`} style={gridStyle}>
      {children}
    </div>
  );
};

export default { DashboardGrid, GridItem };
