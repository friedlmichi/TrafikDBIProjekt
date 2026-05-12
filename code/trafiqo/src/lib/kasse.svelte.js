import { api } from './api.js';

export function createKassenState() {
    let verkaufId = $state(null);
    let positionen = $state([]);
    let fehlerMeldung = $state("");
    let ausweisGeprueft = $state(false);

    // --- NEU: State für unser eigenes Popup ---
    let zeigeAltersPopup = $state(false);
    let altersPopupText = $state("");
    let _popupResolver = null; // Hier merken wir uns die Pause-Funktion

    let gesamtbetrag = $derived(
        positionen.reduce((sum, pos) => sum + (pos.einzelpreis * pos.menge), 0)
    );

    return {
        get verkaufId() { return verkaufId; },
        get positionen() { return positionen; },
        get gesamtbetrag() { return gesamtbetrag; },
        get fehlerMeldung() { return fehlerMeldung; },
        set fehlerMeldung(v) { fehlerMeldung = v; },
        get ausweisGeprueft() { return ausweisGeprueft; },

        // Getter für die UI
        get zeigeAltersPopup() { return zeigeAltersPopup; },
        get altersPopupText() { return altersPopupText; },

        // --- NEU: Die Funktion, die den Code pausiert ---
        frageAlterAb(text) {
            zeigeAltersPopup = true;
            altersPopupText = text;
            return new Promise((resolve) => {
                _popupResolver = resolve;
            });
        },

        // --- NEU: Die Funktion, die vom Button aufgerufen wird ---
        popupAntwort(bestaetigt) {
            zeigeAltersPopup = false;
            if (_popupResolver) {
                _popupResolver(bestaetigt); // Setzt den Code fort (true oder false)
            }
        },

        async starteBon(mitarbeiterId) {
            fehlerMeldung = "";
            ausweisGeprueft = false;
            try {
                const result = await api.neuerBon(mitarbeiterId);
                verkaufId = result.verkauf_id; 
                positionen = [];
            } catch (e) {
                fehlerMeldung = "Konnte Kasse nicht starten: " + e.message;
            }
        },

        async bestaetigeAusweis() {
            if (!verkaufId) return;
            try {
                await api.ausweisBestaetigen(verkaufId);
                ausweisGeprueft = true; 
                fehlerMeldung = ""; 
            } catch (e) {
                fehlerMeldung = "Fehler bei Ausweiskontrolle: " + e.message;
            }
        },

        async scanArtikel(artikelNr) {
            if (!verkaufId) {
                fehlerMeldung = "Bitte zuerst einen neuen Bon starten!";
                return;
            }

            fehlerMeldung = "";
            try {
                const result = await api.positionBuchen(verkaufId, artikelNr, 1);
                
                if (result.p_status === 'ERROR') {
                    if (result.p_error.includes("Achtung") || result.p_error.includes("Alter")) {
                        
                        // HIER IST DIE MAGIE: Wir warten auf unser eigenes Popup!
                        const bestaetigt = await this.frageAlterAb(result.p_error);
                        
                        if (bestaetigt) {
                            await this.bestaetigeAusweis();
                            await this.scanArtikel(artikelNr);
                        } else {
                            fehlerMeldung = "Verkauf abgebrochen: Alterskontrolle nicht bestanden.";
                        }
                    } else {
                        fehlerMeldung = result.p_error;
                    }
                    return; 
                }

                const name = result.p_bezeichnung || result.P_BEZEICHNUNG || "Unbekannter Artikel";
                const preis = Number(result.p_einzelpreis || result.P_EINZELPREIS) || 0;

                const existierenderArtikel = positionen.find(p => p.artikelnr === artikelNr);
                
                if (existierenderArtikel) {
                    existierenderArtikel.menge += 1;
                } else {
                    positionen.push({ 
                        artikelnr: artikelNr, bezeichnung: name, menge: 1, einzelpreis: preis   
                    });
                }

            } catch (e) {
                fehlerMeldung = "Netzwerkfehler: " + e.message;
            }
        },

        async abschliessen(erfolgreich) {
            if (!verkaufId) return;
            try {
                await api.bonAbschliessen(verkaufId, erfolgreich);
                verkaufId = null;
                positionen = [];
                fehlerMeldung = erfolgreich ? "Erfolgreich kassiert!" : "Bon wurde storniert.";
            } catch (e) {
                fehlerMeldung = "Fehler beim Abschluss: " + e.message;
            }
        }
    };
}