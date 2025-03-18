const prayerTimesBody = document.getElementById('prayer-times-body');
const currentTimeElement = document.getElementById("current-time");
const nextIqamaElement = document.getElementById("next-iqama");
const nextPrayerElement = document.getElementById("next-prayer");

let prayers = [
    { name: "Fajr", iqamaOffset: 20, class: "fajr-row" },
    { name: "Dhuhr", iqama: "13:15", class: "dhuhr-row" },
    { name: "Asr", iqamaOffset: 10, class: "asr-row" },
    { name: "Maghrib", iqamaOffset: 6, class: "maghrib-row" },
    { name: "Isha", iqamaOffset: 20, class: "isha-row" }
];

let currentIqamaIndex = null;
let countdownInterval = null;

async function fetchPrayerTimes() {
    const jsonURL = "prayer-times.json"; // Path to your JSON file
    try {
        const response = await fetch(jsonURL);
        const data = await response.json();

        // Get today's date in DD/MM/YYYY format
        const today = new Date();
        const formattedDate = today.toLocaleDateString("en-GB"); // Example: "02/01/2025"

        // Find today's prayer times from JSON
        const todayTiming = data.find(entry => entry.Date === formattedDate);

        if (todayTiming) {
            populatePrayerTable(todayTiming);
            startCountdown();

            // **Update Date Display**
            document.getElementById("date-display").innerText = `📅 Date: ${formattedDate}`;

            // **Update Sunrise Time**
            const sunriseElement = document.getElementById("sunrise-time");
            sunriseElement.innerText = `🌅 Sunrise: ${todayTiming.Sunrise || "-"}`;
        } else {
            console.error("Prayer times for today's date not found in JSON.");
        }
    } catch (error) {
        console.error("Error fetching prayer times from JSON:", error);
    }
}

function populatePrayerTable(timings) {
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

            nextIqamaElement.innerText = `Next Iqama: ${prayers[currentIqamaIndex].name} (${prayers[currentIqamaIndex].iqama})`;
            nextPrayerElement.innerText = `Time to Jamat-e-${prayers[currentIqamaIndex].name} is: ${hours}:${minutes}:${seconds}`;
        }
    }, 1000);
}

function beepAndAlert() {
    let beep = new Audio("beep.mp3");
    beep.play();
  //  alert("Time for the next iqama!");
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

setInterval(fetchPrayerTimes, 2 * 60 * 60 * 1000);

fetchPrayerTimes();

   function updateHijriDate() {
        let today = new Date();
        let hijriDate = today.toLocaleDateString('ar-SA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            calendar: 'islamic-umalqura' 
        });
        document.getElementById("hijri-date").innerText = hijriDate;
    }

    // Run immediately on load
    updateHijriDate();

    // Refresh every 2 hours (7200000 milliseconds)
    setInterval(updateHijriDate, 7200000);
