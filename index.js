const nodemailer = require('nodemailer');   
const net = require('net');

var socket = new net.createServer(onConnected)
socket.listen(8087, 'localhost');

function onConnected(socket) {
    console.log(`New client: ${socket.remoteAddress}:${socket.remotePort}`);

    socket.on("data", function(data) {
        console.log("data received:", data.toString());
    });
  }
  

let configOptions = {
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
}

const transporter = nodemailer.createTransport(configOptions)


async function main() {
    const info = await transporter.sendMail({
        from: 'amelie.grobrosero@gmail.com',
        to: 'amelie.grobrosero@gmail.com',
        subject: 'Nodemailer Test',
        text: 'This is a test email sent using Nodemailer.',
        html: '<h1>This is a test email sent using Nodemailer.</h1>'
    }
    )
    console.log("Message sent: %s", info.messageId);
}
main()