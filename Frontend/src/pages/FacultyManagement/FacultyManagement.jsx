import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTableCourse from "../../components/Table/DataTableCourse";
import { API_URL } from "../../constants";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Button from "../../components/Button";

function FacultyManagement() {
  const [tableData, setTableData] = useState(null);
  const [filters, setFilters] = useState([]);
  const navigate = useNavigate();
  const institute = useSelector((state) => state.auth.user.institute);
  // Column definitions
  const columns = [
    { key: "name", label: "Faculty Name" },
    { key: "email", label: "Fauclty Email" },
    { key: "status", label: "Status" },
    { key: "experience", label: "Experience" },
  ];

  // Filter definitions
  useEffect(() => {
    const updatedFilters = tableData
      ? [
          {
            key: "status",
            label: "Filter by Status",
            options: Array.from(
              new Set(tableData.map((teacher) => teacher.status) || [])
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
        const response = await axios.get(API_URL + "/user", {
          params: {
            role: "Teacher",
            institute_id: institute._id,
          },
        });
        setTableData(response.data.data); // No need to await here as data is already resolved
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run only once on mount

  // Handler functions
  const handleEdit = (row) => {
    navigate(`/course-management/form/${row._id}`, {
      state: {
        course: row,
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
          <Link to="/user-registration">
            <Button>Add Faculty</Button>
          </Link>
        </div>
        <DataTableCourse
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

export default FacultyManagement;
