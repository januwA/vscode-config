const axios = require("axios");
const Config = require("./config");

module.exports = function createHttp() {
  return axios.create({
    baseURL: "https://api.github.com",
    headers: {
      Authorization: `token ${Config.githubToken}`,
      Accept: `application/vnd.github.v3+json`,
      "Content-Type": `application/json`
    }
  });
};
