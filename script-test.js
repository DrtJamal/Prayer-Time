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
let prayerDataCache = [];
let currentDayTiming = null;
let displayDayTiming = null;
let currentIqamaIndex = null;
let countdownInterval = null;
let lastSunriseBeepDate = null;
let lastZawalBeepDate = null;


function getPrayerTimingForDate(prayerData, date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return prayerData.find(entry => {
        const [entryDay, entryMonth] = entry.Date.split("/");
        return entryDay === day && entryMonth === month;
    });
}


async function fetchPrayerTimes() {
    try {
        // Fetch prayer times JSON
        const prayerResponse = await fetch('prayer-times.json');
        const prayerData = await prayerResponse.json();
        prayerDataCache = prayerData;

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

        const todayTiming = getPrayerTimingForDate(prayerData, today);
        currentDayTiming = todayTiming;
        displayDayTiming = { ...todayTiming };

        const formattedDate = today.toLocaleDateString("en-GB");


        if (todayTiming) {
            populatePrayerTable(displayDayTiming);
            updateRollingTimings();
            startCountdown();

            document.getElementById("date-display").innerText = `📅 Date: ${formattedDate}`;
            document.getElementById("sunrise-time").innerText = `🌅 Sunrise: ${displayDayTiming.Sunrise || "-"}`;
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

function updateRollingTimings() {
    if (!currentDayTiming || !displayDayTiming || !prayerDataCache.length) return;

    const now = new Date();
    const minutesNow = now.getHours() * 60 + now.getMinutes();

    const toMinutes = time => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    };

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowTiming = getPrayerTimingForDate(prayerDataCache, tomorrow);
    if (!tomorrowTiming) return;

    const roll = (name, className) => {
        displayDayTiming[name] = tomorrowTiming[name];
        const cell = document.querySelector(`.${className} .adhan-time`);
        if (cell) cell.textContent = tomorrowTiming[name];
    };

    if (minutesNow >= toMinutes(currentDayTiming.Sunrise) + sunriseProhibitionMinutes) {
        roll("Fajr", "fajr-row");
        displayDayTiming.Sunrise = tomorrowTiming.Sunrise;
        document.getElementById("sunrise-time").innerText =
            `🌅 Sunrise: ${tomorrowTiming.Sunrise || "-"}`;
    }

    if (minutesNow >= toMinutes(currentDayTiming.Asr))
        roll("Dhuhr", "dhuhr-row");

    if (minutesNow >= toMinutes(currentDayTiming.Maghrib))
        roll("Asr", "asr-row");

    if (minutesNow >= toMinutes(currentDayTiming.Isha))
        roll("Maghrib", "maghrib-row");
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
    if (!currentDayTiming) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    document.querySelectorAll(".current-prayer").forEach(row => {
        row.classList.remove("current-prayer");
    });

    const rows = document.querySelectorAll("#prayer-times-body tr");

    const fajr = timeToMinutes(currentDayTiming.Fajr);
    const dhuhr = timeToMinutes(currentDayTiming.Dhuhr);
    const asr = timeToMinutes(currentDayTiming.Asr);
    const maghrib = timeToMinutes(currentDayTiming.Maghrib);
    const isha = timeToMinutes(currentDayTiming.Isha);
    const sunrise = timeToMinutes(currentDayTiming.Sunrise);

    if ([fajr, dhuhr, asr, maghrib, isha, sunrise].some(t => t === null)) {
        return;
    }

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

    if (currentPrayer) {
        const currentRow = Array.from(rows).find(
            row => row.cells[0].innerText === currentPrayer
        );

        if (currentRow) {
            currentRow.classList.add("current-prayer");
        }
    }
}

setInterval(updatePrayerHighlight, 1000);
setInterval(updateProhibitedTime, 1000);
setInterval(updateRollingTimings, 60 * 1000);

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
    if (!currentDayTiming) return;

    const now = new Date();

    const currentSeconds =
        now.getHours() * 3600 +
        now.getMinutes() * 60 +
        now.getSeconds();

    const todayKey =
        `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    const sunriseMinutes = timeToMinutes(currentDayTiming.Sunrise);
    const dhuhrMinutes = timeToMinutes(currentDayTiming.Dhuhr);

    if (sunriseMinutes === null || dhuhrMinutes === null) return;

    const sunriseStart = sunriseMinutes * 60;
    const sunriseEnd =
        (sunriseMinutes + sunriseProhibitionMinutes) * 60;

    const zawalStart =
        (dhuhrMinutes - zawalProhibitionMinutes) * 60;

    const zawalEnd = dhuhrMinutes * 60;

    if (currentSeconds >= sunriseStart &&
        currentSeconds < sunriseEnd) {

        showProhibitedTime(
            "SUNRISE PROHIBITED TIME",
            sunriseEnd - currentSeconds
        );
        return;
    }

    if (currentSeconds >= sunriseEnd &&
        currentSeconds < sunriseEnd + 10) {

        if (lastSunriseBeepDate !== todayKey) {
            beepAndAlert();
            lastSunriseBeepDate = todayKey;
        }

        showProhibitedTime("SUNRISE PROHIBITED TIME EXPIRED");
        return;
    }

    if (currentSeconds >= zawalStart &&
        currentSeconds < zawalEnd) {

        showProhibitedTime(
            "ZAWAL PROHIBITED TIME",
            zawalEnd - currentSeconds
        );
        return;
    }

    if (currentSeconds >= zawalEnd &&
        currentSeconds < zawalEnd + 10) {

        if (lastZawalBeepDate !== todayKey) {
            beepAndAlert();
            lastZawalBeepDate = todayKey;
        }

        showProhibitedTime("ZAWAL EXPIRED — DHUHR ATHAN NOW");
        return;
    }

    prohibitedTimeElement.style.display = "none";
}
