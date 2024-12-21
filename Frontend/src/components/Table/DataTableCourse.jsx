import { useState, useEffect, useRef } from "react";
import {
  SearchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  TrashIcon,
  SearchCircleIcon,
} from "@heroicons/react/outline";
import CourseModal from "../CourseModal";

export default function DataTableCourse({
  data,
  columns,
  onEdit,
  onDelete,
  filters,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [filteredData, setFilteredData] = useState(data);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openModalId, setOpenModalId] = useState(null);

  const openModal = (id) => {
    setOpenModalId(id);
  };

  const closeModal = () => {
    setOpenModalId(null);
  };

  // // Modal
  // const openModal = () => setIsModalOpen(true);
  // const closeModal = () => setIsModalOpen(false);

  // Initialize filter values
  useEffect(() => {
    const initialFilterValues = {};
    filters.forEach((filter) => {
      initialFilterValues[filter.key] = "";
    });
    setFilterValues(initialFilterValues);
  }, [filters]);

  // Update filtered data when search or filters change
  useEffect(() => {
    let result = [...data];

    // Apply search filter
    if (searchQuery) {
      result = result.filter((item) =>
        Object.values(item).some((value) =>
          value && typeof value === "object"
            ? Object.values(value).some(
                (v) =>
                  v &&
                  v.toString().toLowerCase().includes(searchQuery.toLowerCase())
              )
            : value &&
              value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value) {
        result = result.filter((item) => {
          const itemValue = key.includes(".")
            ? key.split(".").reduce((obj, k) => obj && obj[k], item)
            : item[key];
          return (
            itemValue &&
            itemValue.toString().toLowerCase().includes(value.toLowerCase())
          );
        });
      }
    });

    // Apply sorting
    if (sortColumn) {
      result.sort((a, b) => {
        const aValue = sortColumn.includes(".")
          ? sortColumn.split(".").reduce((obj, k) => obj && obj[k], a)
          : a[sortColumn];
        const bValue = sortColumn.includes(".")
          ? sortColumn.split(".").reduce((obj, k) => obj && obj[k], b)
          : b[sortColumn];
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(result);
  }, [data, searchQuery, filterValues, sortColumn, sortDirection]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const FilterDropdown = ({ filter }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

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

    const filteredOptions = filter.options.filter((option) =>
      option?.toLowerCase().includes(searchTerm?.toLowerCase())
    );

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-56 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {filterValues[filter.key] || filter.label}
          <ChevronDownIcon className="float-right h-5 w-5 mt-1" />
        </button>
        {isOpen && (
          <div className="absolute z-10 w-48 mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.map((option) => (
                <button
                  key={option}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                  onClick={() => {
                    setFilterValues({ ...filterValues, [filter.key]: option });
                    setIsOpen(false);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return data ? (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        {/* Search Bar */}
        <div className="relative flex-grow md:max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {filters.map((filter) => (
            <FilterDropdown key={filter.key} filter={filter} />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="group px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 ease-in-out"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    <span className="ml-2">
                      {sortColumn === column.key ? (
                        sortDirection === "asc" ? (
                          <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4" />
                        )
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition duration-150 ease-in-out" />
                      )}
                    </span>
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredData.map((row, rowIndex) => (
              <tr
                key={row._id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  rowIndex % 2 === 0
                    ? "bg-gray-50 dark:bg-gray-900"
                    : "bg-white dark:bg-gray-800"
                }`}
              >
                {columns.map((column) => {
                  const value = column.key.includes(".")
                    ? column.key
                        .split(".")
                        .reduce((obj, key) => obj && obj[key], row)
                    : row[column.key];
                  return (
                    <td
                      key={column.key}
                      id={row._id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 font-medium"
                    >
                      {typeof value === "boolean"
                        ? value
                          ? "Completed"
                          : "In Progress"
                        : value}
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(row)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4 transition duration-150 ease-in-out inline-flex items-center"
                  >
                    <PencilIcon className="h-5 w-5 mr-1" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => openModal(row._id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition duration-150 ease-in-out inline-flex items-center"
                  >
                    <SearchCircleIcon className="h-5 w-5 mr-1" />
                    <span>View</span>
                  </button>
                </td>
                <CourseModal
                  isOpen={openModalId === row._id}
                  onClose={closeModal}
                  course={row}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full">No data</div>
  );
}
