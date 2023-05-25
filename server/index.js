const express = require('express');
const cors = require('cors');

const authRoutes = require("./routes/auth.js");

const app = express();
const PORT = process.env.PORT || 5000;

require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = require('twilio')(accountSid, authToken);


app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/', (req, res) => {                   //Data that stream will put into endpoint
    const { message, user: sender, type, members } = req.body;

    if(type === 'message.new') {
        members
            .filter((member) => member.user_id !=sender.id)
            .forEach(({ user }) => {
                if(!user.online) {
                    twilioClient.messages.create({
                        body: `You have a new message from ${message.user.fullName} - ${message.text}`,
                        from: '+13158182598',
                        to: user.phoneNumber
                    })
                        .then(() => console.log("Message Sent"))
                        .catch(err => console.log(err));
                }
            })

            return req.status(200).send('Message Sent!');
    }

    return res.status(200).send("Not a new message!!");
});

app.use('/auth', authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));