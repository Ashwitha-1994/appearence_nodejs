const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
// Serve static files
app.use(express.static(__dirname));

const PORT = 8080;

// Create uploads folder if not exists
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// Serve uploaded files
app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);

// Multer Storage
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {

        const uniqueName =
            crypto.randomBytes(16).toString("hex") +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }

});

const upload = multer({
    storage
});

// Home Route
app.get("/", (req, res) => {

    res.json({
        success: true,
        service: "Twinn Appearance API"
    });

});
app.get("/upload", (req, res) => {
    res.sendFile(
        path.join(__dirname, "upload.html")
    );
});

// Upload Route
app.post(
    "/api/appearance/upload",
    upload.single("file"),
    (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message: "No file uploaded"
                });

            }

            const fileUrl =
                `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

            res.json({

                success: true,

                filename: req.file.filename,

                originalName: req.file.originalname,

                fileUrl: fileUrl

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                error: error.message
            });

        }

    }
);

// List Uploaded Files
app.get("/files", (req, res) => {

    const files = fs.readdirSync("uploads");

    const data = files.map(file => ({
        filename: file,
        url: `${req.protocol}://${req.get("host")}/uploads/${file}`
    }));

    res.json(data);

});

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});