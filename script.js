document.addEventListener("DOMContentLoaded", function () {
    const city = "Carlow";
    const country = "Ireland";
    const method = 2; // Calculation method

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

            // Additional timings
            document.getElementById("sunrise").textContent = timings.Sunrise;

            // Set the Hijri date
            const hijriDate = data.data.date.hijri;
            const day = parseInt(hijriDate.day, 10);
            const month = hijriDate.month.en;
            const year = hijriDate.year;
            const suffix = (day % 10 === 1 && day !== 11) ? "st" :
                           (day % 10 === 2 && day !== 12) ? "nd" :
                           (day % 10 === 3 && day !== 13) ? "rd" : "th";
            document.getElementById("hijri-date").textContent = `${day}${suffix} of ${month}, ${year} AH`;

            // Store prayer times for the next prayer calculation
            const prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
            const prayerTimes = prayerOrder.map(prayer => {
                const time = timings[prayer];
                const [hours, minutes] = time.split(":").map(Number);
                return new Date().setHours(hours, minutes, 0, 0); // Convert to Date object
            });

            function updateNextPrayer() {
                const now = new Date().getTime();
                let nextPrayerIndex = -1;

                // Find the next prayer
                for (let i = 0; i < prayerTimes.length; i++) {
                    if (prayerTimes[i] > now) {
                        nextPrayerIndex = i;
                        break;
                    }
                }

                // If no prayer remains for today, the next prayer is tomorrow's Fajr
                if (nextPrayerIndex === -1) {
                    nextPrayerIndex = 0;
                    prayerTimes[0] += 24 * 60 * 60 * 1000; // Add 24 hours to Fajr time
                }

                const nextPrayer = prayerOrder[nextPrayerIndex];
                const timeToNextPrayer = prayerTimes[nextPrayerIndex] - now;

                // Convert timeToNextPrayer to hours, minutes, and seconds
                const hours = Math.floor(timeToNextPrayer / (1000 * 60 * 60));
                const minutes = Math.floor((timeToNextPrayer % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeToNextPrayer % (1000 * 60)) / 1000);

                // Update the "Next Prayer" and "Time to Next Prayer" fields
                document.getElementById("next-prayer").textContent = `Next Prayer: ${nextPrayer}`;
                document.getElementById("time-to-next").textContent =
                    `Time to ${nextPrayer}: ${hours}h ${minutes}m ${seconds}s`;

                // Update the "Good Luck" message
                document.getElementById("good-luck").textContent = "Good Luck!";
            }

            // Update every second
            setInterval(updateNextPrayer, 1000);
        })
        .catch(error => {
            console.error("Error fetching prayer times:", error);
        });

    // Live clock for current time
    function updateCurrentTime() {
        const now = new Date();

        const weekday = now.toLocaleString("en-US", { weekday: "long" });
        const day = now.getDate();
        const suffix = (day % 10 === 1 && day !== 11) ? "st" :
                       (day % 10 === 2 && day !== 12) ? "nd" :
                       (day % 10 === 3 && day !== 13) ? "rd" : "th";
        const month = now.toLocaleString("en-US", { month: "long" });
        const year = now.getFullYear();

        document.getElementById("current-date").textContent = `${weekday}, ${day}${suffix} of ${month} ${year}`;
        document.getElementById("current-time").textContent = now.toLocaleTimeString();
    }

    setInterval(updateCurrentTime, 1000); // Update time every second
});
