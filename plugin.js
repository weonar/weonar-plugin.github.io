(() => {
    const PLUGIN_ID = 'custom-player-selector';
    const PLAYER_KEY = 'custom_player_choice';

    function log(...args) {
        console.log(`[${PLUGIN_ID}]`, ...args);
    }

    function getSavedPlayer() {
        return localStorage.getItem(PLAYER_KEY) || 'default';
    }

    function savePlayer(player) {
        localStorage.setItem(PLAYER_KEY, player);
        log('Saved player:', player);
    }

    // --- Додавання в меню плеєра ---
    function addPlayerSelectorButton() {
        let button = $('<div class="player-panel__button selector">🎬 Вибір плеєра</div>');

        button.on('hover:enter', () => {
            showPlayerSelection();
        });

        $('.player-panel__body').append(button);
        log('Button added to player menu');
    }

    // --- Меню вибору плеєра ---
    function showPlayerSelection() {
        let selected = getSavedPlayer();

        let list = [
            { title: '🎞️ Стандартний плеєр', value: 'default' },
            { title: '📺 Web-плеєр', value: 'web' },
            { title: '🧩 VLC', value: 'vlc' },
            { title: '🎥 MX Player', value: 'mx' },
            { title: '🧱 Kodi', value: 'kodi' },
        ];

        let menu = new Lampa.Select({
            title: 'Вибір плеєра',
            items: list.map(item => ({
                title: item.title + (item.value === selected ? ' ✅' : ''),
                selected: item.value === selected,
                value: item.value
            })),
            onSelect: (a) => {
                savePlayer(a.value);
                Lampa.Modal.close();
                Lampa.Noty.show(`✅ Вибрано плеєр: ${a.title}`);
            },
            onBack: () => {
                Lampa.Controller.toggle('player');
            }
        });

        menu.show();
    }

    // --- Перехоплення відкриття плеєра ---
    function overridePlayerOpen() {
        const original = Lampa.Player.open;

        Lampa.Player.open = function (params) {
            const selected = getSavedPlayer();

            if (selected === 'default') {
                return original.call(this, params);
            }

            // Приклад дії для зовнішніх плеєрів:
            if (selected === 'web') {
                Lampa.Noty.show('🔗 Відкриваю у Web Player...');
                window.open(params.url, '_blank');
            } else {
                Lampa.Noty.show(`🎬 Відкриваю через ${selected} (імітація)`);
            }
        };

        log('Player open function overridden');
    }

    // --- Ініціалізація ---
    function init() {
        log('Plugin loaded');

        Lampa.Listener.follow('app', (event) => {
            if (event.type === 'ready') {
                overridePlayerOpen();

                // Додаємо кнопку трохи пізніше, коли зʼявиться панель плеєра
                setTimeout(() => {
                    addPlayerSelectorButton();
                }, 1500);
            }
        });
    }

    init();
})();
