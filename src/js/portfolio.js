// Load portfolio from LocalStorage
let portfolio = JSON.parse(localStorage.getItem("portfolio")) || {};
const portfolioDiv = document.getElementById("portfolio-list");
const totalValueSpan = document.getElementById("total-value");
let portfolioChart;

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

// Function to load realized profit/loss
function loadRealizedPL() {
    let realizedPL = localStorage.getItem("realizedPL");
    if (realizedPL === null) {
        realizedPL = 0;
        localStorage.setItem("realizedPL", realizedPL);
    }
    return parseFloat(realizedPL);
}

// Function to update balance display
function updateBalanceDisplay() {
    let balance = loadUserBalance();
    let balanceElement = document.getElementById("user-balance").innerText = formatCurrency(balance);

    if(balanceElement){
        balanceElement.innerText = formatCurrency(balance);
    }
}

// Function to update realized profit/loss display
function updateRealizedPLDisplay() {
    let realizedPL = loadRealizedPL();
    let realizedPLElement = document.getElementById("realized-pl");

    if (realizedPLElement)
    {
        realizedPLElement.innerText = formatCurrency(realizedPL);
        realizedPLElement.style.color = realizedPL >= 0 ? "green" : "red"; // Color-coded profit/loss
    }
}

// Function to update the portfolio display
function updatePortfolio() {
    let portfolioDiv = document.getElementById("portfolio-list");
    let totalValueSpan = document.getElementById("total-value");

    if(!portfolioDiv || !totalValueSpan) return;

    portfolioDiv.innerHTML = "";

    let totalValue = 0;
    let driverNames = [];
    let driverValues = [];

    if (Object.keys(portfolio).length === 0) {
        portfolioDiv.innerHTML = "<p>No investments yet.</p>";
        return;
    }

    Object.keys(portfolio).forEach(driverName => {
        let driver = portfolio[driverName];
        let latestPrice = getDriverPrice(driverName);
        let totalInvestmentValue = driver.shares * latestPrice;
        totalValue += totalInvestmentValue;

        driverNames.push(driverName);
        driverValues.push(totalInvestmentValue);

        // Separate whole and fractional shares
        let displayShares = driver.shares % 1 === 0
            ? `${Math.floor(driver.shares)} shares`
            : `${driver.shares.toFixed(4)} shares`;

        // Calculate weighted average purchase price
        let totalSpent = driver.totalSpent;
        let avgPurchasePrice = totalSpent / driver.shares;

        let profitLoss = totalInvestmentValue - totalSpent;

        const row = document.createElement("div");
        row.classList.add("holding-row");
        row.innerHTML = `
            <span><strong>${driverName}</strong> - ${displayShares}</span>
            <span>💰 Current Value: $${totalInvestmentValue.toFixed(2)}</span>
            <span>📌 Avg. Buy Price: $${avgPurchasePrice.toFixed(2)}</span>
            <span style="color:${profitLoss >= 0 ? 'green' : 'red'};">
                ${profitLoss >= 0 ? "📈" : "📉"} Profit: $${profitLoss.toFixed(2)}
            </span>
        `;
        portfolioDiv.appendChild(row);
    });

    totalValueSpan.innerText = `$${totalValue.toFixed(2)}`;

    updateBalanceDisplay();
    updateRealizedPLDisplay();

    // Update chart
    generatePortfolioChart(driverNames, driverValues);
}

// Function to get the latest driver price
function getDriverPrice(driverName) {
    let storedDrivers = JSON.parse(localStorage.getItem("drivers")) || [];
    let driver = storedDrivers.find(d => d.name === driverName);
    return driver ? driver.price : 50; // Default price if not found
}

// Function to load portfolio value history
function loadPortfolioHistory() {
    let history = JSON.parse(localStorage.getItem("portfolioHistory")) || [];
    return history;
}

// Function to save portfolio history (keep last 20 entries)
function savePortfolioHistory(value) {
    let history = JSON.parse(localStorage.getItem("portfolioHistory")) || [];

    if (history.length === 0) {
        history = Array(10).fill(50000); // Initialize with default values if empty
    }

    history.push(value);
    if (history.length > 20) history.shift(); // Keep only last 20 data points
    localStorage.setItem("portfolioHistory", JSON.stringify(history));
}

