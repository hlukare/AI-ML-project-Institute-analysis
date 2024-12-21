import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "../../components/Table/DataTable";
import { API_URL } from "../../constants";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
function RegionManagement() {
  const [tableData, setTableData] = useState(null);
  const navigate = useNavigate();
  // Column definitions
  const columns = [
    { key: "name", label: "Region Name" },
    { key: "region_lead.name", label: "Region Lead Name" },
    { key: "region_lead.email", label: "Region Lead Email" },
    { key: "region_lead.status", label: "Region Lead Status" },
  ];

  // Filter definitions
  const filters = [
    {
      key: "region_lead.name",
      label: "Filter by Region",
      options: tableData?.map((region) => region.name),
    },
  ];
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_URL + "/location/region/");
        setTableData(response.data.data); // No need to await here as data is already resolved
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run only once on mount

  // Handler functions
  const handleEdit = (row) => {
    navigate(`form/${row._id}`, {
      state: {
        region: row,
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
        <div className="flex justify-end mb-4 mr-5">
          <Link to="form/new">
            <Button>Add Region</Button>
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

export default RegionManagement;
