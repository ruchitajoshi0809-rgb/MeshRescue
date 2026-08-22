const emergencyButton = document.getElementById("emergencyButton");
const scanButton = document.getElementById("scanButton");
const resetButton = document.getElementById("resetButton");
const clearHistoryButton = document.getElementById("clearHistoryButton");

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
let selectedRelayVehicles = [];
let emergencyHistory = JSON.parse(localStorage.getItem("emergencyHistory")) || [];

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

async function loadVehiclesFromBackend() {

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/vehicles"
        );

        if(!response.ok) {
            throw new Error("Failed to fetch vehicles");
        }

        const backendVehicles = await response.json();

        console.log("Vehicles received from backend:", backendVehicles);
        
        vehicles.length = 0;
        vehicles.push(...backendVehicles);
        
        console.log("Vehicles now using backend data:",vehicles);
    } catch(error) {
        console.error("Backend connection error:",error);
    }
    
}
loadVehiclesFromBackend()

async function fetchRelayData() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/relay");

        const data = await response.json();

        console.log("Relay data from backend:", data);

        const winner = data.bestRelay;

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

        updateRelayPath(data.relayPath);

    } catch (error) {
        console.error("Relay API error:", error);
    }
}

async function startEmergencyWithBackend() {

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/relay"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch relay decision");
        }

        const data = await response.json();

        console.log("Emergency relay path:", data.relayPath);

        const path = data.relayPath;
        
        selectedRelayVehicles = path;

        // Emergency status
        emergencyStatus.textContent = "ACTIVE";

        // AI status
        relayStatus.textContent = "PROPAGATING";

        // Number of hops
        hopCount.textContent = path.length;

        // Number of vehicles alerted
        alertCount.textContent = path.length;

        // Update relay path on screen
        updateRelayPath(path);

    } catch (error) {

        console.error("Emergency error:", error);

    }
}

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

    if(!scoredVehicles || scoredVehicles.length === 0){
        relayPath.innerHTML = `
        <div class="relay-node">
        <div class="relay-icon">🚑</div>
        <strong>AMBULANCE</strong>
        <small>SOURCE</small>
        </div>

        <div class="relay-arrow">→</div>

        <div class="relay-node">
        <div class="relay-icon">🏥</div>
        <strong>EMERGENCY</strong>
        <small>DESTINATION</small>
        </div>
        `;
        return;
    }

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

function addEmergencyHistory(path) {

    const historyContainer = document.getElementById("emergencyHistory");

    if(!historyContainer) {
        console.error("Emergency history container not found");
        return;
    }

    const historyNumber = emergencyHistory.length + 1;

    const now = new Date();

    const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    const historyItem = document.createElement("div");

    historyItem.className = "history-item";

    historyItem.innerHTML = `
    <strong>Emergency #${historyNumber}</strong>

    <span> 
    Route: ${path.map(vehicle => vehicle.id).join("→")}
    </span>

    <span>
    Hops: ${path.length}
    </span>

    <span>
    Vehicles Alerted: ${path.length}
    </span>

    <span> 
    Time: ${time}
    </span>

    <span>
    Status:COMPLETE
    `;

    historyContainer.prepend(historyItem);

    emergencyHistory.push({
        id: historyNumber,
        route: path.map(vehicle => vehicle.id),
        hops: path.length,
        vehiclesAlerted: path.length,
        time: time,
        status: "COMPLETE"
    });

    localStorage.setItem("emergencyHistory", JSON.stringify(emergencyHistory));
}

function loadEmergencyHistory() {

    const historyContainer = document.getElementById("emergencyHistory");

    if(!historyContainer) {
        console.error("Emergency history container not found");
        return;
    }

    const savedHistory = JSON.parse(localStorage.getItem("emergencyHistory")) || [];

    savedHistory.forEach(history => {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";

        historyItem.innerHTML = `
        <strong>Emergency #${history.id}</strong>
        
        <span> 
        Route: ${history.route.join("→")}
        </span>
        
        <span>
        Hops: ${history.hops}
        </span>
        
        <span>
        Vehicles Alerted: ${history.vehiclesAlerted}
        </span>
        
        <span> 
        Time: ${history.time}
        </span>
        
        <span>
        Status: ${history.status}
        </span>
        `;

        historyContainer.prepend(historyItem);
    })
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

setTimeout(async () => {

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/relay"
        );

        if (!response.ok) {
            throw new Error("Relay API request failed");
        }

        const data = await response.json();

        console.log("Backend relay decision:", data);

        const winner = data.bestRelay;

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

        updateRelayPath(data.relayPath);

        scanButton.disabled = false;
        scanButton.textContent = "📡 RESCAN NETWORK";

    } catch (error) {

        console.error("Backend relay error:", error);

        scanButton.disabled = false;
        scanButton.textContent = "📡 RESCAN NETWORK";
    }

}, 3500);

});

