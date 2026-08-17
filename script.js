const emergencyButton = document.getElementById("emergencyButton");

const emergencyStatus = document.getElementById("emergencyStatus");
const statusMessage = document.getElementById("statusMessage");

const relayStatus = document.getElementById("relayStatus");
const hopCount = document.getElementById("hopCount");
const alertCount = document.getElementById("alertCount");

emergencyButton.addEventListener("click", function() {
    emergencyStatus.textContent = "EMERGENCY ACTIVE";

    statusMessage.textContent = "Emergency alert is being propagated through the network.";
    
    relayStatus.textContent = "SELECTING";
    
    hopCount.textContent = "3";

    alertCount.textContent = "1";

    emergencyButton.textContent = "🚨 EMERGENCY ACTIVE";
});