const prayerTimesBody = document.getElementById('prayer-times-body');
const currentTimeElement = document.getElementById("current-time");
const nextIqamaElement = document.getElementById("next-iqama");
const nextPrayerElement = document.getElementById("next-prayer");
const prohibitedTimeElement = document.getElementById("prohibited-time");

let prayers = [
    { name: "Fajr", class: "fajr-row" },
    { name: "Dhuhr", class: "dhuhr-row" },
    { name: "Asr", class: "asr-row" },
    { name: "Maghrib", iqamaOffset: 5, class: "maghrib-row" },
    { name: "Isha", class: "isha-row" }
];
const sunriseProhibitionMinutes = 15;
const zawalProhibitionMinutes = 10;

let weeklyIqama = {}; // Will hold iqama times from JSON
let currentIqamaIndex = null;
let countdownInterval = null;
let lastSunriseBeepDate = null;
let lastZawalBeepDate = null;

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

        const todayDay = String(today.getDate()).padStart(2, "0");
        const todayMonth = String(today.getMonth() + 1).padStart(2, "0");

        const todayTiming = prayerData.find(entry => {
            const [day, month] = entry.Date.split("/");
            return day === todayDay && month === todayMonth;
        });

        const formattedDate = today.toLocaleDateString("en-GB");


        if (todayTiming) {
            populatePrayerTable(todayTiming);
            startCountdown();

            document.getElementById("date-display").innerText = `📅 Date: ${formattedDate}`;
            document.getElementById("sunrise-time").innerText = `🌅 Sunrise: ${todayTiming.Sunrise || "-"}`;
            updatePrayerHighlight();
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
            nextPrayerElement.innerText = `Time to ${prayers[currentIqamaIndex].name} is ${hours}:${minutes}:${seconds}`;
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

function timeToMinutes(time) {
    if (!time || !time.includes(":")) return null;

    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

function updatePrayerHighlight() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Remove the previous highlight
    document.querySelectorAll(".current-prayer").forEach(row => {
        row.classList.remove("current-prayer");
    });

    // Get today's prayer times
    const today = new Date();
    const todayDay = String(today.getDate()).padStart(2, "0");
    const todayMonth = String(today.getMonth() + 1).padStart(2, "0");

    // We will use the prayer times already displayed in the table
    const rows = document.querySelectorAll("#prayer-times-body tr");

    let prayerTimes = {};

    rows.forEach(row => {
        const prayerName = row.cells[0].innerText;
        const adhanTime = row.cells[1].innerText;
        prayerTimes[prayerName] = adhanTime;
    });

    // Sunrise time is displayed separately
    const sunriseText = document.getElementById("sunrise-time").innerText;
    const sunriseMatch = sunriseText.match(/(\d{1,2}:\d{2})/);
    const sunriseTime = sunriseMatch ? sunriseMatch[1] : null;

    // Convert times into minutes
    const fajr = timeToMinutes(prayerTimes["Fajr"]);
    const dhuhr = timeToMinutes(prayerTimes["Dhuhr"]);
    const asr = timeToMinutes(prayerTimes["Asr"]);
    const maghrib = timeToMinutes(prayerTimes["Maghrib"]);
    const isha = timeToMinutes(prayerTimes["Isha"]);
    const sunrise = timeToMinutes(sunriseTime);

    if ([fajr, dhuhr, asr, maghrib, isha, sunrise].some(t => t === null)) {
        return;
    }

    // Determine the current prayer period
    let currentPrayer = null;

    if (currentMinutes >= fajr && currentMinutes < sunrise) {
        currentPrayer = "Fajr";
    } else if (currentMinutes >= sunrise + sunriseProhibitionMinutes &&
               currentMinutes < dhuhr - zawalProhibitionMinutes) {
        currentPrayer = null;
    } else if (currentMinutes >= dhuhr && currentMinutes < asr) {
        currentPrayer = "Dhuhr";
    } else if (currentMinutes >= asr && currentMinutes < maghrib - 5) {
        currentPrayer = "Asr";
    } else if (currentMinutes >= maghrib && currentMinutes < isha) {
        currentPrayer = "Maghrib";
    } else if (currentMinutes >= isha || currentMinutes < fajr - 5) {
        currentPrayer = "Isha";
    }

    // Apply the highlight to the current prayer row
    if (currentPrayer) {
        const currentRow = rows.length
            ? Array.from(rows).find(row => row.cells[0].innerText === currentPrayer)
            : null;

        if (currentRow) {
            currentRow.classList.add("current-prayer");
        }
    }
}
setInterval(updatePrayerHighlight, 1000);
setInterval(updateProhibitedTime, 1000);

function showProhibitedTime(message, remainingSeconds = null) {
    prohibitedTimeElement.style.display = "block";

    if (remainingSeconds !== null) {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;

        prohibitedTimeElement.innerHTML = `
            ⚠ ${message}<br>
            PLEASE DO NOT PRAY<br>
            ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}
            REMAINING
        `;
    } else {
        prohibitedTimeElement.innerHTML = `⚠ ${message}`;
    }
}
function updateProhibitedTime() {
    const now = new Date();

    const currentSeconds =
        now.getHours() * 3600 +
        now.getMinutes() * 60 +
        now.getSeconds();

    const todayKey =
        `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    // Get Sunrise time
    const sunriseText =
        document.getElementById("sunrise-time").innerText;

    const sunriseMatch = sunriseText.match(/(\d{1,2}:\d{2})/);

    // Get Dhuhr Athan time from the prayer table
    const rows = document.querySelectorAll("#prayer-times-body tr");

    const dhuhrRow = Array.from(rows).find(
        row => row.cells[0].innerText === "Dhuhr"
    );

    if (!sunriseMatch || !dhuhrRow) return;

    const sunriseMinutes = timeToMinutes(sunriseMatch[1]);
    const dhuhrMinutes = timeToMinutes(dhuhrRow.cells[1].innerText);

    if (sunriseMinutes === null || dhuhrMinutes === null) return;

    // Calculate Sunrise prohibition period
    const sunriseStart = sunriseMinutes * 60;
    const sunriseEnd =
        (sunriseMinutes + sunriseProhibitionMinutes) * 60;

    // Calculate Zawal prohibition period
    const zawalStart =
        (dhuhrMinutes - zawalProhibitionMinutes) * 60;

    const zawalEnd = dhuhrMinutes * 60;

    // 1. Sunrise prohibition active
    if (currentSeconds >= sunriseStart &&
        currentSeconds < sunriseEnd) {

        showProhibitedTime(
            "SUNRISE PROHIBITED TIME",
            sunriseEnd - currentSeconds
        );
        return;
    }

    // 2. Sunrise prohibition expired
    if (currentSeconds >= sunriseEnd &&
        currentSeconds < sunriseEnd + 10) {

        if (lastSunriseBeepDate !== todayKey) {
            beepAndAlert();
            lastSunriseBeepDate = todayKey;
        }

        showProhibitedTime("SUNRISE PROHIBITED TIME EXPIRED");
        return;
    }

    // 3. Zawal prohibition active
    if (currentSeconds >= zawalStart &&
        currentSeconds < zawalEnd) {

        showProhibitedTime(
            "ZAWAL PROHIBITED TIME",
            zawalEnd - currentSeconds
        );
        return;
    }

    // 4. Zawal prohibition expired
    if (currentSeconds >= zawalEnd &&
        currentSeconds < zawalEnd + 10) {

        if (lastZawalBeepDate !== todayKey) {
            beepAndAlert();
            lastZawalBeepDate = todayKey;
        }

        showProhibitedTime(
            "ZAWAL EXPIRED — DHUHR ATHAN NOW"
        );
        return;
    }

    // 5. No prohibited period
    prohibitedTimeElement.style.display = "none";
}