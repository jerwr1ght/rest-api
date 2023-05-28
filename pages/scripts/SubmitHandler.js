function handleForm(event) { event.preventDefault(); } 

function setEvents() {
    document.querySelector('form').addEventListener('submit', handleForm);
}