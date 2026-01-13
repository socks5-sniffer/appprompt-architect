import React from 'react';

interface LabelProps {
  children: React.ReactNode;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ children, className = "" }) => (
  <label className={`block text-sm font-medium text-slate-400 mb-1.5 ${className}`}>
    {children}
  </label>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({ className = "", ...props }) => (
  <input
    className={`w-full bg-dark-900 border border-dark-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-slate-500 ${className}`}
    {...props}
  />
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ className = "", ...props }) => (
  <textarea
    className={`w-full bg-dark-900 border border-dark-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-slate-500 min-h-[100px] ${className}`}
    {...props}
  />
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = "", disabled, children, ...props }) => {
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/20",
    secondary: "bg-dark-800 hover:bg-dark-700 text-slate-200 border border-dark-700",
    ghost: "bg-transparent hover:bg-dark-800 text-slate-400 hover:text-slate-200"
  };

  return (
    <button
      disabled={disabled}
      className={`px-6 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2 ${variants[variant]} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = "", onClick, active }) => (
  <div
    onClick={onClick}
    className={`p-5 rounded-xl border transition-all duration-200 ${
      active 
        ? "bg-primary-900/10 border-primary-500 ring-1 ring-primary-500" 
        : "bg-dark-900 border-dark-800 hover:border-dark-700"
    } ${onClick ? "cursor-pointer hover:shadow-lg" : ""} ${className}`}
  >
    {children}
  </div>
);