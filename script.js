document.addEventListener("DOMContentLoaded", function() {
    const city = "Carlow";
    const country = "Ireland";
    const method = 2;

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

            const sunriseTime = timings.Sunrise;
            const dhuhrTime = timings.Dhuhr;
            const sunriseDate = new Date(`1970-01-01T${sunriseTime}:00Z`);
            const dhuhrDate = new Date(`1970-01-01T${dhuhrTime}:00Z`);

            const irelandOffset = new Date().getTimezoneOffset() * 60000;
            const localSunriseDate = new Date(sunriseDate.getTime() - irelandOffset);
            const localDhuhrDate = new Date(dhuhrDate.getTime() - irelandOffset);

            const ishraqDate = new Date(localSunriseDate.getTime() + 15 * 60 * 1000);
            const ishraqTime = ishraqDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            const chaashtDate = new Date(localSunriseDate.getTime() + 60 * 60 * 1000);
            const chaashtTime = chaashtDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            // Correct Zawal time calculation (15 minutes before Dhuhr)
            const zawalDate = new Date(localDhuhrDate.getTime() - 15 * 60 * 1000); // Subtract 15 minutes for Zawal
            const zawalTime = zawalDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            // Fill additional timings dynamically
            document.getElementById("sunrise").textContent = timings.Sunrise;
            document.getElementById("ishraq").textContent = ishraqTime;
            document.getElementById("chaasht").textContent = chaashtTime;
            document.getElementById("zawal").textContent = zawalTime; // Updated Zawal time

            // Fix for Jummah Khutbah
            document.getElementById("jummah-khutbah").textContent = "01:10 PM"; 
            document.getElementById("second-third").textContent = secondThirdTime;

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
});
