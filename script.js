// Define the coordinates for Carlow Town, Ireland
const latitude = 52.835;
const longitude = -6.9333;

// Set the date format (optional, but useful for getting correct times for the current day)
const date = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD

// Fetch prayer times from Aladhan API using coordinates
fetch(`http://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`)
  .then(response => {
    console.log('API Response Status:', response.status); // Log the response status
    return response.json();
  })
  .then(data => {
    console.log('API Response Data:', data); // Log the full API response

    if (data.code === 200) {
      const prayerTimes = data.data.timings;

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
    } else {
      throw new Error("Error fetching prayer times");
    }
  })
  .catch(error => {
    console.error("Error fetching prayer times:", error);
    const prayerContainer = document.getElementById("prayer-times");
    prayerContainer.innerHTML = "Failed to load prayer times.";
  });
