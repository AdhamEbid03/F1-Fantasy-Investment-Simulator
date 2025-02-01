// Load user portfolio data from LocalStorage
let portfolio = JSON.parse(localStorage.getItem("portfolio")) || {};

// Function to calculate total portfolio value
function calculateTotalValue() {
    let totalValues = [];

    Object.keys(portfolio).forEach(driverName => {
        let driver = portfolio[driverName];
        let latestPrice = getDriverPrice(driverName); // Get current driver price
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

// Function to get the latest driver price (mocking price changes)
function getDriverPrice(driverName) {
    let storedDrivers = JSON.parse(localStorage.getItem("drivers")) || [];
    let driver = storedDrivers.find(d => d.name === driverName);
    return driver ? driver.price : 100; // Default to 100 if not found
}

// Function to update leaderboard
function updateLeaderboard() {
    let leaderboardDiv = document.getElementById("leaderboard");
    leaderboardDiv.innerHTML = "";

    let rankings = calculateTotalValue();

    // Sort rankings by profit (highest to lowest)
    rankings.sort((a, b) => b.profit - a.profit);

    rankings.forEach((entry, index) => {
        let row = document.createElement("div");
        row.classList.add("leaderboard-row");
        row.innerHTML = `
            <span>#${index + 1} - ${entry.name}</span>
            <span>💰 ${entry.currentValue.toFixed(2)}</span>
            <span style="color:${entry.profit >= 0 ? 'green' : 'red'};">
                ${entry.profit >= 0 ? "📈" : "📉"} ${entry.profit}
            </span>
        `;
        leaderboardDiv.appendChild(row);
    });
}

// Call update function on page load
updateLeaderboard();
