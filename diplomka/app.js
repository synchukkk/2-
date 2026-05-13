/* ==========================================
   NewsFlow - Основна логіка додатку
   ========================================== */

class NewsApp {
    constructor() {
        // Основні елементи DOM
        this.newsList = document.getElementById('newsList');
        this.bookmarksList = document.getElementById('bookmarksList');
        this.searchInput = document.getElementById('searchInput');
        this.sortSelect = document.getElementById('sortSelect');
        this.newsView = document.getElementById('newsView');
        this.bookmarksView = document.getElementById('bookmarksView');
        this.recentBookmarks = document.getElementById('recentBookmarks');
        this.totalNewsCount = document.getElementById('totalNewsCount');
        this.bookmarkCount = document.getElementById('bookmarkCount');
        this.toast = document.getElementById('toast');

        // Дані
        this.allNews = [];
        this.bookmarks = [];
        this.filteredNews = [];
        this.searchQuery = '';
        this.sortMethod = 'date';
        this.debounceTimer = null;
        this.updateCount = 0; // Лічильник оновлень

        // Ключ для localStorage
        this.STORAGE_KEY = 'newsBookmarks';

        // Ініціалізація
        this.init();
    }

    /* ==========================================
       Ініціалізація
       ========================================== */

    init() {
        this.loadBookmarksFromStorage();
        this.loadNews(); // Це встановлює allNews та викликає filterAndSort()
        this.attachEventListeners();
        this.updateStats();
        this.renderNews(); // Це повинно показати всі новини
        
        // Встановлюємо активну кнопку новин з самого початку
        const newsBtn = document.querySelector('[data-view="news"]');
        if (newsBtn) {
            newsBtn.classList.add('active');
        }
    }

