/** @type {import('jest').Config} */
const fs = require('fs');

const config = {
    verbose: true,
    testEnvironment: "jsdom",
    testEnvironmentOptions: {html: fs.readFileSync(__dirname + "/index.html", {encoding: "utf8"})}
  };
  
console.log(config.testEnvironmentOptions.html);

  module.exports = config;

