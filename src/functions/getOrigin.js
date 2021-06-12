// import request from "request";
// import cheerio from "cheerio";
import axios from "axios";
export default async function getOrigin(word) {
  const response = await axios.get(`https://spell-bee-backend.vercel.app/words/${word}`);
  const data = await response.data;

  return data.origin == "" ? "Origin Not Found" : data.origin;
}
