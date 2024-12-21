import React from "react";

const ProgressBar = ({ value, maxValue = 100, label }) => {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">{label}</h2>
        <p className="text-gray-600">
          Score: {value} / {maxValue}
        </p>
      </div>
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200">
              {percentage.toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-teal-200">
          <div
            style={{ width: `${percentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-teal-500 transition-all duration-500 ease-in-out"
          ></div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className=" bg-gray-100 flex items-center justify-center p-4">
      <ProgressBar value={80} maxValue={100} label="Extra-Curricular Score" />
    </div>
  );
};

export default App;
