(function() {
    if (typeof Lampa === 'undefined') {
        console.log('[Weonar Player] Lampa API not found');
        return;
    }

    const STORAGE_KEY = 'weonar_player_choice';
    const PLAYER_URL = 'https://weonar.github.io/weonar-plugin.github.io/index.html';

    // Список вариантов
    const PLAYERS = {
        internal: 'Встроенный плеер (ByLampa)',
        weonar: 'Weonar 4K Player',
        msx: 'Media Station X',
        custom: 'Свой URL...'
    };

    // Добавляем пункт в настройки
    Lampa.Settings.add({
        key: STORAGE_KEY,
        name: 'Выбор плеера',
        type: 'select',
        values: PLAYERS,
        default: 'internal'
    });

    // Подписываемся на запуск видео
    Lampa.Listener.follow('player', function(event) {
        if (event.type !== 'start') return;

        const selected = Lampa.Storage.get(STORAGE_KEY, 'internal');
        const src = event.data && event.data.url ? event.data.url : '';
        const title = event.data && event.data.title ? event.data.title : 'Видео';

        if (selected === 'weonar') {
            const link = `${PLAYER_URL}?src=${encodeURIComponent(src)}&title=${encodeURIComponent(title)}`;
            console.log('[Weonar Player] Перенаправление в Weonar 4K Player:', link);
            window.open(link, '_self');
            event.preventDefault();
        } 
        else if (selected === 'msx') {
            const msxLink = `https://msx.benzac.de/player.html?url=${encodeURIComponent(src)}`;
            console.log('[Weonar Player] Перенаправление в MSX:', msxLink);
            window.open(msxLink, '_self');
            event.preventDefault();
        } 
        else if (selected === 'custom') {
            let customUrl = Lampa.Storage.get('weonar_player_custom_url', '');
            if (!customUrl) {
                customUrl = prompt('Введите URL своего плеера (например, https://example.com/player.html):', '');
                if (customUrl) Lampa.Storage.set('weonar_player_custom_url', customUrl);
            }
            if (customUrl) {
                const link = `${customUrl}?src=${encodeURIComponent(src)}&title=${encodeURIComponent(title)}`;
                console.log('[Weonar Player] Перенаправление в custom:', link);
                window.open(link, '_self');
                event.preventDefault();
            }
        }
        else {
            console.log('[Weonar Player] Используется встроенный плеер');
        }
    });

    console.log('%c✅ Weonar Player Plugin загружен', 'color:#00ff88');
})();
