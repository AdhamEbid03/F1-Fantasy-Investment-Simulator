import { drivers } from "./data.js";

const marketDiv = document.getElementById("driver-market");

// Function to update driver prices
function updateMarket() {
    marketDiv.innerHTML = "";
    drivers.forEach((driver, index) => {
        const priceChange = (Math.random() * 10 - 5).toFixed(2); // Random price fluctuation
        driver.price = Math.max(50, driver.price + parseFloat(priceChange)); // Prevents negative price
        driver.change = parseFloat(priceChange);

        // Create driver card
        const driverCard = document.createElement("div");
        driverCard.innerHTML = `
            <h3>${driver.name}</h3>
            <p>💰 Price: $${driver.price.toFixed(2)}</p>
            <p style="color:${priceChange >= 0 ? 'green' : 'red'};">
                ${priceChange >= 0 ? "📈" : "📉"} ${priceChange}
            </p>
            <button onclick="buyDriver(${index})">Invest</button>
        `;
        marketDiv.appendChild(driverCard);
    });
}

// Function to buy a driver (simplified)
function buyDriver(index) {
    alert(`You bought shares in ${drivers[index].name}!`);
}

setInterval(updateMarket, 3000); // Update every 3 seconds
updateMarket();
