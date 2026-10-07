document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('reviewsGrid');
    if (!grid) return;

    const pills = document.querySelectorAll('.review-filters .pill');
    const cards = grid.querySelectorAll('.testimonial-card');

    pills.forEach((pill) => {
        pill.addEventListener('click', () => {
            pills.forEach((p) => p.classList.remove('active'));
            pill.classList.add('active');

            const want = pill.dataset.filter;
            cards.forEach((card) => {
                const show = want === 'all' || card.dataset.rating === want;
                card.hidden = !show;
            });
        });
    });
});