const express = require("express");
const { exec, execSync } = require("child_process");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(
  cors({
    origin: "http://localhost:4200",
  })
);

const homeDirectory = execSync("echo ~").toString().trim();
const yamcsPath = execSync("find ~ -type d -name  uon-yamcs-instance")
  .toString()
  .trim();
const frontendPath = execSync("find ~ -type d -name  uon-web-interface")
  .toString()
  .trim();

process.chdir(yamcsPath);
exec("mvn yamcs:run", (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});

exec("python3 simulator.py", (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});

process.chdir(frontendPath);

exec("ng serve --open", (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
