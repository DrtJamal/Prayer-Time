fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        console.log(data);  // Log the entire API response
        const timings = data.data.timings;
        document.getElementById("Fajr").textContent = timings.Fajr;
        document.getElementById("Dhuhr").textContent = timings.Dhuhr;
        document.getElementById("Asr").textContent = timings.Asr;
        document.getElementById("Maghrib").textContent = timings.Maghrib;
        document.getElementById("Isha").textContent = timings.Isha;
    })
    .catch(error => {
        console.error("Error fetching prayer times:", error);
    });
