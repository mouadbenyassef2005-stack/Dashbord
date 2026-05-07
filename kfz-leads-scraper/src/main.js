import { Actor } from 'apify';
import { ApifyClient } from 'apify-client';

await Actor.init();

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

async function run() {

    // ─────────────────────────────────────────────
    // SCHRITT 1: Google Jobs — Wer sucht gerade?
    // ─────────────────────────────────────────────
    console.log('Schritt 1/3: Suche Kfz-Mechatroniker Stellenanzeigen...');

    const jobsRun = await client.actor('orgupdate/google-jobs-scraper').call({
        includeKeyword: 'Kfz-Mechatroniker',
        locationName: 'Deutschland',
        datePosted: 'month',
        pagesToFetch: 3,
    });

    const { items: jobs } = await client.dataset(jobsRun.defaultDatasetId).listItems();
    console.log(`${jobs.length} Stellenanzeigen gefunden.`);

    if (jobs.length === 0) {
        console.log('Keine Stellenanzeigen gefunden. Bitte Suchbegriff prüfen.');
        return;
    }

    // ─────────────────────────────────────────────
    // SCHRITT 2: Doppelte Firmen herausfiltern
    // ─────────────────────────────────────────────
    console.log('Schritt 2/3: Firmen deduplizieren...');

    const seen = new Set();
    const companies = [];

    for (const job of jobs) {
        const name      = (job.companyName  || job.company_name || '').trim();
        const location  = (job.location     || '').trim();
        const jobTitle  = (job.jobTitle     || job.job_title    || 'Kfz-Mechatroniker/in').trim();
        const applyLink =  job.applyLink    || job.url          || '';

        const key = `${name}__${location}`;

        if (!name || !location) continue;
        if (seen.has(key)) continue;

        seen.add(key);
        companies.push({ name, location, jobTitle, applyLink });
    }

    console.log(`${companies.length} einzigartige Unternehmen gefunden.`);

    if (companies.length === 0) {
        console.log('Keine Unternehmen extrahierbar. Bitte Ergebnisse aus Schritt 1 prüfen.');
        return;
    }

    // ─────────────────────────────────────────────
    // SCHRITT 3: Google Maps — Telefonnummern holen
    // ─────────────────────────────────────────────
    console.log('Schritt 3/3: Suche Telefonnummern über Google Maps...');

    const searchStrings = companies.map(c => `${c.name} ${c.location}`);

    const mapsRun = await client.actor('compass/crawler-google-places').call({
        searchStringsArray: searchStrings,
        language: 'de',
        maxCrawledPlacesPerSearch: 1,
    });

    const { items: places } = await client.dataset(mapsRun.defaultDatasetId).listItems();
    console.log(`${places.length} Google Maps Ergebnisse erhalten.`);

    // Maps-Ergebnisse dem Suchbegriff zuordnen (primär über searchString)
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
        const searchKey = `${company.name} ${company.location}`;

        // Primär: Match über searchString — Fallback: gleicher Index
        const place = placeBySearch[searchKey] || places[i] || {};

        await Actor.pushData({
            Firmenname:       company.name,
            Jobtitel:         company.jobTitle,
            Stadt:            company.location,
            Telefon:          place.phone         || 'Nicht gefunden',
            Website:          place.website        || 'Nicht gefunden',
            Adresse:          place.address        || 'Nicht gefunden',
            Bewertungsanzahl: place.reviewsCount   || 0,
            Stellenanzeige:   company.applyLink,
        });

        saved++;
    }

    console.log(`Fertig! ${saved} Leads gespeichert. Jetzt unter "Results" als Excel exportieren.`);
}

await run();
await Actor.exit();
