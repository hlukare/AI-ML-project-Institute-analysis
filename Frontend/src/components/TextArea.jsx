import React, { useId } from "react";

const TextArea = React.forwardRef(
  (
    {
      name = "",
      rows = 3,
      cols = 3,
      placeholder = "",
      className = "",
      ...props
    },
    ref
  ) => {
    const id = useId();
    return (
      <textarea
        id={id}
        rows={rows}
        cols={cols}
        name={name}
        className={`block w-full px-3 py-2 ml-2 text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm ${className}`}
        placeholder={placeholder}
        ref={ref}
        {...props}
      />
    );
  }
);
export default TextArea;
