"use client";

import React, { useState, useRef, useEffect, forwardRef } from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/outline";

const Dropdown = forwardRef(
  (
    {
      options = [],
      placeholder = "Select an option...",
      onChange = () => {},
      value = "",
      defaultOption = null, // Add default option prop
      label = "",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOption, setSelectedOption] = useState(
      value || defaultOption?.value || ""
    );

    const dropdownRef = useRef(null);

    // Filtered options exclude the defaultOption if it matches an option in the list
    const filteredOptions = options.filter((option) =>
      option?.label?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    useEffect(() => {
      // Update selected option when value changes externally
      if (value) {
        setSelectedOption(value);
      } else if (defaultOption?.value) {
        setSelectedOption(defaultOption.value);
      }
    }, [value, defaultOption]);

    const handleSelect = (option) => {
      if (disabled) return;
      setSelectedOption(option.value);
      onChange(option.value);
      setIsOpen(false);
    };

    return (
      <div
        className={`relative ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        ref={dropdownRef}
      >
        {label && (
          <label
            className={`block text-sm font-medium mb-1 ${
              disabled ? "text-gray-400" : "text-gray-700"
            }`}
          >
            {label}
          </label>
        )}
        <div
          className={`bg-white border border-gray-300 ml-2 rounded-md p-2 flex justify-between items-center ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={`text-gray-700 ${disabled ? "text-gray-400" : ""}`}>
            {selectedOption
              ? options.find((o) => o.value === selectedOption)?.label
              : defaultOption?.label || placeholder}
          </span>
          <ChevronDownIcon
            className={`w-5 h-5 ${
              disabled ? "text-gray-300" : "text-gray-400"
            }`}
          />
        </div>
        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 ml-2 bg-white border border-gray-300 rounded-md shadow-lg">
            <input
              type="text"
              className="w-full p-2 border-b border-gray-300"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul className="max-h-60 overflow-auto">
              {/* Only show the default option if it's not already in the options list */}
              {defaultOption &&
                !options.some((o) => o.value === defaultOption.value) && (
                  <li
                    key="default"
                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => handleSelect(defaultOption)}
                  >
                    <CheckIcon
                      className={`w-4 h-4 mr-2 ${
                        selectedOption === defaultOption.value
                          ? "text-blue-500"
                          : "text-transparent"
                      }`}
                    />
                    {defaultOption.label}
                  </li>
                )}
              {filteredOptions.map((option) => (
                <li
                  key={option.value}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => handleSelect(option)}
                >
                  <CheckIcon
                    className={`w-4 h-4 mr-2 ${
                      selectedOption === option.value
                        ? "text-blue-500"
                        : "text-transparent"
                    }`}
                  />
                  {option.label}
                </li>
              ))}
              {filteredOptions.length === 0 && (
                <li className="p-2 text-gray-500">No results found</li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

export default Dropdown;
