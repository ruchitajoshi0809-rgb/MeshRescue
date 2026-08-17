const emergencyButton = document.getElementById("emergencyButton");

const emergencyStatus = document.getElementById("emergencyStatus");
const statusMessage = document.getElementById("statusMessage");

const relayStatus = document.getElementById("relayStatus");
const hopCount = document.getElementById("hopCount");
const alertCount = document.getElementById("alertCount");

const vehicleStatuses = document.querySelectorAll(".vehicle-status");

let emergencyRunning = false;


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

        if (vehicleStatuses[2]) {
            vehicleStatuses[2].textContent = "ALERTED";
            vehicleStatuses[2].classList.add("alerted");
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