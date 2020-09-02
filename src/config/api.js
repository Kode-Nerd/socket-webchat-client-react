const BASEURL = process.env.REACT_APP_HOST || 'http://localhost';
const PORT = process.env.REACT_APP_PORT || 3000;
const PROD_BASEURL = process.REACT_APP_PROD_BASEURL || window.location.origin;

export default {
  production: {
    baseURL: PROD_BASEURL,
  },
  development: {
    baseURL: `${BASEURL}:${PORT}`
  }
}