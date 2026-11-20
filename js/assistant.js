/* ================================================================
   RON'S TRAVEL ASSISTANT — DUAL-PURPOSE AI ENGINE
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const widget = document.getElementById('urAiWidget');
    if (!widget) return;

    const launcher = document.getElementById('urAiLauncher');
    const tooltip = document.getElementById('urAiTooltip');
    const chatWindow = document.getElementById('urAiWindow');
    const minimizeBtn = document.getElementById('urAiMinimizeBtn');
    const closeBtn = document.getElementById('urAiCloseBtn');
    const resetBtn = document.getElementById('urAiResetBtn');
    const chatBody = document.getElementById('urAiBody');
    const chatForm = document.getElementById('urAiForm');
    const chatInput = document.getElementById('urAiInput');
    const quickButtons = document.querySelectorAll('.ur-quick-card, .ur-quick-wide');
    const carouselTrack = document.getElementById('urAiCarouselTrack');
    const prevBtn = document.getElementById('urCarouselPrev');
    const nextBtn = document.getElementById('urCarouselNext');

    function setMascotState(state) {
        widget.classList.remove('mascot-state-thinking', 'mascot-state-excited');
        if (state === 'thinking') {
            widget.classList.add('mascot-state-thinking');
        } else if (state === 'excited') {
            widget.classList.add('mascot-state-excited');
            setTimeout(() => widget.classList.remove('mascot-state-excited'), 1200);
        }
    }

    const TOUR_PACKAGES = [
        {
            name: '1D Bohol Countryside Tour',
            category: 'Bohol • 1 Day',
            price: 5098,
            interests: ['sightseeing', 'nature', 'countryside', 'bohol', '1 day', 'day tour', 'tarsier', 'chocolate hills'],
            highlights: 'Chocolate Hills, Tarsier Sanctuary, Loboc River Cruise, Baclayon Church.',
            url: '../pages/package.html'
        },
        {
            name: '1D Cebu Oslob-Simala Tour',
            category: 'Cebu • 1 Day',
            price: 5998,
            interests: ['whale shark', 'oslob', 'simala', 'beach', 'marine', 'adventure', '1 day', 'day tour', 'cebu'],
            highlights: 'Oslob Whale Shark Encounter, Tumalog Falls, Simala Shrine.',
            url: '../pages/cebu-tours/oslob-tour.html'
        },
        {
            name: '1D Cebu Moalboal-Badian Tour',
            category: 'Cebu • 1 Day',
            price: 5998,
            interests: ['canyoneering', 'kawasan', 'moalboal', 'badian', 'sardines', 'turtles', 'adventure', 'waterfalls', 'beach', '1 day', 'cebu'],
            highlights: 'Kawasan Falls Canyoneering, Moalboal Sardine Run & Turtle Snorkeling.',
            url: '../pages/package.html'
        },
        {
            name: '4D3N Cebu - Bohol Tour',
            category: 'Cebu-Bohol • 4 Days / 3 Nights',
            price: 7598,
            interests: ['multi-day', 'cebu', 'bohol', 'beaches', 'waterfalls', 'sightseeing', 'island hopping', 'family'],
            highlights: 'Cebu City Tour, Oslob & Simala, Bohol Countryside & Panglao Island.',
            url: '../pages/package.html'
        },
        {
            name: '3D2N Cebu - Bohol Tour',
            category: 'Cebu-Bohol • 3 Days / 2 Nights',
            price: 7598,
            interests: ['multi-day', 'cebu', 'bohol', 'sightseeing', 'oslob', 'simala'],
            highlights: 'Cebu City Highlights, Oslob-Simala, and Bohol Countryside Tour.',
            url: '../pages/package.html'
        },
        {
            name: '2D1N Cebu - Bohol Tour',
            category: 'Cebu-Bohol • 2 Days / 1 Night',
            price: 7598,
            interests: ['weekend', 'short trip', 'cebu', 'bohol', 'city', 'sightseeing'],
            highlights: 'Cebu City Tour + Bohol Countryside Day Tour.',
            url: '../pages/package.html'
        },
        {
            name: '1D Cebu City Tour',
            category: 'Cebu • 1 Day',
            price: 10298,
            interests: ['city', 'heritage', 'temple of leah', 'sirao', 'magellan', 'sightseeing', '1 day', 'cebu'],
            highlights: 'Temple of Leah, Sirao Flower Garden, Taoist Temple, Magellan’s Cross.',
            url: '../pages/package.html'
        },
        {
            name: '5D4N Cebu - Bantayan Tour',
            category: 'Cebu • 5 Days / 4 Nights',
            price: 10398,
            interests: ['bantayan', 'beach', 'island hopping', 'white sand', 'relax', 'adventure', 'cebu'],
            highlights: 'City Tour, Moalboal-Badian, Oslob-Simala, Bantayan Land & Island Hopping.',
            url: '../pages/package.html'
        },
        {
            name: '2D1N City & Oslob Tour',
            category: 'Cebu • 2 Days / 1 Night',
            price: 10398,
            interests: ['oslob', 'whale shark', 'city', 'cebu', 'weekend'],
            highlights: 'Cebu City Heritage Sites + Oslob Whale Shark & Simala Shrine.',
            url: '../pages/cebu-tours/oslob-tour.html'
        }
    ];

    const peso = (num) => '₱' + num.toLocaleString('en-PH');

    function toggleChat(forceState) {
        const isOpen = typeof forceState === 'boolean' ? forceState : !chatWindow.classList.contains('open');
        chatWindow.classList.toggle('open', isOpen);
        chatWindow.setAttribute('aria-hidden', String(!isOpen));
        if (tooltip) tooltip.classList.toggle('hidden', isOpen);
        if (isOpen) {
            setTimeout(() => chatInput.focus(), 200);
        }
    }

    launcher.addEventListener('click', () => toggleChat());
    if (tooltip) tooltip.addEventListener('click', () => toggleChat(true));
    if (minimizeBtn) minimizeBtn.addEventListener('click', () => toggleChat(false));
    if (closeBtn) closeBtn.addEventListener('click', () => toggleChat(false));

    if (prevBtn && nextBtn && carouselTrack) {
        prevBtn.addEventListener('click', () => carouselTrack.scrollBy({ left: -175, behavior: 'smooth' }));
        nextBtn.addEventListener('click', () => carouselTrack.scrollBy({ left: 175, behavior: 'smooth' }));
    }

    quickButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.getAttribute('data-prompt');
            if (prompt) handleUserQuery(prompt);
        });
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const dynamicMessages = chatBody.querySelectorAll('.ur-ai-dynamic');
            dynamicMessages.forEach(el => el.remove());
        });
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        chatInput.value = '';
        handleUserQuery(text);
    });

    function appendMessage(htmlContent, sender = 'bot') {
        const msgDiv = document.createElement('div');
        msgDiv.className = `ur-ai-msg ${sender} ur-ai-dynamic`;

        if (sender === 'bot') {
            msgDiv.innerHTML = `
                <div class="ur-ai-msg-avatar"><i class="fa-solid fa-robot"></i></div>
                <div class="ur-ai-bubble">${htmlContent}</div>
            `;
        } else {
            const safeText = htmlContent.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            msgDiv.innerHTML = `<div class="ur-ai-bubble">${safeText}</div>`;
        }

        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        return msgDiv;
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ur-ai-msg bot ur-ai-dynamic ur-typing-row';
        typingDiv.innerHTML = `
            <div class="ur-ai-msg-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="ur-ai-bubble">
                <div class="ur-typing"><span></span><span></span><span></span></div>
            </div>
        `;
        chatBody.appendChild(typingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        return typingDiv;
    }

    function renderTourCards(tours) {
        if (!tours.length) return '';
        const items = tours.slice(0, 3).map(t => `
            <div class="ur-chat-tour-item">
                <strong>${t.name}</strong>
                <span>${t.category} • ${t.highlights}</span>
                <div class="ur-ct-bottom">
                    <b>From ${peso(t.price)} / pax</b>
                    <a href="${t.url}">View Details →</a>
                </div>
            </div>
        `).join('');
        return `<div class="ur-chat-tour-list">${items}</div>`;
    }

    function renderSupportButtons() {
        return `
            <div class="ur-support-links">
                <a href="https://m.me/uncleronstravelandtours" target="_blank" rel="noopener" class="msgr">
                    <i class="fa-brands fa-facebook-messenger"></i> Messenger
                </a>
                <a href="https://wa.me/639123456789" target="_blank" rel="noopener" class="wa">
                    <i class="fa-brands fa-whatsapp"></i> WhatsApp
                </a>
            </div>
        `;
    }

    function generateResponse(rawQuery) {
        const q = rawQuery.toLowerCase();

        if (/(confirm my booking|process my payment|pay here|charge my card|discount my price|change the price|book it for me now)/i.test(q)) {
            return `
                <span class="ur-ai-intent-tag inquiry">Customer Inquiry Assistance</span><br>
                As an AI assistant, I cannot directly process payments, alter package rates, or confirm reservations on your behalf.<br><br>
                To reserve securely, please open any package's <strong>View Details</strong> page to use our official booking form, or reach our staff for special assistance:
                ${renderSupportButtons()}
            `;
        }

        if (/(human|staff|agent|representative|problem|issue|concern|error|refund|cancel|reschedule|failed payment)/i.test(q)) {
            return `
                <span class="ur-ai-intent-tag inquiry">Customer Inquiry Assistance</span><br>
                I can connect you directly with Uncle Ron's support team so a staff member can assist with your concern or payment issue.<br><br>
                You may also reach us at <strong>+63 912 345 6789</strong> or <strong>info@uncleronstravelandtours.com</strong>, or message us directly here:
                ${renderSupportButtons()}
            `;
        }

        if (/(payment|pay|gcash|maya|paymongo|paypal|bank|instapay|deposit|downpayment|installment)/i.test(q)) {
            return `
                <span class="ur-ai-intent-tag inquiry">Customer Inquiry Assistance</span><br>
                Here are our approved payment options during checkout:<br>
                • <strong>E-Wallets:</strong> GCash & Maya (via PayMongo)<br>
                • <strong>Online & Cards:</strong> Credit/Debit Card & PayPal<br>
                • <strong>Bank Transfer:</strong> InstaPay / Online Banking<br><br>
                You can pay in full or choose a <strong>50% deposit</strong> to hold your slot, with the remaining balance settled on your tour date. Need help with a payment?
                ${renderSupportButtons()}
            `;
        }

        if (/(how do i book|how to book|booking|reserve|reservation|joiner|exclusive|senior|child|infant|lookup|find my booking)/i.test(q)) {
            return `
                <span class="ur-ai-intent-tag inquiry">Customer Inquiry Assistance</span><br>
                <strong>How to Book a Tour:</strong><br>
                1. Click <strong>Book Now</strong> or select <strong>View Details</strong> on your preferred package.<br>
                2. Pick your travel date, booking type (<strong>Exclusive</strong> up to 11 pax, or <strong>Joiners</strong> up to 8 pax), and guest breakdown (Adult, Foreign, Senior, Child).<br>
                3. Enter your contact details and complete payment to receive your <strong>Booking Reference</strong>.<br><br>
                Already booked? Click the <strong>magnifying glass icon</strong> in the top navigation bar to look up your reservation!
            `;
        }

        if (/(accredited|dot|legit|safe|license|where are you|location|office|contact|hours|faq)/i.test(q)) {
            return `
                <span class="ur-ai-intent-tag inquiry">Customer Inquiry Assistance</span><br>
                Uncle Ron's Travel & Tours is a <strong>DOT-accredited and insured</strong> travel agency based in <strong>Cebu City, Philippines</strong>.<br><br>
                • <strong>Phone:</strong> +63 912 345 6789<br>
                • <strong>Email:</strong> info@uncleronstravelandtours.com<br>
                • All packages include vetted local drivers/guides and transparent pricing with no hidden fees.
            `;
        }

        const budgetMatch = q.match(/(?:₱|php|p)?\s*(\d[\d,]*)\s*(k)?/i);
        if (budgetMatch && /(budget|under|below|around|for|₱|php|thousand|k\b|afford|cheap)/i.test(q)) {
            let amount = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
            if (budgetMatch[2]) amount *= 1000;

            if (amount > 0 && amount < 5098) {
                const lowest = TOUR_PACKAGES.slice(0, 3);
                return `
                    <span class="ur-ai-intent-tag guidance">Travel Guidance</span><br>
                    Our current approved packages start at <strong>₱5,098 / person</strong>, so we don't have a full tour package under <strong>${peso(amount)}</strong> right now.<br><br>
                    Here are our most budget-friendly day tours you can consider:
                    ${renderTourCards(lowest)}
                `;
            } else if (amount >= 5098) {
                const affordable = TOUR_PACKAGES.filter(t => t.price <= amount);
                return `
                    <span class="ur-ai-intent-tag guidance">Travel Guidance</span><br>
                    Within your budget of <strong>${peso(amount)} / person</strong>, here are the available packages I recommend:
                    ${renderTourCards(affordable)}
                `;
            }
        }

        const matchedTours = TOUR_PACKAGES.filter(tour =>
            tour.interests.some(tag => q.includes(tag)) ||
            q.includes(tour.name.toLowerCase())
        );

        if (matchedTours.length > 0) {
            return `
                <span class="ur-ai-intent-tag guidance">Travel Guidance</span><br>
                Based on your travel preferences, here are matching tour packages from Uncle Ron's catalog:
                ${renderTourCards(matchedTours)}
            `;
        }

        if (/(recommend|suggest|package|tour|popular|itinerary|travel|destination)/i.test(q)) {
            return `
                <span class="ur-ai-intent-tag guidance">Travel Guidance</span><br>
                I'd love to help you find the right trip! Tell me your <strong>budget per person</strong> (e.g., <em>"₱6,000"</em>) or what you enjoy (e.g., <em>beaches, whale sharks, waterfalls, Cebu, or Bohol</em>).<br><br>
                Meanwhile, here are our top-rated packages:
                ${renderTourCards(TOUR_PACKAGES.slice(0, 3))}
            `;
        }

        return `
            <span class="ur-ai-intent-tag guidance">Travel & Support Assistant</span><br>
            I can help you with two things:<br>
            1. <strong>Travel Guidance:</strong> Share your budget (e.g., <em>"Tours under ₱8,000"</em>) or interests (<em>Oslob, Bohol, beaches, waterfalls</em>).<br>
            2. <strong>Customer Assistance:</strong> Ask how to book, check payment options (GCash, Maya, Card), or connect with our team.
        `;
    }

    function handleUserQuery(text) {
        appendMessage(text, 'user');
        setMascotState('thinking');
        const typing = showTypingIndicator();

        setTimeout(() => {
            typing.remove();
            const replyHtml = generateResponse(text);
            appendMessage(replyHtml, 'bot');
            setMascotState('excited');
        }, 650);
    }
});