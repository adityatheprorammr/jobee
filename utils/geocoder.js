const dotenv = require("dotenv"); // req dotenv package
dotenv.config({ path: "./config/config.env" }); // use config.env variables
 
const nodeGeocoder = require("node-geocoder");
 
const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
console.log(options);
const geoCoder = nodeGeocoder(options);
 
module.exports = geoCoder;