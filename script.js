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

        // Fill additional timings dynamically
        document.getElementById("sunrise").textContent = timings.Sunrise;
        document.getElementById("ishraq").textContent = timings.Sunset;
        document.getElementById("chaasht").textContent = timings.Imsak;
        document.getElementById("prohibited").textContent = timings["Firstthird"];
        document.getElementById("").textContent = timings;
        document.getElementById("second-third").textContent = timings["Secondthird"];
        

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
