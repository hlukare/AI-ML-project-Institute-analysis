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
export default function UnitForm() {
  const [isEditing, setIsEditing] = useState(false);
  // Unit Lead
  const [selectedUnitLead, setSelectedUnitLead] = useState("");
  const [unitLeadOptions, setUnitLeadOptions] = useState([]);
  // Unit Lead
  const [selectedRegion, setSelectedRegion] = useState("");
  const [regionLeadOptions, setRegionOptions] = useState([]);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { unit, operation } = location.state || {};
  let defaultUnitLeadOption = {};
  let defaultRegionOption = {};

  const { user, role } = useSelector((state) => state.auth);
  useEffect(() => {
    if (operation === "edit") {
      defaultUnitLeadOption = {
        value: unit.unit_lead?._id,
        label: unit.unit_lead?.name,
      };
      defaultRegionOption = {
        value: unit.region?._id,
        label: unit.region?.name,
      };
      setSelectedUnitLead(unit?.unit_lead?._id);
      setSelectedRegion(unit?.region?._id);
    } else {
      setIsEditing(true);
    }
  }, []);

  // Fetch unit leads and regions
  useEffect(() => {
    const fetchRegions = async () => {
      const response = await axios.get(`${API_URL}/location/region`);

      const data = response.data.data;
      const formattedData = data.map((region) => ({
        value: region._id,
        label: region.name,
      }));
      if (role == "RegionLead") {
        const region = formattedData.find(
          (region) => region.value == user.region._id
        );
        setSelectedRegion(region);
        setRegionOptions([region]);
      } else {
        setRegionOptions(formattedData);
      }
    };
    const fetchUnitLeads = async () => {
      try {
        const response = await axios.get(`${API_URL}/user`, {
          params: {
            role: "UnitLead",
          },
        });

        const data = response.data.data;
        const formattedData = data.map((unit) => ({
          value: unit._id,
          label: unit.name,
        }));
        setUnitLeadOptions(formattedData);
      } catch (error) {
        console.error("Error fetching unit leads:", error);
      }
    };
    fetchRegions();
    fetchUnitLeads();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues:
      operation === "edit"
        ? {
            name: unit.name,
          }
        : {},
  });

  // Handler functions
  const handleEdit = (row) => {
    setSelectedUnitLead(row.unit_lead_id);
  };

  // Handle form submit
  const onSubmit = async (data) => {
    try {
      console.log(data);
      console.log("Unit Lead ID:", selectedUnitLead);
      console.log("Region ID:", selectedRegion);
      let response = null;
      if (operation === "edit") {
        response = await axios.put(`${API_URL}/location/unit/${unit._id}`, {
          name: data.name,
          region_id: selectedRegion,
          unit_lead_id: selectedUnitLead,
        });
      } else {
        response = await axios.post(`${API_URL}/location/unit/`, {
          name: data.name,
          unit_lead_id: selectedUnitLead,
          region_id: selectedRegion,
        });
      }
      if (response.status === 201 || response.status == 200) {
        console.log("Unit created successfully");
        setIsEditing(false);
      } else {
        console.log("Error creating unit");
      }
      navigate("/unit-management");
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
        {/* UNIT NAME */}
        <div className="space-y-2">
          <Label htmlFor="name">Unit Name</Label>
          <Input
            id="name"
            placeholder="Enter the unit name"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("name", {
              required: "Unit name is required",
              minLength: {
                value: 2,
                message: "Unit name must be at least 2 characters",
              },
            })}
            aria-invalid={errors.name ? "true" : "false"}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>
        {/* REGION LEAD */}
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
        {/* UNIT LEAD */}
        <div className="space-y-2">
          <Label htmlFor="email">Unit Lead</Label>
          <Dropdown
            id="unit_lead_id"
            ref={dropdownRef}
            options={unitLeadOptions}
            defaultOption={defaultUnitLeadOption}
            value={selectedUnitLead}
            onChange={(value) => setSelectedUnitLead(value)}
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
          />
          {errors.unit_lead_id && (
            <p className="text-red-500 text-sm mt-1">
              {errors.unit_lead_id.message}
            </p>
          )}
        </div>

        <Button type="submit" className={`w-full ${isEditing ? "" : "hidden"}`}>
          {operation === "edit" ? "Update Unit" : "Create Unit"}
        </Button>
      </form>
    </>
  );
}
