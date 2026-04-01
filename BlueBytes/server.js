import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify SMTP connection on startup to catch auth failures early
transporter.verify((error, success) => {
    if (error) {
        console.error("Failed to authenticate with Gmail SMTP:", error);
    } else {
        console.log("Gmail SMTP server is ready to take messages");
    }
});

app.post("/contact", async (req, res) => {
    const { name, email, agency, message } = req.body;

    if (!name || !email || !agency || !message) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        await transporter.sendMail({
            from: `"BlueBytes Contact" <${process.env.EMAIL_USER}>`,
            to: "Ideas@BlueBytes.ai",
            subject: `New Contact Form Submission from ${name}`,
            text: `
Name: ${name}
Email: ${email}
Agency: ${agency}
Message:
${message}
            `
        });

        res.json({ success: true });
    } catch (err) {
        console.error("Failed to send email:", err);
        res.status(500).json({ error: "Failed to send message.", details: err?.message });
    }
});

app.listen(3000, () => console.log("Backend running on port 3000"));
