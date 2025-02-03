// Load portfolio from localStorage
let portfolio = JSON.parse(localStorage.getItem("portfolio")) || {};
const leaderboardDiv = document.getElementById("leaderboard");

// Function to calculate total portfolio value
function calculateTotalValue() {
    let totalValues = [];

    Object.keys(portfolio).forEach(driverName => {
        let driver = portfolio[driverName];
        let latestPrice = getDriverPrice(driverName); // Get the latest stock price
        let totalValue = driver.shares * latestPrice;
        
        totalValues.push({
            name: driverName,
            shares: driver.shares,
            totalSpent: driver.totalSpent,
            currentValue: totalValue,
            profit: (totalValue - driver.totalSpent).toFixed(2),
        });
    });

    return totalValues;
}

// Function to get the latest driver price (matches portfolio.js)
function getDriverPrice(driverName) {
    let storedDrivers = JSON.parse(localStorage.getItem("drivers")) || [];
    let driver = storedDrivers.find(d => d.name === driverName);
    return driver ? driver.price : 50; // Default price if not found
}

// Function to update leaderboard display
function updateLeaderboard() {
    leaderboardDiv.innerHTML = "";

    let rankings = calculateTotalValue();

    // Sort rankings by highest profit
    rankings.sort((a, b) => b.profit - a.profit);

    if (rankings.length === 0) {
        leaderboardDiv.innerHTML = "<p>No investors yet.</p>";
        return;
    }

    rankings.forEach((entry, index) => {
        let row = document.createElement("div");
        row.classList.add("leaderboard-row");
        row.innerHTML = `
            <span>#${index + 1} - ${entry.name}</span>
            <span>💰 $${entry.currentValue.toFixed(2)}</span>
            <span style="color:${entry.profit >= 0 ? 'green' : 'red'};">
                ${entry.profit >= 0 ? "📈" : "📉"} ${entry.profit}
            </span>
        `;
        leaderboardDiv.appendChild(row);
    });
}

// Reset leaderboard data
document.getElementById("reset-leaderboard").addEventListener("click", function() {
    localStorage.removeItem("portfolio"); // Clears only portfolio data
    alert("Leaderboard reset!");
    location.reload(); // Refresh page
});

// Initialize leaderboard display
updateLeaderboard();
