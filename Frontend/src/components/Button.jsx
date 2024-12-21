import React from "react";

const Button = React.forwardRef(({ children, className, ...props }, ref) => {
  return (
    <button
      className={`flex group justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white dark:text-black bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});
export default Button;
