(function() {
    if (typeof Lampa === 'undefined') {
        console.log('[Weonar Player] Lampa API не найдена');
        return;
    }

    const STORAGE_KEY = 'weonar_player_choice';
    const PLAYERS = {
        internal: 'Встроенный плеер (по умолчанию)',
        weonar: 'Weonar 4K Player',
        msx: 'Media Station X',
        custom: 'Свой URL...'
    };

    // Проверяем, нет ли уже пункта, чтобы не дублировать
    if (!Lampa.Settings.get('weonar_player_choice')) {
        Lampa.Settings.add({
            key: STORAGE_KEY,
            name: 'Выбрать плеер',
            type: 'select',
            values: PLAYERS,
            default: 'internal'
        });
    }

    // Лог в консоль
    console.log('%c✅ Плагин "Weonar Player Settings" загружен', 'color:#00ff88');

    // Для теста: вывести текущий выбор
    const current = Lampa.Storage.get(STORAGE_KEY, 'internal');
    console.log('[Weonar Player] Текущий выбранный плеер:', current);
})();
