import { useEffect, useState } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import PageTitle from "./components/PageTitle";
import DefaultLayout from "./layout/DefaultLayout";
import Dashboard from "./pages/Dashboard";
import UploadImages from "./pages/UploadImages";
import RegionManagement from "./pages/RegionManagement/RegionManagement";
import RegionForm from "./pages/RegionManagement/RegionForm";
import UnitManagement from "./pages/UnitManagement/UnitManagement";
import UnitForm from "./pages/UnitManagement/UnitForm";
import InstituteManagement from "./pages/InstituteManagement/InstituteManagement";
import InstituteForm from "./pages/InstituteManagement/InstituteForm";
import CourseManagement from "./pages/CourseManagement/CourseManagement";
import CourseForm from "./pages/CourseManagement/CourseForm";
import FacultyManagement from "./pages/FacultyManagement/FacultyManagement";
import UserRegistration from "./pages/UserRegistration";
import setupAxiosDefaults from "./config/axiosConfig.js";
import { useSelector } from "react-redux";

function App() {
  const auth = useSelector((state) => state.auth);
  setupAxiosDefaults(auth.accessToken);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated === false) {
      console.log("logout detected, cleaning up...");
      localStorage.removeItem("persist:root");
      navigate("/login");
    }
  }, [auth.isAuthenticated, navigate]);

  return (
    <>
      <DefaultLayout>
        <Routes>
          <Route
            index
            element={
              <>
                <PageTitle title="Dashboard | Classroom Management System" />
                <Dashboard />
              </>
            }
          />
          <Route
            path="/upload-images"
            element={
              <>
                <PageTitle title="Upload Images | Classroom Management System" />
                <UploadImages />
              </>
            }
          />
          <Route path="/region-management">
            <Route index element={<RegionManagement />} />
            <Route path="form/:regionId" element={<RegionForm />} />
          </Route>
          <Route path="/unit-management">
            <Route index element={<UnitManagement />} />
            <Route path="form/:unitId" element={<UnitForm />} />
          </Route>
          <Route path="/institute-management">
            <Route index element={<InstituteManagement />} />
            <Route path="form/:instituteId" element={<InstituteForm />} />
          </Route>
          <Route path="/course-management">
            <Route index element={<CourseManagement />} />
            <Route path="form/:courseId" element={<CourseForm />} />
          </Route>
          <Route path="/faculty-management">
            <Route index element={<FacultyManagement />} />
          </Route>
          <Route path="/user-registration" element={<UserRegistration />} />
        </Routes>
      </DefaultLayout>
    </>
  );
}

export default App;
