// Define prayer times (you can fetch these dynamically from an API later)
const prayerTimes = {
  Fajr: "05:00 AM",
  Dhuhr: "12:30 PM",
  Asr: "03:45 PM",
  Maghrib: "05:15 PM",
  Isha: "07:00 PM",
};

// Get the container to display prayer times
const prayerContainer = document.getElementById("prayer-times");

// Clear existing content
prayerContainer.innerHTML = "";

// Loop through prayer times and display them
for (const [prayerName, time] of Object.entries(prayerTimes)) {
  const prayerElement = document.createElement("div");
  prayerElement.className = "prayer-time";
  prayerElement.innerHTML = `<strong>${prayerName}:</strong> ${time}`;
  prayerContainer.appendChild(prayerElement);
}
