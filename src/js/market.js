import { drivers } from "./data.js"; // Import driver data

const marketDiv = document.getElementById("driver-market");

// Function to load driver prices from localStorage
function loadSavedDrivers() {
    let savedDrivers = JSON.parse(localStorage.getItem("drivers"));
    if (savedDrivers) {
        savedDrivers.forEach((savedDriver, index) => {
            drivers[index].price = savedDriver.price;
            drivers[index].change = savedDriver.change;
        });
    }
}

// Function to save driver prices to localStorage
function saveDriversToStorage() {
    localStorage.setItem("drivers", JSON.stringify(drivers));
}

// Function to create driver stock cards
function updateMarket() {
    marketDiv.innerHTML = "";

    let portfolio = JSON.parse(localStorage.getItem("portfolio")) || {}; // Load user's portfolio

    drivers.forEach((driver, index) => {
        const priceChangeClass = driver.change >= 0 ? "price-up" : "price-down";
        const priceChangeIcon = driver.change >= 0 ? "📈" : "📉";
        
        let userShares = portfolio[driver.name]?.shares || 0; // Get user shares in this driver
        let hasShares = userShares > 0; // Check if user owns shares

        const card = document.createElement("div");
        card.classList.add("driver-card");

        card.innerHTML = `
            <h3 class="driver-name">${driver.name}</h3>
            <p class="driver-price">Price: $${driver.price.toFixed(2)} 
                <span class="${priceChangeClass}"> 
                    ${priceChangeIcon} ${driver.change.toFixed(2)} (${((driver.change / driver.price) * 100).toFixed(2)}%)
                </span>
            </p>
            <img src="${driver.image}" alt="${driver.name}">
            <br>
            <img src="${driver.teamLogo}" alt="Team Logo" style="width:50px;">
            <br>
            <button class="buy-button" data-index="${index}">BUY</button>
            ${hasShares ? `<button class="sell-button" data-index="${index}">SELL</button>` : ""}
        `;

        marketDiv.appendChild(card);
    });

    // Attach event listeners after the elements are created
    document.querySelectorAll(".buy-button").forEach(button => {
        button.addEventListener("click", (event) => {
            const index = event.target.getAttribute("data-index");
            openInvestmentWindow(index, "buy");
        });
    });

    document.querySelectorAll(".sell-button").forEach(button => {
        button.addEventListener("click", (event) => {
            const index = event.target.getAttribute("data-index");
            openInvestmentWindow(index, "sell");
        });
    });

    saveDriversToStorage(); // Save driver prices after updating UI
}

// Function to update stock prices every 5 seconds
function updateStockPrices() {
    drivers.forEach(driver => {
        let change = (Math.random() * 2 - 1).toFixed(2);
        driver.price = Math.max(20, driver.price + parseFloat(change));
        driver.change = parseFloat(change);
    });

    updateMarket();
    saveDriversToStorage(); // Save new prices to localStorage
}

// Function to open input window for buying/selling
function openInvestmentWindow(index, action) {
    let driver = drivers[index];
    let portfolio = JSON.parse(localStorage.getItem("portfolio")) || {};

    let maxSellableShares = portfolio[driver.name]?.shares || 0;
    let isBuying = action === "buy";

    let amount = prompt(`Enter amount to ${isBuying ? "invest in" : "sell"} ${driver.name}. ${isBuying ? `(Current Price: $${driver.price.toFixed(2)})` : `(You own: ${maxSellableShares.toFixed(4)} shares)`}`);

    amount = parseFloat(amount);

    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount! Please enter a valid value.");
        return;
    }

    if (!isBuying && amount > maxSellableShares) {
        alert("You do not own enough shares to sell this amount.");
        return;
    }

    if (isBuying) {
        buyDriver(index, amount);
    } else {
        sellDriver(index, amount);
    }
}

// Function to buy a driver and store fractional shares
function buyDriver(index, amountInvested) {
    let portfolio = JSON.parse(localStorage.getItem("portfolio")) || {};
    let driver = drivers[index];

    let sharesBought = amountInvested / driver.price; // Fractional shares

    if (!portfolio[driver.name]) {
        portfolio[driver.name] = { shares: 0, totalSpent: 0, purchaseHistory: [] };
    }

    portfolio[driver.name].shares += sharesBought;
    portfolio[driver.name].totalSpent += amountInvested;
    portfolio[driver.name].purchaseHistory.push({ price: driver.price, shares: sharesBought });

    localStorage.setItem("portfolio", JSON.stringify(portfolio));

    alert(`You invested $${amountInvested.toFixed(2)} in ${driver.name}, receiving ${sharesBought.toFixed(4)} shares.`);
    updateMarket(); // Refresh market UI
}

// Function to sell driver shares
function sellDriver(index, sharesToSell) {
    let portfolio = JSON.parse(localStorage.getItem("portfolio")) || {};
    let driver = drivers[index];

    if (!portfolio[driver.name] || portfolio[driver.name].shares < sharesToSell) {
        alert("Error: Not enough shares to sell.");
        return;
    }

    let sellValue = sharesToSell * driver.price; // Total amount received from selling

    portfolio[driver.name].shares -= sharesToSell;
    portfolio[driver.name].totalSpent -= (portfolio[driver.name].totalSpent / portfolio[driver.name].shares) * sharesToSell;

    if (portfolio[driver.name].shares <= 0) {
        delete portfolio[driver.name]; // Remove from portfolio if no shares left
    }

    localStorage.setItem("portfolio", JSON.stringify(portfolio));

    alert(`You sold ${sharesToSell.toFixed(4)} shares of ${driver.name} for $${sellValue.toFixed(2)}.`);
    updateMarket(); // Refresh market UI
}

// Load saved drivers before updating market
loadSavedDrivers();
updateMarket();

// Automatically update market prices every 5 seconds
setInterval(updateStockPrices, 5000);
