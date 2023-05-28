var pageSize = 20;

function getLocalSession() {
    const data = {"sessionId": sessionStorage.getItem("sessionId")};

    if (data.sessionId == null) {
        sessionStorage.clear();
        window.location.href = "404.html";
        return null;
    }

    return data;
}

function getTextAreaValue() {
    return document.getElementById('user_text').value;
}

function resetPagination() {
    resetPageView();
    document.getElementsByName("pagination")[0].value = "Show more";
    document.getElementsByName("pagination")[0].removeAttribute("id");   
    document.getElementsByName("pagination")[0].setAttribute("onclick", "showNextPage();");
} 

async function showNextPage() {
    sessionStorage.setItem("page", parseInt(sessionStorage.getItem("page")) + 1);
    await executePageView(sessionStorage.getItem("page"));
}

async function resetPageView() {
    document.getElementById("user_text").value = "";

    var page = parseInt(sessionStorage.getItem("page"));

    if (!page) {
        page = 1;
        sessionStorage.setItem("page", 1);
    }
    //sessionStorage.setItem("page", 1);

    for(var i = 0; i < page; i++) {
        await executePageView(i + 1);
    }
}

async function executePageView(page) {
    if (!(await isServiceEnabled())) {
        return;
    }

    const data = getLocalSession();
    if (data == null) {
        return;
    }

    data.page = page;
    data.pageSize = pageSize;

    const params = new URLSearchParams(data);

    var url = 'http://localhost:3000/view?' + params.toString();

    var xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            //console.log(response);
            if (response.isLast) {
                document.getElementById("user_text").value += response.responseText;
                sessionStorage.setItem("page", 1);
                document.getElementsByName("pagination")[0].value = "Show less";
                document.getElementsByName("pagination")[0].setAttribute("id", "disabled");
                document.getElementsByName("pagination")[0].setAttribute("onclick", "resetPagination();");
            }
            else {
                document.getElementById("user_text").value += response.responseText;
                //sessionStorage.setItem("page", parseInt(sessionStorage.getItem("page")) + 1);
            }
        }
    }

    xhr.send();

}

async function executeView() {

    if (!(await isServiceEnabled())) {
        return;
    }

    const session = getLocalSession();
    if (session == null) {
        return;
    } 

    const params = new URLSearchParams(session);

    const response = await fetch("http://localhost:3000/view?"+params.toString(),
    {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
          }
    })

    var responseData = await response.json();

    if (response.ok) {
        document.getElementById("user_text").value = responseData.responseText;
    } else {
        console.log("An error occured:", responseData.response);
    }
}

async function executeUpdate() {

    if (!(await isServiceEnabled())) {
        return;
    }

    const requestData = getLocalSession();
    if (requestData == null) {
        return;
    } 

    requestData.text = getTextAreaValue(); 

    const response = await fetch("http://localhost:3000/update",
    {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(requestData)
    })

    var responseData = await response.json();
    
    if (response.ok) {
        sessionStorage.setItem("page", 1);
        swal("User's notes", "The text has been saved", "success");
    } else {
        console.log("An error occured:", responseData.response);
    }
}

async function executeDelete() {

    if (!(await isServiceEnabled())) {
        return;
    }

    const session = getLocalSession();
    if (session == null) {
        return;
    } 

    const response = await fetch("http://localhost:3000/logout",
    {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(session)
    })

    var data = await response.json();
    
    if (response.ok) {
        //sessionStorage.removeItem("sessionId");
        sessionStorage.clear();
        window.location.href = "home.html";
    } else {
        console.log("An error occured:", data.response);
    }
}