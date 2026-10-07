/* Uncle Ron's: guest booking lookup. */
(() => {
    'use strict';

    /* ---------- storage ---------- */
    const LS = {
        get: (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
        set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } }
    };

    const norm = (v) => v.trim().toLowerCase();

    /* ---------- bookings ---------- */
    const bookings = () => LS.get('ur:bookings', []);
    window.urSaveBooking = (b) => {
        LS.set('ur:bookings', [...bookings(), { ...b, email: norm(b.email || '') }]);
    };

    const $ = (s, c = document) => c.querySelector(s);
    const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    const pretty = (d) => new Date(d + 'T00:00').toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const card = (b) => `<div class="found-card"><b>Booking ${esc(b.ref)}</b><br>${esc((b.tour || 'Tour').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))}<br>${esc(pretty(b.date))} · ${b.guests} guest${b.guests > 1 ? 's' : ''}<br>Lead guest: ${esc(b.name)}</div>`;

    /* ---------- modal ---------- */
    document.body.insertAdjacentHTML('beforeend', `
<div class="account-modal-overlay" id="authOverlay">
  <div class="account-modal" role="dialog" aria-modal="true" aria-label="Find My Booking">
    <button type="button" class="account-modal-close" id="authClose" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>

    <section data-panel="find">
      <h2>Find My Booking</h2>
      <p class="auth-desc">Look up your booking details using your booking number and the email address used during reservation.</p>
      <form class="account-form" id="findForm" novalidate>
        <label for="fbRef">Booking number <span class="required">*</span></label>
        <input type="text" id="fbRef" placeholder="e.g. URT-8K4P2M" required>
        <label for="fbEmail">Email you booked with <span class="required">*</span></label>
        <input type="email" id="fbEmail" required>
        <button type="submit" class="account-submit">Find My Booking</button>
      </form>
      <div id="findResult"></div>
    </section>
  </div>
</div>`);

    const overlay = $('#authOverlay');

    function open() {
        overlay.classList.add('open'); 
        document.body.style.overflow = 'hidden';
        $('#findResult').innerHTML = '';
    }

    const close = () => { 
        overlay.classList.remove('open'); 
        document.body.style.overflow = ''; 
    };

    /* ---------- events ---------- */
    $('#authClose').onclick = close;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    $('#findForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!e.target.checkValidity()) return e.target.reportValidity();

        const ref = $('#fbRef').value.trim();
        const email = norm($('#fbEmail').value);

        // Find booking in local storage
        const b = bookings().find((x) => x.ref.toLowerCase() === ref.toLowerCase() && x.email === email);

        if (b) {
            close();
            // Redirect to dedicated booking details page
            window.location.href = `../pages/booking-details.html?ref=${encodeURIComponent(ref)}`;
        } else {
            // Show error message if credentials do not match
            $('#findResult').innerHTML = '<p class="auth-msg err">We couldn\'t find a booking with those details. Check the number and email and try again.</p>';
        }
    });

    window.urAuth = {
        cardHtml: card,
        openFind: open
    };
})();