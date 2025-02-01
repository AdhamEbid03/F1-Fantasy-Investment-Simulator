// Function to load the header and footer
function loadComponents() {
    fetch("components/header.html")
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML("afterbegin", data);
        });

    fetch("components/footer.html")
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML("beforeend", data);
        });
}

// Call the function to load components
loadComponents();
