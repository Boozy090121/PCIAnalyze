/**
 * Dashboard Content Container Component
 * 
 * This component provides a standardized container for dashboard content sections
 * with consistent styling and layout.
 */

import React from 'react';

export interface DashboardContentContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/**
 * Dashboard Content Container component for consistent content sections
 */
export const DashboardContentContainer: React.FC<DashboardContentContainerProps> = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  fullWidth = false,
}) => {
  return (
    <div className={`dashboard-content-container ${fullWidth ? 'full-width' : ''} ${className}`}>
      {(title || actions) && (
        <div className="content-header">
          <div className="content-header-titles">
            {title && <h3 className="content-title">{title}</h3>}
            {subtitle && <p className="content-subtitle">{subtitle}</p>}
          </div>
          
          {actions && (
            <div className="content-actions">
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div className="content-body">
        {children}
      </div>
    </div>
  );
};

export default DashboardContentContainer;
