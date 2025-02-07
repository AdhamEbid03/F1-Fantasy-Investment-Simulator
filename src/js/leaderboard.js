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

// Function to format numbers with commas
function formatCurrency(amount) {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Function to load user balance
function loadUserBalance() {
    let balance = localStorage.getItem("userBalance");
    if (balance === null) {
        balance = 50000;
        localStorage.setItem("userBalance", balance);
    }
    return parseFloat(balance);
}

// Function to update balance display
function updateBalanceDisplay() {
    let balance = loadUserBalance();
    let balanceElement = document.getElementById("user-balance");

    if (balanceElement) {
        balanceElement.innerText = formatCurrency(balance);
    }
}

window.addEventListener("storage", function (event) {
    if (event.key === "userBalance") {
        updateBalanceDisplay();
    }
});

// Initialize leaderboard display
updateLeaderboard();
updateBalanceDisplay();
