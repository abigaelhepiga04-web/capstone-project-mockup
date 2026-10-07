document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-pills .pill');
    const cards = document.querySelectorAll('.package-grid .card');
    const searchToggle = document.getElementById('searchToggle');
    const searchInputWrapper = document.getElementById('searchInputWrapper');
    const tourSearchInput = document.getElementById('tourSearchInput');

    // Filter by Category Pills
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterTours();
        });
    });

    // Toggle Search Bar
    if (searchToggle && searchInputWrapper) {
        searchToggle.addEventListener('click', () => {
            searchInputWrapper.classList.toggle('open');
            if (searchInputWrapper.classList.contains('open')) {
                tourSearchInput.focus();
            }
        });
    }

    // Live Search Filtering
    if (tourSearchInput) {
        tourSearchInput.addEventListener('input', () => {
            filterTours();
        });
    }

    function filterTours() {
        const activeCategory = document.querySelector('.filter-pills .pill.active')?.getAttribute('data-filter') || 'all';
        const searchQuery = tourSearchInput ? tourSearchInput.value.toLowerCase().trim() : '';

        cards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const cardTitle = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const cardDescription = card.querySelectorAll('p')[1]?.textContent.toLowerCase() || '';

            const matchesCategory = activeCategory === 'all' || cardCategory === activeCategory;
            const matchesSearch = cardTitle.includes(searchQuery) || cardDescription.includes(searchQuery);

            if (matchesCategory && matchesSearch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
});

