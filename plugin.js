// Lampa CustomPlayer Plugin
// Version: 1.0
// Author: ChatGPT (примерный шаблон)
// Описание: плагин для Lampa Uncensored (веб-версия в MSX), который полностью
// подменяет стандартный плеер на более надёжную HTML5/HLS реализацию.
// Установка: разместить этот файл на https:// (GitHub Pages / jsDelivr / raw.githack) и
// в Lampa -> Настройки -> Плагины добавить URL к этому файлу.

(function(){
    const PLUGIN_NAME = 'custom_player_replace';
    const HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.1/dist/hls.min.js';

    // Простая загрузка внешнего скрипта
    function loadScript(url){
        return new Promise((resolve, reject)=>{
            if(document.querySelector('script[data-src="'+url+'"]')) return resolve();
            const s = document.createElement('script');
            s.async = true;
            s.setAttribute('data-src', url);
            s.src = url;
            s.onload = ()=>resolve();
            s.onerror = (e)=>reject(e);
            document.head.appendChild(s);
        });
    }

    // Небольшая оболочка для логов
    function log(){
        try{ console.log.apply(console,['[CustomPlayer]'].concat(Array.from(arguments))); }catch(e){}
    }

    // CustomPlayer класс
    function CustomPlayer(){
        this.video = null;
        this.container = null;
        this.hls = null;
        this.current = null;
        this.controlsCreated = false;
        this._onEnded = this._onEnded.bind(this);
    }

    CustomPlayer.prototype.init = function(){
        if(this.container) return;

        // контейнер поверх Lampa
        this.container = document.createElement('div');
        this.container.className = 'cp_overlay_container';
        Object.assign(this.container.style, {
            position: 'fixed',
            left: '0', top: '0', right: '0', bottom: '0',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent'
        });

        // видео элемент
        this.video = document.createElement('video');
        this.video.setAttribute('playsinline', 'true');
        this.video.setAttribute('webkit-playsinline', 'true');
        this.video.controls = true;
        this.video.preload = 'auto';
        Object.assign(this.video.style, {
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%'
        });

        this.container.appendChild(this.video);
        document.body.appendChild(this.container);

        this.video.addEventListener('ended', this._onEnded);
        this.video.addEventListener('error', (e)=>{
            log('video error', e);
        });

        // минимальные кастомные стили
        const css = `
            .cp_overlay_container video{ background: black }
        `;
        const style = document.createElement('style');
        style.innerHTML = css;
        document.head.appendChild(style);
    };

    CustomPlayer.prototype._onEnded = function(){
        Lampa.Player.stop && Lampa.Player.stop();
    };

    CustomPlayer.prototype.play = async function(data){
        // data может быть либо строкой, либо объектом
        try{
            log('play request', data);
            this.init();

            let url = typeof data === 'string' ? data : (data.url || data.file || '');
            if(!url) return log('no url');

            // Сохраним контекст
            this.current = data;

            // если это m3u8 — используем hls.js где нужно
            const isM3U8 = /\.m3u8(\?|$)/i.test(url);

            // Отчистим старое
            this._destroyHls();
            this.video.pause();
            this.video.removeAttribute('src');
            this.video.load();

            if(isM3U8 && typeof Hls === 'undefined' && !this._nativeHlsSupport()){
                // подгружаем hls.js
                await loadScript(HLS_CDN).catch(()=>{
                    log('failed to load hls.js');
                });
            }

            if(isM3U8 && typeof Hls !== 'undefined' && !this._nativeHlsSupport()){
                this.hls = new Hls({
                    maxBufferLength: 60, // держать до 60s в буфере
                    maxMaxBufferLength: 120,
                    enableWorker: true,
                    liveSyncDurationCount: 3
                });

                this.hls.attachMedia(this.video);
                this.hls.on(Hls.Events.MEDIA_ATTACHED, ()=>{
                    this.hls.loadSource(url);
                    this.video.play().catch(e=>log('play rejected', e));
                });

                this.hls.on(Hls.Events.ERROR, (event, data)=>{
                    log('hls error', data);
                });
            } else {
                // либо нативный браузер поддерживает HLS, либо поток mp4
                this.video.src = url;
                // Некоторым платформам нужно небольшое ожидание
                setTimeout(()=>{
                    const p = this.video.play();
                    if(p && p.catch) p.catch(e=>log('play error', e));
                }, 50);
            }

            // Покажем контейнер и уберём стандартный плеер Lampa, если есть
            this.container.style.display = 'flex';

            // Пробуем скрыть оригинальный Lampa video, если он есть
            try{
                const orig = document.querySelector('video:not(.cp_overlay_container video)');
                if(orig && orig !== this.video){
                    orig.pause();
                    orig.style.display = 'none';
                }
            }catch(e){}

            // Сохраняем title
            if(typeof data === 'object' && data.title) document.title = data.title;

        }catch(e){
            log('play exception', e);
        }
    };

    CustomPlayer.prototype.stop = function(){
        try{
            this._destroyHls();
            if(this.video){
                this.video.pause();
                this.video.removeAttribute('src');
                this.video.load();
            }
            if(this.container) this.container.style.display = 'none';
            this.current = null;
        }catch(e){ log('stop error', e) }
    };

    CustomPlayer.prototype._destroyHls = function(){
        try{
            if(this.hls){
                this.hls.destroy();
                this.hls = null;
            }
        }catch(e){ }
    };

    CustomPlayer.prototype._nativeHlsSupport = function(){
        // Проверка, поддерживает ли браузер HLS нативно
        const v = document.createElement('video');
        return v.canPlayType('application/vnd.apple.mpegurl') !== '';
    };

    // Плагин-регистр
    Lampa.Plugin && Lampa.Plugin.create && Lampa.Plugin.create(PLUGIN_NAME, {
        start: function(){
            log('plugin start');

            // бекап оригинала
            const original = Lampa.Player && Lampa.Player.play ? Lampa.Player.play : null;
            const originalStop = Lampa.Player && Lampa.Player.stop ? Lampa.Player.stop : null;

            const cp = new CustomPlayer();

            // Подмена методов
            try{
                Lampa.Player.play = function(data){
                    // если нужно, добавь условие: подменять только для torrent/torrserve
                    // if(typeof data === 'object' && data.url && data.url.includes('8090')) { ... }
                    cp.play(data);
                };

                Lampa.Player.stop = function(){
                    cp.stop();
                    if(originalStop) originalStop.call(Lampa.Player);
                };

                // Опционально — дать доступ к оригиналу
                Lampa.Player.__original_play = original;
                Lampa.Player.__original_stop = originalStop;

                log('player methods replaced');

            }catch(e){ log('replace error', e) }
        },
        stop: function(){
            log('plugin stop');
            // попытка восстановить оригинал
            try{
                if(Lampa.Player && Lampa.Player.__original_play) Lampa.Player.play = Lampa.Player.__original_play;
                if(Lampa.Player && Lampa.Player.__original_stop) Lampa.Player.stop = Lampa.Player.__original_stop;
            }catch(e){ }
        }
    });

})();
