// Function to reset all game data
function resetGame() {
    let confirmReset = confirm("Are you sure you want to reset everything? This will erase all data and restart from scratch.");
    
    if (confirmReset) {
        localStorage.clear(); // Clears all saved data
        localStorage.setItem("userBalance", 50000); // Reset balance
        localStorage.setItem("drivers", JSON.stringify(initialDrivers)); // Reset drivers
        localStorage.setItem("portfolio", JSON.stringify({})); // Clear portfolio
        localStorage.setItem("realizedPL", 0); // Reset realized profit/loss
        localStorage.setItem("portfolioHistory", JSON.stringify(Array(10).fill(0))); // Reset portfolio chart

        if (window.portfolioChart) {
            window.portfolioChart.destroy(); // Destroy chart if it exists
            window.portfolioChart = null;
        }

        location.reload(); // Reload page to apply reset
    }
}

// Ensure the reset button works on every page
document.addEventListener("DOMContentLoaded", function () {
    console.log("Global script loaded");

    setTimeout(() => { // Wait for header to fully render
        let resetButton = document.getElementById("reset-button");
        if (resetButton) {
            console.log("✅ Reset button found!");
            resetButton.addEventListener("click", resetGame);
        } else {
            console.log("❌ Reset button NOT found! Retrying...");
        }
    }, 500); // Delay check by 500ms to ensure the button exists
});
