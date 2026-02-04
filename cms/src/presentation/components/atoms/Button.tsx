import { Loader2 } from 'lucide-react';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
}, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0c]";

    const variants = {
        primary: "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 focus:ring-indigo-500",
        secondary: "bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/10 focus:ring-white",
        outline: "bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-zinc-300 hover:text-white focus:ring-zinc-500",
        ghost: "hover:bg-white/5 text-zinc-400 hover:text-white focus:ring-zinc-500",
        danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 focus:ring-red-500"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
        md: "px-6 py-3 text-sm rounded-xl gap-2",
        lg: "px-8 py-4 text-base rounded-xl gap-2.5",
        icon: "p-2 rounded-lg"
    };

    return (
        <button
            ref={ref}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {!isLoading && leftIcon}
            {children}
            {!isLoading && rightIcon}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
