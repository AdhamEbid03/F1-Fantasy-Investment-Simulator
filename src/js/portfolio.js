let portfolio = JSON.parse(localStorage.getItem("portfolio")) || {};

function buyDriver(index) {
    let driver = drivers[index];
    if (!portfolio[driver.name]) {
        portfolio[driver.name] = { shares: 0, totalSpent: 0 };
    }
    portfolio[driver.name].shares += 1;
    portfolio[driver.name].totalSpent += driver.price;
    
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
    alert(`You now own ${portfolio[driver.name].shares} shares in ${driver.name}`);
}

// Function to generate a performance chart
function generatePortfolioChart() {
    let ctx = document.getElementById('portfolio-chart').getContext('2d');

    let driverNames = Object.keys(portfolio);
    let driverValues = driverNames.map(driver => {
        let latestPrice = getDriverPrice(driver);
        return portfolio[driver].shares * latestPrice;
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: driverNames,
            datasets: [{
                label: 'Portfolio Value ($)',
                data: driverValues,
                backgroundColor: 'rgba(0, 128, 255, 0.6)',
                borderColor: 'rgba(0, 128, 255, 1)',
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

// Call this function inside updatePortfolio()
generatePortfolioChart();
