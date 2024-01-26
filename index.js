const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const methodOverride = require('method-override');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

const app = express();
app.listen(8000, () => {
    console.log("Server is running on port 8000");
});

//Configure template engine (EJS)
//Static files
app.use(methodOverride('_method'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));

// make sure you have created a database
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'students',
    password: 'your_mysql_password', // replace it with your mysql password
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


async function createStudentDatabaseTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS student_database (
            ID INT AUTO_INCREMENT PRIMARY KEY,
            Name VARCHAR(255) NOT NULL,
            Age INT NOT NULL,
            Email VARCHAR(255) NOT NULL UNIQUE,
            Phone VARCHAR(20),
            RegistrationNumber VARCHAR(20),
            CollegeBatch VARCHAR(20),
            Password VARCHAR(255) NOT NULL
        )
    `;                                                     // databse table idhar create ho rhi hai alag fn hai
    try {
        const [result] = await pool.query(createTableQuery);
        console.log("Table 'student_database' created or already exists");
    } catch (error) {
        console.error("Error creating 'student_database' table:", error);
    }
}

app.get('/login', (req, res) => {
    res.render("login.ejs");
});

app.get('/signup', (req, res) => {
    res.render("signup.ejs");
});

app.post('/signup', async (req, res) => {
    let { name, email, phone, registrationNumber, collegeBatch, age, password } = req.body;

    // Checking if the email already exists or not
    const checkQuery = "SELECT * FROM student_database WHERE Email=?";

    try {
        const [result] = await pool.query(checkQuery, [email]);

        if (result.length === 0) {
            // If no record found in the database, then insert data into the table
            const insertQuery = `
                INSERT INTO student_database
                SET ?`;

            const userData = {
                Name: name,
                Age: age,
                Email: email,
                Phone: phone,
                RegistrationNumber: registrationNumber,
                CollegeBatch: collegeBatch,
                Password: password,
            };

            await pool.query(insertQuery, userData);

            return res.status(200).json({ message: "User successfully registered" });
        } else {
            return res.status(400).json({ error: "Email already exists" });
        }
    } catch (err) {
        console.error('MySQL Error:', err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Additional routes can be added as needed
app.post('/login', async (req, res) => {
    let { email, password } = req.body;

    // Check if the email and password match a user in the database
    const loginQuery = "SELECT * FROM student_database WHERE Email=? AND Password=?";

    try {
        const [result] = await pool.query(loginQuery, [email, password]);

        if (result.length === 1) {
            // Successful login
            return res.status(200).json({ message: "Login successful" });
        } else {
            // Invalid email or password
            return res.status(401).json({ error: "Invalid email or password" });
        }
    } catch (err) {
        console.error('MySQL Error:', err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});



//Temporary storage for OTP
const otpStorage = {};

// GET route for OTP verification
app.get('/verify_otp/:email', (req, res) => {
    const email = req.params.email;

    // Render the OTP verification page
    res.render("verify_otp.ejs", { email });
});


app.post('/verify_otp/:email', async (req, res) => {
    const email = req.params.email;
    const otp = req.body.otp;

    if (otpStorage[email] === otp) {
        // OTP is valid, redirect to the password reset page
        res.redirect(`/reset_password/${encodeURIComponent(email)}`);
    } else {
        // Incorrect OTP
        res.status(401).json({ error: "Invalid OTP" });
    }
});

// Send an OTP to the given email address
// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',//any email service provider , here i have wrote gmail
    auth: {
        user: 'your_email',
        pass: 'your_email_password_appPassord', // app password is secondary passkey provided by email service provider
    },
});

app.get('/forgot_password', (req, res) => {
    res.render("forgot_password.ejs");
});

app.post('/forgot_password', async (req, res) => {
    let { email } = req.body;

    // Check if the email exists in the database
    const checkQuery = "SELECT * FROM student_database WHERE Email=?";

    try {
        const [result] = await pool.query(checkQuery, [email]);

        if (result.length === 1) {
            // If the email exists, send an OTP
            const otp = randomstring.generate({
                length: 6,
                charset: 'numeric',
            });

            // Store OTP in temporary storage
            otpStorage[email] = otp;

            // Send OTP via email
            const mailOptions = {
                from: 'your_email',
                to: email,
                subject: 'Password Reset OTP',
                text: `Your OTP for password reset is: ${otp}`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Email sending error:', error);
                    return res.sendStatus(500);
                }

                console.log('Email sent:', info.response);

                // Redirect to OTP verification page
                res.redirect(`/verify_otp/${encodeURIComponent(email)}`);
            });
        } else {
            // Email not found
            res.status(404).json({ error: "Email not found" });
        }
    } catch (err) {
        console.error('MySQL Error:', err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


app.get('/reset_password/:email', (req, res) => {
    const email = decodeURIComponent(req.params.email);
    res.render("reset_password.ejs", { email });
});

app.post('/reset_password/:email', async (req, res) => {
    const email = decodeURIComponent(req.params.email);
    const newPassword = req.body.newPassword;

    try {
        // Update the user's password in the database
        await pool.query('UPDATE student_database SET password = ? WHERE email = ?', [newPassword, email]);

        // Clean up: Remove used OTP from storage
        delete otpStorage[email];

        // Redirect to the login page
        res.redirect("/login");
    } catch (err) {
        console.error('MySQL error:', err);
        res.sendStatus(500);
    }
});




