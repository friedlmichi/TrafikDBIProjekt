<script>
    import { api } from "$lib/api.js";
    import { onMount } from "svelte";

    let artikelListe = $state([]);
    let loading = $state(true);
    let ladeFehler = $state("");

    let eingabeArtikelNr = $state("");
    let eingabeMenge = $state(1);
    let eingangStatus = $state({ type: "", msg: "" });
    let zeigeNeuPopup = $state(false);
    let neuFehler = $state("");
    let neuArtikel = $state({
        artikelnr: "",
        bezeichnung: "",
        preis: 0,
        alter: 0,
        katId: 1,
        liefId: 1,
    });

    async function speichereNeuenArtikel() {
        neuFehler = "";
        try {
            const result = await api.neuerArtikel(neuArtikel);
            if (result.p_status === "ERROR") {
                neuFehler = result.p_error;
            } else {
                zeigeNeuPopup = false;
                eingangStatus = {
                    type: "success",
                    msg: `Artikel ${neuArtikel.bezeichnung} erfolgreich angelegt.`,
                };
                await ladeInventar();
                neuArtikel = {
                    artikelnr: "",
                    bezeichnung: "",
                    preis: 0,
                    alter: 0,
                    katId: 1,
                    liefId: 1,
                };
            }
        } catch (e) {
            neuFehler = "Fehler: " + e.message;
        }
    }

    function autoFocus(node) {
        node.focus();
        return { destroy() {} };
    }

    onMount(async () => {
        await ladeInventar();
    });

    async function ladeInventar() {
        loading = true;
        try {
            const daten = await api.getInventar();
            artikelListe = daten.items || daten;
        } catch (e) {
            ladeFehler = "Konnte Inventar nicht laden: " + e.message;
        } finally {
            loading = false;
        }
    }
    async function handleArtikelLoeschen(artikelNr, bezeichnung) {
        // Öffnet das klassische Browser-Fenster zur Sicherheit
        if (
            !confirm(
                `Möchtest du den Artikel "${bezeichnung}" (${artikelNr}) wirklich aus dem System löschen?`,
            )
        )
            return;

        try {
            const result = await api.loescheArtikel(artikelNr);

            if (result.p_status === "ERROR") {
                // Zeigt unseren Datenbank-Trigger-Fehler an
                alert(result.p_error);
            } else {
                // Filtert den gelöschten Artikel sofort aus der Ansicht
                artikelListe = artikelListe.filter(
                    (a) => a.artikelnr !== artikelNr,
                );
            }
        } catch (e) {
            alert("Netzwerkfehler: " + e.message);
        }
    }

    async function handleWareneingang(event) {
        if (event.key === "Enter" && eingabeArtikelNr.trim() !== "") {
            eingangStatus = { type: "", msg: "" };

            try {
                const result = await api.buchenWareneingang(
                    eingabeArtikelNr.trim(),
                    eingabeMenge,
                );

                if (result.p_status === "ERROR") {
                    eingangStatus = { type: "error", msg: result.p_error };
                } else {
                    const index = artikelListe.findIndex(
                        (a) => a.artikelnr === eingabeArtikelNr.trim(),
                    );
                    let berechneterNeuerBestand = 0;

                    if (index !== -1) {
                        berechneterNeuerBestand =
                            Number(artikelListe[index].lagerbestand) +
                            Number(eingabeMenge);
                        artikelListe[index].lagerbestand =
                            berechneterNeuerBestand;
                    } else {
                        berechneterNeuerBestand =
                            result.p_neuer_bestand || "unbekannt";
                    }

                    eingangStatus = {
                        type: "success",
                        msg: `Wareneingang erfolgreich. Neuer Bestand: ${berechneterNeuerBestand} Stuck.`,
                    };

                    eingabeArtikelNr = "";
                    eingabeMenge = 1;
                }
            } catch (e) {
                eingangStatus = {
                    type: "error",
                    msg: "Netzwerkfehler: " + e.message,
                };
            }
        }
    }
