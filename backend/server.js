const dbURI = 'mongodb://2kazmierczak:pass2kazmierczak@172.20.44.25/2kazmierczak'

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser()); 

mongoose.connect(dbURI)
    .then(() => console.log('Polaczono z baza'))
    .catch((e) => console.error(e));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    settings: {
        mass: Number,
        springConstant: Number,
        damping: Number,
        amplitude: Number,
    },
});

const User = mongoose.model('User', userSchema);
const JWT_SECRET = '12345'

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.json({ message: 'Użytkownik zarejestrowany' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Blad rejestracji' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Nieprawidlowa nazwa uzytkownika lub haslo' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Nieprawidlowa nazwa uzytkownika lub haslo' });
        }

        const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 3600000
        });

        res.json({ message: 'Zalogowano', token:token});
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Blad logowania' });
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Wylogowano' });
});

app.get('/settings', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Brak tokenu' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        res.json({ settings: user.settings, message: 'Ustawienia wczytane' });
    } catch (e) {
        console.error(e);
        res.status(401).json({ message: 'Nieprawidlowy token' });
    }
});

app.post('/settings', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Brak tokenu' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { settings } = req.body;

        const user = await User.findOneAndUpdate(
            { username: decoded.username },
            { settings },
            { new: true }
        );

        res.json({ message: 'Ustawienia zapisane' });
    } catch (e) {
        console.error(e);
        res.status(401).json({ message: 'Nieprawidlowy token' });
    }
});

app.listen(7055, () => {
    console.log('Serwer dziala');
});