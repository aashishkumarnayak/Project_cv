const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const secretKey = "yourSecretKey"; // Replace with your actual secret key

const schema = new mongoose.Schema({
    name: String,
    password: String
});

const User = new mongoose.model("user", schema);

mongoose.connect("mongodb://127.0.0.1:27017/user_data", {
    useNewUrlParser: true
}).then(() => {
    console.log("database is connected");
}).catch((err) => {
    console.log(err);
});

const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ success: false, message: "Access denied. Token is missing." });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Invalid token." });
        }

        req.user = user;
        next();
    });
};

app.post("/api/cv/user/new", async (req, res) => {
    const user = await User.create(req.body);

    const token = jwt.sign({ userId: user._id, username: user.name }, secretKey);

    res.status(200).json({
        success: true,
        user,
        token
    });
});

app.get("/api/cv/user", authenticateToken, async (req, res) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    });
});

app.listen(5000, () => {
    console.log("server is connected");
});
