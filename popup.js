document.getElementById("startTracking").addEventListener("click", () => {
    let destination = document.getElementById("destination").value;

    if (!destination) {
        alert("Please enter a destination.");
        return;
    }

    chrome.runtime.sendMessage({ action: "startTracking", destination });
    alert("Live tracking started for: " + destination);
});