// Function to calculate portfolio value
function calculatePortfolioValue() {
    let portfolio = JSON.parse(localStorage.getItem("portfolio")) || {};
    let totalValue = 0;

    Object.keys(portfolio).forEach(driverName => {
        let driver = portfolio[driverName];
        let latestPrice = getDriverPrice(driverName);
        totalValue += driver.shares * latestPrice;
    });

    return totalValue;
}

// Function to update portfolio tracker
function updatePortfolioTracker() {
    let currentValue = calculatePortfolioValue();
    let history = loadPortfolioHistory();

    let previousValue = history.length > 1 ? history[history.length - 2] : 50000; // Default if no history

    let change = currentValue - previousValue;
    let rateOfReturn = (previousValue > 0) ? (change / previousValue) * 100 : 0;

    // Update UI
    document.getElementById("portfolio-value").innerText = formatCurrency(currentValue);
    document.getElementById("portfolio-change").innerText = formatCurrency(change);
    document.getElementById("portfolio-change").className = change >= 0 ? "positive" : "negative";
    document.getElementById("rate-of-return").innerText = `${rateOfReturn.toFixed(2)}%`;
    document.getElementById("rate-of-return").className = rateOfReturn >= 0 ? "positive" : "negative";

    // Only update chart if value actually changes
    if (currentValue !== previousValue) {
        savePortfolioHistory(currentValue);
        updatePortfolioChart();
    }
}

// Function to update the portfolio chart
function updatePortfolioChart() {
    let ctx = document.getElementById("portfolio-chart").getContext("2d");
    let history = loadPortfolioHistory();

    // Ensure the history is always reset to 0 on a new session
    if (history.length === 0 || history.every(val => val === 0)) {
        history = Array(10).fill(0);
        localStorage.setItem("portfolioHistory", JSON.stringify(history));
    }

    if (!portfolioChart) {
        // Create the chart only once
        portfolioChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: Array(history.length).fill(""),
                datasets: [{
                    label: "Portfolio Value",
                    data: history,
                    borderColor: "cyan",
                    backgroundColor: "rgba(0, 255, 255, 0.1)",
                    borderWidth: 2,
                    pointRadius: 2,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: false,
                scales: {
                    y: { beginAtZero: true } // Forces the chart to start from 0
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    } else {
        // Update only the data
        portfolioChart.data.datasets[0].data = history;
        portfolioChart.update('none');
    }
}
// Function to see the amount of shares owend in a driver
function updateSharesOwned() {
    let sharesListDiv = document.getElementById("shares-list");
    let portfolio = JSON.parse(localStorage.getItem("portfolio")) || {};

    sharesListDiv.innerHTML = ""; // Clear existing list

    if (Object.keys(portfolio).length === 0) {
        sharesListDiv.innerHTML = "<p>No investments yet.</p>";
        return;
    }

    // Add table header
    let headerRow = document.createElement("div");
    headerRow.classList.add("shares-item");
    headerRow.innerHTML = `
        <span><strong>Driver</strong></span>
        <span><strong>Shares</strong></span>
        <span><strong>Total Invested</strong></span>
        <span><strong>Avg Price</strong></span>
        <span><strong>Unrealized P/L</strong></span>
    `;
    sharesListDiv.appendChild(headerRow);

    Object.keys(portfolio).forEach(driverName => {
        let driver = portfolio[driverName];
        let latestPrice = getDriverPrice(driverName);
        let totalInvestmentValue = driver.shares * latestPrice;
        let displayShares = driver.shares % 1 === 0
            ? `${Math.floor(driver.shares)}`
            : `${driver.shares.toFixed(4)}`;

        let avgPrice = driver.totalSpent / driver.shares || 0;
        let unrealizedPL = totalInvestmentValue - driver.totalSpent;

        let shareItem = document.createElement("div");
        shareItem.classList.add("shares-item");
        shareItem.innerHTML = `
            <span>${driverName}</span>
            <span>${displayShares}</span>
            <span>${formatCurrency(driver.totalSpent)}</span>
            <span>${formatCurrency(avgPrice)}</span>
            <span style="color:${unrealizedPL >= 0 ? 'green' : 'red'};">
                ${formatCurrency(unrealizedPL)}
            </span>
        `;
        sharesListDiv.appendChild(shareItem);
    });
}



// Initialize portfolio display
updatePortfolio();
updateBalanceDisplay();
updateRealizedPLDisplay();
updatePortfolioTracker();
updatePortfolioChart();
updateSharesOwned();