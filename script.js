const emergencyButton = document.getElementById("emergencyButton");
const scanButton = document.getElementById("scanButton");

const emergencyStatus = document.getElementById("emergencyStatus");
const statusMessage = document.getElementById("statusMessage");

const relayStatus = document.getElementById("relayStatus");
const hopCount = document.getElementById("hopCount");
const alertCount = document.getElementById("alertCount");

const vehicleStatuses = document.querySelectorAll(".vehicle-status");
const vehicleCards = document.querySelectorAll(".vehicle-card");
const bestRelay = document.getElementById("bestRelay");
const relayPath = document.getElementById("relayPath");

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

// DYNAMIC RELAY SELECTION 

function calculateRelayScore(vehicle) {

    // Signal score
    let signalScore = 0;

    if (vehicle.signal === "Strong") {
        signalScore = 100;
    }
    else if (vehicle.signal === "Medium") {
        signalScore = 70;
    }
    else {
        signalScore = 40;
    }

    // Distance score
    // Closer vehicle = better relay
    let distanceScore = Math.max(0, 100 - (vehicle.distance / 150) * 100);

    //Final weighted score
    const relayScore = (signalScore * 0.4) + (vehicle.relevance * 0.4) + (distanceScore * 0.2);
    return Math.round(relayScore);
}

function selectBestRelay() {
    const scoredVehicles = vehicles.map(vehicle => {
        return {
            ...vehicle,
            relayScore: calculateRelayScore(vehicle)
        };

    });

       // Highest score first
    scoredVehicles.sort((a, b)=> b.relayScore - a.relayScore);
    return scoredVehicles;
}

function updateRelayPath(scoredVehicles) {
    const selectedVehicles = scoredVehicles
    .filter(vehicle => vehicle.relayScore >= 50)
    .slice(0,3);

    let pathHTML = `
    <div class ="relay-node">
    <div class="relay-icon">🚑</div>
    <strong>AMBULANCE</strong>
    <small>SOURCE</small>
    </div>
    `;

    selectedVehicles.forEach((vehicle, index) => {

        pathHTML += `
        <div class="relay-arrow">→</div>
        <div class="relay-node">
        <div class="relay-icon">🚗</div>
        <strong>NODE ${vehicle.id}</strong>
        <small>RELAY ${index + 1}</small>
        </div>
        `;
    });

    pathHTML += `
    <div class="relay-arrow">→</div> 
    
    <div class="relay-node">
    <div class="relay-icon">🏥</div>
    <strong>EMERGENCY</strong>
    <small>DESTINATION</small>
    </div>
    `;
    relayPath.innerHTML = pathHTML;
}

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
            
            const relayScore = calculateRelayScore(vehicle);

            networkInfo.innerHTML = `
                <span>Signal</span>
                <strong>${vehicle.signal}</strong>

                <span>Relevance</span>
                <strong>${vehicle.relevance}%</strong>

                <span>Relay Score</span>
                <strong>${relayScore}/100</strong>

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

        const scoredVehicles = selectBestRelay();

        const winner = scoredVehicles[0];

        bestRelay.innerHTML = `
        <strong>🚗 VEHICLE ${winner.id}</strong>

        <span>
        Relay Score: ${winner.relayScore}/100
        </span>

        <span>
        ${winner.distance}m • ${winner.direction}
        </span>

        <span>
        ${winner.signal} Signal
        </span>

        <span>
        ⭐ PRIMARY RELAY 
        </span>
        `;
        updateRelayPath(scoredVehicles);

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

function calculateRelayScore(vehicle) {
    let score = 0;

    //Direction
    if(vehicle.direction === "East →") {
        score += 40;
    } else {
        score += 10;
    }

    if (vehicle.distance <= 50) {
        score += 35;
    } else if (vehicle.distance <= 100) {
        score += 25;
    } else {
        score += 15;
    }

    // Signal
    if(vehicle.signal === "Strong") {
        score += 25;
    } else if (vehicle.signal === "Medium") {
        score += 15;
    } else {
        score += 5;
    }
    return score;

}

function selectBestRelay() {
    const scoredVehicles = vehicles.map(vehicle => {
        return {
            ...vehicle,
            relayScore: calculateRelayScore(vehicle)
        };
    });

    scoredVehicles.sort(
        (a,b) => b.relayScore - a.relayScore);

    return scoredVehicles;
}

