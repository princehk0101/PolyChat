import axios from "axios";

const API = axios.create({
  baseURL: "http://10.221.211.191:8000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export const registerUser = (data) => API.post("/auth/register/", data);

export const loginUser = (data) => API.post("/auth/login/", data);

export default API;