const express = require("express");
const { exec, execSync } = require("child_process");
const path = require("path");
const app = express();
const os = require("os");

// Determine the base command depending on the environment
const isDevelopment = process.env.NODE_ENV === "DEV";
const baseCommand = isDevelopment ? "mvn yamcs:run" : "authbind --deep mvn yamcs:run";

// Determine the system type
const platform = process.platform;

// Define the base directory to start the search
const baseDir = platform === "win32" ? "P:\\Documents\\CubeSatMCS" : "~/Documents/CubeSatMCS";

// Adjust the path-finding command based on OS
let findCommand;
if (platform === "win32") {
    findCommand = `dir /S /B "${path.join(baseDir, 'uon-yamcs-instance')}"`;
} else {
    findCommand = `find ${baseDir} -type d -name uon-yamcs-instance`;
}

// Execute the find command and handle errors
let yamcsPath;
try {
    yamcsPath = execSync(findCommand).toString().trim();
} catch (err) {
    console.error("Failed to find the uon-yamcs-instance directory:", err);
    process.exit(1); // Exit if the directory is not found
}

process.chdir(yamcsPath);

// Execute the base command depending on OS
if (platform === "win32") {
    exec(`cmd /c "${baseCommand}"`, commandCallback);
} else {
    exec(baseCommand, commandCallback);
}

function commandCallback(err, stdout, stderr) {
    if (err) {
        console.error("Command execution error:", err);
        return;
    }
    console.log("Command output:", stdout);
}

// Run a separate Python simulator
exec("python3 simulator.py", (err, stdout, stderr) => {
    if (err) {
        console.error("Simulator error:", err);
        return;
    }
    console.log("Simulator output:", stdout);
});

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
