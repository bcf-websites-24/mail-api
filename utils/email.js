const { EmailClient } = require("@azure/communication-email");
const ejs = require('ejs');

const sendEmail = async (domainDetails, email, name, otp, reset) => {
    const { domain, sender, connectionString } = domainDetails;

    const client = new EmailClient(connectionString);
    let html = '';

    let template = 'views/verify.ejs';
    if (reset) {
        template = 'views/reset.ejs';
    }

    let subject = "Email verification for BUET CSE Fest 2024 Picture Puzzle";
    if (reset) {
        subject = "Password reset for BUET CSE Fest 2024 Picture Puzzle";
    }

    try {
        html = await ejs.renderFile(template, { name, otp });
    } catch (error) {
        throw new Error("Failed to render email template: " + error.message);
    }

    const message = {
        senderAddress: sender,
        content: {
            subject: subject,
            html: html,
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
        throw new Error(response.error);
    }
}

module.exports = { sendEmail };