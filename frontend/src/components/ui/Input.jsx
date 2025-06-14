/**
 * Reusable Input Component
 * 
 * A flexible input component with validation, icons, and various types
 * Built with Tailwind CSS for consistent styling across the application.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * Input Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.placeholder - Input placeholder
 * @param {any} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onBlur - Blur handler
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Whether input is required
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.icon - Icon component (from lucide-react)
 * @param {string} props.helperText - Helper text below input
 * @param {string} props.size - Input size (sm, md, lg)
 * @returns {React.Component} Input component
 */
const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className = '',
  icon: Icon,
  helperText,
  size = 'md',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-4 py-4 text-base'
  };

  const baseClasses = [
    'w-full rounded-lg border transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed'
  ];

  const stateClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
    : isFocused
    ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-500'
    : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500';

  const inputClasses = [
    ...baseClasses,
    sizeClasses[size],
    stateClasses,
    Icon || type === 'password' ? 'pr-10' : '',
    className
  ].filter(Boolean).join(' ');

  const handleFocus = (e) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
        
        {/* Icon or Password Toggle */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {type === 'password' ? (
            <button
              type="button"
              onClick={togglePassword}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          ) : Icon ? (
            <Icon className="h-5 w-5 text-gray-400" />
          ) : null}
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
      
      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
