const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const url = 'https://www.du.edu/calendar';
const outputFile = 'results/calendar_events.json';

async function fetchEventDescription(eventUrl) {
  try {
    const response = await axios.get(eventUrl);
    const $ = cheerio.load(response.data);
    const description = $('.description p').eq(1).text().trim(); // Adjust the selector based on the actual HTML structure
    return description;
  } catch (error) {
    console.error(`Error fetching event description from ${eventUrl}:`, error);
    return '';
  }
}

async function fetchCalendarEvents() {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const events = [];

    // Select each event item
    const eventCards = $('.event-card').toArray();
    for (const element of eventCards) {
      const title = $(element).find('h3').text().trim();
      const date = $(element).find('p').first().text().trim();
      const time = $(element).find('.icon-du-clock').parent().text().trim();
      const detailsUrl = $(element).attr('href');

      // Filter events for the year 2025
      const eventDate = new Date(date + ' 2025');
      if (eventDate.getFullYear() === 2025) {
        const event = { title, date };
        if (time) event.time = time;

        // Fetch the event description
        if (detailsUrl) {
          const fullDetailsUrl = new URL(detailsUrl, url).href;
          const description = await fetchEventDescription(fullDetailsUrl);
          if (description) event.description = description;
        }

        events.push(event);
      }
    }

    // Save the results in a structured JSON file
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir);
    }

    fs.writeFileSync(outputFile, JSON.stringify({ events }, null, 2));
    console.log('Events saved to', outputFile);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
  }
}

fetchCalendarEvents();