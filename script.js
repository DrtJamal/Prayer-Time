// Fetch prayer times based on location
async function fetchPrayerTimes() {
  const city = "Carlow";
  const country = "Ireland";
  const apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=2`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.code === 200) {
      const timings = data.data.timings;
      displayPrayerTimes(timings);
    } else {
      console.error("Failed to fetch prayer times");
      alert("Error fetching prayer times");
    }
  } catch (error) {
    console.error("Error fetching prayer times:", error);
  }
}

// Display the prayer times on the page
function displayPrayerTimes(timings) {
  const prayerContainer = document.getElementById("prayer-times");

  // Clear any existing content
  prayerContainer.innerHTML = '';

  // Add prayer times
  for (const [prayerName, time] of Object.entries(timings)) {
    const prayerElement = document.createElement("div");
    prayerElement.className = "prayer-time";
    prayerElement.id = prayerName;  // Dynamically assign id for CSS styling
    prayerElement.innerHTML = `<strong>${prayerName}:</strong> ${time}`;
    prayerContainer.appendChild(prayerElement);
  }
}

// Display current date and Hijri date
function displayDate() {
  const today = new Date();
  const currentDateElement = document.getElementById("current-date");
  const hijriDateElement = document.getElementById("hijri-date");

  const currentDate = today.toLocaleDateString();
  currentDateElement.textContent = `Today: ${currentDate}`;

  // You can use an API to get the Hijri date if needed, here's an example for now:
  hijriDateElement.textContent = `Hijri Date: 16 Jumada al-Awwal 1446`;  // Placeholder
}

// Initialize the page
function init() {
  fetchPrayerTimes();
  displayDate();
}

init();  // Call init to load everything
