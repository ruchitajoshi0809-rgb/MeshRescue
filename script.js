const emergencyButton = document.getElementById("emergencyButton");
const scanButton = document.getElementById("scanButton");

const emergencyStatus = document.getElementById("emergencyStatus");
const statusMessage = document.getElementById("statusMessage");

const relayStatus = document.getElementById("relayStatus");
const hopCount = document.getElementById("hopCount");
const alertCount = document.getElementById("alertCount");

const vehicleStatuses = document.querySelectorAll(".vehicle-status");
const vehicleCards = document.querySelectorAll(".vehicle-card");

let emergencyRunning = false;

// VEHICLE NETWORK DATA
const vehicles = [
    {
        id: "A",
        distance: 42,
        direction: "East →",
        signal: "Strong",
        relevance: 94
    },
    {
        id: "B",
        distance: 67,
        direction: "East →",
        signal: "Strong",
        relevance: 88
    },
    {
        id: "C",
        distance: 85,
        direction: "West ←",
        signal: "Medium",
        relevance: 18
    },
    {
        id: "D",
        distance: 102,
        direction: "North ↑",
        signal: "Weak",
        relevance: 25
    },
    {
        id: "E",
        distance: 135,
        direction: "East →",
        signal: "Medium",
        relevance: 71
    }
];

// NETWORK SCAN
scanButton.addEventListener("click", function () {

    scanButton.disabled = true;
    scanButton.textContent = "📡 SCANNING NETWORK...";

    vehicles.forEach((vehicle, index) => {

        setTimeout(() => {

            const card = vehicleCards[index];

            if (!card) return;

            // Remove previous network information
            const oldNetworkInfo = card.querySelector(".network-info");

            if (oldNetworkInfo) {
                oldNetworkInfo.remove();
            }

            // Create network information
            const networkInfo = document.createElement("div");

            networkInfo.className = "network-info";

            networkInfo.innerHTML = `
                <span>Signal</span>
                <strong>${vehicle.signal}</strong>

                <span>Relevance</span>
                <strong>${vehicle.relevance}%</strong>

                <span>Network</span>
                <strong>CONNECTED</strong>
            `;

            card.appendChild(networkInfo);

            // Update waiting status
            if (vehicleStatuses[index]) {

                vehicleStatuses[index].textContent = "CONNECTED";

                vehicleStatuses[index].classList.remove(
                    "waiting",
                    "alerted",
                    "relaying"
                );

                vehicleStatuses[index].classList.add("connected");
            }

        }, index * 600);

    });


    setTimeout(() => {
        scanButton.disabled = false;
        scanButton.textContent = "📡 RESCAN NETWORK";

    }, 3500);

});

// EMERGENCY SYSTEM
emergencyButton.addEventListener("click", function () {

    // Prevent multiple clicks
    if (emergencyRunning) {
        return;
    }

    emergencyRunning = true;

    // STEP 1 — Emergency detected
    emergencyStatus.textContent = "EMERGENCY DETECTED";
    statusMessage.textContent =
        "Emergency alert has been created.";

    relayStatus.textContent = "DETECTING";

    emergencyButton.textContent = "🚨 EMERGENCY ACTIVE";

    // STEP 2 — AI selects relay
    setTimeout(function () {

        emergencyStatus.textContent = "AI SELECTING RELAY";

        statusMessage.textContent =
            "Finding the most relevant nearby vehicles...";

        relayStatus.textContent = "SELECTING";

    }, 1500);


    // STEP 3 — First vehicle receives alert
    setTimeout(function () {

        emergencyStatus.textContent = "ALERT FORWARDING";

        statusMessage.textContent =
            "Node A received the emergency alert.";

        relayStatus.textContent = "FORWARDING";

        hopCount.textContent = "1";

        if (vehicleStatuses[0]) {
            vehicleStatuses[0].textContent = "ALERTED";
            vehicleStatuses[0].classList.add("alerted");
        }

    }, 3000);


    // STEP 4 — Second hop
    setTimeout(function () {

        statusMessage.textContent =
            "Node B is relaying the emergency alert.";

        hopCount.textContent = "2";

        if (vehicleStatuses[1]) {
            vehicleStatuses[1].textContent = "RELAYING";
            vehicleStatuses[1].classList.add("relaying");
        }

    }, 4500);


    // STEP 5 — Third hop
    setTimeout(function () {

        statusMessage.textContent =
            "Node E received the emergency alert.";

        hopCount.textContent = "3";

        if (vehicleStatuses[4]) {
            vehicleStatuses[4].textContent = "ALERTED";
            vehicleStatuses[4].classList.add("alerted");
        }

    }, 6000);


    // STEP 6 — Complete
    setTimeout(function () {

        emergencyStatus.textContent = "EMERGENCY ACTIVE";

        statusMessage.textContent =
            "Alert successfully propagated through 3 hops.";

        relayStatus.textContent = "COMPLETE";

        alertCount.textContent = "3";

        emergencyButton.textContent = "✅ ALERT PROPAGATED";

    }, 7500);

});