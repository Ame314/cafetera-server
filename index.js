const nodemailer = require('nodemailer');
const net = require('net');
const express = require('express');
const app = express();

// Email configuration
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    tls: {
        rejectUnauthorized: true,
        minVersion: "TLSv1.2"
    },
    auth: {
        user: "amelie.grobrosero@gmail.com",
        pass: "zazc pniy bact higa"
    }
});

// Statistics storage
let dailyStats = {
    uses: 0,
    totalCups: 0,
    lastWaterLevel: 0,
    lastAlertSent: null // Add timestamp for last alert
};

// Reset daily stats at midnight
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        sendDailyReport();
        dailyStats = { 
            uses: 0, 
            totalCups: 0, 
            lastWaterLevel: dailyStats.lastWaterLevel,
            lastAlertSent: dailyStats.lastAlertSent 
        };
    }
}, 60000);

async function sendDailyReport() {
    const emailContent = `
        <h2>Reporte Diario de la Cafetera</h2>
        <p>Usos totales: ${dailyStats.uses}</p>
        <p>Tazas preparadas: ${dailyStats.totalCups}</p>
        <p>Nivel actual de agua: ${dailyStats.lastWaterLevel}cm</p>
    `;

    try {
        await transporter.sendMail({
            from: 'amelie.grobrosero@gmail.com',
            to: 'amelie.grobrosero@gmail.com',
            subject: 'Reporte Diario de Cafetera IoT',
            html: emailContent
        });
        console.log('Daily report sent successfully');
    } catch (error) {
        console.error('Error sending daily report:', error);
    }
}

async function sendWaterAlert(waterLevel) {
    const now = new Date();
    // Only send alert if it's been more than 1 hour since the last alert
    if (!dailyStats.lastAlertSent || (now - dailyStats.lastAlertSent) > 3600000) {
        try {
            await transporter.sendMail({
                from: 'amelie.grobrosero@gmail.com',
                to: 'amelie.grobrosero@gmail.com',
                subject: '¡Alerta! Nivel de Agua Bajo en Cafetera',
                html: `
                    <h2>¡Alerta de Agua!</h2>
                    <p>El nivel de agua en la cafetera está bajo (${waterLevel.toFixed(1)}cm).</p>
                    <p>Por favor, rellene el depósito para asegurar el funcionamiento correcto.</p>
                    <p>Fecha y hora: ${now.toLocaleString()}</p>
                `
            });
            dailyStats.lastAlertSent = now;
            console.log('Water alert sent successfully');
        } catch (error) {
            console.error('Error sending water alert:', error);
        }
    }
}

app.use(express.json());

// Update endpoint to handle water level checks
app.post('/update_stats', (req, res) => {
    const { uses, cups, waterLevel } = req.body;
    dailyStats.uses += uses || 0;
    dailyStats.totalCups += cups || 0;
    
    if (waterLevel !== undefined) {
        dailyStats.lastWaterLevel = waterLevel;
        // Send alert if water level is below 2cm
        if (waterLevel <= 2) {
            sendWaterAlert(waterLevel);
        }
    }
    res.send('Stats updated');
});

// Additional endpoint for water alerts from ESP32
app.post('/water_alert', (req, res) => {
    const { status, waterLevel } = req.body;
    if (status === 'low') {
        sendWaterAlert(waterLevel || dailyStats.lastWaterLevel);
    }
    res.send('Alert processed');
});

const PORT = 8087;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});