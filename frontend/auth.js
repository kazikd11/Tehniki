let token = null;

async function register(username, password) {
    try {
        const response = await fetch('http://localhost:7055/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        alert(data.message);
    } catch (e) {
        console.error(e);
    }
}

async function login(username, password) {
    try {
        const response = await fetch('http://localhost:7055/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        console.log(data)

        if (response.ok) {
            token = data.token;
            // console.log("token")
            // console.log(token)
            document.cookie = `auth_token=${token}; path=/`;
            alert('Zalogowano');
            checkLoginStatus();
        } else {
            alert(data.message);
            // console.log("Nie zalogowano")
        }
    } catch (e) {
        console.error(e);
    }
}

async function saveSettings(settings) {
    if (!token) {
        alert('Musisz sie zalogowac');
        return;
    }

    try {
        const response = await fetch('http://localhost:7055/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ settings }),
        });
        const data = await response.json();
        alert(data.message);
    } catch (e) {
        console.error(e);
    }
}

async function loadSettings() {
    if (!token) {
        alert('Musisz sie zalogowac');
        return;
    }

    try {
        const response = await fetch('http://localhost:7055/settings', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();

        if (response.ok) {
            document.getElementById('mass').value = data.settings.mass;
            document.getElementById('spring-constant').value = data.settings.springConstant;
            document.getElementById('damping').value = data.settings.damping;
            document.getElementById('amplitude').value = data.settings.amplitude;
        }
        alert(data.message);
    } catch (e) {
        console.error(e);
    }
}

async function logout() {
    try {
        const response = await fetch('http://localhost:7055/logout', {
            method: 'POST',
        });
        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            document.cookie = 'auth_token=; path=/';
            checkLoginStatus();
        }
    } catch (e) {
        console.error(e);
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function checkLoginStatus() {
    token = getCookie('auth_token');
    console.log("check")
    console.log(token)

    if (token) {
        document.getElementById('login-button').style.display = 'none';
        document.getElementById('register-button').style.display = 'none';
        document.getElementById('logout-button').style.display = 'inline';
    } else {
        document.getElementById('login-button').style.display = 'inline';
        document.getElementById('register-button').style.display = 'inline';
        document.getElementById('logout-button').style.display = 'none';
    }
}

document.getElementById('register-button').addEventListener('click', () => {
    const u = prompt('Podaj nazwe uzytkownika:');
    const p = prompt('Podaj haslo:');
    register(u, p);
});

document.getElementById('login-button').addEventListener('click', () => {
    const u = prompt('Podaj nazwe uzytkownika:');
    const p = prompt('Podaj haslo:');
    login(u, p);
});

document.getElementById('logout-button').addEventListener('click', () => logout());

document.getElementById('save-settings').addEventListener('click', () => {
    const settings = {
        mass: parseFloat(document.getElementById('mass').value),
        springConstant: parseFloat(document.getElementById('spring-constant').value),
        damping: parseFloat(document.getElementById('damping').value),
        amplitude: parseFloat(document.getElementById('amplitude').value),
    };
    saveSettings(settings);
});

document.getElementById('load-settings').addEventListener('click', loadSettings);

window.onload = () => {
    checkLoginStatus();
};
