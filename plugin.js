(function() {
    // Проверка, что Lampa загружена
    if (typeof Lampa === 'undefined') return;

    // Добавляем кнопку в настройки
    Lampa.Settings.add({
        key: 'weonar_player',
        name: 'Выбор плеера',
        type: 'select',
        values: {
            default: 'Стандартный',
            custom: 'Мой 4K плеер',
            external: 'MSX-плеер'
        },
        default: 'default'
    });

    // Подписываемся на событие "перед запуском видео"
    Lampa.Listener.follow('player', function(e) {
        if (e.type === 'start') {
            let selected = Lampa.Storage.get('weonar_player', 'default');

            if (selected === 'custom') {
                // Подмена на твой плеер
                let src = encodeURIComponent(e.data.url || '');
                let title = encodeURIComponent(e.data.title || 'Видео');
                let newUrl = `https://weonar.github.io/weonar-plugin.github.io/index.html?src=${src}&title=${title}`;
                
                console.log('🔁 Перенаправление в кастомный плеер:', newUrl);
                window.open(newUrl, '_self'); // заменить окно
                e.preventDefault(); // отменить стандартное воспроизведение
            }
        }
    });

    console.log('%cWeonar Player Plugin loaded ✅', 'color: #00ff88');
})();
