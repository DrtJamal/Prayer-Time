const prayerTimesBody = document.getElementById('prayer-times-body');
const currentTimeElement = document.getElementById("current-time");
const nextIqamaElement = document.getElementById("next-iqama");
const nextPrayerElement = document.getElementById("next-prayer");

let prayers = [
    { name: "Fajr", class: "fajr-row" },
    { name: "Dhuhr", class: "dhuhr-row" },
    { name: "Asr", class: "asr-row" },
    { name: "Maghrib", iqamaOffset: 3, class: "maghrib-row" },
    { name: "Isha", class: "isha-row" }
];

let weeklyIqama = {}; // Will hold iqama times from JSON
let currentIqamaIndex = null;
let countdownInterval = null;

async function fetchPrayerTimes() {
    try {
        // Fetch prayer times JSON
        const prayerResponse = await fetch('prayer-times.json');
        const prayerData = await prayerResponse.json();

        // Fetch weekly iqama JSON
        const iqamaResponse = await fetch('iqama.json');
        weeklyIqama = await iqamaResponse.json();

        // Assign iqama times to prayers array (skip Maghrib offset)
        prayers.forEach(p => {
            if (p.name !== "Maghrib") {
                p.iqama = weeklyIqama[p.name] || "-";
            }
        });

        const today = new Date();
        const formattedDate = today.toLocaleDateString("en-GB"); // DD/MM/YYYY
        const todayTiming = prayerData.find(entry => entry.Date === formattedDate);

        if (todayTiming) {
            populatePrayerTable(todayTiming);
            startCountdown();

            document.getElementById("date-display").innerText = `📅 Date: ${formattedDate}`;
            document.getElementById("sunrise-time").innerText = `🌅 Sunrise: ${todayTiming.Sunrise || "-"}`;
        } else {
            console.error("Prayer times for today's date not found in JSON.");
        }
    } catch (error) {
        console.error("Error fetching prayer times or iqama JSON:", error);
    }
}

function populatePrayerTable(timings) {
    prayerTimesBody.innerHTML = "";

    prayers.forEach(prayer => {
        const adhanTime = timings[prayer.name];
        const iqamaTime = prayer.iqamaOffset
            ? addMinutes(adhanTime, prayer.iqamaOffset)
            : prayer.iqama || "-";

        prayer.iqama = iqamaTime;

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
    const options = { timeZone: "Europe/Dublin", hour12: false };
    return now.toLocaleTimeString("en-GB", options);
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
            startCountdown();
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

setInterval(fetchPrayerTimes, 2 * 60 * 60 * 1000); // every 2 hours
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

updateHijriDate();
setInterval(updateHijriDate, 7200000); // every 2 hours