// ---- Booking Widget Logic ----
(() => {
    const root = document.getElementById('bk');
    if (!root) return;
    const $= (s) => root.querySelector(s),$$ = (s) => [...root.querySelectorAll(s)];
    const base = +root.dataset.price, defaultMaxPer = +root.dataset.max || 11;
    const capacity = +root.dataset.capacity || 30, tour = root.dataset.tour || 'tour';
    const peso = (n) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const COUPONS = { UNCLERON10: 0.10 };
    const REDIRECT = {
        ewallet: "You'll be redirected to PayMongo to finish paying with your e-wallet.",
        maya: "You'll be redirected to Maya to complete your payment securely.",
        paypal: "You'll be redirected to PayPal to complete your payment securely.",
        bank: 'Bank / InstaPay details will be shown after you confirm. Your booking is held once we receive the transfer.'
    };
    const dateEl = $('#bkDate'), gBtn = $('#bkGuestsBtn'), gPanel = $('#bkGuestsPanel');
    
    const priceForeign = +root.dataset.priceForeign || base;
    const priceSenior = +root.dataset.priceSenior || base * 0.8;
    const priceChild36 = +root.dataset.priceChild36 || base * 0.5;
    const priceInfant12 = +root.dataset.priceInfant12 || 0;

    const pax = { adult: 1, foreign: 0, senior: 0, child36: 0, infant12: 0 };
    const totalPax = () => pax.adult + pax.foreign + pax.senior + pax.child36 + pax.infant12;
    let coupon = 0, step = 1, confirmed = false;

    // Helper function to fetch selected booking type value dynamically
    const getBookingTypeValue = () => {
        const checked = root.querySelector('input[name="bkType"]:checked');
        return checked ? checked.value : 'exclusive';
    };

    const key = (d) => `bk:${tour}:${d}`;
    const baseline = (d) => {
        let h = 0; for (const ch of tour + d) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
        const r = (h % 1000) / 1000;
        return r > 0.97 ? capacity : Math.round(capacity * (0.2 + r * 0.7));
    };
    const stored = (d) => { try { return +localStorage.getItem(key(d)) || 0; } catch { return 0; } };
    const reserve = (d, n) => { try { localStorage.setItem(key(d), stored(d) + n); } catch { /* storage blocked */ } };
    const booked = (d) => Math.min(capacity, baseline(d) + stored(d));
    const prettyDate = (d) => new Date(d + 'T00:00').toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    if (dateEl) {
        dateEl.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    }

    // Dynamic Max Guests based on Booking Type (Joiners: max 8, Exclusive: max 11)
    function getMaxPerBooking() {
        const typeVal = getBookingTypeValue();
        return typeVal === 'joiners' ? 8 : defaultMaxPer;
    }

    function seatLimit() {
        const d = dateEl ? dateEl.value : '';
        const currentMax = getMaxPerBooking();
        return Math.max(0, Math.min(currentMax, d ? capacity - booked(d) : capacity));
    }

    function paintGuests() {
        const limit = seatLimit(), t = totalPax();
        if ($('#bkAdultN')) $('#bkAdultN').textContent = pax.adult;
        if ($('#bkForeignN')) $('#bkForeignN').textContent = pax.foreign;
        if ($('#bkSeniorN')) $('#bkSeniorN').textContent = pax.senior;
        if ($('#bkChild36N')) $('#bkChild36N').textContent = pax.child36;
        if ($('#bkInfant12N')) $('#bkInfant12N').textContent = pax.infant12;          $$('.bk-counter button').forEach((b) => {
            b.disabled = +b.dataset.dir < 0 ? (pax[b.dataset.pax] <= 0 || (b.dataset.pax === 'adult' && t <= 1)) : t >= limit;
        });

        const s = (n) => (n > 1 ? 's' : '');
        if ($('#bkGuestsText')) {
            $('#bkGuestsText').textContent = !limit ? 'No seats available' : `${t} Guest${s(t)}`;
        }
        if (gBtn) gBtn.disabled = !limit;

        // --- Hide Joiner Option when guest count is 9 to 11 ---
        const joinerCard = $('#bkTypeJoinerCard');
        if (joinerCard) {
            const joinerRadio = joinerCard.querySelector('input');
            if (t >= 9 && t <= 11) {
                joinerCard.style.display = 'none'; // Hide joiner option
                if (joinerRadio) joinerRadio.disabled = true;

                // Automatically switch selection to Exclusive
                const exclusiveRadio = root.querySelector('input[name="bkType"][value="exclusive"]');
                if (exclusiveRadio) exclusiveRadio.checked = true;
            } else {
                joinerCard.style.display = 'flex'; // Show joiner option
                if (joinerRadio) joinerRadio.disabled = false;
            }
        }
    }

    function rebuildGuests() {
        const d = dateEl ? dateEl.value : '', remaining = d ? capacity - booked(d) : capacity, limit = seatLimit(), currentMax = getMaxPerBooking();
        while (totalPax() > limit && pax.infant12 > 0) pax.infant12--;
        while (totalPax() > limit && pax.child36 > 0) pax.child36--;
        while (totalPax() > limit && pax.senior > 0) pax.senior--;
        while (totalPax() > limit && pax.foreign > 0) pax.foreign--;
        while (totalPax() > limit && pax.adult > 0) pax.adult--;
        if (limit && !totalPax()) pax.adult = 1;
        paintGuests();
        const msg = $('#bkAvailMsg');
        if (msg) {
            msg.textContent = !d ? '' : !limit ? 'Sorry, this date is fully booked. Please choose another date.'
                : remaining < currentMax ? `Only ${remaining} seat${remaining > 1 ? 's' : ''} left on this date.` : '';
            msg.className = 'bk-note' + (msg.textContent ? ' err' : '');
        }
    }

    function paintBar() {
        const box = $('#bkAvail'), bar = $('#bkUrgency'), d = dateEl ? dateEl.value : '';
        if (!box || !bar) return;
        if (!d) {
            box.dataset.level = 'none';
            bar.style.setProperty('--fill', '0%'); bar.style.setProperty('--mine', '0%');
            if ($('#bkAvailLabel')) $('#bkAvailLabel').textContent = 'Pick a date to see availability';
            if ($('#bkAvailLeft')) $('#bkAvailLeft').textContent = '';
            return;
        }
        const b = booked(d), mine = confirmed ? 0 : Math.min(totalPax(), capacity - b);
        const pct = (b + mine) / capacity * 100, left = capacity - b - mine;
        box.dataset.level = pct >= 100 ? 'full' : pct >= 80 ? 'fast' : pct >= 50 ? 'filling' : 'good';
        bar.style.setProperty('--fill', (b / capacity * 100) + '%');
        bar.style.setProperty('--mine', (mine / capacity * 100) + '%');
        if ($('#bkAvailLabel')) $('#bkAvailLabel').textContent = { full: 'Fully booked', fast: 'Filling up fast', filling: 'Filling up', good: 'Good availability' }[box.dataset.level];
        if ($('#bkAvailLeft')) $('#bkAvailLeft').textContent = left <= 0 && !mine ? 'Sold out'
            : `${left} of ${capacity} seats left` + (mine ? ` · includes your ${mine}` : '');
    }

    function calc() {
        const g = totalPax();
        const addons = $$('.bk-check input:checked').reduce((s, c) => s + +c.dataset.price * (c.dataset.per === 'person' ? g : 1), 0);
        const baseTotal = (base * pax.adult) + (priceForeign * pax.foreign) + (priceSenior * pax.senior) + (priceChild36 * pax.child36) + (priceInfant12 * pax.infant12);
        const gross = baseTotal + addons, discount = gross * coupon, subtotal = gross - discount;
        const deposit = $('input[name=bkPay]:checked')?.value === 'deposit';
        const due = subtotal * (deposit ? 0.5 : 1);
        const fee = +($('input[name=bkMethod]:checked')?.dataset.fee || 0), charge = due * fee / 100;
        return { g, baseTotal, addons, discount, subtotal, deposit, due, fee, charge, total: due + charge };
    }

    function render() {
        const c = calc(), method = $('input[name=bkMethod]:checked')?.value;
        const rows = [];
        const typeVal = getBookingTypeValue();
        const bookingType = typeVal === 'joiners' ? 'Joiner' : 'Exclusive';
        rows.push(['Booking Type', bookingType, 'strong']);
        if (pax.adult) rows.push([`Adults × ${pax.adult}`, peso(base * pax.adult)]);
        if (pax.foreign) rows.push([`Foreign × ${pax.foreign}`, peso(priceForeign * pax.foreign)]);
        if (pax.senior) rows.push([`Senior Citizens × ${pax.senior}`, peso(priceSenior * pax.senior)]);
        if (pax.child36) rows.push([`Children (3-6 yrs) × ${pax.child36}`, peso(priceChild36 * pax.child36)]);
        if (pax.infant12) rows.push([`Children (1-2 yrs) × ${pax.infant12}`, peso(priceInfant12 * pax.infant12)]);
        if (c.addons) rows.push(['Add-ons', peso(c.addons)]);
        if (c.discount) rows.push(['Coupon discount', '−' + peso(c.discount)]);
        rows.push(['Subtotal', peso(c.subtotal), 'strong']);
        if (c.deposit) rows.push(['50% deposit due now', peso(c.due)]);
        if (c.charge) rows.push([`Service charge (${c.fee}%)`, peso(c.charge)]);
        rows.push(['Total to pay now', peso(c.total), 'total']);
        if (c.deposit) rows.push(['Balance (cash on tour date)', peso(c.subtotal - c.due)]);
        if ($('#bkSummary')) $('#bkSummary').innerHTML = rows.map(([l, v, k]) => `<div class="bk-row ${k || ''}"><span>${l}</span><span>${v}</span></div>`).join('');
        if ($('#bkPayBtn')) $('#bkPayBtn').textContent = 'Pay ' + peso(c.total);
        if ($('#bkCard')) $('#bkCard').hidden = method !== 'card';
        if ($('#bkRedirect')) {
            $('#bkRedirect').hidden = method === 'card';
            $('#bkRedirect').textContent = REDIRECT[method] || '';         }     }      function go(n) {         step = n;         $$('.bk-step').forEach((s) => { s.hidden = +s.dataset.step !== n; });
        if ($('#bkBack')) $('#bkBack').hidden = n === 1 || n === 4;
        paintBar(); render();
    }

    const valid = (fields) => {
        const bad = fields.find((f) => !f.checkValidity());
        if (bad) bad.reportValidity();
        return !bad;
    };

    root.addEventListener('change', (e) => {
        if (e.target === dateEl || e.target.name === 'bkType') rebuildGuests();
        paintBar(); render();
    });

    if ($('#bkBack')) $('#bkBack').onclick = () => go(step - 1);
    $$('[data-next]').forEach((b) => b.onclick = () => {         if (step === 1) {             if (!valid($$
('[data-step="1"] [required]'))) return;
            if (!totalPax()) { if (dateEl) dateEl.focus(); return; }
        }
        go(step + 1);
    });

    if ($('#bkApply')) {
        $('#bkApply').onclick = () => {
            const code = $('#bkCoupon').value.trim().toUpperCase(), msg = $('#bkCouponMsg');
            coupon = COUPONS[code] || 0;
            if (msg) {
                msg.textContent = code ? (coupon ? `Coupon applied: ${coupon * 100}% off` : 'Invalid coupon code') : '';
                msg.className = 'bk-note ' + (coupon ? 'ok' : 'err');
            }
            render();
        };
    }

    if ($('#bkPayBtn')) {
        $('#bkPayBtn').onclick = () => {
            if (!$('#bkCard').hidden && !valid($$('#bkCard [required]'))) return;
            const d = dateEl.value, n = totalPax();
            if (n > capacity - booked(d)) {
                rebuildGuests(); go(1);
                if ($('#bkAvailMsg')) {
                    $('#bkAvailMsg').textContent = 'Sorry, those seats were just taken. Please adjust your guests or date.';
                    $('#bkAvailMsg').className = 'bk-note err';
                }
                return;
            }
            reserve(d, n); confirmed = true;
            const ref = new Date().getFullYear() + '-' + (Math.floor(Math.random() * 9000) + 1000);
            if ($('#bkRef')) $('#bkRef').textContent = ref;
            if (window.urSaveBooking) window.urSaveBooking({
                ref, tour, date: d, guests: n,
                type: getBookingTypeValue(),
                name: $('#bkName').value, email: $('#bkEmail').value, phone: $('#bkPhone').value
            });
            if ($('#bkEmailOut')) $('#bkEmailOut').textContent = $('#bkEmail').value;
            const left = capacity - booked(d);
            if ($('#bkSeats')) $('#bkSeats').textContent = `${n} seat${n > 1 ? 's' : ''} reserved for ${prettyDate(d)}. ${left > 0 ? left + ' left on that date.' : 'That date is now sold out.'}`;
            go(4);
        };
    }

    const setGuestsOpen = (open) => {
        if (gPanel) gPanel.hidden = !open;
        if (gBtn) gBtn.setAttribute('aria-expanded', open);
    };
    if (gBtn) gBtn.onclick = () => setGuestsOpen(gPanel.hidden);
    document.addEventListener('click', (e) => { if (!e.target.closest('.bk-guests')) setGuestsOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setGuestsOpen(false); });
    if (gPanel) {
        gPanel.addEventListener('click', (e) => {
            const b = e.target.closest('button[data-pax]');
            if (!b || b.disabled) return;
            pax[b.dataset.pax] += +b.dataset.dir;
            paintGuests(); paintBar(); render();
        });
    }

    if ($('#bkForm')) $('#bkForm').addEventListener('submit', (e) => e.preventDefault());
    rebuildGuests(); paintBar(); render();
})();

