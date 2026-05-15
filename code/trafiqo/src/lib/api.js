// src/lib/api.js

// Passe diese URL an deinen lokalen oder gehosteten ORDS-Pfad an
const BASE_URL = 'https://oracleapex.com/ords/trafik/api'; 
// src/lib/api.js (Auszug)

async function request(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {} // Startet leer
    };

    if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        
        // 1. Hole die Antwort als reinen Text (egal ob JSON, leer oder Fehler)
        const textData = await response.text();
        
        // 2. Wandle es nur in JSON um, wenn wirklich Text da ist
        let data = {};
        if (textData) {
            try {
                data = JSON.parse(textData);
            } catch (e) {
                console.warn("Konnte Antwort nicht als JSON parsen:", textData);
            }
        }

        if (!response.ok) {
            throw new Error(data.message || data.errmsg || `HTTP Fehler ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Fehler bei ${endpoint}:`, error);
        throw error;
    }
}

export const api = {
    // GET: Inventar abrufen
    getInventar: () => request('/inventar'),
      // GET: Alle Verkäufe (Historie)
    getVerkaeufe: () => request('/verkauf'),

    // POST: Kasse - Neuen Bon starten (erwartet p_mitarbeiter_id)
    neuerBon: (mitarbeiterId) => request('/kasse/neu', 'POST', { p_mitarbeiter_id: mitarbeiterId }),

    // POST: Kasse - Position buchen (erwartet p_verkauf_id, p_artikelnr, p_menge)
    positionBuchen: (verkaufId, artikelNr, menge) => request('/kasse/position', 'POST', { 
        p_verkauf_id: verkaufId, 
        p_artikelnr: artikelNr, 
        p_menge: menge 
    }),

    // POST: Kasse - Abschließen oder Stornieren (erwartet p_verkauf_id, p_erfolgreich)
    bonAbschliessen: (verkaufId, erfolgreich) => request('/kasse/abschluss', 'POST', { 
        p_verkauf_id: verkaufId, 
        p_erfolgreich: erfolgreich 
    }),
    // POST: Ausweis für aktuellen Bon bestätigen
    ausweisBestaetigen: (verkaufId) => request('/kasse/ausweis', 'POST', { p_verkauf_id: verkaufId }),
    
      // POST: Wareneingang buchen
    buchenWareneingang: (artikelNr, menge) => request('/inventar', 'POST', { p_artikelnr: artikelNr, p_menge: menge }),

    // POST: Neuen Artikel anlegen
    neuerArtikel: (daten) => request('/inventar/neu', 'POST', { 
        p_artikelnr: daten.artikelnr, p_bezeichnung: daten.bezeichnung, 
        p_preis: daten.preis, p_alter: daten.alter, 
        p_kat_id: daten.katId, p_lief_id: daten.liefId 
    }),
    // GET: Alle Abos laden
    getAbos: () => request('/abos'),
    
   // POST: Abo speichern
    speichereAbo: (daten) => request('/abos', 'POST', { 
        p_kunde_id: daten.kundeId, 
        // WICHTIG: artikelNr (mit großem N) und .trim() zur Sicherheit!
        p_artikelnr: daten.artikelNr ? daten.artikelNr.trim() : "", 
        p_menge: daten.menge, 
        p_wochentag: daten.wochentag 
    }),
    // GET & POST für Kunden
    getKunden: () => request('/kunden'),
    neuerKunde: (daten) => request('/kunden', 'POST', { 
        p_vorname: daten.vorname, 
        p_nachname: daten.nachname, 
        p_telefon: daten.telefon, 
        p_geburtsdatum: daten.geburtsdatum 
    }),
    // GET: Dashboard aufgeteilt in zwei sichere Aufrufe
    getDashboardStats: () => request('/dashboard/stats'),
    getDashboardReservierungen: () => request('/dashboard/reservierungen'),
    loescheArtikel: (artikelNr) => request('/inventar/loeschen', 'POST', { p_artikelnr: artikelNr }),
};