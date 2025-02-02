import { drivers } from "./data.js";

const marketDiv = document.getElementById("driver-market");

// Function to create driver stock cards
function updateMarket() {
    marketDiv.innerHTML = "";

    drivers.forEach((driver, index) => {
        const priceChangeClass = driver.change >= 0 ? "price-up" : "price-down";
        const priceChangeIcon = driver.change >= 0 ? "📈" : "📉";

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
            <button class="buy-button" onclick="buyDriver(${index})">BUY</button>
        `;

        marketDiv.appendChild(card);
    });
}

// Function to buy driver (adds to portfolio)
function buyDriver(index) {
    let driver = drivers[index];
    let portfolio = JSON.parse(localStorage.getItem("portfolio")) || {};

    if (!portfolio[driver.name]) {
        portfolio[driver.name] = { shares: 0, totalSpent: 0 };
    }
    
    portfolio[driver.name].shares += 1;
    portfolio[driver.name].totalSpent += driver.price;

    localStorage.setItem("portfolio", JSON.stringify(portfolio));

    alert(`You invested in ${driver.name}!`);
}

setInterval(() => {
    drivers.forEach(driver => {
        let change = (Math.random() * 2 - 1).toFixed(2);
        driver.price = Math.max(20, driver.price + parseFloat(change));
        driver.change = parseFloat(change);
    });
    updateMarket();
}, 5000); // Updates every 5 seconds

updateMarket();