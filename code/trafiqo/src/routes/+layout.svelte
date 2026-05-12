<!-- src/routes/+layout.svelte -->
<script>
    let { children } = $props();
    
    const user = { name: "Michael", role: "CEO of Trafiqo" };
</script>

<div class="app-layout">
    <aside class="sidebar">
        <div class="logo">
            <div class="logo-mark">T</div>
            <div class="logo-text">
                Trafiqo<span>OS</span>
            </div>
        </div>
        
        <nav>
            <a href="/" class="nav-item">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
                Dashboard
            </a>
            <a href="/kasse" class="nav-item">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M2 10h20"/>
                    <path d="M6 16h4"/>
                </svg>
                Kassen-Terminal
            </a>
            <a href="/inventar" class="nav-item">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                Inventar
            </a>
            <a href="/abos" class="nav-item">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/>
                    <path d="M7 7h10M7 12h10M7 17h6"/>
                </svg>
                Zeitschriften-Abos
            </a>
            <a href="/kunden" class="nav-item">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
                Stammkunden
            </a>
        </nav>

        <div class="user-info">
            <div class="user-avatar">{user.name.charAt(0)}</div>
            <div class="user-details">
                <span class="user-name">{user.name}</span>
                <span class="user-role">{user.role}</span>
            </div>
        </div>
    </aside>

    <main class="content">
        {@render children()}
    </main>
</div>

<style>
    :global(body) {
        margin: 0;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        background-color: #f8f9fb;
        color: #1a1f36;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    :global(*) {
        box-sizing: border-box;
    }

    .app-layout {
        display: flex;
        height: 100vh;
        overflow: hidden;
    }

    .sidebar {
        width: 260px;
        background-color: #ffffff;
        border-right: 1px solid #e6e9ef;
        display: flex;
        flex-direction: column;
        padding: 0;
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 24px 20px;
        border-bottom: 1px solid #e6e9ef;
    }

    .logo-mark {
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #1a1f36 0%, #3d4663 100%);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 1.1rem;
    }

    .logo-text {
        font-size: 1.25rem;
        font-weight: 700;
        color: #1a1f36;
        letter-spacing: -0.02em;
    }

    .logo-text span {
        color: #697386;
        font-weight: 500;
    }

    nav {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        gap: 2px;
        padding: 16px 12px;
    }

    .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #697386;
        text-decoration: none;
        padding: 12px 14px;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.15s ease;
    }

    .nav-item:hover {
        background-color: #f8f9fb;
        color: #1a1f36;
    }

    .nav-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px;
        border-top: 1px solid #e6e9ef;
        margin-top: auto;
    }

    .user-avatar {
        width: 40px;
        height: 40px;
        background: #f0f2f5;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.9rem;
        color: #1a1f36;
    }

    .user-details {
        display: flex;
        flex-direction: column;
    }

    .user-name {
        font-weight: 600;
        font-size: 0.9rem;
        color: #1a1f36;
    }

    .user-role {
        font-size: 0.8rem;
        color: #697386;
    }

    .content {
        flex-grow: 1;
        padding: 32px 40px;
        overflow-y: auto;
        background-color: #f8f9fb;
    }
</style>
