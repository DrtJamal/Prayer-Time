document.addEventListener("DOMContentLoaded", function() {
    // Function to update the current time (live clock)
    function updateCurrentTime() {
        const currentDate = new Date();
        const currentTime = currentDate.toLocaleTimeString(); // Get the current time in 12-hour format

        document.getElementById("current-time").textContent = currentTime;
    }

    // Initial call to display the current time immediately
    updateCurrentTime();

    // Update the current time every second
    setInterval(updateCurrentTime, 1000); // 1000 ms = 1 second

    // Existing code for fetching prayer times and other data
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

            // Other existing code for fetching and displaying timings
            // ...

            // Format and display Hijri date
            const hijriDate = data.data.date.hijri;
            const day = parseInt(hijriDate.day, 10);
            const month = hijriDate.month.en;
            const year = hijriDate.year;

            const suffix = (day % 10 === 1 && day !== 11) ? "st" :
                           (day % 10 === 2 && day !== 12) ? "nd" :
                           (day % 10 === 3 && day !== 13) ? "rd" : "th";

            const formattedHijriDate = `${day}${suffix} of ${month}, ${year} AH`;
            document.getElementById("hijri-date").textContent = formattedHijriDate;
        })
        .catch(error => {
            console.error("Error fetching prayer times:", error);
        });

    // Other existing code (like the current date and Hijri date)
});
