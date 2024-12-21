"use client";

import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

export default function Dashboard() {
  const classroomActivityChartRef = useRef(null);
  const impairmentChartRef = useRef(null);
  const extracurricularChartRef = useRef(null);
  const alignmentChartRef = useRef(null);

  useEffect(() => {
    // Classroom Activity Chart
    const classroomActivityChart = new Chart(
      classroomActivityChartRef.current,
      {
        type: "bar",
        data: {
          labels: [
            "Group Discussion",
            "Role Play",
            "Case Study",
            "Presentation",
          ],
          datasets: [
            {
              label: "Activity Frequency",
              data: [75, 60, 80, 65],
              backgroundColor: [
                "rgba(255, 99, 132, 0.6)",
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 206, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)",
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
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
            },
          },
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Classroom Activity Frequency",
            },
          },
        },
      }
    );

    // Impairment Analysis Chart
    const impairmentChart = new Chart(impairmentChartRef.current, {
      type: "doughnut",
      data: {
        labels: ["Visual", "Auditory", "Mobility", "Cognitive"],
        datasets: [
          {
            data: [30, 25, 20, 25],
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
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
            position: "right",
          },
          title: {
            display: true,
            text: "Impairment Analysis",
          },
        },
      },
    });

    // Extracurricular Activities Chart
    const extracurricularChart = new Chart(extracurricularChartRef.current, {
      type: "bar",
      data: {
        labels: ["Sports", "Arts", "Community Service", "Leadership"],
        datasets: [
          {
            label: "Average Score",
            data: [75, 80, 85, 70],
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
          {
            label: "Benchmark",
            data: [70, 75, 80, 75],
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Extracurricular Activities",
          },
        },
      },
    });

    // Alignment Score Chart
    const alignmentChart = new Chart(alignmentChartRef.current, {
      type: "radar",
      data: {
        labels: [
          "Curriculum",
          "Industry Needs",
          "Student Goals",
          "Faculty Expertise",
          "Technology Integration",
        ],
        datasets: [
          {
            label: "Score",
            data: [85, 75, 90, 95, 80],
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            pointBackgroundColor: "rgba(255, 99, 132, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(255, 99, 132, 1)",
          },
          {
            label: "Benchmark",
            data: [80, 85, 85, 90, 85],
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            pointBackgroundColor: "rgba(54, 162, 235, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(54, 162, 235, 1)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Alignment Score and Average Points",
          },
        },
      },
    });

    return () => {
      classroomActivityChart.destroy();
      impairmentChart.destroy();
      extracurricularChart.destroy();
      alignmentChart.destroy();
    };
  }, []);

  return (
    <div className=" bg-gray-100 min-h-screen p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Skill Training Monitoring Dashboard
      </h1>

      <div>
        <div className="flex gap-6 mt-5 max-h-[70vh]">
          {/* Classroom Activity Analysis */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">
              Classroom Activity Analysis
            </h2>
            {/* <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-600">
                Best Classroom Activity
              </h3>
              <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">
                  Image Carousel Placeholder
                </span>
              </div>
            </div> */}
            <canvas ref={classroomActivityChartRef}></canvas>
          </div>

          {/* Impairment Analysis */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">
              Impairment Analysis
            </h2>
            <canvas ref={impairmentChartRef} className="mx-auto"></canvas>
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-600">
                Infrastructure Suggestions
              </h3>
              <div className="space-y-2">
                {[
                  {
                    category: "Visual",
                    suggestions: [
                      "Increase font size",
                      "Use high contrast colors",
                      "Provide screen readers",
                    ],
                  },
                  {
                    category: "Auditory",
                    suggestions: [
                      "Use closed captions",
                      "Provide transcripts",
                      "Improve acoustics",
                    ],
                  },
                  {
                    category: "Mobility",
                    suggestions: [
                      "Install ramps",
                      "Widen doorways",
                      "Adjust desk heights",
                    ],
                  },
                  {
                    category: "Cognitive",
                    suggestions: [
                      "Simplify instructions",
                      "Use visual aids",
                      "Provide extra time",
                    ],
                  },
                ].map((item) => (
                  <details
                    key={item.category}
                    className="bg-gray-50 rounded-lg"
                  >
                    <summary className="font-semibold p-2 cursor-pointer hover:bg-gray-100">
                      {item.category}
                    </summary>
                    <ul className="p-2 space-y-1">
                      {item.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-6 mt-5">
          {/* Training Effectiveness */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">
              Training Effectiveness
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Attendance Score", score: 85 },
                { name: "Faculty Score", score: 92 },
                { name: "Marks Score", score: 78 },
                { name: "Student Score", score: 88 },
              ].map((item) => (
                <div key={item.name} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-600">
                    {item.name}
                  </h3>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                          {item.score}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                      <div
                        style={{ width: `${item.score}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extracurricular Activities */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">
              Extracurricular Activities
            </h2>
            <canvas ref={extracurricularChartRef}></canvas>
          </div>
        </div>

        {/* Alignment Score and Average Points */}
        <div className="max-w-[50%] mt-5 mx-auto bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            Alignment Score and Average Points
          </h2>
          <canvas ref={alignmentChartRef}></canvas>
        </div>
      </div>
    </div>
  );
}
