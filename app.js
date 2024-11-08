
const express = require('express');
const ejs = require('ejs');
const path = require('path');
const sequelize = require('./models/index');
const Email = require('./models/email');
const { Op } = require('sequelize');
const { selectDomain } = require('./utils/domainSelector');
const { authenticate } = require('./middlewares/authenticate');
const { errorHandler } = require('./middlewares/errorHandler');
const { sendEmail } = require('./utils/email');
const { authenticator } = require('otplib');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const generateOTP = (length = 6) => {
    const otp = crypto.randomInt(0, Math.pow(10, length)).toString().padStart(length, '0');
    return otp;
};

// Route to send OTP email
app.post('/otp', authenticate, async (req, res, next) => {
    const { name, email, pwd_reset } = req.body;

    let reset = false;

    if (!name || !email || !email.includes('@')) {
        return res.status(400).json({ message: 'Invalid name or email' });
    }

    if (pwd_reset) {
        reset = true;
    }


    const otp = generateOTP(6);
    const domainDetails = selectDomain();

    try {
        const result = await sendEmail(domainDetails, email, name, otp, reset);
        await Email.create({ sender: domainDetails.sender, recipient: email, name, otp, status: 'success' });
        res.status(200).json({ otp: otp, message: 'Email sent successfully!', result });
    } catch (error) {
        await Email.create({ sender: domainDetails.sender, recipient: email, name, otp, status: 'failed', error: error.message });
        next(error);  // Pass error to global error handler
    }
});

// Route to get email statistics
app.get('/status', authenticate, async (req, res) => {
    const now = new Date();
    const oneMinuteAgo = new Date(now - 60 * 1000);
    const oneHourAgo = new Date(now - 60 * 60 * 1000);

    const timezone = req.query.timezone || 'Asia/Dhaka';

    const formatTimeToZone = (timestamp) => {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(timestamp);
    };

    const getStats = async (timeFrame) => {
        const successfulEmails = await Email.count({
            where: { status: 'success', timestamp: { [Op.between]: [timeFrame, now] } }
        });
        const failedEmails = await Email.count({
            where: { status: 'failed', timestamp: { [Op.between]: [timeFrame, now] } }
        });
        const errors = await Email.findAll({
            where: { status: 'failed', timestamp: { [Op.between]: [timeFrame, now] } },
            attributes: ['sender', 'timestamp', 'recipient', 'error']
        });

        const totalEmails = successfulEmails + failedEmails; // Calculate total emails

        return {
            success: successfulEmails,
            failed: failedEmails,
            total: totalEmails,
            errors: errors.map(e => ({
                sender: e.sender,
                timestamp: formatTimeToZone(e.timestamp), // Convert timestamp to the correct timezone
                recipient: e.recipient,
                errorMessage: e.error
            }))
        };
    };

    const stats = {
        lastMinute: await getStats(oneMinuteAgo),
        lastHour: await getStats(oneHourAgo)
    };

    res.render('status', { stats });
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await sequelize.sync();
    console.log('Database synced');
});
