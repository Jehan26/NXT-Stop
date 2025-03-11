let destinationCoords = null;
let watchId = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startTracking") {
        getCoordinates(request.destination);
    }
});

// Function to convert address into GPS coordinates using OpenStreetMap API
async function getCoordinates(address) {
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    let response = await fetch(url);
    let data = await response.json();

    if (data.length > 0) {
        destinationCoords = {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
        };
        startLiveTracking();
    } else {
        console.error("Failed to fetch destination coordinates.");
    }
}

// Function to start live tracking
function startLiveTracking() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            position => {
                let userLat = position.coords.latitude;
                let userLon = position.coords.longitude;
                
                console.log(`Current Location: ${userLat}, ${userLon}`);

                if (destinationCoords) {
                    let distance = getDistanceFromLatLonInMeters(userLat, userLon, destinationCoords.lat, destinationCoords.lon);
                    console.log(`Distance to destination: ${distance} meters`);

                    if (distance <= 150) {
                        triggerAlert();
                        navigator.geolocation.clearWatch(watchId); // Stop tracking after alert
                    }
                }
            },
            error => console.error("Error getting location:", error),
            { enableHighAccuracy: true, maximumAge: 0 }
        );
    } else {
        console.error("Geolocation not supported.");
    }
}

// Function to calculate distance between two coordinates (Haversine formula)
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius of Earth in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Function to trigger an alert when 150m away
function triggerAlert() {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "NXT STOP Alert!",
        message: "You are 150 meters away from your destination!",
        priority: 2
    });

    // Optional: Add sound or vibration if used on mobile or smartwatch
    new Audio("alert.mp3").play(); // Add an alert sound file (optional)
}
