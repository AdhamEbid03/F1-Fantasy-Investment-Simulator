import { drivers as initialDrivers } from "./data.js"; // Import default driver data

const marketDiv = document.getElementById("driver-market");
const balanceSpan = document.getElementById("user-balance");

// Function to load drivers from localStorage or reset to default
function loadSavedDrivers() {
    let savedDrivers = JSON.parse(localStorage.getItem("drivers"));

    if (!savedDrivers || savedDrivers.length === 0 || savedDrivers.length !== initialDrivers.length) {
        localStorage.setItem("drivers", JSON.stringify(initialDrivers)); // Reset drivers
        return JSON.parse(JSON.stringify(initialDrivers)); // Fresh copy to avoid reference issues
    }
    return savedDrivers;
}

// Function to save drivers to localStorage
function saveDriversToStorage(drivers) {
    localStorage.setItem("drivers", JSON.stringify(drivers));
}

// Function to update stock prices every 5 seconds
function updateStockPrices() {
    let drivers = loadSavedDrivers();

    drivers.forEach(driver => {
        let priceChange = (Math.random() * 4 - 2).toFixed(2); // Random change between -2 and +2
        driver.change = parseFloat(priceChange);
        driver.price = Math.max(20, driver.price + driver.change); // Prevents price going below 20

        // Store price history (keep only last 10 prices)
        if (!driver.priceHistory) driver.priceHistory = [];
        driver.priceHistory.push(driver.price);
        if (driver.priceHistory.length > 10) driver.priceHistory.shift(); // Keep only last 10 records
    });

    saveDriversToStorage(drivers); // Save new prices
    updateMarket(); // Refresh UI
}

// Function to load user balance
function loadUserBalance() {
    let balance = localStorage.getItem("userBalance");
    if (balance === null) {
        balance = 50000; // Set initial balance if not set
        localStorage.setItem("userBalance", balance);
    }
    return parseFloat(balance);
}

// Function to save user balance
function saveUserBalance(amount) {
    localStorage.setItem("userBalance", amount);
}

