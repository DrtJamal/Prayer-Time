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

         // Convert Sunrise time to Date object
        const sunriseTime = timings.Sunrise;
        const dhuhrTime = timings.Dhuhr;

        const sunriseDate = new Date(`1970-01-01T${sunriseTime}:00Z`); // Sunrise in UTC
        const dhuhrDate = new Date(`1970-01-01T${dhuhrTime}:00Z`); // Dhuhr in UTC

        // Calculate Ishraq (15 minutes after sunrise)
        const ishraqDate = new Date(sunriseDate.getTime() + 15 * 60 * 1000); // Add 15 minutes
        const ishraqTime = ishraqDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        // Calculate Chaasht (60 minutes after sunrise)
        const chaashtDate = new Date(sunriseDate.getTime() + 60 * 60 * 1000); // Add 60 minutes
        const chaashtTime = chaashtDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });



          // Calculate Second Third of Night
        const maghribTime = timings.Maghrib; // e.g., "18:00"
        const fajrTime = timings.Fajr; // e.g., "05:00"
        const maghribDate = new Date(`1970-01-01T${maghribTime}:00Z`);
        const fajrDate = new Date(`1970-01-02T${fajrTime}:00Z`); // Next day Fajr
        const totalNightMilliseconds = fajrDate - maghribDate; // Duration of the night
        const secondThirdDate = new Date(maghribDate.getTime() + (2 / 3) * totalNightMilliseconds);
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
        // Fix for Jummah Khutbah
document.getElementById("jummah-khutbah").textContent = "01:10 PM"; // Static or dynamic Jummah timing
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

// Current date and time (can be dynamically fetched as well)
const currentDate = new Date().toLocaleDateString();
const currentTime = new Date().toLocaleTimeString();

document.getElementById("current-date").textContent = currentDate;
document.getElementById("current-time").textContent = currentTime;

// Hijri Date - You can use an API for Hijri Date if needed
document.getElementById("hijri-date").textContent = "16 Jumada al-Awwal 1446"; // Hardcoded for now
