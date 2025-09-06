import React, { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  as?: 'button' | 'a';
  children: ReactNode;
  className?: string;
}

type ButtonPropsWithButtonElement = ButtonProps & ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' };
type ButtonPropsWithAnchorElement = ButtonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a' };

export type ButtonCombinedProps = ButtonPropsWithButtonElement | ButtonPropsWithAnchorElement;

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonCombinedProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      as = 'button',
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseStyles = cn(
      'inline-flex items-center justify-center font-medium tracking-tight rounded-full transition-all duration-200',
      'focus-visible:ring-focus focus-visible:ring-2 focus-visible:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      fullWidth && 'w-full',
      !isDisabled && 'hover:scale-105 active:scale-[0.98]'
    );

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm gap-1.5',
      md: 'px-5 py-2.5 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
    };

    const variantStyles = {
      primary: cn(
        'bg-gradient-to-r from-brand-start to-brand-end text-white',
        'shadow-soft hover:shadow-soft-lg',
        'disabled:from-gray-400 disabled:to-gray-500',
        'dark:disabled:from-gray-600 dark:disabled:to-gray-700'
      ),
      secondary: cn(
        'bg-neutral-100 text-neutral-900',
        'hover:bg-neutral-200 shadow-soft hover:shadow-soft-lg',
        'dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700',
        'disabled:bg-neutral-100 disabled:text-neutral-400',
        'dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500'
      ),
      tertiary: cn(
        'bg-white text-neutral-700',
        'hover:bg-neutral-50 shadow-soft hover:shadow-soft-lg',
        'dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800',
        'disabled:bg-white disabled:text-neutral-400',
        'dark:disabled:bg-neutral-900 dark:disabled:text-neutral-600'
      ),
      outline: cn(
        'bg-transparent border-2 border-neutral-300 text-neutral-700',
        'hover:bg-neutral-50 hover:border-neutral-400',
        'dark:border-neutral-600 dark:text-neutral-300',
        'dark:hover:bg-neutral-800 dark:hover:border-neutral-500',
        'disabled:border-neutral-200 disabled:text-neutral-400',
        'dark:disabled:border-neutral-700 dark:disabled:text-neutral-600'
      ),
      ghost: cn(
        'bg-transparent text-neutral-700',
        'hover:bg-neutral-100',
        'dark:text-neutral-300 dark:hover:bg-neutral-800',
        'disabled:text-neutral-400',
        'dark:disabled:text-neutral-600'
      ),
      destructive: cn(
        'bg-gradient-to-r from-red-500 to-rose-500 text-white',
        'shadow-soft hover:shadow-soft-lg',
        'hover:from-red-600 hover:to-rose-600',
        'disabled:from-red-300 disabled:to-rose-300',
        'dark:disabled:from-red-800 dark:disabled:to-rose-800'
      ),
    };

    const iconSize = {
      sm: 'w-4 h-4',
      md: 'w-[18px] h-[18px]',
      lg: 'w-5 h-5',
    };

    const LoadingSpinner = () => (
      <svg
        className={cn('animate-spin', iconSize[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    const combinedClassName = cn(
      baseStyles,
      sizeStyles[size],
      variantStyles[variant],
      className
    );

    const content = (
      <>
        {loading && <LoadingSpinner />}
        {!loading && leftIcon && <span className={iconSize[size]}>{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className={iconSize[size]}>{rightIcon}</span>}
      </>
    );

    if (as === 'a') {
      const { href, ...anchorProps } = props as AnchorHTMLAttributes<HTMLAnchorElement>;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={isDisabled ? undefined : href}
          role="button"
          aria-disabled={isDisabled}
          aria-busy={loading}
          className={combinedClassName}
          {...anchorProps}
        >
          {content}
        </a>
      );
    }

    const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        className={combinedClassName}
        {...buttonProps}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;