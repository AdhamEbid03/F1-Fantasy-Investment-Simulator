// Load portfolio from LocalStorage
let portfolio = JSON.parse(localStorage.getItem("portfolio")) || {};
const portfolioDiv = document.getElementById("portfolio-list");
const totalValueSpan = document.getElementById("total-value");

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

// Function to generate a portfolio chart
function generatePortfolioChart(driverNames, driverValues) {
    const ctx = document.getElementById("portfolio-chart").getContext("2d");

    // Destroy previous chart if exists
    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: driverNames,
            datasets: [{
                label: "Portfolio Value ($)",
                data: driverValues,
                backgroundColor: "rgba(0, 128, 255, 0.6)",
                borderColor: "rgba(0, 128, 255, 1)",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Initialize portfolio display
updatePortfolio();
updateBalanceDisplay();
updateRealizedPLDisplay();