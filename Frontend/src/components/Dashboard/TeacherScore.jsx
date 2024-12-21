import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const ScoreComparisonGraph = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const data = {
    alignment_score: 5,
    average_score: 13.67,
  };

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const myChartRef = chartRef.current.getContext("2d");

    chartInstance.current = new Chart(myChartRef, {
      type: "bar",
      data: {
        labels: ["Alignment Score", "Average Score"],
        datasets: [
          {
            data: [data.alignment_score, data.average_score],
            backgroundColor: [
              "rgba(66, 153, 225, 0.8)", // Blue
              "rgba(72, 187, 120, 0.8)", // Green
            ],
            borderColor: ["rgba(66, 153, 225, 1)", "rgba(72, 187, 120, 1)"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Score Comparison",
            font: {
              size: 18,
              weight: "bold",
            },
            color: "#2D3748", // Tailwind gray-800
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: Math.ceil(Math.max(data.alignment_score, data.average_score)),
            ticks: {
              font: {
                size: 12,
              },
              color: "#4A5568", // Tailwind gray-700
            },
          },
          x: {
            ticks: {
              font: {
                size: 12,
              },
              color: "#4A5568", // Tailwind gray-700
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
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto my-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Score Overview
        </h2>
        <p className="text-gray-600">
          Comparison of Alignment and Average Scores
        </p>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <canvas ref={chartRef} />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="bg-gray-50 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {key
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {value.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreComparisonGraph;
