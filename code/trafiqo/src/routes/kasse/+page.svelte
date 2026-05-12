<!-- src/routes/kasse/+page.svelte -->
<script>
    import { createKassenState } from "$lib/kasse.svelte.js";

    const kasse = createKassenState();
    let eingabeArtikelNr = $state("");
    const aktuelleMitarbeiterId = 1;

    function autoFocus(node) {
        node.focus();
        return { destroy() {} };
    }

    async function handleScan(event) {
        if (event.key === "Enter" && eingabeArtikelNr.trim() !== "") {
            await kasse.scanArtikel(eingabeArtikelNr.trim());
            eingabeArtikelNr = "";
        }
    }
</script>

<div class="pos-container">
    <header class="pos-header">
        <div class="header-left">
            <h1>Kassen-Terminal</h1>
            <span class="header-divider"></span>
            <span class="header-status">
                {kasse.verkaufId ? `Bon #${kasse.verkaufId}` : "Bereit"}
            </span>
        </div>
        <div class="header-right">
            <div class="staff-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
                Mitarbeiter {aktuelleMitarbeiterId}
            </div>
        </div>
    </header>

    {#if kasse.fehlerMeldung}
        <div class="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
            </svg>
            <div class="alert-content">
                <strong>Achtung</strong>
                <span>{kasse.fehlerMeldung}</span>
            </div>
        </div>
    {/if}

    {#if !kasse.verkaufId}
        <div class="start-screen">
            <div class="start-content">
                <div class="start-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="M2 10h20"/>
                        <path d="M6 16h4"/>
                    </svg>
                </div>
                <h2>Kasse bereit</h2>
                <p>Starten Sie einen neuen Verkaufsvorgang</p>
                <button class="btn-start" onclick={() => kasse.starteBon(aktuelleMitarbeiterId)}>
                    Neuen Bon starten
                </button>
            </div>
        </div>
    {:else}
        <div class="kassen-grid">
            <div class="bon-bereich">
                <div class="scanner-section">
                    <label for="scanner" class="scanner-label">Artikel scannen</label>
                    <div class="scanner-input-wrapper">
                        <svg class="scanner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
                            <path d="M7 12h10M7 8h10M7 16h6"/>
                        </svg>
                        <input
                            id="scanner"
                            type="text"
                            bind:value={eingabeArtikelNr}
                            onkeydown={handleScan}
                            use:autoFocus
                            placeholder="Barcode scannen oder Artikelnummer eingeben..."
                            autocomplete="off"
                        />
                    </div>
                </div>

                <div class="bon-liste">
                    <div class="bon-header">
                        <span class="bon-title">Positionen</span>
                        <span class="bon-count">{kasse.positionen.length} Artikel</span>
                    </div>
                    <div class="bon-table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Artikel</th>
                                    <th class="text-center">Menge</th>
                                    <th class="text-right">Einzelpreis</th>
                                    <th class="text-right">Gesamt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each kasse.positionen as pos}
                                    <tr>
                                        <td>
                                            <div class="article-info">
                                                <span class="article-name">{pos.bezeichnung}</span>
                                                <span class="article-nr">{pos.artikelnr}</span>
                                            </div>
                                        </td>
                                        <td class="text-center">
                                            <span class="quantity-badge">{pos.menge}</span>
                                        </td>
                                        <td class="text-right">{pos.einzelpreis.toFixed(2)} EUR</td>
                                        <td class="text-right total-cell">{(pos.menge * pos.einzelpreis).toFixed(2)} EUR</td>
                                    </tr>
                                {:else}
                                    <tr>
                                        <td colspan="4" class="empty-state">
                                            <div class="empty-content">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                                    <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
                                                </svg>
                                                <span>Scannen Sie den ersten Artikel</span>
                                            </div>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="aktions-bereich">
                <div class="summe-display">
                    <span class="summe-label">Gesamtbetrag</span>
                    <span class="summe-value">{kasse.gesamtbetrag.toFixed(2)}</span>
                    <span class="summe-currency">EUR</span>
                </div>

                <div class="action-section">
                    <h3 class="section-title">Alterskontrolle</h3>
                    {#if kasse.ausweisGeprueft}
                        <button class="btn-verified" disabled>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 6L9 17l-5-5"/>
                            </svg>
                            Ausweis kontrolliert
                        </button>
                    {:else}
                        <button class="btn-warning" onclick={() => kasse.bestaetigeAusweis()}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="16" rx="2"/>
                                <circle cx="9" cy="10" r="2"/>
                                <path d="M15 8h2M15 12h2"/>
                                <path d="M7 16h10"/>
                            </svg>
                            Ausweis kontrollieren
                        </button>
                    {/if}
                </div>

                <div class="action-section">
                    <h3 class="section-title">Abschluss</h3>
                    <div class="buttons">
                        <button class="btn-success" onclick={() => kasse.abschliessen(true)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="4" width="20" height="16" rx="2"/>
                                <path d="M2 10h20"/>
                            </svg>
                            Bezahlen
                        </button>
                        <button class="btn-danger" onclick={() => kasse.abschliessen(false)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                            Stornieren
                        </button>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

{#if kasse.zeigeAltersPopup}
    <div class="modal-overlay">
        <div class="modal-box">
            <div class="modal-header warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <path d="M12 9v4M12 17h.01"/>
                </svg>
                Alterskontrolle erforderlich
            </div>
            <div class="modal-body">
                <div class="age-warning">{kasse.altersPopupText}</div>
                <p class="modal-instruction">Bitte physischen Ausweis kontrollieren. Ist der Kunde alt genug?</p>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick={() => kasse.popupAntwort(false)}>
                    Abbrechen
                </button>
                <button class="btn-success" onclick={() => kasse.popupAntwort(true)}>
                    Ausweis bestatigt
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .pos-container {
        max-width: 1400px;
        margin: 0 auto;
        height: calc(100vh - 64px);
        display: flex;
        flex-direction: column;
    }

    .pos-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #ffffff;
        padding: 16px 24px;
        border-radius: 12px;
        border: 1px solid #e6e9ef;
        margin-bottom: 24px;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .pos-header h1 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1a1f36;
    }

    .header-divider {
        width: 1px;
        height: 24px;
        background: #e6e9ef;
    }

    .header-status {
        color: #059669;
        font-weight: 500;
        font-size: 0.9rem;
    }

    .staff-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f8f9fb;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 0.875rem;
        color: #697386;
        font-weight: 500;
    }

    .staff-badge svg {
        width: 16px;
        height: 16px;
    }

    .alert {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background: #fef2f2;
        color: #991b1b;
        padding: 16px 20px;
        border-radius: 10px;
        border: 1px solid #fecaca;
        margin-bottom: 24px;
    }

    .alert svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        margin-top: 2px;
    }

    .alert-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .alert-content strong {
        font-weight: 600;
    }

    .start-screen {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-grow: 1;
        background: #ffffff;
        border-radius: 12px;
        border: 1px solid #e6e9ef;
    }

    .start-content {
        text-align: center;
        max-width: 320px;
    }

    .start-icon {
        width: 80px;
        height: 80px;
        background: #f8f9fb;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
    }

    .start-icon svg {
        width: 40px;
        height: 40px;
        color: #697386;
    }

    .start-content h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1a1f36;
        margin: 0 0 8px 0;
    }

    .start-content p {
        color: #697386;
        margin: 0 0 32px 0;
    }

    .btn-start {
        background: #1a1f36;
        color: white;
        border: none;
        padding: 16px 32px;
        border-radius: 10px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .btn-start:hover {
        background: #2d3450;
    }

    .kassen-grid {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: 24px;
        flex-grow: 1;
        min-height: 0;
    }

    .bon-bereich {
        display: flex;
        flex-direction: column;
        gap: 20px;
        min-height: 0;
    }

    .scanner-section {
        background: #ffffff;
        padding: 20px;
        border-radius: 12px;
        border: 1px solid #e6e9ef;
    }

    .scanner-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        color: #1a1f36;
        margin-bottom: 10px;
    }

    .scanner-input-wrapper {
        position: relative;
    }

    .scanner-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;
        color: #697386;
    }

    .scanner-input-wrapper input {
        width: 100%;
        font-size: 1rem;
        padding: 14px 16px 14px 48px;
        border: 2px solid #e6e9ef;
        border-radius: 10px;
        box-sizing: border-box;
        transition: border-color 0.2s ease;
    }

    .scanner-input-wrapper input:focus {
        border-color: #1a1f36;
        outline: none;
    }

    .scanner-input-wrapper input::placeholder {
        color: #9ca3af;
    }

    .bon-liste {
        background: #ffffff;
        border: 1px solid #e6e9ef;
        border-radius: 12px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
    }

    .bon-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #e6e9ef;
    }

    .bon-title {
        font-weight: 600;
        color: #1a1f36;
    }

    .bon-count {
        color: #697386;
        font-size: 0.875rem;
    }

    .bon-table-wrapper {
        overflow-y: auto;
        flex-grow: 1;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        padding: 14px 20px;
        text-align: left;
    }

    th {
        font-size: 0.75rem;
        font-weight: 600;
        color: #697386;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: #f8f9fb;
        border-bottom: 1px solid #e6e9ef;
        position: sticky;
        top: 0;
    }

    td {
        font-size: 0.9rem;
        color: #1a1f36;
        border-bottom: 1px solid #e6e9ef;
    }

    .text-center {
        text-align: center;
    }

    .text-right {
        text-align: right;
    }

    .article-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .article-name {
        font-weight: 500;
    }

    .article-nr {
        font-size: 0.8rem;
        color: #697386;
    }

    .quantity-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: #f0f2f5;
        color: #1a1f36;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.9rem;
    }

    .total-cell {
        font-weight: 600;
    }

    .empty-state {
        text-align: center;
        padding: 48px 20px !important;
    }

    .empty-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: #697386;
    }

    .empty-content svg {
        width: 32px;
        height: 32px;
        opacity: 0.5;
    }

    .aktions-bereich {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .summe-display {
        background: #ffffff;
        border: 1px solid #e6e9ef;
        border-radius: 12px;
        padding: 24px;
        text-align: center;
    }

    .summe-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: #697386;
        margin-bottom: 8px;
    }

    .summe-value {
        font-size: 3rem;
        font-weight: 700;
        color: #1a1f36;
        letter-spacing: -0.02em;
    }

    .summe-currency {
        font-size: 1.5rem;
        font-weight: 500;
        color: #697386;
        margin-left: 4px;
    }

    .action-section {
        background: #ffffff;
        border: 1px solid #e6e9ef;
        border-radius: 12px;
        padding: 20px;
    }

    .section-title {
        font-size: 0.75rem;
        font-weight: 600;
        color: #697386;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0 0 12px 0;
    }

    .buttons {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 16px;
        font-size: 0.95rem;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
    }

    button svg {
        width: 18px;
        height: 18px;
    }

    .btn-success {
        background: #059669;
        color: white;
    }

    .btn-success:hover {
        background: #047857;
    }

    .btn-danger {
        background: #ffffff;
        color: #dc2626;
        border: 1px solid #fecaca;
    }

    .btn-danger:hover {
        background: #fef2f2;
    }

    .btn-warning {
        background: #fef3c7;
        color: #92400e;
        border: 1px solid #fcd34d;
    }

    .btn-warning:hover {
        background: #fde68a;
    }

    .btn-verified {
        background: #ecfdf5;
        color: #059669;
        border: 1px solid #a7f3d0;
        cursor: default;
    }

    .btn-secondary {
        background: #ffffff;
        color: #697386;
        border: 1px solid #e6e9ef;
    }

    .btn-secondary:hover {
        background: #f8f9fb;
    }

    /* Modal */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(26, 31, 54, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(4px);
    }

    .modal-box {
        background: #ffffff;
        border-radius: 16px;
        width: 90%;
        max-width: 480px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        overflow: hidden;
        animation: modalIn 0.2s ease-out;
    }

    @keyframes modalIn {
        from {
            transform: scale(0.95);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    .modal-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px 24px;
        font-size: 1.1rem;
        font-weight: 600;
    }

    .modal-header.warning {
        background: #fef3c7;
        color: #92400e;
    }

    .modal-header svg {
        width: 24px;
        height: 24px;
    }

    .modal-body {
        padding: 24px;
    }

    .age-warning {
        background: #fef2f2;
        color: #991b1b;
        padding: 16px;
        border-radius: 10px;
        border-left: 4px solid #dc2626;
        font-weight: 500;
        margin-bottom: 16px;
    }

    .modal-instruction {
        color: #697386;
        margin: 0;
        line-height: 1.5;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 20px 24px;
        background: #f8f9fb;
        border-top: 1px solid #e6e9ef;
    }
</style>
