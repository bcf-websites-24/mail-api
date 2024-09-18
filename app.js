
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

const app = express();
app.use(express.json());

// Route to send OTP email
app.post('/otp', authenticate, async (req, res, next) => {
    const { name, email } = req.body;

    if (!name || !email || !email.includes('@')) {
        return res.status(400).json({ message: 'Invalid name or email' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    const domainDetails = selectDomain();

    try {
        const result = await sendEmail(domainDetails, email, name, otp);
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
                timestamp: e.timestamp.toLocaleString(), // Format timestamp to readable string
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
