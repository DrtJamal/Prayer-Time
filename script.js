<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prayer Timetable - Carlow</title>
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background-color: #e0d0b0;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        .container {
            width: 100%;
            max-width: 1200px;
            text-align: center;
            background-color: #e0d0b0;
        }

        header {
            background-color: #e87722;
            padding: 0;
        }

        header img {
            width: 100%;
            height: auto;
            display: block;
        }

        .date-section {
            font-size: 1.2rem;
            margin: 10px 0;
        }

        .clock {
            font-size: 5rem;
            font-weight: bold;
            margin: 20px 0;
            color: black;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        table th, table td {
            padding: 15px;
            text-align: center;
            font-size: 1.3rem;
        }

        table th {
            background-color: #e87722;
            font-weight: bold;
            color: white;
        }

        table tbody tr:nth-child(1) {
            background-color: #ffe4b5; /* Fajr: Light orange-yellow */
        }

        table tbody tr:nth-child(2) {
            background-color: #fffacd; /* Sunrise: Lemon chiffon */
        }

        table tbody tr:nth-child(3) {
            background-color: #fff8dc; /* Dhuhr: Cornsilk */
        }

        table tbody tr:nth-child(4) {
            background-color: #f5deb3; /* Asr: Wheat */
        }

        table tbody tr:nth-child(5) {
            background-color: #87cefa; /* Maghrib: Light sky blue */
        }

        table tbody tr:nth-child(6) {
            background-color: #4682b4; /* Isha: Steel blue */
            color: white; /* Contrast for text */
        }

        .footer {
            background-color: #e87722;
            padding: 10px 0;
            color: black;
            font-size: 1.2rem;
        }

        .footer span {
            font-weight: bold;
        }

        #next-prayer {
            margin: 20px 0;
            font-size: 1.5rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <img src="logo3.jpeg" alt="Carlow Islamic Cultural Centre Logo">
        </header>

        <div class="date-section" id="date-display"></div>
        <div class="clock" id="digital-clock">00:00:00</div>

        <table>
            <thead>
                <tr>
                    <th>PRAYER</th>
                    <th>ADHAN</th>
                    <th>IQAMAH</th>
                </tr>
            </thead>
            <tbody id="prayer-times-body"></tbody>
        </table>

        <div id="next-prayer">Next is: Calculating...</div>

        <div class="footer">
            Jummah Khutbah: <span id="jumuah-time">13:10</span>
        </div>
    </div>

    <script>
        const prayerTimesBody = document.getElementById('prayer-times-body');
        const nextPrayerDisplay = document.getElementById('next-prayer');
        const clockDisplay = document.getElementById('digital-clock');
        const dateDisplay = document.getElementById('date-display');
        let nextPrayer = null;

        async function fetchPrayerTimes() {
            const apiURL = "https://api.aladhan.com/v1/timingsByCity?city=Carlow&country=Ireland&method=2";

            try {
                const response = await fetch(apiURL);
                const data = await response.json();
                const timings = data.data.timings;
                const hijriDate = data.data.date.hijri;

                populatePrayerTable(timings);
                updateDateDisplay(hijriDate);
                determineNextPrayer(timings);
            } catch (error) {
                console.error("Error fetching prayer times:", error);
                nextPrayerDisplay.textContent = "Failed to load prayer times.";
            }
        }

        function populatePrayerTable(timings) {
            const prayers = [
                { name: "Fajr", iqama: "07:00" },
                { name: "Sunrise", iqama: "-" },
                { name: "Dhuhr", iqama: "12:45" },
                { name: "Asr", iqama: "14:15" },
                { name: "Maghrib", iqamaOffset: 10 },
                { name: "Isha", iqama: "19:00" }
            ];

            prayerTimesBody.innerHTML = "";

            prayers.forEach(prayer => {
                const adhanTime = timings[prayer.name];
                const iqamaTime = prayer.iqamaOffset
                    ? addMinutes(adhanTime, prayer.iqamaOffset)
                    : prayer.iqama || "-";

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${prayer.name}</td>
                    <td>${adhanTime || "-"}</td>
                    <td>${iqamaTime}</td>
                `;
                prayerTimesBody.appendChild(row);
            });
        }

        function addMinutes(time, minutes) {
            if (!time) return "-";
            const [hours, mins] = time.split(":").map(Number);
            const date = new Date();
            date.setHours(hours, mins + minutes);
            return date.toTimeString().slice(0, 5);
        }

        function updateDateDisplay(hijriDate) {
            const now = new Date();
            const gregorianDate = now.toDateString();
            dateDisplay.innerHTML = `${gregorianDate} | ${hijriDate.day} ${hijriDate.month.en} ${hijriDate.year} AH`;
        }

        function determineNextPrayer(timings) {
            const now = new Date();
            const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
            let minTimeDifference = Infinity;

            prayers.forEach(prayer => {
                const adhanTime = timings[prayer];
                if (!adhanTime) return;

                const [hours, minutes] = adhanTime.split(":").map(Number);
                const prayerTime = new Date();
                prayerTime.setHours(hours, minutes, 0);

                const timeDifference = prayerTime - now;
                if (timeDifference > 0 && timeDifference < minTimeDifference) {
                    nextPrayer = { name: prayer, time: prayerTime };
                    minTimeDifference = timeDifference;
                }
            });

            if (nextPrayer) {
                updateNextPrayerCountdown();
            } else {
                nextPrayerDisplay.textContent = "Next Prayer: Fajr";
            }
        }

        function updateNextPrayerCountdown() {
            if (!nextPrayer) return;

            const now = new Date();
            const timeDifference = nextPrayer.time - now;

            if (timeDifference > 0) {
                const remainingTime = formatTimeDifference(timeDifference);
                nextPrayerDisplay.textContent = `Next Prayer: ${nextPrayer.name} in ${remainingTime}`;
            } else {
                nextPrayerDisplay.textContent = "Calculating next prayer...";
                fetchPrayerTimes();
            }
        }

        function formatTimeDifference(ms) {
            const totalSeconds = Math.floor(ms / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            return `${hours}h ${minutes}m ${seconds}s`;
        }

        function updateClock() {
            const now = new Date();
            clockDisplay.textContent = now.toLocaleTimeString();
        }

        setInterval(updateClock, 1000);
        setInterval(updateNextPrayerCountdown, 1000);
        fetchPrayerTimes();
    </script>
</body>
</html>
