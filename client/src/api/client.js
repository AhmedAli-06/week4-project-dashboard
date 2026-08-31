import axios from 'axios';
const base = import.meta.env.VITE_API_URL || '/api';
const client = axios.create({ baseURL: base });
let authToken = null;
export function setAuthToken(token) {
  authToken = token;
  if (token) client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete client.defaults.headers.common['Authorization'];
}
export default client;
