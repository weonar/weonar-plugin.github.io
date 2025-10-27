(function waitForLampa() {
    // Проверяем, доступен ли Lampa
    if (typeof window.Lampa === 'undefined' || !Lampa.Settings) {
        console.log('[Weonar Player] Lampa не готова, ждём...');
        return setTimeout(waitForLampa, 1500);
    }

    try {
        const STORAGE_KEY = 'weonar_player_choice';
        const PLAYERS = {
            internal: 'Встроенный плеер (по умолчанию)',
            weonar: 'Weonar 4K Player',
            msx: 'Media Station X',
            custom: 'Свой URL...'
        };

        // Проверяем, не добавлен ли уже пункт
        if (!Lampa.Settings.get(STORAGE_KEY)) {
            Lampa.Settings.add({
                key: STORAGE_KEY,
                name: 'Выбрать плеер',
                type: 'select',
                values: PLAYERS,
                default: 'internal'
            });
            console.log('%c✅ Плагин Weonar Player Settings добавил пункт выбора плеера', 'color:#00ff88');
        } else {
            console.log('%cℹ️ Пункт выбора плеера уже существует', 'color:#ffaa00');
        }
    } catch (e) {
        console.error('[Weonar Player] Ошибка при добавлении настроек:', e);
    }
})();