// Back to Top Button
let mybutton = document.getElementById("myBtn");
window.onscroll = function() { scrollFunction(); };

function scrollFunction() {
    if (mybutton) {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            mybutton.style.display = "block";
        } else {
            mybutton.style.display = "none";
        }
    }
}

function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

// Reveal cards on scroll
document.addEventListener("DOMContentLoaded", function () {
    const tourCards = document.querySelectorAll(".package-grid .card");
    const columnsPerRow = 5;

    const observerOptions = {
        root: null,
        rootMargin: "0px 0px -50px 0px",
        threshold: 0.15
    };

    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const cardIndex = Array.from(tourCards).indexOf(entry.target);
                const rowIndex = Math.floor(cardIndex / columnsPerRow);

                setTimeout(() => {
                    entry.target.classList.add("reveal");
                }, rowIndex * 150);

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    tourCards.forEach((card) => cardObserver.observe(card));
});

// Floating contact options
document.addEventListener("DOMContentLoaded", function () {
    const contactToggleBtn = document.getElementById("contactToggleBtn");
    const contactOptions = document.getElementById("contactOptions");

    if (contactToggleBtn && contactOptions) {
        contactToggleBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            contactOptions.classList.toggle("show");
            const icon = contactToggleBtn.querySelector("i");
            if (contactOptions.classList.contains("show")) {
                icon.className = "fa-solid fa-xmark";
            } else {
                icon.className = "fa-solid fa-comments";
            }
        });

        document.addEventListener("click", function (e) {
            if (!contactToggleBtn.contains(e.target) && !contactOptions.contains(e.target)) {
                contactOptions.classList.remove("show");
                const icon = contactToggleBtn.querySelector("i");
                if (icon) icon.className = "fa-solid fa-comments";
            }
        });
    }
});

// Star Rating Picker for Review Form
document.addEventListener('DOMContentLoaded', () => {
    const picker = document.getElementById('starRatingPicker');
    const input = document.getElementById('reviewRatingInput');

    if (picker && input) {
        const stars = picker.querySelectorAll('i');

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const val = star.getAttribute('data-value');
                input.value = val;

                stars.forEach(s => {
                    if (s.getAttribute('data-value') <= val) {
                        s.classList.remove('fa-regular');
                        s.classList.add('fa-solid');
                    } else {
                        s.classList.remove('fa-solid');
                        s.classList.add('fa-regular');
                    }
                });
            });
        });
    }
});