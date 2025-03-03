const axios = require("axios");
const fs = require("fs");

const url = "https://denverpioneers.com"; // The website URL

async function scrapeEvents() {
    try {
        // Step 1: Fetch the raw HTML response
        const response = await axios.get(url);
        const html = response.data;

        // Debugging Step: Check if `window.sidearmComponents` exists in the HTML
        if (!html.includes("window.sidearmComponents")) {
            console.error("`window.sidearmComponents` not found in HTML. Check if it's loaded dynamically.");
            fs.writeFileSync("debug.html", html); // Save HTML for manual inspection
            console.log("Saved raw HTML to debug.html. Open it and search for 'sidearmComponents'.");
            return;
        }

        // Step 2: Extract the JavaScript block that defines `window.sidearmComponents`
        const match = html.match(/window\.sidearmComponents\s*=\s*(\[[\s\S]*?\]);/);

        if (!match) {
            console.error(" Data block not found in the HTML. Maybe it's structured differently?");
            return;
        }

        // Step 3: Parse the extracted JSON safely
        let jsonData;
        try {
            jsonData = JSON.parse(match[1]);
        } catch (error) {
            console.error("Error parsing JSON:", error.message);
            return;
        }

        // Step 4: Find the component containing event data
        console.log("🔍 Checking extracted JSON structure...");
        fs.writeFileSync("debug.json", JSON.stringify(jsonData, null, 4)); // Save JSON for manual review

        const eventsComponent = jsonData.find(c => c.name === "foo");

        if (!eventsComponent || !eventsComponent.data) {
            console.error(" No event data found in 'foo' component.");
            console.log("Check 'debug.json' to see available component names.");
            return;
        }

        // Step 5: Extract relevant game data
        const gameDetails = eventsComponent.data.map(game => ({
            duTeam: game.sport?.title || "Unknown",
            opponent: game.opponent?.title || "Unknown",
            date: game.date ? new Date(game.date + "Z").toLocaleDateString() : "Unknown"
        }));

        // Step 6: Save extracted data
        fs.writeFileSync("events.json", JSON.stringify(gameDetails, null, 4));

        console.log("Data extracted and saved to events.json");
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}

// Run the scraper
scrapeEvents();
