// Function to update the date and time
function updateDateTime() {
  // Get the current time
  const currentTime = new Date();

  // Format the current date and time in Gregorian
  const dateTime = currentTime.toLocaleString();

  // Get the current Hijri date using moment-hijri
  const hijriDate = moment(currentTime).format('iD iMMMM iYYYY'); // iD = Day, iMMMM = Month, iYYYY = Year in Hijri

  // Get the current day of the week (e.g., Monday, Tuesday)
  const dayOfWeek = currentTime.toLocaleString('en-us', { weekday: 'long' });

  // Display the current date and time
  const dateTimeElement = document.getElementById("current-date-time");
  dateTimeElement.innerHTML = `
    <h2 class="time">${dateTime}</h2>
    <p class="day">${dayOfWeek}</p>
    <p class="hijri">${hijriDate}</p>
  `;
}

// Call the function initially and update every second
updateDateTime();
setInterval(updateDateTime, 1000); // Update every 1000ms (1 second)
