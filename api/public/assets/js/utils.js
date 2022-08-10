function postData(url = '', data = {}) {
    return fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
        referrer: 'no-referer',
        body: JSON.stringify(data),
    })
    .then(response => response.json());
}

function signIn() {
    const body = {
        username: document.forms[0].elements[0].value,
        password: document.forms[0].elements[1].value,
    };

    postData('/login', body)
    .then((response) => {
        if(response.status !== 200) throw new Error(response.error);
        window.location.replace('/game.html');
    })
    .catch((error) => {
        window.alert(error.message);
        window.location.replace('/index.html');
    });
}

function signUp() {
    const body = {
        email: document.forms[0].elements[0].value,
        username: document.forms[0].elements[1].value,
        password: document.forms[0].elements[2].value,
    };

    postData('/signup', body)
    .then((response) => {
        if(response.status !== 200) throw new Error(response.error);
        window.alert('user created successfully');
        window.location.replace('/index.html');
    })
    .catch((error) => {
        window.alert(error.message);
        window.location.replace('/signup.html');
    });
}

function forgotPassword() {
    console.log("forgot password");
}

function resetPassword() {
    console.log("reset Password");
}