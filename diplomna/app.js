// NewsFlow App - News Viewer with Bookmarks
// API: https://newsapi.org/

class NewsApp {
    constructor() {
        this.articles = [];
        this.bookmarks = [];
        this.currentView = 'news'; // 'news' or 'bookmarks'
        this.isLoading = false;
        this.searchTerm = '';
        this.sortBy = 'publishedAt';
        this.language = 'en';
        
        this.init();
    }

    init() {
        this.loadBookmarks();
        this.render();
        this.attachEventListeners();
        this.loadNews();
    }

    // Event Listeners
    attachEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-btn')) {
                const view = e.target.dataset.view;
                this.switchView(view);
            }
        });

        // Search
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('debounce', () => this.handleSearch());
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.debounceSearch();
            });
        }

        // Filters
        const sortSelect = document.querySelector('.sort-select');
        const langSelect = document.querySelector('.lang-select');
        const categorySelect = document.querySelector('.category-select');

        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.filterAndSort();
            });
        }

        if (langSelect) {
            langSelect.addEventListener('change', (e) => {
                this.language = e.target.value;
                this.loadNews();
            });
        }

        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                const category = e.target.value;
                this.loadNews(category);
            });
        }

        // Refresh button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('refresh-btn')) {
                this.loadNews();
            }
        });

        // Bookmark buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('bookmark-btn')) {
                const articleUrl = e.target.dataset.url;
                this.toggleBookmark(articleUrl);
            }
        });

        // Remove bookmark
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('bookmark-remove-btn')) {
                const articleUrl = e.target.dataset.url;
                this.removeBookmark(articleUrl);
            }
        });

        // Bookmark item click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.bookmark-item-content')) {
                const url = e.target.closest('.bookmark-item').dataset.url;
                window.open(url, '_blank');
            }
        });
    }

    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.handleSearch();
        }, 500);
    }

    handleSearch() {
        this.filterAndSort();
    }

    // Load news from API or use mock data
    async loadNews(category = 'general') {
        this.isLoading = true;
        this.render();

        try {
            const mockArticles = this.getMockArticles();
            this.articles = mockArticles;
            
            if (this.searchTerm) {
                this.articles = this.articles.filter(article =>
                    article.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                    article.description.toLowerCase().includes(this.searchTerm.toLowerCase())
                );
            }

            this.filterAndSort();
        } catch (error) {
            console.error('Error loading news:', error);
            this.articles = this.getMockArticles();
        } finally {
            this.isLoading = false;
            this.render();
        }
    }

    // Mock news data (since we don't have API key)
    getMockArticles() {
        return [
            {
                id: 1,
                title: 'Революційні технології в сфері штучного інтелекту змінюють світ',
                description: 'Нові досягнення в machine learning дозволяють розробити системи, які можуть розв\'язувати складні завдання швидше ніж коли-небудь.',
                image: 'https://images.unsplash.com/photo-1677442d019cecf92818b9839fdf91d1f8a84c12?w=500&h=250&fit=crop',
                source: 'TechNews Daily',
                url: 'https://example.com/ai-revolution',
                publishedAt: '2024-04-20T10:00:00Z',
                category: 'technology'
            },
            {
                id: 2,
                title: 'Глобальна конференція розробників розпочалася з амбітних презентацій',
                description: 'Більше 50,000 розробників збралися для обговорення найновіших трендів в IT індустрії та майбутніх можливостях.',
                image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=250&fit=crop',
                source: 'Dev Conference',
                url: 'https://example.com/dev-conf',
                publishedAt: '2024-04-20T09:30:00Z',
                category: 'events'
            },
            {
                id: 3,
                title: 'Новий стандарт веб-розробки обіцяє покращити продуктивність',
                description: 'Консорціум W3C презентував оновлення до веб-стандартів, які мають значно прискорити завантаження сайтів.',
                image: 'https://images.unsplash.com/photo-1633356713697-4dc2a5c869b3?w=500&h=250&fit=crop',
                source: 'Web Dev Today',
                url: 'https://example.com/web-standards',
                publishedAt: '2024-04-20T08:45:00Z',
                category: 'technology'
            },
            {
                id: 4,
                title: 'Кібербезпека стала пріоритетом для всіх компаній',
                description: 'Експерти попереджають про зростаючу кількість кіберзагроз і рекомендують вжити заходи для захисту даних.',
                image: 'https://images.unsplash.com/photo-1563986768494-4dee2763a3a8?w=500&h=250&fit=crop',
                source: 'Cyber Alert',
                url: 'https://example.com/cybersecurity',
                publishedAt: '2024-04-19T16:20:00Z',
                category: 'security'
            },
            {
                id: 5,
                title: 'Хмарні технології продовжують революціонізувати IT сектор',
                description: 'Великі гравці на ринку впроваджують нові рішення для хмарних обчислень, що робить їх більш доступними.',
                image: 'https://images.unsplash.com/photo-1460925895917-afdab684c3c7?w=500&h=250&fit=crop',
                source: 'Cloud Insider',
                url: 'https://example.com/cloud-tech',
                publishedAt: '2024-04-19T14:15:00Z',
                category: 'technology'
            },
            {
                id: 6,
                title: 'Стартап отримав фінансування на розробку квантового комп\'ютера',
                description: 'Інноваційна компанія залучила $100 мільйонів інвестицій для розробки практичного квантового комп\'ютера.',
                image: 'https://images.unsplash.com/photo-1526374965328-7f5ae4e8b08f?w=500&h=250&fit=crop',
                source: 'Startup Times',
                url: 'https://example.com/quantum',
                publishedAt: '2024-04-19T12:00:00Z',
                category: 'innovation'
            },
            {
                id: 7,
                title: 'Екологічні IT рішення набирають популярність',
                description: 'Компанії інвестують у зелені технології для зменшення вуглецевого сліду своїх операцій.',
                image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&h=250&fit=crop',
                source: 'Green Tech',
                url: 'https://example.com/green-it',
                publishedAt: '2024-04-18T11:30:00Z',
                category: 'sustainability'
            },
            {
                id: 8,
                title: 'Мобільні додатки змінюють спосіб, яким люди працюють',
                description: 'Нові мобільні рішення дозволяють працівникам бути продуктивними з будь-якого місця у світі.',
                image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=250&fit=crop',
                source: 'Mobile Digest',
                url: 'https://example.com/mobile-apps',
                publishedAt: '2024-04-18T10:00:00Z',
                category: 'mobile'
            }
        ];
    }

    // Filter and sort articles
    filterAndSort() {
        let filtered = [...this.articles];

        // Sort
        filtered.sort((a, b) => {
            if (this.sortBy === 'publishedAt') {
                return new Date(b.publishedAt) - new Date(a.publishedAt);
            } else if (this.sortBy === 'title') {
                return a.title.localeCompare(b.title);
            }
            return 0;
        });

        this.articles = filtered;
        this.render();
    }

    // Switch view
    switchView(view) {
        this.currentView = view;
        this.render();
    }

    // Bookmark management
    toggleBookmark(url) {
        const article = this.articles.find(a => a.url === url);
        if (!article) return;

        const bookmarkIndex = this.bookmarks.findIndex(b => b.url === url);

        if (bookmarkIndex > -1) {
            this.bookmarks.splice(bookmarkIndex, 1);
        } else {
            this.bookmarks.push(article);
        }

        this.saveBookmarks();
        this.render();
    }

    removeBookmark(url) {
        this.bookmarks = this.bookmarks.filter(b => b.url !== url);
        this.saveBookmarks();
        this.render();
    }

    loadBookmarks() {
        const saved = localStorage.getItem('newsBookmarks');
        this.bookmarks = saved ? JSON.parse(saved) : [];
    }

    saveBookmarks() {
        localStorage.setItem('newsBookmarks', JSON.stringify(this.bookmarks));
    }

    isBookmarked(url) {
        return this.bookmarks.some(b => b.url === url);
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Вчора';
        } else {
            return date.toLocaleDateString('uk-UA', { month: 'short', day: 'numeric' });
        }
    }

    // Render main view
    render() {
        const root = document.getElementById('root');
        root.innerHTML = this.getTemplate();
        this.attachEventListeners();
    }

    getTemplate() {
        return `
            ${this.getHeaderTemplate()}
            <div class="container">
                ${this.currentView === 'news' ? this.getNewsTemplate() : this.getBookmarksTemplate()}
            </div>
        `;
    }

    getHeaderTemplate() {
        return `
            <div class="header">
                <div class="header-container">
                    <div class="header-title">
                        <span class="header-title-icon">📰</span>
                        <span>NewsFlow</span>
                    </div>
                    <div class="header-nav">
                        <button class="nav-btn ${this.currentView === 'news' ? 'active' : ''}" data-view="news">
                            📰 Новини
                        </button>
                        <button class="nav-btn ${this.currentView === 'bookmarks' ? 'active' : ''}" data-view="bookmarks">
                            ⭐ Закладки (${this.bookmarks.length})
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getNewsTemplate() {
        if (this.isLoading) {
            return `
                <div class="loading">
                    <div class="spinner"></div>
                </div>
            `;
        }

        return `
            <div class="controls">
                <div class="search-box">
                    <input 
                        type="text" 
                        class="search-input" 
                        placeholder="🔍 Пошук новин..."
                        value="${this.searchTerm}"
                    >
                </div>
                <div class="filter-group">
                    <select class="filter-select sort-select">
                        <option value="publishedAt" ${this.sortBy === 'publishedAt' ? 'selected' : ''}>
                            Сортування: Нові першими
                        </option>
                        <option value="title" ${this.sortBy === 'title' ? 'selected' : ''}>
                            Сортування: За назвою
                        </option>
                    </select>
                    <button class="btn-icon refresh-btn" title="Оновити новини">🔄</button>
                </div>
            </div>

            <div class="articles-section">
                <div class="articles-list">
                    ${this.articles.length > 0 
                        ? this.articles.map(article => this.getArticleCardTemplate(article)).join('')
                        : '<div class="empty-message"><div class="empty-icon">📭</div><p>Новин не знайдено</p></div>'
                    }
                </div>
                ${this.getSidebarTemplate()}
            </div>
        `;
    }

    getArticleCardTemplate(article) {
        const isBookmarked = this.isBookmarked(article.url);
        return `
            <div class="article-card">
                <img 
                    src="${article.image}" 
                    alt="${article.title}"
                    class="article-image"
                    onerror="this.src='https://images.unsplash.com/photo-1557825132-69e6e4c6cf3e?w=500&h=250&fit=crop'"
                >
                <div class="article-content">
                    <div class="article-date">${this.formatDate(article.publishedAt)}</div>
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-description">${article.description}</p>
                    <div class="article-source">${article.source}</div>
                    <div class="article-footer">
                        <a href="${article.url}" target="_blank" class="article-read-link">Читати далі →</a>
                        <button 
                            class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}"
                            data-url="${article.url}"
                            title="${isBookmarked ? 'Видалити закладку' : 'Додати закладку'}"
                        >
                            ${isBookmarked ? '⭐' : '☆'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getBookmarksTemplate() {
        if (this.bookmarks.length === 0) {
            return `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 60px; margin-bottom: 20px;">📚</div>
                    <h2 style="color: #1e293b; margin-bottom: 10px;">Немає збережених закладок</h2>
                    <p style="color: #64748b; margin-bottom: 20px;">Додавайте вподобані статті до закладок для подальшого читання</p>
                    <button class="nav-btn" data-view="news" style="background: #2563eb; color: white; border: none;">← Повернутись до новин</button>
                </div>
            `;
        }

        return `
            <div class="articles-section">
                <div class="articles-list">
                    ${this.bookmarks.map(article => this.getArticleCardTemplate(article)).join('')}
                </div>
                ${this.getBookmarksSidebarTemplate()}
            </div>
        `;
    }

    getSidebarTemplate() {
        return `
            <div class="sidebar">
                <div class="sidebar-section">
                    <div class="sidebar-title">📊 Статистика</div>
                    <div class="stats">
                        <div class="stat-item">
                            <div class="stat-label">Всього новин</div>
                            <div class="stat-value">${this.articles.length}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Закладок</div>
                            <div class="stat-value">${this.bookmarks.length}</div>
                        </div>
                    </div>
                </div>

                <div class="sidebar-section">
                    <div class="sidebar-title">⭐ Останні закладки</div>
                    ${this.bookmarks.length > 0 
                        ? `
                            <div class="bookmarks-list">
                                ${this.bookmarks.slice(-3).reverse().map(article => `
                                    <div class="bookmark-item" data-url="${article.url}">
                                        <div class="bookmark-item-content">
                                            <div class="bookmark-item-title">${article.title}</div>
                                            <div class="bookmark-item-date">${this.formatDate(article.publishedAt)}</div>
                                        </div>
                                        <button 
                                            class="bookmark-remove-btn" 
                                            data-url="${article.url}"
                                            title="Видалити"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        `
                        : '<div class="empty-message"><div class="empty-icon">💔</div><p>Закладок поки немає</p></div>'
                    }
                </div>
            </div>
        `;
    }

    getBookmarksSidebarTemplate() {
        return `
            <div class="sidebar">
                <div class="sidebar-section">
                    <div class="sidebar-title">📊 Статистика</div>
                    <div class="stats">
                        <div class="stat-item">
                            <div class="stat-label">Всього закладок</div>
                            <div class="stat-value">${this.bookmarks.length}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Джерел</div>
                            <div class="stat-value">${new Set(this.bookmarks.map(a => a.source)).size}</div>
                        </div>
                    </div>
                </div>

                <div class="sidebar-section">
                    <div class="sidebar-title">🏷️ Джерела</div>
                    <div class="bookmarks-list">
                        ${Array.from(new Set(this.bookmarks.map(a => a.source))).map(source => `
                            <div style="padding: 8px 12px; background: #f1f5f9; border-radius: 6px; font-size: 13px;">
                                <strong>${source}</strong>
                                <div style="color: #64748b; font-size: 12px;">(${this.bookmarks.filter(a => a.source === source).length})</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NewsApp();
});
