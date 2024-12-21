import React, { useState, useEffect, useRef } from "react";
import { set, useForm } from "react-hook-form";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";
import Textarea from "../../components/TextArea.jsx";
import Label from "../../components/Label.jsx";
import Dropdown from "../../components/Dropdown.jsx";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { API_URL } from "../../constants.js";
import { useNavigate, useLocation } from "react-router-dom";
export default function InsitituteForm() {
  const [isEditing, setIsEditing] = useState(false);
  // Unit
  const [selectedUnit, setSelectedUnit] = useState("");
  const [unitOptions, setUnitOptions] = useState([]);
  //  Region
  const [selectedRegion, setSelectedRegion] = useState("");
  const [regionLeadOptions, setRegionOptions] = useState([]);
  // Institute Head
  const [selectedInstituteHead, setSelectedInstituteHead] = useState("");
  const [instituteHeadOptions, setInstituteHeadOptions] = useState([]);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { institute, operation } = location.state || {};
  let defaultUnitOption = {};
  let defaultRegionOption = {};
  let defaultInstituteHeadOption = {};

  const { user, role } = useSelector((state) => state.auth);

  useEffect(() => {
    if (operation === "edit") {
      defaultUnitOption = {
        value: institute?.unit?._id,
        label: institute?.unit?.name,
      };
      defaultRegionOption = {
        value: institute.region?._id,
        label: institute.region?.name,
      };
      defaultInstituteHeadOption = {
        value: institute?.institute_head?._id,
        label: institute?.institute_head?.name,
      };
      setSelectedUnit(institute?.unit?._id);
      setSelectedRegion(institute?.region?._id);
      console.log(institute);
      setSelectedInstituteHead(institute?.institute_head?._id);
    } else {
      setIsEditing(true);
    }
  }, []);

  // Fetch unit leads, regions and institute heads
  useEffect(() => {
    const fetchRegions = async () => {
      const response = await axios.get(`${API_URL}/location/region`);
      const data = response.data.data;
      console.log(data);
      const formattedData = data.map((region) => ({
        value: region._id,
        label: region.name,
      }));
      // if (role == "UnitLead") {
      //   console.log("Formatted Data", formattedData);
      //   console.log("User Region", user);
      //   const region = formattedData.find(
      //     (option) => option.value === user.region._id
      //   );
      //   setSelectedRegion(region);
      //   setRegionOptions([region]);
      // } else {
      setRegionOptions(formattedData);
      // }
    };
    const fetchInstituteHeads = async () => {
      const response = await axios.get(`${API_URL}/user`, {
        params: {
          role: "InstituteHead",
        },
      });
      const data = response.data.data;
      const formattedData = data.map((institute) => ({
        value: institute._id,
        label: institute.name,
      }));
      setInstituteHeadOptions(formattedData);
    };
    fetchInstituteHeads();
    fetchRegions();
  }, []);

  useEffect(() => {
    const fetchUnits = async () => {
      if (!selectedRegion) return;
      try {
        const response = await axios.get(`${API_URL}/location/unit`, {
          params: {
            region_id: selectedRegion,
          },
        });

        const data = response.data.data;
        const formattedData = data.map((institute) => ({
          value: institute._id,
          label: institute.name,
        }));
        setUnitOptions(formattedData);
      } catch (error) {
        console.error("Error fetching unit leads:", error);
      }
    };
    fetchUnits();
  }, [selectedRegion]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues:
      operation === "edit"
        ? {
            name: institute.name,
            address: institute.address,
            contact: institute.contact,
            email: institute.email,
          }
        : {},
  });

  // Handler functions
  const handleEdit = (row) => {
    setSelectedUnit(row.unit_lead_id);
  };

  // Handle form submit
  const onSubmit = async (data) => {
    try {
      let response = null;
      if (operation === "edit") {
        response = await axios.put(
          `${API_URL}/location/institute/management/${institute._id}`,
          {
            name: data.name,
            address: data.address,
            contact: data.contact,
            email: data.email,
            region_id: selectedRegion,
            unit_id: selectedUnit,
            institute_head_id: selectedInstituteHead,
          }
        );
      } else {
        response = await axios.post(
          `${API_URL}/location/institute/management`,
          {
            name: data.name,
            address: data.address,
            contact: data.contact,
            email: data.email,
            region_id: selectedRegion,
            unit_id: selectedUnit,
            institute_head_id: selectedInstituteHead,
          }
        );
      }
      if (response.status === 201 || response.status == 200) {
        console.log("Institute created successfully");
        setIsEditing(false);
        navigate("/institute-management");
      } else {
        console.log("Error creating unit");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {operation === "edit" ? (
        <div className="w-full flex justify-end">
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 mr-2 "
              >
                <path d="m10 10-6.157 6.162a2 2 0 0 0-.5.833l-1.322 4.36a.5.5 0 0 0 .622.624l4.358-1.323a2 2 0 0 0 .83-.5L14 13.982" />
                <path d="m12.829 7.172 4.359-4.346a1 1 0 1 1 3.986 3.986l-4.353 4.353" />
                <path d="m15 5 4 4" />
                <path d="m2 2 20 20" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 mr-2"
              >
                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                <path d="m15 5 4 4" />
              </svg>
            )}

            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
      ) : null}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-w-2xl mx-auto p-2"
      >
        {/* INSTITUTE NAME */}
        <div className="space-y-2">
          <Label htmlFor="name">Institute Name</Label>
          <Input
            id="name"
            placeholder="Enter the institute name"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("name", {
              required: "Institute name is required",
              minLength: {
                value: 2,
                message: "Institute name must be at least 2 characters",
              },
            })}
            aria-invalid={errors.name ? "true" : "false"}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* EMAIL */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        {/* CONTACT NUMBER */}
        <div className="space-y-2">
          <Label htmlFor="contact">Contact</Label>
          <Input
            id="contact"
            type="tel"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("contact", {
              required: "Contact number is required",
              minLength: {
                value: 10,
                message: "Contact number must be at least 10 characters",
              },
            })}
            aria-invalid={errors.contact ? "true" : "false"}
          />
          {errors.contact && (
            <p className="text-red-500 text-sm mt-1">
              {errors.contact.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="about">Address</Label>
          <Textarea
            id="address"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("address", {
              required: "Address section is required",
              minLength: {
                value: 10,
                message: "Address section must be at least 10 characters",
              },
            })}
            aria-invalid={errors.address ? "true" : "false"}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">
              {errors.address.message}
            </p>
          )}
        </div>
        {/* REGION */}
        <div className="space-y-2">
          <Label htmlFor="email">Region</Label>
          <Dropdown
            id="region_lead_id"
            ref={dropdownRef}
            options={regionLeadOptions}
            defaultOption={defaultRegionOption}
            value={selectedRegion}
            onChange={(value) => setSelectedRegion(value)}
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
          />
          {errors.region_lead && (
            <p className="text-red-500 text-sm mt-1">
              {errors.region_lead.message}
            </p>
          )}
        </div>
        {/* UNIT */}
        <div className="space-y-2">
          <Label htmlFor="email">Unit Lead</Label>
          <Dropdown
            id="unit_lead_id"
            ref={dropdownRef}
            options={unitOptions}
            defaultOption={defaultUnitOption}
            value={selectedUnit}
            onChange={(value) => setSelectedUnit(value)}
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
          />
          {errors.unit_lead_id && (
            <p className="text-red-500 text-sm mt-1">
              {errors.unit_lead_id.message}
            </p>
          )}
        </div>
        {/* INSTITUTE LEAD */}
        <div className="space-y-2">
          <Label htmlFor="email">Institute Lead</Label>
          <Dropdown
            id="institute_lead_id"
            ref={dropdownRef}
            options={instituteHeadOptions}
            defaultOption={defaultInstituteHeadOption}
            value={selectedInstituteHead}
            onChange={(value) => setSelectedInstituteHead(value)}
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
          />
          {errors.institute_lead_id && (
            <p className="text-red-500 text-sm mt-1">
              {errors.institute_lead_id.message}
            </p>
          )}
        </div>

        <Button type="submit" className={`w-full ${isEditing ? "" : "hidden"}`}>
          {operation === "edit" ? "Update Institute" : "Create Institute"}
        </Button>
      </form>
    </>
  );
}
