
async function isServiceEnabled() {

    var result = true;

    try {
        const response = await fetch("http://localhost:3000",
        {
            method: 'HEAD'
        });
    } catch (error) {
       swal("Service Health", "Fetching data response is not OK", "error");
       console.log("An error occured: Fetching data response is not OK. Check server");
       result = false;
    }

    

    return result;
}