import React from "react";

const Label = ({ children, htmlFor = "", className = "", ...props }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mx-0 text-left ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

export default Label;
