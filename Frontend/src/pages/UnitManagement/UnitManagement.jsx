import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "../../components/Table/DataTable";
import Button from "../../components/Button";
import { API_URL } from "../../constants";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function UnitManagement() {
  const [tableData, setTableData] = useState(null);
  const navigate = useNavigate();
  const { region } = useSelector((state) => state.auth.user);
  // Column definitions
  const columns = [
    { key: "name", label: "Unit Name" },
    { key: "unit_lead.name", label: "Unit Lead Name" },
    { key: "unit_lead.email", label: "Unit Lead Email" },
    { key: "region.name", label: "Region" },
    { key: "region.region_lead.name", label: "Region Lead Name" },
    { key: "region.region_lead.email", label: "Region Lead Email" },
  ];

  // Filter definitions
  const filters = [
    {
      key: "region.name",
      label: "Filter by Region",
      options: Array.from(new Set(tableData?.map((unit) => unit.region?.name))),
    },
  ];
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_URL + "/location/unit");
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
        unit: row,
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
            <Button>Add Unit</Button>
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

export default UnitManagement;