    attachEventListeners() {
        // Пошук
        this.searchInput.addEventListener('input', (e) => {
            this.onSearch(e);
        });

        // Сортування
        this.sortSelect.addEventListener('change', (e) => {
            this.sortMethod = e.target.value;
            this.filterAndSort();
            this.renderNews();
        });

        // Навігація (виключаємо кнопку оновлення)
        document.querySelectorAll('.nav-btn:not(.refresh-btn)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Оновлюємо активну кнопку
                document.querySelectorAll('.nav-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');
                
                this.switchView(e.target.dataset.view);
            });
        });

        // Оновлення новин
        document.querySelector('.refresh-btn').addEventListener('click', () => {
            this.loadNews();
            this.filterAndSort();
            this.renderNews();
            this.showToast('✅ Новини оновлені!', 'success');
        });
    }

    /* ==========================================
       Завантаження новин
       ========================================== */

    loadNews() {
        // Все новини поділені на декілька "пакетів" для оновлення
        const allNewsPackets = [
            // ПАКЕТ 1 (початковий)
            [
                // 🐾 ТВАРИНИ
                {
                    id: 1,
                    title: '🐼 Панди повертаються до Китаю після успішної реабілітації',
                    description: 'Після 10 років в зоопарку, три панди повертаються у дикі ліси Китаю. Програма розведення зберегла цей вид від вимирання.',
                    image: 'https://images.unsplash.com/photo-1564760055-d8626aeb3333?w=500&h=300&fit=crop',
                    source: '🐾 Про тварин',
                    date: new Date('2024-05-13'),
                    url: 'https://example.com/animals'
                },
                {
                    id: 2,
                    title: '🦁 Молодий лев вперше загарчав у лондонському зоопарку',
                    description: 'Малюк кішки став популярною зіркою соцмереж. Відвідувачі чекають на дозвіл для фото з ним.',
                    image: 'https://images.unsplash.com/photo-1570544886411-07a7cd183fe7?w=500&h=300&fit=crop',
                    source: '🐾 Про тварин',
                    date: new Date('2024-05-12'),
                    url: 'https://example.com/animals'
                },
                {
                    id: 3,
                    title: '🐬 Дельфіни комунікують складніше, ніж ми думали',
                    description: 'Нові дослідження показали, що дельфіни використовують система мові, аналогічну людській мові. Вони передають знання від покоління до покоління.',
                    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop',
                    source: '🐾 Про тварин',
                    date: new Date('2024-05-11'),
                    url: 'https://example.com/animals'
                },

                // 🇺🇦 УКРАЇНА
                {
                    id: 4,
                    title: '🇺🇦 Київ отримає нові лінії метро до кінця року',
                    description: 'Влада столиці розпочала масштабне розширення підземного транспорту. Нові станції з\'єднають віддалені райони міста.',
                    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop',
                    source: '🇺🇦 Україна',
                    date: new Date('2024-05-10'),
                    url: 'https://example.com/ukraine'
                },
                {
                    id: 5,
                    title: '🌾 Український урожай 2024 встановив новий рекорд',
                    description: 'Аграрії зібрали понад 80 млн тон зерна. Це найбільший урожай за останні 20 років.',
                    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&h=300&fit=crop',
                    source: '🇺🇦 Україна',
                    date: new Date('2024-05-09'),
                    url: 'https://example.com/ukraine'
                },
                {
                    id: 6,
                    title: '🏛️ В Львові відкрили музей сучасного мистецтва',
                    description: 'Новий музей містить роботи українських художників. Вхід вільний для студентів кожного третього дня тижня.',
                    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&h=300&fit=crop',
                    source: '🇺🇦 Україна',
                    date: new Date('2024-05-08'),
                    url: 'https://example.com/ukraine'
                },

                // 📱 ТЕЛЕФОНИ
                {
                    id: 7,
                    title: '📱 iPhone 16 отримає камеру з 200 мегапіксельною матрицею',
                    description: 'Apple найбільше сфокусується на якості фото. Новий чип обробляє 8K відео без затримок.',
                    image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&h=300&fit=crop',
                    source: '📱 Мобільні',
                    date: new Date('2024-05-13'),
                    url: 'https://example.com/phones'
                },
                {
                    id: 8,
                    title: '⚡ Samsung Galaxy Z Fold 6 буде товщиною 10мм при закритому стані',
                    description: 'Компанія достатньо розтончила складні механізми. Батарея тримає 3 дні роботи без підзарядки.',
                    image: 'https://images.unsplash.com/photo-1572286226051-fd251ed90b39?w=500&h=300&fit=crop',
                    source: '📱 Мобільні',
                    date: new Date('2024-05-12'),
                    url: 'https://example.com/phones'
                },
                {
                    id: 9,
                    title: '🔋 Xiaomi розробила батарею, що заряджається за 5 хвилин',
                    description: 'Нова технологія швидкої зарядки буде в Xiaomi 15. Батарея залишається холодною навіть при швидкій зарядці.',
                    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=300&fit=crop',
                    source: '📱 Мобільні',
                    date: new Date('2024-05-11'),
                    url: 'https://example.com/phones'
                },

                // ⚽ СПОРТ
                {
                    id: 10,
                    title: '⚽ Реал Мадрид виграв 15-й Кубок Європи поспіль',
                    description: 'Історична перемога в фіналі Ліги чемпіонів. Бензема забив переможний гол на 90-й хвилині.',
                    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop',
                    source: '⚽ Спорт',
                    date: new Date('2024-05-10'),
                    url: 'https://example.com/sports'
                },
                {
                    id: 11,
                    title: '🏀 LeBron James встановив новий рекорд NBA',
                    description: 'Легендарний гравець забив 40 000 очок за кар\'єру. Це найбільше в історії баскетболу.',
                    image: 'https://images.unsplash.com/photo-1546519638-68711109e3e3?w=500&h=300&fit=crop',
                    source: '⚽ Спорт',
                    date: new Date('2024-05-09'),
                    url: 'https://example.com/sports'
                },
                {
                    id: 12,
                    title: '🏊 Плавець Caeleb Dressel завоював 5 золотих медалей на Олімпіаді',
                    description: 'Американський чемпіон показав найкращі результати за всю історію змагань. Новий світовий рекорд на 100м вільний стиль.',
                    image: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=500&h=300&fit=crop',
                    source: '⚽ Спорт',
                    date: new Date('2024-05-08'),
                    url: 'https://example.com/sports'
                },

                // 🎬 РОЗВАГИ/КІНО
                {
                    id: 13,
                    title: '🎬 Нової частини "Аватара" виділили бюджет в 350 мільйонів',
                    description: 'Джеймс Камерон продовжує серію неймовірних спецефектів. Зйомки почнуться в 2026 році.',
                    image: 'https://images.unsplash.com/photo-1533613220915-609f4a6b0812?w=500&h=300&fit=crop',
                    source: '🎬 Розваги',
                    date: new Date('2024-05-12'),
                    url: 'https://example.com/entertainment'
                },
                {
                    id: 14,
                    title: '🎵 Taylor Swift дав концерт в Україні перед 50 000 фанатів',
                    description: 'Найпопулярніша співачиця світу виступила на НСК "Олімпійський". Квитки розпродалися за 2 години.',
                    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=300&fit=crop',
                    source: '🎬 Розваги',
                    date: new Date('2024-05-11'),
                    url: 'https://example.com/entertainment'
                },
                {
                    id: 15,
                    title: '🎮 GTA 6 офіційно анонсована з датою випуску',
                    description: 'Один з найбільш чекаємих ігор року виходить 25 вересня 2025. Трейлер набрав 500 млн переглядів.',
                    image: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=300&fit=crop',
                    source: '🎬 Розваги',
                    date: new Date('2024-05-10'),
                    url: 'https://example.com/entertainment'
                },

                // 💪 ЗДОРОВ'Я
                {
                    id: 16,
                    title: '💊 Вінниця розроблена вакцина від раку набула переломних результатів',
                    description: 'Українські вчені розробили вакцину, що зменшує пухлини на 80%. Вже почалися випробування на людях.',
                    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=300&fit=crop',
                    source: '💪 Здоров\'я',
                    date: new Date('2024-05-12'),
                    url: 'https://example.com/health'
                },
                {
                    id: 17,
                    title: '🧘 Медитація зменшує стрес на 70% - дослідження ВОЗ',
                    description: 'Щоденна медитація протягом 10 хвилин покращує психічне здоров\'я. Це офіційно рекомендує всесвітня організація здоров\'я.',
                    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=300&fit=crop',
                    source: '💪 Здоров\'я',
                    date: new Date('2024-05-11'),
                    url: 'https://example.com/health'
                },
                {
                    id: 18,
                    title: '🫀 Нове серце з біопринтера допоможе мільйонам людей',
                    description: '3D біопринтер створив перше штучне серце з клітин пацієнта. Це революція в трансплантології.',
                    image: 'https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=500&h=300&fit=crop',
                    source: '💪 Здоров\'я',
                    date: new Date('2024-05-10'),
                    url: 'https://example.com/health'
                },

                // 🚗 АВТО
                {
                    id: 19,
                    title: '🚗 Tesla випустила безпілотний автомобіль для громадянського використання',
                    description: 'FSD 12 отримав дозвіл на експлуатацію в більшості країн. Перші машини вже появилися на дорогах.',
                    image: 'https://images.unsplash.com/photo-1560958089-b8a63c6c0fa1?w=500&h=300&fit=crop',
                    source: '🚗 Авто',
                    date: new Date('2024-05-13'),
                    url: 'https://example.com/auto'
                },
                {
                    id: 20,
                    title: '⚡ Електромобіль з запасом ходу в 2000 км з\'явив на ринку',
                    description: 'Нова батарея від BYD дозволила проїхати 2000 км на одному заряді. Серійне виробництво почалося.',
                    image: 'https://images.unsplash.com/photo-1617469767537-b85faf00021e?w=500&h=300&fit=crop',
                    source: '🚗 Авто',
                    date: new Date('2024-05-12'),
                    url: 'https://example.com/auto'
                },

                // 🌌 НАУКА
                {
                    id: 21,
                    title: '🌌 NASA знайшла експопланету з ознаками життя',
                    description: 'На планеті K2-18c виявлені вуглеводні в атмосфері. Існує ймовірність наявності біологічного життя.',
                    image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=500&h=300&fit=crop',
                    source: '🌌 Наука',
                    date: new Date('2024-05-11'),
                    url: 'https://example.com/science'
                },
                {
                    id: 22,
                    title: '🔬 Вчені розділили чорну діру на дві окремі',
                    description: 'Першого разу в історії астрономи спостерігали розділення чорної діри. Це підтверджує нові теорії про простір-час.',
                    image: 'https://images.unsplash.com/photo-1462331940975-31eebf106451?w=500&h=300&fit=crop',
                    source: '🌌 Наука',
                    date: new Date('2024-05-10'),
                    url: 'https://example.com/science'
                },

                // ✈️ ПОДОРОЖІ
                {
                    id: 23,
                    title: '✈️ Перший авіарейс на водню піднявся в небо',
                    description: 'Авіалайнер на основі водню успішно пройшов тестовий рейс. Це може змінити авіаційну промисловість.',
                    image: 'https://images.unsplash.com/photo-1466043699849-6cedf5a288c0?w=500&h=300&fit=crop',
                    source: '✈️ Подорожі',
                    date: new Date('2024-05-12'),
                    url: 'https://example.com/travel'
                },
                {
                    id: 24,
                    title: '🏖️ Мальдіви відкрили перший підводний готель для туристів',
                    description: 'Гостям пропонується ночівля на глибині 5 метрів з видом на коралові рифи. Ночовка коштує від 10 тис. дол.',
                    image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=500&h=300&fit=crop',
                    source: '✈️ Подорожі',
                    date: new Date('2024-05-11'),
                    url: 'https://example.com/travel'
                },

                // 👗 МОДА
                {
                    id: 25,
                    title: '👗 Telfar Clemens представив нову колекцію на неділю моди в Парижі',
                    description: 'Культова дизайнерська сумка стала символом моди. Цьогорічна колекція розпродалася за 3 години.',
                    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop',
                    source: '👗 Мода',
                    date: new Date('2024-05-13'),
                    url: 'https://example.com/fashion'
                }
            ],

            // ПАКЕТ 2 (нові новини при першому оновленні)
            [
                {
                    id: 101,
                    title: '🦎 Нові види гекона відкриті в Африці',
                    description: 'Натуралісти знайшли 5 нових видів ящірок у дощових лісах. Вони мають унікальне забарвлення.',
                    image: 'https://images.unsplash.com/photo-1567359781514-3b963ff205b7?w=500&h=300&fit=crop',
                    source: '🐾 Про тварин',
                    date: new Date('2024-05-14'),
                    url: 'https://example.com/animals'
                },
                {
                    id: 102,
                    title: '🐓 Курячі яйця стали дорожчі на 30%',
                    description: 'На ринку спостерігається дефіцит яєць через грип птиці. Фермери очікують нормалізації ситуації.',
                    image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=500&h=300&fit=crop',
                    source: '🐾 Про тварин',
                    date: new Date('2024-05-14'),
                    url: 'https://example.com/animals'
                },
                {
                    id: 103,
                    title: '🔥 Україна отримала нові гелікоптери для евакуації',
                    description: 'США передали 10 вертольотів для допомоги цивільному населенню. Перші рейси вже проводяться.',
                    image: 'https://images.unsplash.com/photo-1587210102834-cf8c4f56f5ed?w=500&h=300&fit=crop',
                    source: '🇺🇦 Україна',
                    date: new Date('2024-05-14'),
                    url: 'https://example.com/ukraine'
                },
                {
                    id: 104,
                    title: '🎨 Український художник продав картину за 2 млн доларів',
                    description: 'На аукціоні в Нью-Йорку українська абстрактна робота встановила рекорд. Гроші будуть передані благодійності.',
                    image: 'https://images.unsplash.com/photo-1578926078328-123456789012?w=500&h=300&fit=crop',
                    source: '🇺🇦 Україна',
                    date: new Date('2024-05-14'),
                    url: 'https://example.com/ukraine'
                },
                {
                    id: 105,
                    title: '📱 OnePlus 13 анонсована з экраном 2К',
                    description: 'Новий флагман отримав найяскравіший екран на ринку. Ціна почнеться від 599 доларів.',
                    image: 'https://images.unsplash.com/photo-1592286927505-1be2f0cf7147?w=500&h=300&fit=crop',
                    source: '📱 Мобільні',
                    date: new Date('2024-05-14'),
                    url: 'https://example.com/phones'
                },
                {
                    id: 106,
                    title: '⚽ Італія виграла чемпіонат європи з футзалу',
                    description: 'Італійська команда перемогла у фіналі з рахунком 5:3. Це перша перемога за 10 років.',
                    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop',
                    source: '⚽ Спорт',
                    date: new Date('2024-05-14'),
                    url: 'https://example.com/sports'
                },
                {
                    id: 107,
                    title: '🎭 Спектакль "Гамлет" відбудеться в Киево-Мохилянській академії',
                    description: 'Театр "Модерн" представить класичну п\'єсу з новим прочитанням. Білети розпродаються швидко.',
                    image: 'https://images.unsplash.com/photo-1485095329183-d0797cdc5676?w=500&h=300&fit=crop',
                    source: '🎬 Розваги',
                    date: new Date('2024-05-14'),
                    url: 'https://example.com/entertainment'
                },
                {
                    id: 108,
                    title: '💉 Нова вакцина від грипу пройшла останню стадію випробувань',
                    description: 'Препарат показав 95% ефективність. Виробництво почнеться восени.',
                    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&h=300&fit=crop',
                    source: '💪 Здоров\'я',
                    date: new Date('2024-05-14'),
                    url: 'https://example.com/health'
                },
                {
                    id: 109,
                    title: '🚙 Maserati представила гібридну версію Ghibli',
                    description: 'Культовий седан отримав електромотор. Витрата палива зменшилася на 40%.',
                    image: 'https://images.unsplash.com/photo-1609708536965-68ddf2817901?w=500&h=300&fit=crop',
                    source: '🚗 Авто',
                    date: new Date('2024-05-14'),
                    url: 'https://example.com/auto'
                },
                {
                    id: 110,
                    title: '🌍 Учені виявили новий материал для сонячних батарей',
                    description: 'Матеріал перевищує ефективність кремнію на 60%. Це прискорить розповсюдження сонячної енергії.',
                    image: 'https://images.unsplash.com/photo-1509391366360-2e938aa1ef14?w=500&h=300&fit=crop',
                    source: '🌌 Наука',
                    date: new Date('2024-05-14'),
                    url: 'https://example.com/science'
                },
                {
                    id: 111,
                    title: '✈️ SkyBridge відкрила рейси в 50 нових міст',
                    description: 'Авіакомпанія розширює мережу маршрутів. На 15% зменшилися ціни на квитки.',
                    image: 'https://images.unsplash.com/photo-1552821206-fffe20c6171f?w=500&h=300&fit=crop',
                    source: '✈️ Подорожі',
                    date: new Date('2024-05-14'),
                    url: 'https://example.com/travel'
                }
            ],

            // ПАКЕТ 3 (при другому оновленні)
            [
                {
                    id: 201,
                    title: '🦅 Білі орли повертаються до Європи',
                    description: 'Популяція білих орлів збільшилася на 120%. Вони повертаються в регіони, де їх не було 50 років.',
                    image: 'https://images.unsplash.com/photo-1540573133985-87b6da3007ff?w=500&h=300&fit=crop',
                    source: '🐾 Про тварин',
                    date: new Date('2024-05-15'),
                    url: 'https://example.com/animals'
                },
                {
                    id: 202,
                    title: '🇺🇦 Суспільне представило новий навчальний канал',
                    description: 'Канал присвячений популяризації науки та освіти. Вже випущено 100 епізодів.',
                    image: 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=500&h=300&fit=crop',
                    source: '🇺🇦 Україна',
                    date: new Date('2024-05-15'),
                    url: 'https://example.com/ukraine'
                },
                {
                    id: 203,
                    title: '📱 Google Pixel 9 Pro отримав революційну камеру AI',
                    description: 'Штучний інтелект покращує кожне фото в реальному часі. Результати вражають конкурентів.',
                    image: 'https://images.unsplash.com/photo-1511235642339-ea64a128b9d9?w=500&h=300&fit=crop',
                    source: '📱 Мобільні',
                    date: new Date('2024-05-15'),
                    url: 'https://example.com/phones'
                },
                {
                    id: 204,
                    title: '⚾ Чемпіонат світу з бейсболу почав у США',
                    description: '16 команд змагаються за золото. Першу гру переглянуло 100 млн глядачів.',
                    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop',
                    source: '⚽ Спорт',
                    date: new Date('2024-05-15'),
                    url: 'https://example.com/sports'
                },
                {
                    id: 205,
                    title: '🎪 Цирк "Дю Солей" повернувся на сцену',
                    description: 'Нова программа "Luna" готується до світового туру. Перший виступ - в Лос-Анджелесі.',
                    image: 'https://images.unsplash.com/photo-1514306688772-adc0a7cc6dea?w=500&h=300&fit=crop',
                    source: '🎬 Розваги',
                    date: new Date('2024-05-15'),
                    url: 'https://example.com/entertainment'
                },
                {
                    id: 206,
                    title: '💊 Прорив у лікуванні Альцгеймера',
                    description: 'Новий препарат зупиняє розвиток хвороби на 60%. Його вже вводять пацієнтам.',
                    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=300&fit=crop',
                    source: '💪 Здоров\'я',
                    date: new Date('2024-05-15'),
                    url: 'https://example.com/health'
                },
                {
                    id: 207,
                    title: '🚀 BMW показала майбутнє M8 електромобіля',
                    description: 'Концепт мав 900 л.с. та розгін 0-100 за 2.8 сек. Серійна версія вийде через 3 роки.',
                    image: 'https://images.unsplash.com/photo-1533473359331-35b1d4d7b2d8?w=500&h=300&fit=crop',
                    source: '🚗 Авто',
                    date: new Date('2024-05-15'),
                    url: 'https://example.com/auto'
                },
                {
                    id: 208,
                    title: '🔭 Найміцніший телескоп світу знайшов стародавню галактику',
                    description: 'Об\'єкт датується 13.5 млрд років назад. Це переписує історію Всесвіту.',
                    image: 'https://images.unsplash.com/photo-1462331940975-31eebf106451?w=500&h=300&fit=crop',
                    source: '🌌 Наука',
                    date: new Date('2024-05-15'),
                    url: 'https://example.com/science'
                },
                {
                    id: 209,
                    title: '🏝️ Нові острови Мальдів відкриються для туристів',
                    description: 'Три незвідані острови готуються до прийому перших гостей. Екотуризм буде пріоритетом.',
                    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=300&fit=crop',
                    source: '✈️ Подорожі',
                    date: new Date('2024-05-15'),
                    url: 'https://example.com/travel'
                },
                {
                    id: 210,
                    title: '👠 Нова колекція Гуччі в честь італійського мистецтва',
                    description: 'Палаццо Піти показав найяскравішу колекцію 21 століття. Ціни доступні для середнього класу.',
                    image: 'https://images.unsplash.com/photo-1595563437245-2d7e189e3c5e?w=500&h=300&fit=crop',
                    source: '👗 Мода',
                    date: new Date('2024-05-15'),
                    url: 'https://example.com/fashion'
                }
            ]
        ];

        // Вибираємо пакет новин за лічильником оновлень
        const packetIndex = this.updateCount % allNewsPackets.length;
        const newsPacket = allNewsPackets[packetIndex];

        // Якщо це перший раз, встановлюємо новини
        if (this.updateCount === 0) {
            this.allNews = [...newsPacket];
        } else {
            // При оновленні додаємо нові новини на початок
            this.allNews = [...newsPacket, ...this.allNews];
        }

        // Інкрементуємо лічильник
        this.updateCount++;

        this.filteredNews = [...this.allNews];
        this.filterAndSort();
        this.updateStats();
    }

    /* ==========================================
       Управління закладками
       ========================================== */

    toggleBookmark(newsId) {
        const news = this.allNews.find(n => n.id === newsId);
        const isBookmarked = this.bookmarks.some(b => b.id === newsId);

        if (isBookmarked) {
            this.bookmarks = this.bookmarks.filter(b => b.id !== newsId);
            this.showToast('❌ Закладка видалена', 'info');
        } else {
            this.bookmarks.push(news);
            this.showToast('⭐ Закладка додана!', 'success');
        }

        this.saveBookmarksToStorage();
        this.updateStats();
        this.renderNews();
        this.renderRecentBookmarks();
    }

    isBookmarked(newsId) {
        return this.bookmarks.some(b => b.id === newsId);
    }

    /* ==========================================
       Пошук та фільтрація
       ========================================== */

    onSearch(event) {
        this.searchQuery = event.target.value.toLowerCase().trim();

        // Debounce для оптимізації
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.filterAndSort();
            this.renderNews();
        }, 300);
    }

    filterAndSort() {
        // Фільтрація за пошуком
        let result = this.allNews.filter(news => {
            const searchLower = this.searchQuery.toLowerCase().trim();
            
            if (!searchLower) {
                return true; // Якщо пошук порожній, показуємо всі
            }
            
            return (
                news.title.toLowerCase().includes(searchLower) ||
                news.description.toLowerCase().includes(searchLower) ||
                news.source.toLowerCase().includes(searchLower)
            );
        });

        // Сортування
        if (this.sortMethod === 'date') {
            result.sort((a, b) => new Date(b.date) - new Date(a.date)); // Нові першими
        } else if (this.sortMethod === 'title') {
            result.sort((a, b) => a.title.localeCompare(b.title, 'uk')); // За назвою
        }

        this.filteredNews = result;
    }

    /* ==========================================
       Перемикання подань
       ========================================== */

    switchView(viewName) {
        // Показ/приховування подань
        this.newsView.classList.remove('active');
        this.bookmarksView.classList.remove('active');

        if (viewName === 'news') {
            this.newsView.classList.add('active');
            this.filterAndSort();
            this.renderNews();
        } else if (viewName === 'bookmarks') {
            this.bookmarksView.classList.add('active');
            this.renderBookmarks();
        }
    }

    /* ==========================================
       Рендеринг новин
       ========================================== */

    renderNews() {
        // Переконаємось, що фільтрація актуальна
        if (this.searchQuery === '' || this.newsList.innerHTML === '') {
            this.filterAndSort();
        }
        
        this.newsList.innerHTML = '';

        if (!this.filteredNews || this.filteredNews.length === 0) {
            this.newsList.innerHTML = `
                <div class="no-bookmarks" style="grid-column: 1 / -1;">
                    <div class="no-bookmarks-emoji">📭</div>
                    <p>Новин не знайдено</p>
                </div>
            `;
            return;
        }

        this.filteredNews.forEach(news => {
            const card = this.createNewsCard(news);
            this.newsList.appendChild(card);
        });
    }

    createNewsCard(news) {
        const card = document.createElement('div');
        card.className = 'news-card';
        const isBookmarked = this.isBookmarked(news.id);

        const formattedDate = this.formatDate(news.date);

        card.innerHTML = `
            <img src="${news.image}" alt="${news.title}" class="news-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22500%22 height=%22300%22%3E%3Crect fill=%22%23e2e8f0%22 width=%22500%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22%2364748b%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EДаних немає%3C/text%3E%3C/svg%3E'">
            <div class="news-content">
                <div class="news-meta">
                    <span class="news-source">${news.source}</span>
                    <span class="news-date">${formattedDate}</span>
                </div>
                <h3 class="news-title">${this.escapeHtml(news.title)}</h3>
                <p class="news-description">${this.escapeHtml(news.description)}</p>
                <div class="news-footer">
                    <a href="${news.url}" target="_blank" class="read-more-btn">Читати далі →</a>
                    <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-id="${news.id}">
                        ${isBookmarked ? '⭐' : '☆'}
                    </button>
                </div>
            </div>
        `;

        // Обробник для кнопки закладки
        card.querySelector('.bookmark-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleBookmark(news.id);
        });

        return card;
    }

    /* ==========================================
       Рендеринг закладок
       ========================================== */

    renderBookmarks() {
        this.bookmarksList.innerHTML = '';

        if (this.bookmarks.length === 0) {
            this.bookmarksList.innerHTML = `
                <div class="no-bookmarks">
                    <div class="no-bookmarks-emoji">⭐</div>
                    <p>У вас поки немає закладок</p>
                    <p style="font-size: 0.85rem; margin-top: 0.5rem;">Додавайте цікаві статті за допомогою кнопки ☆</p>
                </div>
            `;
            return;
        }

        this.bookmarks.forEach(news => {
            const card = this.createNewsCard(news);
            this.bookmarksList.appendChild(card);
        });
    }

    renderRecentBookmarks() {
        this.recentBookmarks.innerHTML = '';

        if (this.bookmarks.length === 0) {
            this.recentBookmarks.innerHTML = '<p class="empty-message">Немає закладок</p>';
            return;
        }

        // Показуємо 3 останні закладки
        const recent = this.bookmarks.slice(-3).reverse();

        recent.forEach(bookmark => {
            const item = document.createElement('div');
            item.className = 'recent-bookmark-item';

            const truncatedTitle = bookmark.title.length > 30 
                ? bookmark.title.substring(0, 27) + '...' 
                : bookmark.title;

            item.innerHTML = `
                <span>${truncatedTitle}</span>
                <button class="remove-bookmark" data-id="${bookmark.id}">✕</button>
            `;

            // Клік на закладку
            item.querySelector('span').addEventListener('click', () => {
                // Прокручуємо до статті у списку новин
                this.searchInput.value = '';
                this.filterAndSort();
                this.renderNews();
                this.newsView.classList.add('active');
                this.bookmarksView.classList.remove('active');
                document.querySelector('[data-view="news"]').classList.add('active');
                document.querySelector('[data-view="bookmarks"]').classList.remove('active');
            });

            // Видалення закладки
            item.querySelector('.remove-bookmark').addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleBookmark(bookmark.id);
            });

            this.recentBookmarks.appendChild(item);
        });
    }

    /* ==========================================
       Управління сховищем
       ========================================== */

    saveBookmarksToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.bookmarks));
        } catch (error) {
            console.error('Помилка при збереженні закладок:', error);
            this.showToast('⚠️ Помилка при збереженні', 'error');
        }
    }

    loadBookmarksFromStorage() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            this.bookmarks = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Помилка при завантаженні закладок:', error);
            this.bookmarks = [];
        }
    }

    /* ==========================================
       Оновлення статистики
       ========================================== */

    updateStats() {
        this.totalNewsCount.textContent = this.allNews.length;
        this.bookmarkCount.textContent = this.bookmarks.length;
        this.renderRecentBookmarks();
    }

    /* ==========================================
       Утилітарні функції
       ========================================== */

    formatDate(date) {
        const options = {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(date).toLocaleDateString('uk-UA', options);
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    showToast(message, type = 'info') {
        this.toast.textContent = message;
        this.toast.className = 'toast show';

        if (type === 'success') {
            this.toast.style.background = 'var(--success)';
        } else if (type === 'error') {
            this.toast.style.background = 'var(--danger)';
        } else {
            this.toast.style.background = 'var(--primary-blue)';
        }

        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

/* ==========================================
   Ініціалізація при завантаженні сторінки
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    const app = new NewsApp();
});
