// Correct API endpoint with Carlow, Ireland
const city = "Carlow";
const country = "Ireland";
const method = 2;  // You can adjust this if you want a different calculation method

const apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=${method}`;

fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        const timings = data.data.timings;
        // Fill the prayer times dynamically
        document.getElementById("Fajr").textContent = timings.Fajr;
        document.getElementById("Dhuhr").textContent = timings.Dhuhr;
        document.getElementById("Asr").textContent = timings.Asr;
        document.getElementById("Maghrib").textContent = timings.Maghrib;
        document.getElementById("Isha").textContent = timings.Isha;
    })
    .catch(error => {
        console.error("Error fetching prayer times:", error);
    });

// Current date and time (can be dynamically fetched as well)
const currentDate = new Date().toLocaleDateString();
const currentTime = new Date().toLocaleTimeString();

document.getElementById("current-date").textContent = currentDate;
document.getElementById("current-time").textContent = currentTime;

// Hijri Date - You can use an API for Hijri Date if needed
document.getElementById("hijri-date").textContent = "16 Jumada al-Awwal 1446"; // Hardcoded for now