</script>

<div class="inventar-container">
    <div class="page-header">
        <div class="header-content">
            <h1>Inventar</h1>
            <p class="page-subtitle">Lagerbestand und Wareneingang verwalten</p>
        </div>
        <button class="btn-primary" onclick={() => (zeigeNeuPopup = true)}>
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <path d="M12 5v14M5 12h14" />
            </svg>
            Neuer Artikel
        </button>
    </div>

    <div class="wareneingang-panel">
        <div class="panel-header">
            <div class="panel-title">
                <svg
                    class="panel-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                >
                    <path
                        d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"
                    />
                    <path d="M7 12h10M7 8h10M7 16h6" />
                </svg>
                <h2>Schneller Wareneingang</h2>
            </div>
        </div>
        <p class="panel-hint">
            Scannen Sie den Barcode der Lieferung. Die Menge wird automatisch
            dem Lager hinzugefugt.
        </p>

        <div class="scanner-reihe">
            <div class="input-group compact">
                <label for="menge">Menge</label>
                <input
                    id="menge"
                    type="number"
                    min="1"
                    bind:value={eingabeMenge}
                />
            </div>

            <div class="input-group scanner-input">
                <label for="barcode">Barcode scannen</label>
                <div class="input-wrapper">
                    <svg
                        class="input-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                    >
                        <path
                            d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"
                        />
                    </svg>
                    <input
                        id="barcode"
                        type="text"
                        bind:value={eingabeArtikelNr}
                        onkeydown={handleWareneingang}
                        use:autoFocus
                        placeholder="Barcode scannen oder eingeben..."
                        autocomplete="off"
                    />
                </div>
            </div>
        </div>

        {#if eingangStatus.msg}
            <div class="status-msg {eingangStatus.type}">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    {#if eingangStatus.type === "success"}
                        <path d="M20 6L9 17l-5-5" />
                    {:else}
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4M12 16h.01" />
                    {/if}
                </svg>
                {eingangStatus.msg}
            </div>
        {/if}
    </div>

    <div class="lager-section">
        <div class="section-header">
            <h2 class="section-title">Lagerbestand</h2>
            <button class="btn-ghost" onclick={ladeInventar}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path d="M23 4v6h-6M1 20v-6h6" />
                    <path
                        d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
                    />
                </svg>
                Aktualisieren
            </button>
        </div>

        {#if loading}
            <div class="loading-state">
                <div class="spinner"></div>
                <span>Lade Inventar...</span>
            </div>
        {:else if ladeFehler}
            <div class="error-state">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                </svg>
                {ladeFehler}
            </div>
        {:else}
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Artikelnummer</th>
                            <th>Bezeichnung</th>
                            <th class="text-right">Preis</th>
                            <th class="text-center">Bestand</th>
                            <th class="text-center">Altersfreigabe</th>
                            <th class="text-center">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each artikelListe as artikel}
                            <tr
                                class={artikel.lagerbestand < 5
                                    ? "low-stock"
                                    : ""}
                            >
                                <td class="mono">{artikel.artikelnr}</td>
                                <td class="article-name"
                                    >{artikel.bezeichnung}</td
                                >
                                <td class="text-right"
                                    >{artikel.verkaufspreis.toFixed(2)} EUR</td
                                >
                                <td class="text-center">
                                    <span
                                        class="stock-badge {artikel.lagerbestand <
                                        5
                                            ? 'critical'
                                            : artikel.lagerbestand < 10
                                              ? 'low'
                                              : 'normal'}"
                                    >
                                        {artikel.lagerbestand}
                                    </span>
                                </td>
                                <td class="text-center">
                                    {#if artikel.altersfreigabe > 0}
                                        <span class="age-badge"
                                            >{artikel.altersfreigabe}+</span
                                        >
                                    {:else}
                                        <span class="age-none">-</span>
                                    {/if}
                                </td>
                                <td class="text-center">
                                    <button
                                        class="btn-ghost"
                                        style="color: #ef4444; padding: 5px;"
                                        title="Artikel löschen"
                                        onclick={() =>
                                            handleArtikelLoeschen(
                                                artikel.artikelnr,
                                                artikel.bezeichnung,
                                            )}
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            width="18"
                                            height="18"
                                        >
                                            <path
                                                d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
                                            />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
</div>

{#if zeigeNeuPopup}
    <div class="modal-overlay">
        <div class="modal-box">
            <div class="modal-header">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                >
                    <path
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                </svg>
                Neuen Artikel anlegen
            </div>
            <div class="modal-body">
                <div class="form-grid">
                    <div class="input-group full-width">
                        <label>Artikelnummer (Barcode)</label>
                        <input
                            type="text"
                            bind:value={neuArtikel.artikelnr}
                            use:autoFocus
                            placeholder="Barcode scannen..."
                        />
                    </div>

                    <div class="input-group full-width">
                        <label>Bezeichnung</label>
                        <input
                            type="text"
                            bind:value={neuArtikel.bezeichnung}
                            placeholder="z.B. Red Bull 0.25L"
                        />
                    </div>

                    <div class="input-group">
                        <label>Verkaufspreis (EUR)</label>
                        <input
                            type="number"
                            step="0.01"
                            bind:value={neuArtikel.preis}
                        />
                    </div>

                    <div class="input-group">
                        <label>Altersfreigabe</label>
                        <select
                            bind:value={neuArtikel.alter}
                            class="select-input"
                        >
                            <option value={0}>Keine</option>
                            <option value={16}>Ab 16</option>
                            <option value={18}>Ab 18</option>
                        </select>
                    </div>

                    <div class="input-group">
                        <label>Kategorie</label>
                        <select
                            bind:value={neuArtikel.katId}
                            class="select-input"
                        >
                            <option value={1}>1 - Tabakwaren</option>
                            <option value={2}>2 - Getränke</option>
                            <option value={3}>3 - Zeitschriften</option>
                        </select>
                    </div>

                    <div class="input-group">
                        <label>Lieferant ID</label>
                        <input type="number" bind:value={neuArtikel.liefId} />
                    </div>
                </div>

                {#if neuFehler}
                    <div class="error-msg">{neuFehler}</div>
                {/if}
            </div>

            <div class="modal-footer">
                <button
                    class="btn-secondary"
                    onclick={() => (zeigeNeuPopup = false)}>Abbrechen</button
                >
                <button class="btn-primary" onclick={speichereNeuenArtikel}
                    >Speichern</button
                >
            </div>
        </div>
    </div>
{/if}

<style>
    .inventar-container {
        max-width: 1200px;
        margin: 0 auto;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 32px;
    }

    .header-content h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1a1f36;
        margin: 0 0 4px 0;
        letter-spacing: -0.02em;
    }

    .page-subtitle {
        color: #697386;
        margin: 0;
        font-size: 0.95rem;
    }

    .wareneingang-panel {
        background: #ffffff;
        border: 1px solid #e6e9ef;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 32px;
    }

    .panel-header {
        margin-bottom: 8px;
    }

    .panel-title {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .panel-icon {
        width: 20px;
        height: 20px;
        color: #697386;
    }

    .panel-title h2 {
        font-size: 1rem;
        font-weight: 600;
        color: #1a1f36;
        margin: 0;
    }

    .panel-hint {
        color: #697386;
        font-size: 0.875rem;
        margin: 0 0 20px 0;
    }

    .scanner-reihe {
        display: flex;
        gap: 16px;
        align-items: flex-end;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .input-group.compact {
        width: 100px;
    }

    .input-group.scanner-input {
        flex-grow: 1;
    }

    .input-group.full-width {
        grid-column: 1 / -1;
    }

    .input-group label {
        font-size: 0.8rem;
        font-weight: 600;
        color: #697386;
        text-transform: uppercase;
        letter-spacing: 0.03em;
    }

    .input-group input,
    .select-input {
        padding: 12px 14px;
        border: 1px solid #e6e9ef;
        border-radius: 8px;
        font-size: 0.95rem;
        color: #1a1f36;
        background: #ffffff;
        transition: border-color 0.2s ease;
    }

    .input-group input:focus,
    .select-input:focus {
        border-color: #1a1f36;
        outline: none;
    }

    .input-wrapper {
        position: relative;
    }

    .input-wrapper .input-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        color: #697386;
    }

    .input-wrapper input {
        padding-left: 44px;
        width: 100%;
        box-sizing: border-box;
    }

    #menge {
        text-align: center;
    }

    .status-msg {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 16px;
        padding: 14px 16px;
        border-radius: 8px;
        font-weight: 500;
        font-size: 0.9rem;
    }

    .status-msg svg {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
    }

    .status-msg.success {
        background: #ecfdf5;
        color: #059669;
        border: 1px solid #a7f3d0;
    }

    .status-msg.error {
        background: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
    }

    .lager-section {
        background: #ffffff;
        border: 1px solid #e6e9ef;
        border-radius: 12px;
        overflow: hidden;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e6e9ef;
    }

    .section-title {
        font-size: 1rem;
        font-weight: 600;
        color: #1a1f36;
        margin: 0;
    }

    .btn-ghost {
        display: flex;
        align-items: center;
        gap: 8px;
        background: none;
        border: none;
        color: #697386;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 6px;
        transition: all 0.2s ease;
    }

    .btn-ghost:hover {
        background: #f8f9fb;
        color: #1a1f36;
    }

    .btn-ghost svg {
        width: 16px;
        height: 16px;
    }

    .btn-primary {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #1a1f36;
        color: white;
        padding: 12px 20px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .btn-primary:hover {
        background: #2d3450;
    }

    .btn-primary svg {
        width: 18px;
        height: 18px;
    }

    .btn-secondary {
        background: #ffffff;
        color: #697386;
        border: 1px solid #e6e9ef;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-secondary:hover {
        background: #f8f9fb;
        color: #1a1f36;
    }

    .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 48px;
        color: #697386;
    }

    .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #e6e9ef;
        border-top-color: #1a1f36;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .error-state {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 48px;
        color: #dc2626;
    }

    .error-state svg {
        width: 20px;
        height: 20px;
    }

    .table-wrapper {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th,
    td {
        padding: 14px 24px;
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
    }

    td {
        font-size: 0.9rem;
        color: #1a1f36;
        border-bottom: 1px solid #e6e9ef;
    }

    tr:last-child td {
        border-bottom: none;
    }

    .text-right {
        text-align: right;
    }

    .text-center {
        text-align: center;
    }

    .mono {
        font-family: "SF Mono", Monaco, monospace;
        font-size: 0.85rem;
        color: #697386;
    }

    .article-name {
        font-weight: 500;
    }

    .stock-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 40px;
        padding: 6px 12px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.85rem;
    }

    .stock-badge.normal {
        background: #ecfdf5;
        color: #059669;
    }

    .stock-badge.low {
        background: #fef3c7;
        color: #92400e;
    }

    .stock-badge.critical {
        background: #fef2f2;
        color: #dc2626;
    }

    .low-stock {
        background: #fffbeb;
    }

    .age-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: #1a1f36;
        color: white;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
    }

    .age-none {
        color: #9ca3af;
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
        max-width: 520px;
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
        background: #1a1f36;
        color: white;
        padding: 20px 24px;
        font-size: 1.1rem;
        font-weight: 600;
    }

    .modal-header svg {
        width: 22px;
        height: 22px;
    }

    .modal-body {
        padding: 24px;
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }

    .error-msg {
        margin-top: 16px;
        padding: 14px 16px;
        background: #fef2f2;
        color: #dc2626;
        border-radius: 8px;
        border: 1px solid #fecaca;
        font-size: 0.9rem;
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