// Function to format numbers with commas
function formatCurrency(amount) {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Function to update balance display
function updateBalanceDisplay() {
    let balance = loadUserBalance();
    let balanceElement = document.getElementById("user-balance");
    let marketBalanceContainer = document.getElementById("market-balance");

    if (balanceElement && marketBalanceContainer) {
        balanceElement.innerText = formatCurrency(balance);
        marketBalanceContainer.style.display = "block"; // Show balance only on Market page
    }
}

// Function to create driver stock cards
function updateMarket() {
    let drivers = loadSavedDrivers();
    marketDiv.innerHTML = "";

    let portfolio = JSON.parse(localStorage.getItem("portfolio")) || {}; // Load user's portfolio

    drivers.forEach((driver, index) => {
        const priceChangeClass = driver.change >= 0 ? "price-up" : "price-down";
        const priceChangeIcon = driver.change >= 0 ? "📈" : "📉";

        let userShares = portfolio[driver.name]?.shares || 0;
        let hasShares = userShares > 0;

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
            ${hasShares ? `
                <button class="sell-button" data-index="${index}">SELL</button>
                <button class="sell-all-button" data-index="${index}">SELL ALL</button>
            ` : ""}
        `;

        marketDiv.appendChild(card);
    });

    // Attach event listeners after the elements are created
    document.querySelectorAll(".buy-button").forEach(button => {
        button.addEventListener("click", (event) => {
            const index = parseInt(event.target.getAttribute("data-index"));
            buyDriver(index);
        });
    });

    document.querySelectorAll(".sell-button").forEach(button => {
        button.addEventListener("click", (event) => {
            const index = parseInt(event.target.getAttribute("data-index"));
            sellDriver(index);
        });
    });

    document.querySelectorAll(".sell-all-button").forEach(button => {
        button.addEventListener("click", (event) => {
            const index = parseInt(event.target.getAttribute("data-index"));
            sellAllShares(index);
        });
    });

    updateBalanceDisplay();
}

// Function to buy shares
function buyDriver(index) {
    let drivers = loadSavedDrivers();
    let driver = drivers[index];
    let balance = loadUserBalance();
    let portfolio = JSON.parse(localStorage.getItem("portfolio")) || {};

    let amountInvested = prompt(`Enter amount to invest in ${driver.name} (Current Price: $${driver.price.toFixed(2)})`);
    amountInvested = parseFloat(amountInvested);

    if (isNaN(amountInvested) || amountInvested <= 0) {
        alert("Invalid amount! Please enter a valid value.");
        return;
    }

    if (amountInvested > balance) {
        alert("Not enough balance to complete this transaction!");
        return;
    }

    let sharesBought = amountInvested / driver.price;

    if (!portfolio[driver.name]) {
        portfolio[driver.name] = { shares: 0, totalSpent: 0 };
    }

    portfolio[driver.name].shares += sharesBought;
    portfolio[driver.name].totalSpent += amountInvested;

    balance -= amountInvested;
    saveUserBalance(balance);
    localStorage.setItem("portfolio", JSON.stringify(portfolio));

    alert(`You invested $${amountInvested.toFixed(2)} in ${driver.name}, receiving ${sharesBought.toFixed(4)} shares.`);
    updateMarket();
    updateSharesOwned();
}

// Function to sell driver shares
function sellDriver(index) {
    let drivers = loadSavedDrivers();
    let driver = drivers[index];
    let balance = loadUserBalance();
    let portfolio = JSON.parse(localStorage.getItem("portfolio")) || {};
    let realizedPL = parseFloat(localStorage.getItem("realizedPL")) || 0;

    if (!portfolio[driver.name] || portfolio[driver.name].shares <= 0) {
        alert("You don't own any shares to sell.");
        return;
    }

    let maxSellableShares = portfolio[driver.name].shares;
    let sharesToSell = prompt(`Enter number of shares to sell for ${driver.name}. You own: ${maxSellableShares.toFixed(4)} shares.`);

    sharesToSell = parseFloat(sharesToSell);

    if (isNaN(sharesToSell) || sharesToSell <= 0 || sharesToSell > maxSellableShares) {
        alert("Invalid number of shares!");
        return;
    }

    let sellValue = sharesToSell * driver.price;
    let costBasis = (portfolio[driver.name].totalSpent / maxSellableShares) * sharesToSell;
    let profitloss = sellValue - costBasis;

    realizedPL += profitloss;
    balance += sellValue;

    portfolio[driver.name].shares -= sharesToSell;
    portfolio[driver.name].totalSpent -= costBasis;

    if (portfolio[driver.name].shares <= 0) {
        delete portfolio[driver.name];
    }

    saveUserBalance(balance);
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
    localStorage.setItem("realizedPL", realizedPL.toFixed(2));

    alert(`You sold ${sharesToSell.toFixed(4)} shares of ${driver.name} for ${formatCurrency(sellValue)}.`);
    updateMarket();
    updateRealizedPLDisplay();
    updateSharesOwned();
}

function sellAllShares(index) {
    let drivers = loadSavedDrivers();
    let driver = drivers[index];
    let balance = loadUserBalance();
    let portfolio = JSON.parse(localStorage.getItem("portfolio")) || {};
    let realizedPL = parseFloat(localStorage.getItem("realizedPL")) || 0;

    if (!portfolio[driver.name] || portfolio[driver.name].shares <= 0) {
        alert("No shares to sell.");
        return;
    }

    let totalShares = portfolio[driver.name].shares;
    let sellValue = totalShares * driver.price;
    let costBasis = portfolio[driver.name].totalSpent; // Total cost of the shares
    let profitLoss = sellValue - costBasis;

    realizedPL += profitLoss;
    balance += sellValue;

    delete portfolio[driver.name];

    saveUserBalance(balance);
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
    localStorage.setItem("realizedPL", realizedPL.toFixed(2));

    alert(`You sold ALL (${totalShares.toFixed(4)}) shares of ${driver.name} for ${formatCurrency(sellValue)}.`);
    updateMarket();
    updateRealizedPLDisplay();
}

// Load saved drivers & update market
updateMarket();

// Update stock prices every 5 seconds
setInterval(updateStockPrices, 5000);
