import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "../../components/Table/DataTable";
import { API_URL } from "../../constants";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";

function InstituteManagement() {
  const [tableData, setTableData] = useState(null);
  const [filters, setFilters] = useState([]);
  const navigate = useNavigate();
  // const tableData = [
  //   {
  //     id: 1,
  //     instituteName: "Institute A",
  //     regionName: "North",
  //     unitName: "Unit 1",
  //     status: "Active",
  //   },
  //   {
  //     id: 2,
  //     instituteName: "Institute B",
  //     regionName: "South",
  //     unitName: "Unit 2",
  //     status: "Inactive",
  //   },
  //   {
  //     id: 3,
  //     instituteName: "Institute C",
  //     regionName: "East",
  //     unitName: "Unit 3",
  //     status: "Active",
  //   },
  //   {
  //     id: 4,
  //     instituteName: "Institute A",
  //     regionName: "West",
  //     unitName: "Unit 4",
  //     status: "Pending",
  //   },
  //   // Add more data as needed
  // ];

  // Column definitions
  // Column definitions
  const columns = [
    { key: "name", label: "Institute Name" },
    { key: "address", label: "Address" },
    { key: "contact", label: "Contact" },
    { key: "email", label: "Email" },
    { key: "region.name", label: "Region" },
    { key: "unit.name", label: "Unit" },
  ];

  // Filter definitions
  useEffect(() => {
    const updatedFilters = tableData
      ? [
          {
            key: "region.name",
            label: "Filter by Region",
            options: Array.from(
              new Set(
                tableData.map((institute) => institute?.region?.name) || []
              )
            ),
          },
          {
            key: "unit.name",
            label: "Filter by Unit",
            options: Array.from(
              new Set(tableData.map((institute) => institute?.unit?.name) || [])
            ),
          },
        ]
      : [];
    setFilters(updatedFilters);
  }, [tableData]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          API_URL + "/location/institute/management/"
        );
        setTableData(response.data.data); // No need to await here as data is already resolved
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run only once on mount

  // Handler functions
  const handleEdit = (row) => {
    navigate(`/institute-management/form/${row._id}`, {
      state: {
        institute: row,
        operation: "edit",
      },
    });
  };

  const handleDelete = (row) => {
    console.log("Delete:", row);
  };

  return tableData == null ? null : (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end mb-4">
          <Link to="form/new">
            <Button>Add Institute</Button>
          </Link>
        </div>
        <DataTable
          data={tableData}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          filters={filters}
        />
      </div>
    </div>
  );
}

export default InstituteManagement;
