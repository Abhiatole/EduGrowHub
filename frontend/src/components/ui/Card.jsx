/**
 * Reusable Card Component
 * 
 * A flexible card component for displaying content with consistent styling
 * Built with Tailwind CSS for the EduGrowHub application.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import React from 'react';

/**
 * Card Component
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.shadow - Whether to show shadow
 * @param {boolean} props.hover - Whether to show hover effects
 * @param {boolean} props.border - Whether to show border
 * @param {string} props.padding - Padding size (sm, md, lg, xl)
 * @param {Function} props.onClick - Click handler for clickable cards
 * @returns {React.Component} Card component
 */
const Card = ({
  children,
  className = '',
  shadow = true,
  hover = false,
  border = true,
  padding = 'md',
  onClick,
  ...props
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const baseClasses = [
    'bg-white rounded-lg transition-all duration-200',
    border ? 'border border-gray-200' : '',
    shadow ? 'shadow-sm' : '',
    hover ? 'hover:shadow-md hover:border-gray-300' : '',
    onClick ? 'cursor-pointer' : '',
    paddingClasses[padding] || paddingClasses.md,
    className
  ].filter(Boolean).join(' ');

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * Card Header Component
 */
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Card Title Component
 */
export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
    {children}
  </h3>
);

/**
 * Card Content Component
 */
export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`text-gray-600 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Card Footer Component
 */
export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
