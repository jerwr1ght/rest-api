function getLoginData() {

    data = {
        "username": document.getElementById('username').value,
        "password": document.getElementById('password').value
    }

    return data;
}

async function executeLogin() {

    if (!(await isServiceEnabled())) {
        return;
    }
    

    const response = await fetch("http://localhost:3000/login",
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(getLoginData())
    })

    var data = await response.json();
    
    if (response.ok) {
        sessionStorage.setItem("sessionId", data.sessionId);
        sessionStorage.setItem("page", 1);
        window.location.href = "post.html";
    } else {
        console.log("An error occured:", data.response);
        swal("Login issue", "No user exists with the specified username or password", "error");
    }
}




