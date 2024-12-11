// Replace with your desired location's latitude and longitude
const location = { latitude: YOUR_LATITUDE, longitude: YOUR_LONGITUDE };

// Function to fetch prayer times from the API
const fetchPrayerTimes = async () => {
    try {
        // Get today's date
        const today = new Date();
        const date = today.toISOString().split("T")[0];
        document.getElementById("date").textContent = `Date: ${date}`;

        // Fetch prayer times from Aladhan API
        const response = await fetch(
            `https://api.aladhan.com/v1/timings/${Math.floor(today.getTime() / 1000)}?latitude=${location.latitude}&longitude=${location.longitude}&method=2`
        );

        if (response.ok) {
            const data = await response.json();
            const timings = data.data.timings;

            // Get the table body element
            const prayerTimesTable = document.getElementById("prayer-times");
            prayerTimesTable.innerHTML = ''; // Clear existing rows

            // List of prayers to display
            const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

            // Populate the table with prayer times
            prayers.forEach((prayer) => {
                const row = document.createElement("tr");

                const prayerNameCell = document.createElement("td");
                prayerNameCell.textContent = prayer;

                const prayerTimeCell = document.createElement("td");
                prayerTimeCell.textContent = timings[prayer];

                row.appendChild(prayerNameCell);
                row.appendChild(prayerTimeCell);
                prayerTimesTable.appendChild(row);
            });
        } else {
            alert("Failed to fetch prayer times. Please try again later.");
        }
    } catch (error) {
        console.error("Error fetching prayer times:", error);
        alert("An error occurred while fetching prayer times.");
    }
};

// Set your location's coordinates here
const setLocation = () => {
    // Replace with your actual latitude and longitude
    location.latitude = 25.276987; // Example: Dubai latitude
    location.longitude = 55.296249; // Example: Dubai longitude
};

// Initialize the script on page load
document.addEventListener("DOMContentLoaded", () => {
    setLocation(); // Set the coordinates
    fetchPrayerTimes(); // Fetch and display prayer times
});
