import { Actor } from 'apify';
import { ApifyClient } from 'apify-client';

await Actor.init();

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

// Remote/Ausland Locations überspringen
const SKIP_LOCATION = /anywhere|remote|weltweit|worldwide|\bNY\b|\bCA\b|\bFL\b|\bTX\b|United States|United Kingdom/i;

// Nur den Stadtnamen extrahieren: "Berlin, Deutschland" → "Berlin"
function extractCity(location) {
    if (!location) return '';
    return location.split(',')[0].trim();
}

async function run() {

    // Mehrere Keywords für mehr Ergebnisse
    const keywords = [
        'Kfz-Mechatroniker Werkstatt',
        'Kfz Mechatroniker Autohaus',
        'Kraftfahrzeugmechatroniker Stelle',
    ];

    const allJobs = [];

    // ─────────────────────────────────────────────
    // SCHRITT 1: Google Jobs — für jeden Suchbegriff
    // ─────────────────────────────────────────────
    for (const keyword of keywords) {
        console.log(`Suche: "${keyword}"...`);

        const jobsRun = await client.actor('orgupdate/google-jobs-scraper').call({
            includeKeyword: keyword,
            locationName: 'Deutschland',
            datePosted: 'month',
            pagesToFetch: 5,
        });

        const { items } = await client.dataset(jobsRun.defaultDatasetId).listItems();
        console.log(`→ ${items.length} Stellen gefunden.`);
        allJobs.push(...items);
    }

    console.log(`Gesamt: ${allJobs.length} Stellenanzeigen gesammelt.`);

    if (allJobs.length === 0) {
        console.log('Keine Stellenanzeigen gefunden. Suchbegriff prüfen.');
        return;
    }

    // ─────────────────────────────────────────────
    // SCHRITT 2: Filtern & deduplizieren
    // ─────────────────────────────────────────────
    console.log('Filtere Remote-Jobs und Duplikate...');

    const seen = new Set();
    const companies = [];

    for (const job of allJobs) {
        const name      = (job.companyName  || job.company_name || '').trim();
        const location  = (job.location     || '').trim();
        const jobTitle  = (job.jobTitle     || job.job_title    || 'Kfz-Mechatroniker/in').trim();
        const applyLink =  job.applyLink    || job.url          || '';

        // Kein Name oder Ort → überspringen
        if (!name || !location) continue;

        // Remote / Ausland → überspringen
        if (SKIP_LOCATION.test(location)) {
            console.log(`Übersprungen (Remote/Ausland): ${name} — ${location}`);
            continue;
        }

        // Duplikat → überspringen
        const key = `${name}__${location}`;
        if (seen.has(key)) continue;

        seen.add(key);
        companies.push({
            name,
            location,
            city: extractCity(location),
            jobTitle,
            applyLink,
        });
    }

    console.log(`${companies.length} einzigartige Unternehmen in Deutschland gefunden.`);

    if (companies.length === 0) {
        console.log('Keine deutschen Unternehmen gefunden.');
        return;
    }

    // ─────────────────────────────────────────────
    // SCHRITT 3: Google Maps — Telefonnummern holen
    // ─────────────────────────────────────────────
    console.log('Suche Telefonnummern über Google Maps...');

    // Nur Stadtname verwenden: "Auto Müller GmbH Berlin" statt "Auto Müller GmbH Berlin, Deutschland"
    const searchStrings = companies.map(c => `${c.name} ${c.city}`);

    const mapsRun = await client.actor('compass/crawler-google-places').call({
        searchStringsArray: searchStrings,
        language: 'de',
        maxCrawledPlacesPerSearch: 1,
    });

    const { items: places } = await client.dataset(mapsRun.defaultDatasetId).listItems();
    console.log(`${places.length} Google Maps Ergebnisse erhalten.`);

    // Match über searchString
    const placeBySearch = {};
    for (const place of places) {
        const key = place.searchString;
        if (key && !placeBySearch[key]) {
            placeBySearch[key] = place;
        }
    }

    // ─────────────────────────────────────────────
    // SCHRITT 4: Alles zusammenführen & speichern
    // ─────────────────────────────────────────────
    let saved = 0;

    for (let i = 0; i < companies.length; i++) {
        const company   = companies[i];
        const searchKey = `${company.name} ${company.city}`;
        const place     = placeBySearch[searchKey] || places[i] || {};

        await Actor.pushData({
            Firmenname:       company.name,
            Jobtitel:         company.jobTitle,
            Stadt:            company.city,
            Telefon:          place.phone       || 'Nicht gefunden',
            Website:          place.website     || 'Nicht gefunden',
            Adresse:          place.address     || 'Nicht gefunden',
            Bewertungsanzahl: place.reviewsCount || 0,
            Stellenanzeige:   company.applyLink,
        });

        saved++;
    }

    console.log(`Fertig! ${saved} Leads gespeichert.`);
}

await run();
await Actor.exit();
