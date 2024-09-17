const { EmailClient } = require("@azure/communication-email");
const fs = require("fs");
const express = require('express');
const ejs = require('ejs');
const path = require('path');

const json = fs.readFileSync(path.join(__dirname, 'keys.json'));

const keys = JSON.parse(json);

let id = 0;

const sendEmail = async (email, name, otp) => {
    id = (id + 1) % keys.length;

    const connectionString = keys[id]["connectionString"];
    const domain = keys[id]["domain"];

    const client = new EmailClient(connectionString);
    let html = '';

    try {
        html = await ejs.renderFile(path.join(__dirname, 'template.ejs'), { name, otp });
    } catch (error) {
        throw new Error("Failed to render email template");
    }

    message = {
        senderAddress: `DoNotReply@${domain}.buetcsefest2024.com`,
        content: {
            subject: "Email verification for BUET CSE Fest 2024 Picture Puzzle",
            plainText: html,
        },
        recipients: {
            to: [
                {
                    address: email,
                    displayName: name,
                },
            ],
        },
    };

    const poller = await client.beginSend(message);
    const response = await poller.pollUntilDone();

    if (response.status === "Succeeded") {
        return response;
    } else {
        print(response);
        throw new Error("Failed to send email: " + response.error);
    }
}

const app = express();
app.use(express.json());

app.post('/otp', async (req, res) => {
    const { name, email } = req.body;
    const apiKey = req.headers.authorization?.split('Bearer ')[1] || req.query.apiKey; // Get the API key from the request header or query parameter

    if (!apiKey) {
        return res.status(401).json({ message: 'API key is missing' });
    }


    if (apiKey !== process.env.MAIL_API_KEY) {
        return res.status(401).json({ message: 'Invalid API key' });
    }

    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
    }

    if (!email.includes('@')) {
        return res.status(400).json({ message: 'Invalid email address' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    try {
        const result = await sendEmail(email, name, otp);
        res.status(200).json({ message: 'Email sent successfully!', result });
    } catch (error) {
        res.status(500).json({ message: 'Error sending email', error });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