// EMERGENCY SYSTEM
emergencyButton.addEventListener("click", function () {

    // Prevent multiple clicks
    if (emergencyRunning) {
        return;
    }

    emergencyRunning = true;

    startEmergencyWithBackend();

    if (selectedRelayVehicles.length === 0) {
        const scoredVehicles = selectBestRelay();

        selectedRelayVehicles = scoredVehicles
        .filter(vehicle => vehicle.relayScore >= 50)
        .slice(0, 3);
    }

    // STEP 1 - Emergency detected
    emergencyStatus.textContent = "EMERGENCY DETECTED";
    statusMessage.textContent = "Emergency alert has been created.";

    relayStatus.textContent = "DETECTING";

    emergencyButton.textContent = "🚨 EMERGENCY ACTIVE";

    // STEP 2 — AI selects relay
    setTimeout(function () {

        emergencyStatus.textContent = "AI SELECTING RELAY";

        statusMessage.textContent = "Finding the most relevant nearby vehicles...";

        relayStatus.textContent = "SELECTING";

    }, 1500);


    // STEP 3 — Dynamic relay forwarding 
    selectedRelayVehicles.forEach((vehicle, index) => {
        setTimeout(function () {
            const vehicleIndex = vehicles.findIndex(
            v => v.id === vehicle.id
        );

        emergencyStatus.textContent = "ALERT FORWARDING";

        statusMessage.textContent =
            `Node ${vehicle.id} is forwarding the emergency alert.`;

        relayStatus.textContent = "FORWARDING";

        hopCount.textContent = index + 1;

        if (vehicleStatuses[vehicleIndex]) {
            vehicleStatuses[vehicleIndex].textContent = index === selectedRelayVehicles.length - 1
             ? "ALERTED"
             : "RELAYING";

            vehicleStatuses[vehicleIndex].classList.remove (
                "waiting",
                "connected",
                "alerted",
                "relaying"
            );
            
            vehicleStatuses[vehicleIndex].classList.add( index === selectedRelayVehicles.length - 1
                ? "alerted"
                : "relaying"
            ); 
        }


        }, 3000 + (index * 1500));
    });


    // Complete
    const completionTime = 3000 + (selectedRelayVehicles.length * 1500) + 1000;
    
    setTimeout(function () {

        emergencyStatus.textContent = "EMERGENCY ACTIVE";

        statusMessage.textContent =
            `Alert successfully propagated through ${selectedRelayVehicles.length}hops.`;

        relayStatus.textContent = "COMPLETE";

        alertCount.textContent = selectedRelayVehicles.length;

        emergencyButton.textContent = "✅ ALERT PROPAGATED";

        addEmergencyHistory(selectedRelayVehicles);

        emergencyRunning = false;

    }, completionTime);

});

loadEmergencyHistory();

//RESET BUTTON
resetButton.addEventListener("click",function() {

    emergencyRunning = false;
    selectedRelayVehicles = [];

    emergencyStatus.textContent = "SYSTEM READY";
    statusMessage.textContent = "Waiting for an emergency alert...";
    relayStatus.textContent = "READY";
    hopCount.textContent = "0";
    alertCount.textContent = "0";
    emergencyButton.textContent = "🚨 START EMERGENCY";
    
    vehicleStatuses.forEach(status => {
        status.textContent = "CONNECTED";
        status.classList.remove(
            "waiting",
            "alerted",
            "relaying"
        );
        status.classList.add("connected");
    });

    bestRelay.innerHTML = `
    <span>Waiting for network scan...</span>
    `;
    updateRelayPath([]);
    console.log("Emergency system reset");
})

//CLEAR EMERGENCY HISTORY

clearHistoryButton.addEventListener("click", function () {
    emergencyHistory =[];
    localStorage.removeItem("emergencyHistory");
    const historyContainer = document.getElementById("emergencyHistory");
    historyContainer.innerHTML = `
    <p>No emergency alerts yet.</p>
    `;
    console.log("Emergency history cleared");
});