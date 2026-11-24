/* ================================================================
   RONNY — GUIDED CUSTOMER ASSISTANCE MOCKUP
   Front-end demonstration only. Connect Laravel/API endpoints for
   live package, payment and availability data in the real system.
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const widget = document.getElementById('urAiWidget');
    if (!widget) return;

    const launcher = document.getElementById('urAiLauncher');
    const tooltip = document.getElementById('urAiTooltip');
    const chatWindow = document.getElementById('urAiWindow');
    const minimizeBtn = document.getElementById('urAiMinimizeBtn');
    const closeBtn = document.getElementById('urAiCloseBtn');
    const chatBody = document.getElementById('urAiBody');
    const chatForm = document.getElementById('urAiForm');
    const chatInput = document.getElementById('urAiInput');
    const quickGrid = document.getElementById('urAiQuickGrid');
    const carouselSection = document.getElementById('urAiCarouselSection');
    const topicToolbar = document.getElementById('urAiTopicToolbar');
    const browseTopicsBtn = document.getElementById('urAiBrowseTopics');
    const carouselTrack = document.getElementById('urAiCarouselTrack');
    const prevBtn = document.getElementById('urCarouselPrev');
    const nextBtn = document.getElementById('urCarouselNext');

    const state = {
        activeFlow: null,
        answers: {},
        selectedTours: [],
        awaitingFreeText: null
    };

    // These package entries mirror the sample package information in the supplied mockup.
    // Replace with Laravel-provided package data when backend integration is implemented.
    const TOUR_PACKAGES = [
        {
            name: '1D Bohol Countryside Tour',
            category: 'Bohol • 1 Day',
            price: 5098,
            highlights: 'Chocolate Hills, Tarsier Sanctuary, Loboc River Cruise',
            interests: ['sightseeing', 'nature', 'countryside', 'bohol', 'tarsier', 'chocolate hills'],
            url: '../pages/package.html'
        },
        {
            name: '1D Cebu Oslob-Simala Tour',
            category: 'Cebu • 1 Day',
            price: 5998,
            highlights: 'Oslob Whale Shark Encounter, Tumalog Falls, Simala Shrine',
            interests: ['whale shark', 'oslob', 'simala', 'beach', 'marine', 'adventure', 'cebu'],
            url: '../pages/cebu-tours/oslob-tour.html'
        },
        {
            name: '1D Cebu Moalboal-Badian Tour',
            category: 'Cebu • 1 Day',
            price: 5998,
            highlights: 'Kawasan Falls, Moalboal Sardine Run and Turtle Snorkeling',
            interests: ['canyoneering', 'kawasan', 'moalboal', 'badian', 'sardines', 'turtles', 'adventure', 'waterfalls', 'beach'],
            url: '../pages/package.html'
        },
        {
            name: '4D3N Cebu - Bohol Tour',
            category: 'Cebu-Bohol • 4 Days / 3 Nights',
            price: 7598,
            highlights: 'Cebu City, Oslob, Simala, Bohol Countryside and Panglao',
            interests: ['multi-day', 'cebu', 'bohol', 'beaches', 'waterfalls', 'sightseeing', 'island hopping', 'family'],
            url: '../pages/package.html'
        },
        {
            name: '3D2N Cebu - Bohol Tour',
            category: 'Cebu-Bohol • 3 Days / 2 Nights',
            price: 7598,
            highlights: 'Cebu City Highlights, Oslob-Simala and Bohol Countryside',
            interests: ['multi-day', 'cebu', 'bohol', 'sightseeing', 'oslob', 'simala'],
            url: '../pages/package.html'
        },
        {
            name: '2D1N Cebu - Bohol Tour',
            category: 'Cebu-Bohol • 2 Days / 1 Night',
            price: 7598,
            highlights: 'Cebu City Tour and Bohol Countryside Day Tour',
            interests: ['weekend', 'short trip', 'cebu', 'bohol', 'city', 'sightseeing'],
            url: '../pages/package.html'
        },
        {
            name: '1D Cebu City Tour',
            category: 'Cebu • 1 Day',
            price: 10298,
            highlights: 'Temple of Leah, Sirao Flower Garden, Taoist Temple and Magellan’s Cross',
            interests: ['city', 'heritage', 'temple of leah', 'sirao', 'magellan', 'sightseeing'],
            url: '../pages/package.html'
        },
        {
            name: '5D4N Cebu - Bantayan Tour',
            category: 'Cebu • 5 Days / 4 Nights',
            price: 10398,
            highlights: 'Cebu City, Moalboal-Badian, Oslob-Simala and Bantayan',
            interests: ['bantayan', 'beach', 'island hopping', 'white sand', 'relax', 'adventure', 'cebu'],
            url: '../pages/package.html'
        },
        {
            name: '2D1N City & Oslob Tour',
            category: 'Cebu • 2 Days / 1 Night',
            price: 10398,
            highlights: 'Cebu City Heritage Sites, Oslob and Simala Shrine',
            interests: ['oslob', 'whale shark', 'city', 'cebu', 'weekend'],
            url: '../pages/cebu-tours/oslob-tour.html'
        }
    ];

    const peso = value => '₱' + Number(value).toLocaleString('en-PH');

    function setMascotState(mode) {
        widget.classList.remove('mascot-state-thinking', 'mascot-state-excited');
        if (mode === 'thinking') widget.classList.add('mascot-state-thinking');
        if (mode === 'excited') {
            widget.classList.add('mascot-state-excited');
            window.setTimeout(() => widget.classList.remove('mascot-state-excited'), 1200);
        }
    }

    function toggleChat(forceState) {
        const open = typeof forceState === 'boolean'
            ? forceState
            : !chatWindow.classList.contains('open');

        chatWindow.classList.toggle('open', open);
        chatWindow.setAttribute('aria-hidden', String(!open));
        if (tooltip) tooltip.classList.toggle('hidden', open);
        if (open) window.setTimeout(() => chatInput.focus(), 180);
    }

    launcher?.addEventListener('click', () => toggleChat());
    tooltip?.addEventListener('click', () => toggleChat(true));
    minimizeBtn?.addEventListener('click', () => toggleChat(false));
    closeBtn?.addEventListener('click', () => toggleChat(false));

    prevBtn?.addEventListener('click', () => {
        carouselTrack?.scrollBy({ left: -170, behavior: 'smooth' });
    });
    nextBtn?.addEventListener('click', () => {
        carouselTrack?.scrollBy({ left: 170, behavior: 'smooth' });
    });

    function scrollToBottom() {
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function appendMessage(content, sender = 'bot') {
        const row = document.createElement('div');
        row.className = `ur-ai-msg ${sender} ur-ai-dynamic`;

        if (sender === 'bot') {
            row.innerHTML = `
                <div class="ur-ai-msg-avatar"><i class="fa-solid fa-robot"></i></div>
                <div class="ur-ai-bubble">${content}</div>
            `;
        } else {
            const bubble = document.createElement('div');
            bubble.className = 'ur-ai-bubble';
            bubble.textContent = content;
            row.appendChild(bubble);
        }

        chatBody.appendChild(row);
        scrollToBottom();
        return row;
    }

    function appendChoices(options, onChoose, config = {}) {
        const wrap = document.createElement('div');
        wrap.className = 'ur-ai-choice-list ur-ai-dynamic';

        options.forEach(option => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'ur-ai-choice' + (config.primary === option ? ' primary' : '');
            button.textContent = option;
            button.addEventListener('click', () => {
                wrap.querySelectorAll('button').forEach(btn => btn.disabled = true);
                wrap.classList.add('answered');
                onChoose(option);
            });
            wrap.appendChild(button);
        });

        chatBody.appendChild(wrap);
        scrollToBottom();
        return wrap;
    }

    function appendInlineField(placeholder, onSubmit, inputType = 'text') {
        const wrap = document.createElement('form');
        wrap.className = 'ur-ai-inline-field ur-ai-dynamic';
        const input = document.createElement('input');
        input.type = inputType;
        input.placeholder = placeholder;
        if (inputType === 'date') {
            const today = new Date();
            const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 10);
            input.min = localDate;
        }
        input.required = true;

        const button = document.createElement('button');
        button.type = 'submit';
        button.textContent = 'Continue';
        wrap.append(input, button);
        wrap.addEventListener('submit', event => {
            event.preventDefault();
            const value = input.value.trim();
            if (!value) return;
            input.disabled = true;
            button.disabled = true;
            onSubmit(value);
        });
        chatBody.appendChild(wrap);
        scrollToBottom();
        input.focus();
    }

    function showQuestion(question, options, callback) {
        appendMessage(question);
        appendChoices(options, callback);
    }

    function showTopicControls() {
        if (quickGrid) quickGrid.hidden = true;
        if (carouselSection) carouselSection.hidden = true;
        if (topicToolbar) topicToolbar.hidden = false;
    }

    function restoreWelcomeTopics() {
        if (quickGrid) quickGrid.hidden = false;
        if (carouselSection) carouselSection.hidden = false;
        if (topicToolbar) topicToolbar.hidden = true;
        state.activeFlow = null;
        state.answers = {};
        state.selectedTours = [];
        state.awaitingFreeText = null;
        scrollToBottom();
    }

    browseTopicsBtn?.addEventListener('click', restoreWelcomeTopics);

    function beginFlow(flow) {
        state.activeFlow = flow;
        state.answers = {};
        state.selectedTours = [];
        state.awaitingFreeText = null;
        showTopicControls();

        const names = {
            'find-tour': 'Find a Tour',
            'compare-tours': 'Compare Tours',
            'check-availability': 'Check Availability',
            'my-booking': 'My Booking',
            'payment-help': 'Payment Help',
            'other-questions': 'Other Questions'
        };
        appendMessage(`<span class="ur-ai-intent-tag guidance">${names[flow]}</span><br>Let's get started! You can choose one of the suggested answers or type your own message anytime.`);
        runFlowStep(flow);
    }

    function runFlowStep(flow) {
        if (flow === 'find-tour') return findTourStep();
        if (flow === 'compare-tours') return compareToursStep();
        if (flow === 'check-availability') return availabilityStep();
        if (flow === 'payment-help') return paymentStep();
        if (flow === 'my-booking') return myBookingStep();
        if (flow === 'other-questions') return otherQuestionsStep();
    }

    // FIND A TOUR — one compact question at a time.
    function findTourStep() {
        const a = state.answers;

        if (!a.destination) {
            showQuestion('Do you already have a destination in mind?', [
                'Cebu', 'Bohol', 'Cebu and Bohol', 'I’m open to suggestions', 'Explore all tours'
            ], value => {
                appendMessage(value, 'user');
                a.destination = value;
                findTourStep();
            });
            return;
        }

        if (!a.budget) {
            showQuestion('What is your estimated budget per person?', [
                'Below ₱5,000', '₱5,000–₱7,000', '₱7,001–₱10,000',
                'Above ₱10,000', 'No fixed budget'
            ], value => {
                appendMessage(value, 'user');
                a.budget = value;
                findTourStep();
            });
            return;
        }

        if (!a.guests) {
            showQuestion('How many guests will be joining?', [
                '1 guest', '2–4 guests', '5–8 guests', '9 or more'
            ], value => {
                appendMessage(value, 'user');
                a.guests = value;
                findTourStep();
            });
            return;
        }

        if (!a.interest) {
            showQuestion('What kind of experience are you interested in? (Optional)', [
                'Adventure', 'Nature and sightseeing', 'Beach and island activities',
                'Cultural experiences', 'No preference'
            ], value => {
                appendMessage(value, 'user');
                a.interest = value;
                showTourRecommendations();
            });
            return;
        }
    }

    function showTourRecommendations() {
        const a = state.answers;
        let matches = TOUR_PACKAGES.filter(tour => {
            const destinationMatch =
                a.destination === 'Explore all tours' ||
                a.destination === 'I’m open to suggestions' ||
                (a.destination === 'Cebu' && /Cebu/.test(tour.category)) ||
                (a.destination === 'Bohol' && /Bohol/.test(tour.category)) ||
                (a.destination === 'Cebu and Bohol' && /Cebu-Bohol/.test(tour.category));
            const budgetLimit = a.budget === 'Below ₱5,000' ? 4999
                : a.budget === '₱5,000–₱7,000' ? 7000
                : a.budget === '₱7,001–₱10,000' ? 10000
                : a.budget === 'Above ₱10,000' ? Infinity : Infinity;
            return destinationMatch && tour.price <= budgetLimit;
        });

        if (a.interest && a.interest !== 'No preference') {
            const key = a.interest.toLowerCase();
            const tags = key.includes('adventure') ? ['adventure', 'canyoneering', 'whale shark']
                : key.includes('nature') ? ['nature', 'sightseeing', 'countryside']
                : key.includes('beach') ? ['beach', 'island hopping', 'marine']
                : ['heritage', 'city', 'cultural'];
            const preferred = matches.filter(t => t.interests.some(tag => tags.includes(tag)));
            if (preferred.length) matches = preferred;
        }

        if (!matches.length) {
            matches = TOUR_PACKAGES.filter(t => t.price <= (a.budget === 'Below ₱5,000' ? 4999 : Infinity));
        }

        const cards = matches.slice(0, 3).map(t => `
            <div class="ur-chat-tour-item">
                <strong>${t.name}</strong>
                <span>${t.category} · ${t.highlights}</span>
                <div class="ur-ct-bottom">
                    <b>From ${peso(t.price)} / person</b>
                    <a href="${t.url}">View Details →</a>
                </div>
            </div>
        `).join('');

        appendMessage(`
            Based on your selections, here are some packages to explore:
            ${cards ? `<div class="ur-chat-tour-list">${cards}</div>` : 'Please explore the full package list for more options.'}
            <div class="ur-ai-result-note"><strong>Note:</strong> These are recommendations based on the sample package data. Availability is checked separately when you select a tour date.</div>
        `);
        appendChoices(['Compare these tours', 'Check availability', 'Ask another question'], choice => {
            appendMessage(choice, 'user');
            if (choice === 'Compare these tours') beginFlow('compare-tours');
            else if (choice === 'Check availability') beginFlow('check-availability');
            else appendMessage('Sure! Type your question in the message box and I’ll help where I can.');
        });
    }

    // COMPARE TOURS — compact package selection, then comparison criteria.
    function compareToursStep() {
        const names = TOUR_PACKAGES.map(t => t.name);
        if (!state.selectedTours.length) {
            appendMessage('Which tour packages would you like to compare? Choose the first package.');
            appendChoices(names, value => {
                appendMessage(value, 'user');
                state.selectedTours.push(value);
                appendMessage('Great. Choose the second package.');
                appendChoices(names.filter(n => n !== value), second => {
                    appendMessage(second, 'user');
                    state.selectedTours.push(second);
                    appendMessage('What would you like to compare?');
                    appendChoices(['Price', 'Duration', 'Destinations and activities', 'Everything'], criterion => {
                        appendMessage(criterion, 'user');
                        showComparison(criterion);
                    });
                });
            });
        }
    }

    function showComparison(criterion) {
        const selected = state.selectedTours.map(name => TOUR_PACKAGES.find(t => t.name === name)).filter(Boolean);
        const rows = selected.map(t => `
            <tr><th>${t.name}</th><td>${peso(t.price)} / person</td><td>${t.category}</td><td>${t.highlights}</td></tr>
        `).join('');
        appendMessage(`
            Here's a side-by-side overview using the sample package information:
            <div style="overflow-x:auto">
                <table class="ur-ai-comparison">
                    <thead><tr><th>Tour</th><th>Price</th><th>Duration</th><th>Highlights</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <div class="ur-ai-result-note">You selected: <strong>${criterion}</strong>. Package information should be loaded from the approved tour records in the live system.</div>
        `);
        appendChoices(['Compare other tours', 'Find a tour', 'Ask another question'], choice => {
            appendMessage(choice, 'user');
            if (choice === 'Compare other tours') {
                state.selectedTours = [];
                compareToursStep();
            } else if (choice === 'Find a tour') beginFlow('find-tour');
            else appendMessage('Go ahead and type your question below.');
        });
    }

    // AVAILABILITY — collects the required inputs, but does not fabricate live availability.
    function availabilityStep() {
        if (!state.answers.package) {
            showQuestion('Which tour package are you interested in?', TOUR_PACKAGES.slice(0, 6).map(t => t.name), value => {
                appendMessage(value, 'user');
                state.answers.package = value;
                availabilityStep();
            });
            return;
        }
        if (!state.answers.date) {
            appendMessage('What is your preferred tour date?');
            appendInlineField('Select your preferred date', value => {
                appendMessage(value, 'user');
                state.answers.date = value;
                availabilityStep();
            }, 'date');
            return;
        }
        if (!state.answers.guests) {
            showQuestion('How many guests will be joining?', ['1 guest', '2–4 guests', '5–8 guests', '9 or more'], value => {
                appendMessage(value, 'user');
                state.answers.guests = value;
                appendMessage(`
                    Thanks! Here's what you selected:
                    <div class="ur-ai-result-note">
                        <strong>Tour:</strong> ${state.answers.package}<br>
                        <strong>Date:</strong> ${state.answers.date}<br>
                        <strong>Guests:</strong> ${state.answers.guests}
                    </div>
                    To show a reliable availability result, the live system checks the current booking capacity in the database. This mockup does not connect to live availability yet.
                    <a class="ur-ai-action-link" href="../pages/package.html">Continue to Tour Packages <i class="fa-solid fa-arrow-right"></i></a>
                `);
            });
        }
    }

    // PAYMENT HELP — predefined entry points, then context-appropriate guidance.
    function paymentStep() {
        if (!state.answers.paymentTopic) {
            showQuestion('What do you need help with?', [
                'GCash payment', 'PayPal payment', 'Payment status', 'Payment problem'
            ], value => {
                appendMessage(value, 'user');
                state.answers.paymentTopic = value;
                paymentStep();
            });
            return;
        }

        const topic = state.answers.paymentTopic;
        if (topic === 'GCash payment' || topic === 'PayPal payment') {
            appendMessage(`
                I can guide you through the payment process. Select the situation that best describes your concern:
            `);
            appendChoices(['I’m making a new booking', 'I already made a payment'], value => {
                appendMessage(value, 'user');
                if (value === 'I’m making a new booking') {
                    appendMessage(`Choose your tour package and continue through its official booking page. The available payment methods will be presented during checkout. I can't process a payment directly inside this chat.`);
                } else {
                    appendMessage(`For an existing transaction, please check the payment information shown in your booking. If the payment status does not look correct, our staff can help verify it.`);
                    showSupportOptions();
                }
            });
        } else if (topic === 'Payment status') {
            appendMessage(`For privacy and payment accuracy, please use the booking page or contact our staff to verify an existing transaction. Ronny does not independently approve or change payment statuses.`);
            showSupportOptions();
        } else {
            appendMessage(`I'm sorry you're experiencing a payment problem. Please contact our staff so they can review the transaction. Don't share passwords, one-time codes, or full payment-card details in this chat.`);
            showSupportOptions();
        }
    }

    // MY BOOKING — shortcut to the existing lookup feature; no duplicate OTP flow.
    function myBookingStep() {
        appendMessage(`
            You can view your booking details through our existing <strong>Find My Booking</strong> feature.
            <br><br>You'll need your booking reference number and the email address used for the booking.
            <br><button type="button" class="ur-ai-action-link" id="urAiOpenFindBooking">Open Find My Booking <i class="fa-solid fa-arrow-right"></i></button>
        `);
        const button = document.getElementById('urAiOpenFindBooking');
        button?.addEventListener('click', () => {
            if (window.urAuth && typeof window.urAuth.openFind === 'function') {
                window.urAuth.openFind();
            } else {
                appendMessage('The Find My Booking feature could not be opened from this preview. Please use the booking search icon in the website navigation.');
            }
        });
    }

    // OTHER QUESTIONS — suggested prompts plus free-text input always available.
    function otherQuestionsStep() {
        showQuestion('What would you like to know about Uncle Ron’s Travel and Tours?', [
            'Tour inclusions', 'Promotions', 'Meeting points and schedules',
            'What should I bring?', 'Booking policies'
        ], value => {
            appendMessage(value, 'user');
            answerGeneralQuestion(value);
        });
    }

    function showSupportOptions() {
        appendMessage(`
            <div class="ur-ai-result-note"><strong>Need staff assistance?</strong><br>You can contact the team through the available support channels.</div>
            <div class="ur-support-links">
                <a href="https://m.me/uncleronstravelandtours" target="_blank" rel="noopener" class="msgr"><i class="fa-brands fa-facebook-messenger"></i> Messenger</a>
                <a href="https://wa.me/639123456789" target="_blank" rel="noopener" class="wa"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
            </div>
            <a class="ur-ai-action-link" href="tel:+639123456789"><i class="fa-solid fa-phone"></i> Call +63 912 345 6789</a>
        `);
    }

    // Static AI-style response layer for presentation purposes.
    // These replies are authored examples, not live AI/API responses.
    function showThinkingThen(replyFn) {
        const indicator = document.createElement('div');
        indicator.className = 'ur-ai-thinking ur-ai-dynamic';
        indicator.innerHTML = '<span></span><span></span><span></span><small>Ronny is thinking...</small>';
        chatBody.appendChild(indicator);
        scrollToBottom();
        window.setTimeout(() => {
            indicator.remove();
            replyFn();
        }, 650);
    }

    function addNextStepChoices(options) {
        appendChoices(options, value => {
            appendMessage(value, 'user');
            const q = value.toLowerCase();
            if (/contact|staff|human|team/.test(q)) {
                appendMessage('Of course. This is something our team can help you with directly. Here are the available ways to reach them:');
                showSupportOptions();
            } else if (/booking|find my booking|view details/.test(q)) {
                myBookingStep();
            } else if (/availability|date|check slots/.test(q)) {
                beginFlow('check-availability');
            } else if (/compare/.test(q)) {
                beginFlow('compare-tours');
            } else if (/tour|recommend|package/.test(q)) {
                beginFlow('find-tour');
            } else {
                appendMessage('Sure! Tell me a little more about what you need, and I’ll guide you from there.');
            }
        });
    }

    function answerGeneralQuestion(query) {
        const q = query.toLowerCase();
        let reply = '';

        if (/promotion|promo|discount/.test(q)) {
            reply = 'Good question! Promotions can change, so I don’t want to give you outdated information. You can check the Promos section of our website for the offers currently published. If you have a particular promo in mind, tell me its name and I can help explain what to look for.';
        } else if (/inclusion|included|package include/.test(q)) {
            const tour = TOUR_PACKAGES.find(t => q.includes(t.name.toLowerCase()) || t.interests.some(tag => q.includes(tag)));
            reply = tour
                ? `For the ${tour.name}, the listed highlights include ${tour.highlights}. Inclusions can vary by package, so please open the package details to review the confirmed inclusions and exclusions before booking.`
                : 'Each tour has its own inclusions and exclusions. Which package are you considering? I can help you find the relevant package details.';
        } else if (/meeting|schedule|pickup|pick-up|what time|departure/.test(q)) {
            reply = 'Meeting points and departure schedules can depend on the tour package and date. I don’t want to guess and give you the wrong location or time. Which tour are you planning to join?';
        } else if (/bring|pack|what should.*(bring|pack)|wear/.test(q)) {
            reply = 'That depends on the activities included in your chosen tour. In general, it’s a good idea to review the package information and prepare suitable clothing and personal essentials for the destination. Which tour are you interested in? I can help narrow down the information.';
        } else if (/policy|terms|condition|child|senior|pwd|infant/.test(q)) {
            reply = 'Booking conditions and eligibility details should follow the business’s published Terms and Conditions. I can help explain a specific policy, but I don’t want to assume a rule that may not apply to your package. Which policy would you like clarified?';
        } else if (/family|kid|children/.test(q)) {
            reply = 'I can help you look for a package that may suit your group. The best option depends on the destination, activities, and ages of the guests. Are you looking for a relaxed sightseeing trip or something more adventurous?';
        } else if (/hello|hi\b|hey\b|good morning|good afternoon|good evening/.test(q)) {
            reply = 'Hi there! 😊 Welcome to Uncle Ron’s Travel and Tours. I can help you explore tour packages, compare options, check availability guidance, understand payment steps, or answer questions about your trip. What are you planning?';
        } else if (/thank/.test(q)) {
            reply = 'You’re very welcome! 😊 If another question comes up while planning your trip, just send it here and I’ll do my best to guide you.';
        } else {
            reply = 'I can help with tour recommendations, package information, comparisons, availability inquiries, booking guidance, and payment questions for Uncle Ron’s Travel and Tours. Could you tell me a little more about what you’re trying to find out?';
        }

        showThinkingThen(() => {
            appendMessage(reply);
            addNextStepChoices(['Find a tour', 'Check availability', 'Contact staff']);
        });
    }

    function answerFreeTextPayment(query) {
        const q = query.toLowerCase();
        let reply;

        if (/pending|not updated|hasn't updated|has not updated|still processing|already paid|paid already/.test(q)) {
            reply = 'I understand why that would be concerning, especially if you have already completed the payment. A booking can remain pending while the payment result is still being processed or verified. I can’t confirm the status of your individual transaction from this chat, so I don’t want to tell you it has been received without checking. Please open Find My Booking to review the latest booking details. If the status still looks incorrect, our staff can verify the transaction for you.';
        } else if (/failed|declined|error|unsuccessful|not go through/.test(q)) {
            reply = 'Sorry the payment didn’t go through. Before trying again, check whether your payment app or account shows a completed transaction so you don’t accidentally pay twice. If money was deducted or the result is unclear, please contact our staff to verify it before making another attempt.';
        } else if (/refund|chargeback|double charged|charged twice/.test(q)) {
            reply = 'I understand this needs attention. Refunds and payment disputes require the team to review the transaction and the booking details. I can’t approve or process a refund here, but I can direct you to customer support so they can assist.';
        } else if (/gcash/.test(q)) {
            reply = 'For GCash, follow the payment instructions shown during the booking process and make sure the transaction is completed in your GCash app. If you have already paid but your booking has not updated, our staff will need to verify the transaction. Please don’t share your MPIN or one-time password in this chat.';
        } else if (/paypal/.test(q)) {
            reply = 'For PayPal, complete the payment through the official checkout flow and wait for the payment result before closing the process. If you were charged but the booking still appears pending, please use Find My Booking and contact our team for transaction verification. Never share your PayPal password here.';
        } else {
            reply = 'I can help explain the payment process, but checking an individual transaction requires verification by the booking system or staff. Are you asking about a payment that is still pending, a failed payment, or a payment method?';
        }

        showThinkingThen(() => {
            appendMessage(reply);
            addNextStepChoices(['Open Find My Booking', 'Contact staff', 'Ask another question']);
        });
    }

    function answerFreeTextTour(query) {
        const q = query.toLowerCase();
        const matches = TOUR_PACKAGES.filter(t =>
            q.includes(t.name.toLowerCase()) || t.interests.some(tag => q.includes(tag))
        );
        let reply;

        if (/cheap|cheaper|afford|budget|under|below/.test(q)) {
            const amountMatch = q.match(/(?:₱|php\s*)(\d[\d,]*)/i);
            const budget = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : null;
            const options = TOUR_PACKAGES.filter(t => budget ? t.price <= budget : true).sort((a,b) => a.price-b.price).slice(0,3);
            const cards = options.map(t => `<div class="ur-chat-tour-item"><strong>${t.name}</strong><span>${t.category} · ${t.highlights}</span><div class="ur-ct-bottom"><b>From ${peso(t.price)} / person</b><a href="${t.url}">View Details →</a></div></div>`).join('');
            reply = `I can help you look for an option that better fits your budget. ${budget ? `For a budget of around ${peso(budget)} per person, ` : 'Here are some of the lower-priced sample packages, ' }these are worth exploring:<div class="ur-chat-tour-list">${cards}</div><div class="ur-ai-result-note">These are sample package prices in this mockup. Please confirm the current rate on the package page.</div>`;
        } else if (matches.length) {
            const cards = matches.slice(0,3).map(t => `<div class="ur-chat-tour-item"><strong>${t.name}</strong><span>${t.category} · ${t.highlights}</span><div class="ur-ct-bottom"><b>From ${peso(t.price)} / person</b><a href="${t.url}">View Details →</a></div></div>`).join('');
            reply = `Based on what you mentioned, these packages may be relevant:<div class="ur-chat-tour-list">${cards}</div><div class="ur-ai-result-note">I matched these using the sample tour information. If you tell me your budget and group size, I can help narrow the options further.</div>`;
        } else {
            reply = 'I can help you find a suitable tour. Do you have a destination in mind, or would you prefer recommendations based on your budget and the kind of activities you enjoy?';
        }

        showThinkingThen(() => {
            appendMessage(reply);
            addNextStepChoices(['Compare tours', 'Check availability', 'Ask another question']);
        });
    }

    // Free-text messages are interpreted first, even when no card was selected.
    // The mockup uses local intent rules and authored replies to demonstrate the intended AI experience.
    function handleFreeText(text) {
        appendMessage(text, 'user');
        const q = text.toLowerCase();

        if (/\b(refund|chargeback|complaint|cancel my booking|cancellation|reschedule|change my booking|special arrangement|speak to (a )?(person|staff)|human|agent)\b/.test(q)) {
            showThinkingThen(() => {
                appendMessage('I understand. This request needs someone from our team to review the booking or situation directly. I can’t make changes or approve requests from this chat, but I can show you how to contact the team.');
                showSupportOptions();
            });
            return;
        }

        if (/\b(pending|payment|paid|gcash|paypal|transaction|deducted|charged|failed payment|payment status)\b/.test(q)) {
            state.activeFlow = 'payment-help';
            showTopicControls();
            appendMessage('<span class="ur-ai-intent-tag guidance">PAYMENT HELP</span>');
            answerFreeTextPayment(text);
            return;
        }

        if (/\b(booking reference|find my booking|my reservation|booking details|view my booking|booking status)\b/.test(q)) {
            state.activeFlow = 'my-booking';
            showTopicControls();
            showThinkingThen(() => myBookingStep());
            return;
        }

        if (/\b(available|availability|fully booked|open slots|available date|what dates)\b/.test(q)) {
            state.activeFlow = 'check-availability';
            showTopicControls();
            showThinkingThen(() => {
                appendMessage('I can help check that. Availability depends on the selected package, tour date, and number of guests. Which tour are you interested in?');
                availabilityStep();
            });
            return;
        }

        if (/\b(compare|difference|versus|vs\.)\b/.test(q)) {
            state.activeFlow = 'compare-tours';
            showTopicControls();
            showThinkingThen(() => {
                appendMessage('Sure! Comparing the packages side by side can make the choice easier. Which two tours would you like to compare?');
                compareToursStep();
            });
            return;
        }

        if (/\b(tour|recommend|recommendation|budget|cheap|cheaper|afford|beach|oslob|bohol|moalboal|bantayan|cebu city|island)\b/.test(q)) {
            state.activeFlow = 'find-tour';
            showTopicControls();
            appendMessage('<span class="ur-ai-intent-tag guidance">TOUR RECOMMENDATIONS</span>');
            answerFreeTextTour(text);
            return;
        }

        state.activeFlow = 'other-questions';
        showTopicControls();
        appendMessage('<span class="ur-ai-intent-tag guidance">GENERAL ASSISTANCE</span>');
        answerGeneralQuestion(text);
    }

    // Card event listeners.
    quickGrid?.querySelectorAll('[data-card]').forEach(button => {
        button.addEventListener('click', () => beginFlow(button.dataset.card));
    });

    // Existing popular suggestion cards remain visible on the welcome screen.
    // Clicking one sends the user to the package details page as before.

    chatForm?.addEventListener('submit', event => {
        event.preventDefault();
        const value = chatInput.value.trim();
        if (!value) return;
        chatInput.value = '';
        handleFreeText(value);
    });
});
