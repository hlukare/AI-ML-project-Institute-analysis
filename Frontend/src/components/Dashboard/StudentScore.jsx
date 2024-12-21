import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const StudentDashboard = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const data = {
    attendance_score: 85,
    faculty_teaching_score: 90,
    marks_score: 78,
    student_score: 84,
  };

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const myChartRef = chartRef.current.getContext("2d");

    chartInstance.current = new Chart(myChartRef, {
      type: "pie",
      data: {
        labels: [
          "Attendance",
          "Faculty Teaching",
          "Marks",
          "Overall Student Score",
        ],
        datasets: [
          {
            data: [
              data.attendance_score,
              data.faculty_teaching_score,
              data.marks_score,
              data.student_score,
            ],
            backgroundColor: [
              "rgba(255, 99, 132, 0.8)",
              "rgba(54, 162, 235, 0.8)",
              "rgba(255, 206, 86, 0.8)",
              "rgba(75, 192, 192, 0.8)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
          title: {
            display: true,
            text: "Student Performance Overview",
            font: {
              size: 18,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="min-w-[50%] bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto my-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Student Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="bg-gray-100 rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              {key
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </h2>
            <div className="text-3xl font-bold text-blue-600">{value}%</div>
          </div>
        ))}
      </div>
      <div className="bg-gray-100 rounded-lg p-4 shadow">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default StudentDashboard;
