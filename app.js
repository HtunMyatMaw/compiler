const express = require("express");
const { exec } = require("child_process");
const app = express();
const port = 3000;

const winston = require("winston");
const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "logs/app.log" }),
    ],
});

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json");
    next();
})

app.post("/compile", (req, res) => {
    logger.log("info", "Request received: ", req);
    const { code } = req.body;
    logger.log("info", "Request Body: ", req.body);

    // Save the Java code to a temporary file
    const filename = "Main.java";
    require("fs").writeFileSync(filename, code);

    // Compile the Java code
    exec(`javac ${filename} `, (error, stdout, stderr) => {
        if (error) {
            res.send(code);
        } else {
            exec(`java Main`, (error, stdout, stderr) => {
                res.send(stdout + stderr);
            });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port} `);
});
