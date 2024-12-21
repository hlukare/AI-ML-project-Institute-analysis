// axiosConfig.js
import axios from "axios";
import { API_URL } from "../constants";

const setupAxiosDefaults = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
  axios.defaults.baseURL = API_URL;
};

export default setupAxiosDefaults;
