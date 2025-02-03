// Load portfolio from LocalStorage
let portfolio = JSON.parse(localStorage.getItem("portfolio")) || {};
const portfolioDiv = document.getElementById("portfolio-list");
const totalValueSpan = document.getElementById("total-value");

// Function to update the portfolio display
function updatePortfolio() {
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
        let wholeShares = Math.floor(driver.shares);
        let fractionalShares = driver.shares - wholeShares;

        // Determine how to display shares (clean format)
        let displayShares = fractionalShares === 0 
            ? `${wholeShares} shares`
            : `${driver.shares.toFixed(4)} shares`; // Show full precision only if fractional exists

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
