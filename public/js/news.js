const allNews = Array.from(document.querySelectorAll('.news-card')).map(card => ({
    html: card.outerHTML,
    title: card.dataset.title,
    time: card.dataset.time
}));

const container = document.getElementById('news-container');
const filterInput = document.getElementById('filter-title');
const sortSelect = document.getElementById('sort-order');
const resetButton = document.getElementById('reset');

function renderNews(newsArray) {
    container.innerHTML = newsArray.map(item => item.html).join('');
}

function filterAndSort() {
    const query = filterInput.value.trim().toLowerCase();
    const sortOrder = sortSelect.value;

    let filtered = allNews.filter(n => n.title.includes(query));

    filtered.sort((a, b) => {
        const dateA = new Date(a.time);
        const dateB = new Date(b.time);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    renderNews(filtered);
}

filterInput.addEventListener('input', filterAndSort);
sortSelect.addEventListener('change', filterAndSort);
resetButton.addEventListener('click', () => {
    filterInput.value = '';
    sortSelect.value = 'desc';
    renderNews(allNews);
});