import React, { useId } from "react";

const Input = React.forwardRef(
  (
    {
      type = "text",
      name = "",
      placeholder = "",
      className = "",
      errors = null,
      ...props
    },
    ref
  ) => {
    const id = useId();
    return (
      <input
        id={id}
        type={type}
        name={name}
        cursor={type === "date" ? "pointer" : "text"}
        className={`block w-full px-3 py-2 mx-2 text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm ${
          errors?.title ? "border-red-500" : "border-gray-300"
        } ${className}`}
        placeholder={placeholder}
        ref={ref}
        {...props}
      />
    );
  }
);
export default Input;
