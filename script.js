const prayerTimesBody = document.getElementById('prayer-times-body');
    const currentTimeElement = document.getElementById("current-time");
    const nextIqamaElement = document.getElementById("next-iqama");
    const nextPrayerElement = document.getElementById("next-prayer");
    const currentPrayerElement = document.getElementById("current-prayer");

    let prayers = [
        { name: "Fajr", iqama: "07:00", class: "fajr-row" },
        { name: "Dhuhr", iqama: "12:50", class: "dhuhr-row" },
        { name: "Asr", iqama: "14:30", class: "asr-row" },
        { name: "Maghrib", iqamaOffset: 12, class: "maghrib-row" },
        { name: "Isha", iqama: "19:00", class: "isha-row" }
    ];

    let currentIqamaIndex = null;
    let countdownInterval = null;
    let timings = {}; // Holds the fetched timings

    async function fetchPrayerTimes() {
        const apiURL = "https://api.aladhan.com/v1/timingsByCity?city=Carlow&country=Ireland&method=3";
        try {
            const response = await fetch(apiURL);
            const data = await response.json();
            timings = data.data.timings; // Store fetched timings
           // document.getElementById("sunrise-time").innerText = `Sunrise: ${timings.Sunrise}`;
            populatePrayerTable();
            startCountdown(); // Start countdown after populating table
            updateCurrentPrayer(); // Update the current prayer status
        } catch (error) {
            console.error("Error fetching prayer times:", error);
        }
    }

    function populatePrayerTable() {
        prayerTimesBody.innerHTML = ""; // Clear the table

        prayers.forEach(prayer => {
            const adhanTime = timings[prayer.name];
            const iqamaTime = prayer.iqamaOffset
                ? addMinutes(adhanTime, prayer.iqamaOffset) // Add offset for Maghrib
                : prayer.iqama || "-";

            // Update iqama time in the array for countdown purposes
            prayer.iqama = iqamaTime;

            // Create a new row in the table
            const row = document.createElement('tr');
            row.classList.add(prayer.class);
            row.innerHTML = `
                <td>${prayer.name}</td>
                <td class="adhan-time">${adhanTime || "-"}</td>
                <td>${iqamaTime}</td>
            `;
            prayerTimesBody.appendChild(row);
        });
    }

    function getCurrentTime() {
        const now = new Date();
        return now.toTimeString().slice(0, 8);
    }

    function findNextIqama() {
        const now = new Date();
        let nextIqamaTime = null;
        let nextIqamaIndex = null;

        for (let i = 0; i < prayers.length; i++) {
            const [hours, minutes] = prayers[i].iqama.split(":").map(Number);
            const iqamaDate = new Date();
            iqamaDate.setHours(hours, minutes, 0, 0);

            if (iqamaDate > now) {
                nextIqamaTime = iqamaDate;
                nextIqamaIndex = i;
                break;
            }
        }

        if (!nextIqamaTime) {
            nextIqamaTime = new Date();
            nextIqamaTime.setDate(nextIqamaTime.getDate() + 1);
            const [hours, minutes] = prayers[0].iqama.split(":").map(Number);
            nextIqamaTime.setHours(hours, minutes, 0, 0);
            nextIqamaIndex = 0;
        }

        return { nextIqamaTime, nextIqamaIndex };
    }

    function startCountdown() {
        if (countdownInterval) clearInterval(countdownInterval);

        const { nextIqamaTime, nextIqamaIndex } = findNextIqama();
        currentIqamaIndex = nextIqamaIndex;

        countdownInterval = setInterval(() => {
            const now = new Date();
            const diff = nextIqamaTime - now;

            if (diff <= 0) {
                clearInterval(countdownInterval);
                beepAndAlert();
                startCountdown(); // Move to next iqama
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                nextIqamaElement.innerText = `Next Iqama is: ${prayers[currentIqamaIndex].name} at (${prayers[currentIqamaIndex].iqama})`;
                nextPrayerElement.innerText = `Time Remaining to Jamat-e-${prayers[currentIqamaIndex].name}: ${hours}:${minutes}:${seconds}`;
            }
        }, 1000);
    }

    function updateCurrentPrayer() {
    setInterval(() => {
        const now = new Date();
        const currentTime = `${now.getHours()}:${now.getMinutes()}`;
        const prayerTimes = {
            Fajr: timings.Fajr,
            Sunrise: timings.Sunrise,
            Dhuhr: timings.Dhuhr,
            Asr: timings.Asr,
            Sunset: timings.Sunset,
            Maghrib: timings.Maghrib,
            Isha: timings.Isha
        };

        let currentStatus = "Prohibited Time";

        if (isBetween(currentTime, prayerTimes.Fajr, prayerTimes.Sunrise)) {
            currentStatus = "Fajr time";
        } else if (isBetween(currentTime, addMinutes(prayerTimes.Sunrise, 12), addMinutes(prayerTimes.Dhuhr, -12))) {
            currentStatus = "Chaasht time";
        } else if (isBetween(currentTime, prayerTimes.Dhuhr, prayerTimes.Asr)) {
            currentStatus = "Dhuhr time";
        } else if (isBetween(currentTime, prayerTimes.Asr, addMinutes(prayerTimes.Sunset, -4))) {
            currentStatus = "Asr time";
        } else if (isBetween(currentTime, prayerTimes.Maghrib, prayerTimes.Isha)) {
            currentStatus = "Maghrib time";
        } else if (
            isBetween(currentTime, prayerTimes.Isha, prayerTimes.Fajr) || // Extend Isha to 15 mins before Fajr
            currentTime >= prayerTimes.Isha // Handle post-midnight case
        ) {
            currentStatus = "Isha time";
        }

        currentPrayerElement.innerText = currentStatus;
    }, 1000);
}

    function isBetween(currentTime, startTime, endTime) {
        const [currentHours, currentMinutes] = currentTime.split(":").map(Number);
        const [startHours, startMinutes] = startTime.split(":").map(Number);
        const [endHours, endMinutes] = endTime.split(":").map(Number);

        const current = new Date();
        const start = new Date();
        const end = new Date();

        current.setHours(currentHours, currentMinutes, 0, 0);
        start.setHours(startHours, startMinutes, 0, 0);
        end.setHours(endHours, endMinutes, 0, 0);

        return current >= start && current < end;
    }

    function beepAndAlert() {
        let beep = new Audio("beep1.mp3");
        beep.play();
    }

    function addMinutes(time, minutes) {
        if (!time) return "-";
        const [hours, mins] = time.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, mins + minutes);
        return date.toTimeString().slice(0, 5);
    }

    // Update current time every second
    setInterval(() => {
        currentTimeElement.innerText = `${getCurrentTime()}`;
    }, 1000);

    fetchPrayerTimes();
