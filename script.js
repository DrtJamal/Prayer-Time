document.addEventListener("DOMContentLoaded", function() {
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

            // Convert Sunrise time to Date object
            const sunriseTime = timings.Sunrise;
            const dhuhrTime = timings.Dhuhr;
            const sunriseDate = new Date(`1970-01-01T${sunriseTime}:00Z`);
            const dhuhrDate = new Date(`1970-01-01T${dhuhrTime}:00Z`);

            // Convert to local time zone (Ireland)
            const irelandOffset = new Date().getTimezoneOffset() * 60000; // In milliseconds
            const localSunriseDate = new Date(sunriseDate.getTime() - irelandOffset);
            const localDhuhrDate = new Date(dhuhrDate.getTime() - irelandOffset);

            // Calculate Ishraq (15 minutes after sunrise)
            const ishraqDate = new Date(localSunriseDate.getTime() + 15 * 60 * 1000); // Add 15 minutes
            const ishraqTime = ishraqDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            // Calculate Chaasht (60 minutes after sunrise)
            const chaashtDate = new Date(localSunriseDate.getTime() + 60 * 60 * 1000); // Add 60 minutes
            const chaashtTime = chaashtDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            // Correct Zawal time calculation (10 minutes before Dhuhr)
            const zawalDate = new Date(localDhuhrDate.getTime() - 10 * 60 * 1000); // Subtract 10 minutes for Zawal
            const zawalTime = zawalDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            // Calculate Second Third of Night
            const maghribTime = timings.Maghrib;
            const fajrTime = timings.Fajr;
            const maghribDate = new Date(`1970-01-01T${maghribTime}:00Z`);
            const fajrDate = new Date(`1970-01-02T${fajrTime}:00Z`); // Next day Fajr
            const totalNightMilliseconds = fajrDate - maghribDate; // Duration of the night
            const secondThirdDate = new Date(maghribDate.getTime() + (2 / 3) * totalNightMilliseconds);

            // Correct time format for Second Third of Night
            const secondThirdTime = secondThirdDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });

            // Fill additional timings dynamically
            document.getElementById("sunrise").textContent = timings.Sunrise;
            document.getElementById("ishraq").textContent = ishraqTime;
            document.getElementById("chaasht").textContent = chaashtTime;
            document.getElementById("zawal").textContent = zawalTime;
            document.getElementById("jummah-khutbah").textContent = "01:10 PM";
            document.getElementById("second-third").textContent = secondThirdTime;

            // Format and display Hijri date
            const hijriDate = data.data.date.hijri;
            const day = parseInt(hijriDate.day, 10);
            const month = hijriDate.month.en; // Get Hijri month in English
            const year = hijriDate.year;

            // Append "st", "nd", "rd", "th" to the day
            const suffix = (day % 10 === 1 && day !== 11) ? "st" :
                           (day % 10 === 2 && day !== 12) ? "nd" :
                           (day % 10 === 3 && day !== 13) ? "rd" : "th";

            const formattedHijriDate = `${day}${suffix} of ${month}, ${year} AH`;
            document.getElementById("hijri-date").textContent = formattedHijriDate;
        })
        .catch(error => {
            console.error("Error fetching prayer times:", error);
        });

    // Live clock for current time
    function updateCurrentTime() {
        const now = new Date();

        // Get the day of the week
        const weekday = now.toLocaleString('en-US', { weekday: 'long' });

        // Get the day, adding the suffix (st, nd, rd, th)
        const day = now.getDate();
        const suffix = (day % 10 === 1 && day !== 11) ? "st" :
                       (day % 10 === 2 && day !== 12) ? "nd" :
                       (day % 10 === 3 && day !== 13) ? "rd" : "th";

        // Get the month and year
        const month = now.toLocaleString('en-US', { month: 'long' });
        const year = now.getFullYear();

        // Format the date as: "Wednesday, 11th of December 2024"
        const formattedDate = `${weekday}, ${day}${suffix} of ${month} ${year}`;

        // Get the current time (24-hour format)
        const currentTime = now.toLocaleTimeString();

        // Update the date and time on the webpage
        document.getElementById("current-date").textContent = formattedDate;
        document.getElementById("current-time").textContent = currentTime;
    }

    // Update time every second
    setInterval(updateCurrentTime, 1000); // 1000 ms = 1 second
});
