<script>
    import { api } from "$lib/api.js";
    import { onMount } from "svelte";

    let aboListe = $state([]);
    let loading = $state(true);
    let fehlerMeldung = $state("");

    let zeigePopup = $state(false);
    let formFehler = $state("");
    let neuesAbo = $state({
        kundeId: 1,
        artikelNr: "",
        menge: 1,
        wochentag: "Montag",
    });
    const wochentage = [
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag",
    ];

    onMount(async () => {
        await ladeAbos();
    });

    async function ladeAbos() {
        loading = true;
        try {
            const daten = await api.getAbos();
            aboListe = daten.items || daten;
        } catch (e) {
            fehlerMeldung = "Fehler beim Laden: " + e.message;
        } finally {
            loading = false;
        }
    }

    async function handleSpeichern() {
        formFehler = "";
        console.log(neuesAbo);
        
        try {
            const result = await api.speichereAbo(neuesAbo);

            if (result.p_status === "ERROR") {
                formFehler = result.p_error;
            } else {
                zeigePopup = false;
                await ladeAbos();
                neuesAbo = {
                    kundeId: 1,
                    artikelId: "",
                    menge: 1,
                    wochentag: "Montag",
                };
            }
        } catch (e) {
            formFehler = "Netzwerkfehler: " + e.message;
        }
    }
</script>

<div class="abo-container">
    <div class="page-header">
        <div class="header-content">
            <h1>Zeitschriften-Abonnements</h1>
            <p class="page-subtitle">
                Reservierungen und wiederkehrende Bestellungen verwalten
            </p>
        </div>
        <button class="btn-primary" onclick={() => (zeigePopup = true)}>
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <path d="M12 5v14M5 12h14" />
            </svg>
            Neue Reservierung
        </button>
    </div>

    {#if loading}
        <div class="loading-state">
            <div class="spinner"></div>
            <span>Lade Abonnements...</span>
        </div>
    {:else if fehlerMeldung}
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
            {fehlerMeldung}
        </div>
    {:else}
        <div class="table-card">
            <div class="table-header">
                <div class="header-info">
                    <svg
                        class="header-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                    >
                        <path
                            d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"
                        />
                        <path d="M7 7h10M7 12h10M7 17h6" />
                    </svg>
                    <span>Aktive Reservierungen</span>
                </div>
                <span class="record-count">{aboListe.length} Eintrage</span>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Wochentag</th>
                            <th>Kunde</th>
                            <th>Zeitschrift</th>
                            <th class="text-center">Menge</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each aboListe as abo}
                            <tr>
                                <td
                                    ><span class="day-tag">{abo.wochentag}</span
                                    ></td
                                >
                                <td>
                                    <div class="customer-info">
                                        <span class="customer-name"
                                            >{abo.kunden_name}</span
                                        >
                                        <span class="customer-id"
                                            >ID: {abo.kunde_id}</span
                                        >
                                    </div>
                                </td>
                                <td>{abo.zeitschrift_name}</td>
                                <td class="text-center">
                                    <span class="quantity-badge"
                                        >{abo.menge}</span
                                    >
                                </td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="4" class="empty-state">
                                    <div class="empty-content">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="1.5"
                                        >
                                            <path
                                                d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"
                                            />
                                            <path d="M7 7h10M7 12h10M7 17h6" />
                                        </svg>
                                        <span>Keine aktiven Reservierungen</span
                                        >
                                        <button
                                            class="btn-link"
                                            onclick={() => (zeigePopup = true)}
                                            >Erste Reservierung anlegen</button
                                        >
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/if}
</div>

{#if zeigePopup}
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
                        d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"
                    />
                    <path d="M7 7h10M7 12h10M7 17h6" />
                </svg>
                Zeitschrift reservieren
            </div>
            <div class="modal-body">
                <div class="form-grid">
                    <div class="input-group">
                        <label>Kunden-ID</label>
                        <input type="number" bind:value={neuesAbo.kundeId} />
                    </div>

                    <div class="input-group">
                        <label>Artikel-Barcode</label>
                        <input
                            type="text"
                            bind:value={neuesAbo.artikelNr}
                            placeholder="Barcode der Zeitschrift scannen..."
                        />
                    </div>

                    <div class="input-group">
                        <label>Menge</label>
                        <input
                            type="number"
                            min="1"
                            bind:value={neuesAbo.menge}
                        />
                    </div>

                    <div class="input-group">
                        <label>Abholtag</label>
                        <select
                            bind:value={neuesAbo.wochentag}
                            class="select-input"
                        >
                            {#each wochentage as tag}
                                <option value={tag}>{tag}</option>
                            {/each}
                        </select>
                    </div>
                </div>

                {#if formFehler}
                    <div class="error-msg">{formFehler}</div>
                {/if}
            </div>
            <div class="modal-footer">
                <button
                    class="btn-secondary"
                    onclick={() => (zeigePopup = false)}>Abbrechen</button
                >
                <button class="btn-primary" onclick={handleSpeichern}
                    >Reservieren</button
                >
            </div>
        </div>
    </div>
{/if}

<style>
    .abo-container {
        max-width: 1000px;
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

    .btn-link {
        background: none;
        border: none;
        color: #2563eb;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        padding: 0;
    }

    .btn-link:hover {
        text-decoration: underline;
    }

    .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 64px;
        background: #ffffff;
        border: 1px solid #e6e9ef;
        border-radius: 12px;
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
        padding: 64px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 12px;
        color: #dc2626;
    }

    .error-state svg {
        width: 20px;
        height: 20px;
    }

    .table-card {
        background: #ffffff;
        border-radius: 12px;
        border: 1px solid #e6e9ef;
        overflow: hidden;
    }

    .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e6e9ef;
    }

    .header-info {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        color: #1a1f36;
    }

    .header-icon {
        width: 20px;
        height: 20px;
        color: #697386;
    }

    .record-count {
        color: #697386;
        font-size: 0.875rem;
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
        padding: 16px 24px;
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

    .text-center {
        text-align: center;
    }

    .day-tag {
        display: inline-block;
        background: #eff6ff;
        color: #2563eb;
        padding: 6px 12px;
        border-radius: 6px;
        font-weight: 500;
        font-size: 0.8rem;
    }

    .customer-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .customer-name {
        font-weight: 500;
    }

    .customer-id {
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

    .empty-state {
        text-align: center;
        padding: 64px 24px !important;
    }

    .empty-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: #697386;
    }

    .empty-content svg {
        width: 40px;
        height: 40px;
        opacity: 0.4;
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

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
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
