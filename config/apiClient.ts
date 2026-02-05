import axios from "axios";
import appConfig from "./config";

const apiClient = axios.create({
  baseURL: `${appConfig.apiHost}`,
  headers: {
    "Content-Type": "application/json",
    "X-Tenant-ID": appConfig.tenantId || "",
  },
});

export default apiClient;
