<script>
    import { api } from '$lib/api.js';
    import { onMount } from 'svelte';

    let stats = $state({ gesamtumsatz: 0, anzahl_abos: 0, kritischer_bestand: 0 });
    let reservierungen = $state([]);
    let loading = $state(true);
    let fehlerMeldung = $state("");

    onMount(async () => {
        try {
            // Holt beide Datenpakete gleichzeitig!
            const [statsDaten, resDaten] = await Promise.all([
                api.getDashboardStats(),
                api.getDashboardReservierungen()
            ]);

            // ORDS packt die Ergebnisse immer in ein "items" Array
            stats = statsDaten.items[0] || stats;
            reservierungen = resDaten.items || [];

        } catch (e) {
            fehlerMeldung = "Konnte Dashboard nicht laden: " + e.message;
            console.error(e);
        } finally {
            loading = false;
        }
    });
</script>
<div class="dashboard">
    <div class="page-header">
        <h1>Management Dashboard</h1>
        <p class="page-subtitle">Willkommen bei Trafiqo OS</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-header">
                <span class="stat-label">Gesamtumsatz</span>
                <div class="stat-icon revenue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                    </svg>
                </div>
            </div>
            <div class="stat-value">{Number(stats.gesamtumsatz || 0).toFixed(2)} EUR</div>
            <div class="stat-indicator positive">
                <span class="indicator-dot"></span>
                Aktuell
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-header">
                <span class="stat-label">Aktive Abonnements</span>
                <div class="stat-icon subscriptions">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/>
                        <path d="M7 7h10M7 12h10M7 17h6"/>
                    </svg>
                </div>
            </div>
            <div class="stat-value">{stats.anzahl_abos || 0}</div>
            <div class="stat-indicator neutral">
                <span class="indicator-dot"></span>
                Abonnements
            </div>
        </div>

        <div class="stat-card {(stats.kritischer_bestand || 0) > 0 ? 'warning' : ''}">
            <div class="stat-header">
                <span class="stat-label">Nachzubestellen</span>
                <div class="stat-icon {(stats.kritischer_bestand || 0) > 0 ? 'critical' : 'stock'}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                </div>
            </div>
            <div class="stat-value">{stats.kritischer_bestand || 0}</div>
            <div class="stat-indicator {(stats.kritischer_bestand || 0) > 0 ? 'negative' : 'positive'}">
                <span class="indicator-dot"></span>
                {(stats.kritischer_bestand || 0) > 0 ? 'Aktion erforderlich' : 'Lager in Ordnung'}
            </div>
        </div>
    </div>

    <div class="reservierungen-panel">
        <div class="panel-header">
            <div class="panel-title">
                <svg class="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                <h2>Anstehende Abholungen</h2>
            </div>
            <span class="badge">{reservierungen.length} Reservierungen</span>
        </div>
        
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Wochentag</th>
                        <th>Kunde</th>
                        <th>Zeitschrift</th>
                        <th>Menge</th>
                    </tr>
                </thead>
                <tbody>
                    {#each reservierungen as res}
                        <tr>
                            <td><span class="day-tag">{res.wochentag}</span></td>
                            <td class="customer-name">{res.kunden_name}</td>
                            <td>{res.zeitschrift_name}</td>
                            <td><span class="quantity">{res.menge}x</span></td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="4" class="empty-state">
                                <div class="empty-content">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                                        <path d="M16 2v4M8 2v4M3 10h18"/>
                                    </svg>
                                    <span>Keine anstehenden Reservierungen</span>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>

<style>
    .dashboard {
        max-width: 1200px;
        margin: 0 auto;
    }

    .page-header {
        margin-bottom: 32px;
    }

    .page-header h1 {
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

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        margin-bottom: 32px;
    }

    .stat-card {
        background: #ffffff;
        padding: 24px;
        border-radius: 12px;
        border: 1px solid #e6e9ef;
        transition: box-shadow 0.2s ease;
    }

    .stat-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .stat-card.warning {
        border-color: #fbbf24;
        background: linear-gradient(to bottom, #fffbeb, #ffffff);
    }

    .stat-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
    }

    .stat-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #697386;
    }

    .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .stat-icon svg {
        width: 20px;
        height: 20px;
    }

    .stat-icon.revenue {
        background: #ecfdf5;
        color: #059669;
    }

    .stat-icon.subscriptions {
        background: #eff6ff;
        color: #2563eb;
    }

    .stat-icon.stock {
        background: #f0f2f5;
        color: #697386;
    }

    .stat-icon.critical {
        background: #fef2f2;
        color: #dc2626;
    }

    .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #1a1f36;
        letter-spacing: -0.02em;
        margin-bottom: 8px;
    }

    .stat-indicator {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        font-weight: 500;
    }

    .indicator-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
    }

    .stat-indicator.positive {
        color: #059669;
    }

    .stat-indicator.positive .indicator-dot {
        background: #059669;
    }

    .stat-indicator.negative {
        color: #dc2626;
    }

    .stat-indicator.negative .indicator-dot {
        background: #dc2626;
    }

    .stat-indicator.neutral {
        color: #697386;
    }

    .stat-indicator.neutral .indicator-dot {
        background: #697386;
    }

    .reservierungen-panel {
        background: #ffffff;
        border-radius: 12px;
        border: 1px solid #e6e9ef;
        overflow: hidden;
    }

    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e6e9ef;
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

    .badge {
        background: #f0f2f5;
        color: #697386;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }

    .table-wrapper {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
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

    .day-tag {
        background: #eff6ff;
        color: #2563eb;
        padding: 6px 12px;
        border-radius: 6px;
        font-weight: 500;
        font-size: 0.8rem;
    }

    .customer-name {
        font-weight: 500;
    }

    .quantity {
        font-weight: 600;
        color: #1a1f36;
    }

    .empty-state {
        text-align: center;
        padding: 48px 24px !important;
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
</style>
