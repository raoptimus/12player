/*!
 * TcEx Jquery Plugins
 * http://12traff.com/
 * http://12player.tv/
 *
 * Copyright 2014
 */
$tc.fn.tcPlayer = function(config){

    var preloader = new function() {

        var timer = 0;
        var index = 0;
        var maxIndex = 7;

        var stopped = function() {
            return !(timer > 0);
        };

        this.start = function() {
            if (!stopped())
                return;

            showBigButton($bigButtonLoader);

            timer = setInterval(function() {
                $bigButtonLoader.removeClass(prefixIcoStyle + "loader1-0" + index);
                index++;

                if (index > maxIndex)
                    index = 0;

                $bigButtonLoader.addClass(prefixIcoStyle + "loader1-0" + index);
            }, 100);
        };

        this.stop = function() {
            if (stopped())
                return;

            clearInterval(timer);
            timer = 0;
            hideBigButtons();
        };
    };

    var resize = function() {
        var props = {
            'width': "100%",
            'height': "100%"
        };
        $player.prop(props).css(props);
    };

    // region full screen

    //for safari and very old browsers
    function fsBoxFullScreen() {
        $("body", $(doc)).addClass(prefixStyle + "body");
        $(doc).trigger("FXBoxFullscreenChange");
    }

    //for safari and very old browsers
    function fbBoxCancelFullScreen() {
        $("body", $(doc)).removeClass(prefixStyle + "body");
        $(doc).trigger("FXBoxFullscreenChange");
    }

    function fullScreen() {
        var el = config.frameId
            ? window.top.document.getElementById(config.frameId)
            : document.getElementById(config.containerId);

        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        } else {
            fsBoxFullScreen();
        }
    }

    function cancelFullScreen()
    {
        if ($("body", $(doc)).hasClass(prefixStyle + "body")) {
            fbBoxCancelFullScreen();
        }else if (doc.exitFullscreen) {
            doc.exitFullscreen();
        } else if (doc.msExitFullscreen) {
            doc.msExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
            doc.mozCancelFullScreen();
        } else if (doc.webkitCancelFullScreen) {
            doc.webkitCancelFullScreen();
        }
    }

    function changeFullScreenState() {
        if (doc.msFullscreenElement ||
            doc.fullScreen ||
            doc.mozFullScreen ||
            doc.webkitIsFullScreen ||
            doc.fullscreenElement ||
            $("body", $(doc)).hasClass(prefixStyle + "body")) {

            $buttonFullScreen.hide();
            $buttonCancelFullScreen.show();
            $containerFsbox.addClass(prefixStyle + 'fullscreen');
            if (config.frameId)
                $("#" + config.frameId, $(doc)).addClass(prefixStyle + 'fullscreen');
        } else {
            $buttonFullScreen.show();
            $buttonCancelFullScreen.hide();
            $containerFsbox.removeClass(prefixStyle + 'fullscreen');
            if (config.frameId)
                $("#" + config.frameId, $(doc)).removeClass(prefixStyle + 'fullscreen');
        }

        $playerProxy.trigger("resize");
    }

    function isFullScreen() {
        return !!(document.msFullscreenElement ||
            document.fullScreen ||
            document.mozFullScreen ||
            document.webkitIsFullScreen ||
            $containerFsbox.hasClass(prefixStyle + "fullscreen"));
    }

    // endregion

    function play() {
        $$.log(playerReady, "play");
        if (!playerReady)
            return;
        $player[0].play();
    }

    function stop() {
        if (!playerReady) return;
        preloader.stop();
        $player[0].stop();
        $buttonPause.hide();
        $buttonStop.hide();
        $buttonPlay.show();
        $containerBigButtons.show();
    }

    function pause() {
        if (!playerReady)
            return;

        if (!paused())
            $player[0].pause();
    }

    function seek(time) {
        $$.log(playerReady, "seek");
        //console.log("requested time: " + time + " seekrequested: " + ($context.seekrequested ? 1 : 0));
        if (!playerReady || player.currentTime == time || $context.seekrequested)
            return;
        $context.seekrequested = true;
        //console.log(player.currentTime + " - " + time);
        player.currentTime = time;
        preloader.start();
    }

    function paused() {
        return !!(player.paused);
    }

    function toggle() {
        if (!playerReady) return;
        if (paused()) {
            play();
        } else {
            pause();
        }
    }

    function load() {
        if (player.paused) {
            $player[0].load();
        }
    }

    this.on = function (eventName, callback) {
        $playerProxy.on(eventName, function() {
            $$.log(eventName);
            callback();
        });
    };

    var on = this.on;

    this.off = function (eventName, callback) {
        $playerProxy.off(eventName, callback);
    };

    var off = this.off;

    function keyUp(e) {
        var code = e.keyCode || e.which;

        if (code !== 0) {
            switch (code) {

                case 27:
                {
                    if (isFullScreen())
                        cancelFullScreen();

                }
                    break;

                case 70: {
                    if (!isFullScreen())
                        fullScreen();

                }
                    break;

                case 119: {
                    toggle();
                }
                    break;
            }
        }
    }

    function loadPoster() {
        if (config.autoStart)
            return;

        var src = getDefaultPosterUrl();

        if (src == "")
            return;

        $$.log(src);

        function resizePoster($img) {
            var img = $img[0];
            var w = img.width;
            var h = img.height;

            var maxW = $containerPoster.width(),
                maxH = $containerPoster.height();

            var hRatio = (h * maxW) / w;
            var wRatio = (w * maxH) / h;

            if (wRatio == maxW && hRatio == maxH) {
                $img.css({width: "100%", height: "100%"});
            } else if (wRatio > maxW) {
                $img.css({width: "100%", height: "auto"});
            } else {
                $img.css({width: "auto", height: "100%"});
            }
        }

        $$.image().prop("src", src).on("done", function() {
            var $img = $(this);
            $containerPoster.html("").append($img);
            $containerPoster.show();
            $img.show();

            resizePoster($img);
            on("resize", function() {
                resizePoster($img);
            });
        });
    }

    function loadWatermark() {
        if (!config.watermark)
            return;

        var w = config.watermark;
        $$.log(w.logoUrl);

        var $img = $$.image()
            .prop("src", w.logoUrl)
            .on("done", function() {
                $link.show();
                $img.show();
                $containerWatermark.show();
            });
        var $link = $img;

        if (w.url && w.url != "") {
            $link = $("<a />").prop({
                    target: "_blank",
                    href: w.url
                }
            ).append($img);

            $link.click(function() {
                cancelFullScreen();
                return true;
            });
        }
        $containerWatermark.html("").append($link);
        $containerWatermark.css({
            top: w.top || "auto",
            right: w.right || "auto",
            bottom: w.bottom || "auto",
            left: w.left || "auto"
        });
    }

    function toggleWatermark(close) {
        if (close)
            $containerWatermark.fadeOut();
        else
            $containerWatermark.fadeIn();
    }

    function embed($player) {
        $$.log("embed");
        $containerBox
            .append(
                $player,
                controls()
            );
        $context.html("").append($containerFsbox);
        preloader.start();

        loadPoster();
        hqMenu();
        loadWatermark();

        $context.trigger("ready");
    }

    function embedInstall() {
        $containerWarn.html("").append([
            $$.dict.t("This video requires the Flash Player") + ".",
            $("<br />"),
            $("<a />").prop({href: "http://www.adobe.com/go/getflashplayer", target: "_blank"}).html($$.dict.t("Download Flash Player")),
            $("<br />"),
            $$.dict.t("Already have Flash Player") + "?",
            $("<a />").prop({href: "javascript:document.location.reload()"}).html($$.dict.t("Reload the page"))
        ]).show();
        $containerBox.append(bigButtonControl());
        $context.html("")
            .append($containerFsbox);
        showBigButton($bigButtonWarn);
    }

    function hqMenu() {
        if (!$containerControls)
            return;

        var $hqItems = htmlPrefDiv("quality-menu", false);
        var itemCount = 0;
        var vs = config.playlist[0].videos;

        for (var hq in vs) {
            if (!vs.hasOwnProperty(hq))
                continue;

            var item = vs[hq];
            var $item = htmlPrefDiv("quality-item")
                .data("key", hq)
                .text(hq).show();
            $hqItems.append($item);
            $item.on("click", switchHq);

            if (item.isDefault)
                $item.addClass("active");

            itemCount++;
        }

        if (itemCount <= 1) {
            $buttonChangeHq.parent().hide();
            return;
        }

        $buttonChangeHq.parent().show();
        $buttonChangeHq.html("");
        $containerHqMenu = $hqItems;
        $containerHq.show().append($hqItems);

        $buttonChangeHq.on("click", function () {
            $containerHqMenu.slideDown();

            setTimeout(function() {
                $containerHqMenu.slideUp();
            }, 3000);
        });

        $player.on("click mouseover", function() {
            $containerHqMenu.slideUp();
        });
    }

    function switchHq(event) {
        var $item = $(event.target);

        if ($item.hasClass("active")) {
            $containerHqMenu.toggle();
            return;
        }

        var key = $item.data("key");
        var item = config.playlist[0].videos[key];

        if (item.fileUrl && item.fileUrl != "") {
            $containerHqMenu.find("*").removeClass("active");
            $item.addClass("active");
            switchSrc(item.fileUrl);
        }
        else if (item.pageUrl && item.pageUrl != "") {
            cancelFullScreen();
            document.location.href = item.pageUrl; //todo: in new win or self
        }

        $containerHqMenu.hide();
    }

    function switchSrc(src) {
        lastTime = player.currentTime;
        player.src = src;
        load();
    }

    function onAll() {
        $$.log("");

        if ($bigButtonPlay)
            $bigButtonPlay.click(play);

        $.each(mediaEvents, function(key, event) {
            $playerProxy.on(event, captureEvent);
        });

        if ($containerControls) {
            $buttonPlay.click(play);
            $buttonPause.click(pause);
            $buttonStop.click(stop);
            $buttonReplay.click(function() {
                seek(0);
                play();
            });

            $bigButtonReplay.click(function() {
                seek(0);
                play();
            });

            $buttonFullScreen.click(fullScreen);
            $buttonCancelFullScreen.click(cancelFullScreen);
            $(doc).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange FXBoxFullscreenChange', changeFullScreenState);

            if ($containerVolume) {
                $buttonVolumeLow.click(function() {
                    player.volume = 0.5;
                });
                $buttonVolumeMedium.click(function() {
                    player.volume = 1;
                });
                $buttonVolumeHigh.click(function() {
                    player.volume = 0;
                });
            }

            $containerFsbox.on("keyup", keyUp);
            $(window).resize(resize);
        }

        $player.show().css("display", "block");

        if (config.autoplay)
            play();
    }

    var volumeInstalled = false;

    function setupVolume() {
        if (!$containerVolume || !player.volume)
            return;

        if (!volumeInstalled) {
            setupVolumeSeeker();
            var v = $$.storage.get(prefixStyle + "volume") || 0.5;
            volumeInstalled = true;
            player.volume = parseFloat(v);
        }
    }

    function volumeChange() {
        if (!$containerVolume)
            return;

        $buttonVolumeHigh.parent().find("*").hide();

        if (player.volume >= 0.9) {
            $buttonVolumeHigh.show();
        } else if (player.volume >= 0.5) {
            $buttonVolumeMedium.show();
        } else {
            $buttonVolumeLow.show();
        }

        if (!volumeSeeker.seeking) {
            $containerBarVolumeProgress.width(player.volume * 100 + '%');
            $containerSeekerVolume.css({left: player.volume * 100 + '%'});
        }
        $$.storage.put(prefixStyle + "volume", player.volume);
    }

    function seekerUpdate() {
        if (videoSeeker.seeking || player.seeking || player.paused)
            return;

        var pos = Math.round(player.currentTime * 10000 / player.duration) / 100 + '%';
        $containerSeekerProgress.css({left: pos});
        $containerBarProgress.width(pos);
    }

    function timeUpdate() {
        var pos = Math.round(player.duration - player.currentTime);
        timerElapsedSec = +(pos % 60);
        timerElapsedMin = +((pos - timerElapsedSec) / 60);
        $containerTimeElapsed.text('- ' + $$.format.num2d(timerElapsedMin) + ':' + $$.format.num2d(timerElapsedSec));

        pos = Math.round(player.currentTime);
        timerCurrentSec = +(pos % 60);
        timerCurrentMin = +((pos - timerCurrentSec) / 60);
        $containerTimeCurrent.text($$.format.num2d(timerCurrentMin) + ':' + $$.format.num2d(timerCurrentSec));

        $context.currentTime = pos;
    }

    function progress() {
        if (!player.buffered || player.buffered.length == 0 || typeof player.buffered.end != 'function')
            return;

        var pos = 0;

        try {
            var start = 0;
            var end = 0;
            var cur = player.currentTime;

            for (var i = 0; i < player.buffered.length - 1; i++) {
                start = player.buffered.start(i);
                end = player.buffered.end(i);

                if (end > cur)
                    break;
            }

            pos = Math.round(player.buffered.end(i) * 10000 / player.duration) / 100 + '%';

        } catch (e) {
            pos = 0;
        }

        $containerBarLoading.width(pos);
    }

    var seeker = function(config) {
        var context = this;
        var $seeker = config.seeker;
        var duration = config.duration;
        var onSeek = config.onSeek;
        this.seeking = false;
        this.seekrequested = false;
        var $area = $seeker.parent().parent(),
            $progress = $seeker.parent();

        var offsetX = 0;
        var offsetXP = 0;
        var time = 0;

        function up(e) {
            $$.log("seeker.up", e.type);
            $area.off("mouseup vmouseup", up);
            $area.off("mousemove vmousemove", move);
            update();
            onSeek(time);
            setTimeout(function() {
                context.seeking = false;
            }, 1000);
        }

        function down(e) {
            $$.log(e.type);
            context.seeking = true;
            calc(e);
            $area.on("mouseup vmouseup", up);
            $area.on("mousemove vmousemove", move);
        }

        function calc(e) {
            var progressWidth = $progress.width();
            offsetX = (e.originalEvent.clientX || e.clientX) - $progress.offset().left;

            if (isNaN(offsetX))
                return;

            if (offsetX < 0)
                offsetX = 0;

            if (offsetX > progressWidth)
                offsetX = progressWidth;

            offsetXP = (offsetX / progressWidth) * 100;
            time = Math.round((duration / progressWidth) * offsetX);
        }

        function move(e) {
            $$.log(e.type);
            calc(e);
            update();
        }

        function update() {
            $seeker.css({left: offsetXP + "%"});
        }

        $seeker.on("mousedown vmousedown", down);
        $progress.css('cursor', 'pointer').on("mousedown vmousedown", down);

        $playerProxy.on("playing", function() {
            setTimeout(function() {
                context.seeking = false;
            }, 2000);
        });

        return this;
    };

    function setupVideoSeeker() {
        if (videoSeeker)
            return;

        $context.duration = player.duration;

        videoSeeker = new seeker({
            seeker: $containerSeekerProgress,
            duration: player.duration,
            onSeek: function(pos) {
                seek((pos > player.duration) ? player.duration : pos);
            }
        });
    }

    function setupVolumeSeeker() {
        if (volumeSeeker || !$containerVolume)
            return;

        volumeSeeker = new seeker({
            seeker: $containerSeekerVolume,
            duration: 100,
            onSeek: function(pos) {
                player.volume = (pos > 100) ? 1 : pos / 100;
            }
        });
    }

    function showBigButton($button) {
        preloader.stop();
        hideBigButtons();
        $button.show();
        $containerBigButtons.show();
    }

    function hideBigButtons() {
        preloader.stop();
        $containerBigButtons.find("*:not(." + prefixStyle + "big-buttons-bg)").hide();
        $containerBigButtons.hide();
    }

    function showButton($button) {
        $button.parent().find("*").hide();
        $button.show();
    }

    function captureEvent(event) {
        event.preventDefault();
        event.stopPropagation();

        var eventType = event.type;

        $$.log(eventType);

        if (eventType == "pause" && player.duration && player.duration - player.currentTime < 1)
            eventType = "ended";

        $context.trigger(eventType);

        playerReady = true;

        switch (event.type) {
            case "loadstart": {

                hideControlBar();
                loadedMetaData = false;
                preloader.start();
                $containerWarn.hide();

                var readyTest = setInterval(function()
                {
                    if ((player.networkState == 1 || player.networkState == 2)
                        && !config.preload)
                    {
                        $player.trigger("suspend");
                        clearInterval(readyTest);
                    }
                }, 1000);
            }
                break;
            case "volumechange": {
                volumeChange();
            }
                break;

            case "durationchange":
            case "timeupdate": {
                if ($containerControls) {
                    setupVideoSeeker();
                    timeUpdate();
                }
            }
                break;

            case "canplaythrough": {
                playerReady = true;
                if ($containerControls) {
                    $containerBarLoading.width(100 + "%");
                }
            }
                break;

            case "pause": {
                if ($containerControls) {
                    showBigButton($bigButtonPause);

                    $bigButtonPause.animate({
                        transform: 'scale(1.5)',
                        opacity: 0.1
                    }, {
                        complete: function() {
                            $bigButtonPause.css('opacity', 100);
                            hideBigButtons();
                            showBigButton($bigButtonPlay);
                        }
                    });

                    showButton($buttonPlay);
                }
                else {
                    if ((!$$.detect.device.mobile() && !$$.detect.os.ios()) || !loadedMetaData) {
                        showBigButton($bigButtonPlay);
                    }
                }

                $context.playing = false;
            }
            break;

            case "play": {
                hideBigButtons();

                if ($containerControls) {
                    showButton($buttonPause);
                }

                $context.playing = true;
            }
            break;

            case "stalled": {
                playerReady = true;
                setupVolume();

                if (paused()) {
                    if (config.autoStart)
                        play();

                    showBigButton($bigButtonPlay);
                }

                if (lastTime > -1 || config.autoStart) {
                    play();
                }
            }
                break;

            case "canplay": {
                playerReady = true;
                setupVolume();

                if (paused()) {
                    if (config.autoStart)
                        play();

                    showBigButton($bigButtonPlay);
                }
            }
                break;
            case "suspend": {
                playerReady = true;
                setupVolume();

                if (paused()) {
                    if (config.autoStart)
                        play();

                    if (paused())
                        showBigButton($bigButtonPlay);
                }
            }
                break;

            case "progress": {
                //progress();
            }
                break;

            case "loadedmetadata": {
                playerReady = true;
                loadedMetaData = true;
                setupVolume();

                if ($containerControls) {
                    showControlBar();
                    setupAutoHideControls();
                    setupVideoSeeker();

                    updateTimer = setInterval(function() {
                        timeUpdate();
                        seekerUpdate();
                        progress();
                    }, 100);
                }

                if (paused()) {
                    if (config.autoStart)
                        play();

                    if (paused())
                        showBigButton($bigButtonPlay);
                }

                if (lastTime > -1) {
                    seek(lastTime);
                    lastTime = -1;
                }
            }
                break;

            case "waiting":
            case "seeking": {
                preloader.start();
            }
                break;

            case "click": {
                toggle();
            }
                break;

            case "playing": {
                hideBigButtons();
                $containerPoster.hide();

                if ($containerControls) {
                    showButton($buttonPause);
                }

                $context.playing = true;

                if ($context.playerType == 'flash'){
                    $context.seekrequested = false;
                }
            }
            break;

//            case "abort":
            case "error": {
                clearInterval(updateTimer);
                updateTimer = 0;

                setTimeout(function() {
                    showBigButton($bigButtonWarn);
                    $containerWarn.html(warnMsg).show();
                }, 3000);
            }
                break;

            case "seeked": {
                $context.seekrequested = false;
                preloader.stop();
                play();
            }
                break;

            case "ended": {
                showButton($buttonReplay);
                showBigButton($bigButtonReplay);

                $context.playing = false;
            }
                break;
        }
    }

    function getDefaultVideoUrl() {
        var vs = config.playlist[0].videos;

        for (var key in vs) {
            if (vs.hasOwnProperty(key)) {
                var v = vs[key];

                if (v.isDefault)
                    return v.fileUrl;
            }
        }

        return "";
    }

    function getDefaultPosterUrl() {
        return config.playlist[0].introImage;
    }

    var tcVideo = function() {
        var context = this;
        var htmlOptions = {
            preload: (config.preload) ? "metadata" : "none",
            width: $context.width(),
            height: $context.height(),
            src: getDefaultVideoUrl(),
            id: config.containerId + "mpl"
        };

        if (config.htmlOptions)
            htmlOptions = $.extend(htmlOptions, config.htmlOptions);

        $player = $('<video />').attr(htmlOptions);
        $playerProxy = $player;

        embed($player);

        $.extend(context.__proto__, new function() {
            mediaProps.map(function(prop) {
                $$.getters(context, prop,
                    function() {
                        return $player[0][prop];
                    },
                    function(v) {
                        $player[0][prop] = v;
                    }
                );
            });
        });

        onAll();
        return context;
    };

    var tcFlash = function() {
        var context = this;
        var objId = config.containerId + "mpl";
        var attr = {
            player: config.player || ((config.path || ".") + "/12player.swf"),
            htmlOptions: {
                width: "100%",
                height: "100%",
                id: objId
            },
            flashParams: {
                allowscriptaccess: "always",
                allowmenu: "false",
                allowfullscreen: "true",
                wmode: "opaque"
            },
            flashVars: {
                allowScriptAccess: "always",
                objectId: objId,
                src: getDefaultVideoUrl(),
                preload: (config.preload)  ? "metadata" : "none"
            }
        };

        if (DEBUG)
            attr.flashVars.debug = 'true';

        var htmlOptions = $.extend(attr.htmlOptions, {
            "type": "application/x-shockwave-flash",
            "data": attr.player
        });

        if (config.htmlOptions)
            $.extend(htmlOptions, config.htmlOptions);

        var flashParams = attr.flashParams;

        if (config.flashParams)
            $.extend(flashParams, config.flashParams);

        if ($$.detect.browser.ie())
            flashParams.movie = attr.player;

        flashParams.flashvars = $$.cast.toFlashvarsString(attr.flashVars);

        if (config.flashVars)
            $.extend(attr.flashVars, config.flashVars);

        var obj = "<object " + $$.cast.toHtmlString(htmlOptions) + " >" +
            $$.cast.toObjectParamVars(flashParams) +
            "</object>"
            ;

        $player = $(obj);

        $.each("play,pause,load,resume,stop,abort,endOfStream".split(","),
            function(key, fn) {
            $player[0][fn] = function() {
                $player[0]["_" + fn]();
            };
        });

        $playerProxy = $("<i />");

        var f = new function() {
            $.each(mediaProps, function( key, prop ) {
                $$.getters(context, prop,
                    function() {
                        try {
                            return $player[0]._getProperty(prop);
                        }
                        catch (e) {
                            console.error(e, prop);
                            return null;
                        }
                    },
                    function(v) {
                        $player[0]._setProperty(prop, v);
                    }
                );
            });
        };

        $.extend(context.__proto__, f);
        $.extend($player[0].__proto__, f);

        embed($player);

        window[objId + "_EV"] = function(eventName) {
            try {
                $playerProxy.trigger(eventName);
            }
            catch(e) {
                $$.log(e);
            }
        };

        window[objId + "_ER"] = function(error) {
            $playerProxy.trigger("error");
        };

        onAll();
        return context;
    };

    function htmlDiv(className, isShow) {
        var $div = $("<div />");

        if (typeof className == 'string')
            $div.addClass(className);

        if (isShow)
            $div.show();
        else
            $div.hide();

        return $div;
    }

    function htmlIco(className, isShow) {
        return htmlDiv(prefixIcoStyle + className, isShow);
    }

    function htmlPrefDiv(className, isShow) {
        return htmlDiv(prefixStyle + className, isShow);
    }

    function stopBubbles(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function bigButtonControl() {
        $containerBigButtons = htmlPrefDiv("big-buttons")
            .append([
                $bigButtonPlay = htmlIco("play"),
                $bigButtonReplay = htmlIco("spinner"),
                $bigButtonWarn = htmlIco("warning"),
                $bigButtonLoader = htmlIco("loader1-00"),
                $bigButtonPause = htmlIco("pause"),
                htmlPrefDiv("big-buttons-bg", true)
            ]);

        $containerBigButtons.find("*").click(stopBubbles);
        $containerBigButtons.click(stopBubbles);

        return $containerBigButtons;
    }

    function volumeControl() {
        return htmlPrefDiv("volume-control", true)
            .append(
                $containerBarVolume = htmlPrefDiv("volume-control-bar", true) //seeker
                    .append(
                        $containerVolumeProgress = htmlPrefDiv("bar-container", true)
                            .append([
                                $containerVolume = htmlPrefDiv("bar-bg", true),
                                $containerBarVolumeProgress = htmlPrefDiv("progress-bar", true),
                                $containerSeekerVolume = htmlPrefDiv("seeker", true)
                                    .append(
                                        htmlPrefDiv("seeker-bg", true)
                                    )
                            ])
                    ),
                htmlPrefDiv("volume-control-icon", true)
                    .append([
                        $buttonVolumeLow = htmlIco("volume-low", true),
                        $buttonVolumeMedium = htmlIco("volume-medium"),
                        $buttonVolumeHigh = htmlIco("volume-high")
                    ])
            );
    }

    function controls() {
        var isMobile = $$.detect.device.mobile() || ($$.window.innerWidth || $$.window.screen.width) <= 480;
        var isTablet = $$.detect.device.tablet() || ($$.window.innerWidth || $$.window.screen.width) <= 1024;

        if (isMobile || !config.preload)
            $containerWatermark.css("margin-bottom", 0);

        if (isMobile && ($$.detect.os.win() || $$.detect.os.ios()))
            return bigButtonControl();

        var $volumeControl = (isTablet) ? null : volumeControl();

        var cs = [
            bigButtonControl(),
            $containerControls = htmlPrefDiv("tools")
                .append([
                    htmlPrefDiv("tools-background", true),
                    htmlPrefDiv("toolbar", true)
                        .append([
                            htmlPrefDiv("playback", true)
                                .append([
                                    $buttonPlay = htmlIco("play", true),
                                    $buttonPause = htmlIco("pause"),
                                    $buttonStop = htmlIco("stop"),
                                    $buttonReplay = htmlIco("spinner")
                                ]),
                            htmlPrefDiv("screen-mode", true)
                                .append([
                                    $buttonFullScreen = htmlIco("expand", true),
                                    $buttonCancelFullScreen = htmlIco("contract", false)
                                ])
                            , $containerHq = htmlPrefDiv("quality-settings", true)
                                .append(
                                    $buttonChangeHq = htmlIco("cog", true)
                                ),
                            $volumeControl,
                            htmlPrefDiv("timing", true)
                                .append([
                                    $containerTimeElapsed = htmlPrefDiv("time-elapsed", true),
                                    $containerTimeDuration = htmlPrefDiv("time-duration"),
                                    $containerTimeCurrent = htmlPrefDiv("time-current")
                                ]),
                            $containerBarStatus = htmlPrefDiv("status-bar", true) //seeker
                                .append(
                                    $containerProgress = htmlPrefDiv("bar-container", true)
                                        .append([
                                            htmlPrefDiv("bar-bg", true),
                                            $containerBarLoading = htmlPrefDiv("loading-bar", true),
                                            $containerBarProgress = htmlPrefDiv("progress-bar", true),
                                            $containerSeekerProgress = htmlPrefDiv("seeker", true)
                                                .append(
                                                    htmlPrefDiv("seeker-bg", true)
                                                )
                                        ])
                                )
                        ])
                ])
        ];

        $containerControls.click(stopBubbles);
        $containerControls.find("*").click(stopBubbles);

        return cs;
    }

    //auto hide controls
    function setupAutoHideControls() {
        if (!config.hideControls)
            return;

        var start = $$.date.now.timestamp();
        var timer = 0;

        setInterval(function() {
            if (!isFullScreen() || $$.date.now.timestamp() - start < 3000)
                return;

            hideControlBar();
        }, 1000);

        $containerBox.hover(
            function() {
                clearTimeout(timer);
                timer = 0;
                showControlBar();
            },
            function() {//out
                timer = setTimeout(function() {
                    hideControlBar();
                }, 1000);
            }
        );

        $containerBox.on("mousemove vmousemove", function() {
            start = $$.date.now.timestamp();
            showControlBar();
        });
    }

    function isShow($o) {
        return !($o.css("display") == "none" || !$o.hasClass(prefixStyle + "show"));
    }

    function showControlBar() {
        if (!$containerControls || isShow($containerControls))
            return;

        $containerControls.slideDown("slow");
        $containerWatermark.css("margin-bottom", '3em');
    }

    function hideControlBar() {
        if (!$containerControls || isShow($containerControls))
            return;

        $containerControls.slideUp("slow");
        $containerWatermark.css("margin-bottom", 0);
    }

    //init()
    {
        var $ = $tc || $;
        var $$ = $.tcEx;
        var $context = $(this);
        $context.play = play;
        $context.pause = pause;
        $context.stop = stop;
        $context.toggleWatermark = toggleWatermark;
        $context.name = "12traff";
        $context.version = "2.04";
        $context.duration = 0;
        $context.currentTime = 0;
        $context.playing = false;
        $context.playerType = 'html5';
        config = config || {};
        config.preload = $$.cast.toBoolean(config.preload);
        config.autoStart = $$.cast.toBoolean(config.autoStart);
        var path = config.path || ".";
        var loadedMetaData, playerReady = false;
        var updateTimer = 0;
        var player = null;
        var $player = null;
        var prefixStyle = 'h5vp-';
        var prefixIcoStyle = prefixStyle + 'icon-';
        var $playerProxy = null;
        var doc = config.frameId ? window.top.document : document;
        var mediaProps = ["error", "src", "currentSrc", "crossOrigin", "networkState", "preload", "buffered",
            "readyState", "seeking", "currentTime", "duration","paused", "defaultPlaybackRate", "playbackRate",
            "played", "seekable", "ended", "autoplay", "loop", "mediaGroup", "controller", "controls", "volume",
            "muted", "defaultMuted", "audioTracks", "videoTracks", "textTracks", "width", "height", "videoWidth",
            "videoHeight", "poster",
        /**/"eventProxyFunction", "errorEventProxyFunction"
        ];
        var mediaEvents = ["loadstart", /*"progress",*/ "suspend", "abort", "error", "emptied", "stalled", "loadedmetadata",
            "loadeddata", "canplay", "canplaythrough", "playing", "waiting", "seeking", "seeked", "ended",
            "durationchange", /*"timeupdate"*/, "play", "pause", "ratechange", "resize", "volumechange", "load", "click"
        ];

        var timerElapsedMin,
            timerElapsedSec,
            timerCurrentMin,
            timerCurrentSec,

            $containerTimeElapsed,
            $containerTimeDuration,
            $containerTimeCurrent,

            lastTime = -1
            ;

        var $containerFsbox = htmlPrefDiv("fsbox", true),
            $containerBox = htmlPrefDiv("box", true),
            $containerWarn = htmlPrefDiv("errorbox"),
            $containerPoster = htmlPrefDiv("poster"),
            $containerWatermark = htmlPrefDiv("watermark", false);

        var videoSeeker,
            volumeSeeker,

            $containerControls,
            $containerBigButtons,
            $containerProgress,
            $containerVolumeProgress,
            $containerVolume,
            $containerHq,
            $containerHqMenu,
            $containerBarVolume,
            $containerBarLoading,
            $containerBarProgress,
            $containerBarStatus,
            $containerBarVolumeProgress,
            $containerSeekerProgress,
            $containerSeekerVolume,

            $bigButtonPlay,
            $bigButtonPause,
            $bigButtonLoader,
            $bigButtonWarn,
            $bigButtonReplay,

            $buttonPlay,
            $buttonPause,
            $buttonStop,
            $buttonReplay,
            $buttonFullScreen,
            $buttonCancelFullScreen,
            $buttonChangeHq,
            $buttonVolumeLow,
            $buttonVolumeMedium,
            $buttonVolumeHigh = null;

        $containerBox.append($containerWarn, $containerPoster, $containerWatermark);
        $containerFsbox.append($containerBox);

        var warnMsg = "Video is temporarily unavailable or is removed. Try see again.";

        if (!window.h5vp) {

            if ($$.detect)
                window.h5vp = true;

            if (!config.frameId)
            {
                $$.loadCss(path + '/skin/tcdark/css/normalise.min.css');
                $$.loadCss(path + '/skin/tcdark/css/font.css');
                $$.loadCss(path + '/skin/tcdark/css/main.css');
            }
            else
            {
                //styles needs for the parent document
                var css = "." + prefixStyle + "body{" +
                    "position: absolute;" +
                    "height: 100% !important;" +
                    "width: 100% !important;" +
                    "overflow: hidden;" +
                    "visibility: hidden;" +
                    "}";
                css += "." + prefixStyle + "fullscreen{" +
                    "position: fixed !important;" +
                    "width: 100% !important;" +
                    "height: 100% !important;" +
                    "top: 0;" +
                    "left: 0;" +
                    "right: 0;" +
                    "bottom: 0;" +
                    "z-index: 10000;" +
                    "visibility: visible;" +
                    "}";
                $$.appendCss(css, doc);
            }

            $$.dict.addRange({
                "This video requires the Flash Player": "Это видео требует установки Flash player",
                "Download Flash Player": "Скачать Flash Player",
                "Already have Flash Player": "Flash Player уже установлен",
                "Reload the page": "Перезагрузить эту страницу"
            });

            warnMsg = config.error ||
                $$.dict.add(warnMsg, "Видео временно недоступно или удалено. Попробуйте посмотреть позже.");
        }

        if ($$.detect.browser.ie() && document.documentMode < 8) {
            embedInstall(); //@todo update your browser
        } else {
            var defUrl = getDefaultVideoUrl();
            var isFlash = $$.flash.has(9, 1, 24),
                 isVideo = $$.video.has("h264"),
                 defaultPlayer = config.defaultPlayer || "auto",
                 isFlv = defUrl.indexOf(".flv") > -1,
                 isRtmp = defUrl.indexOf("rtmp://") > -1;

            if ((defaultPlayer == "html5" || (isVideo && defaultPlayer != "flash")) && isVideo && !isFlv && !isRtmp) {
                player = new tcVideo();
            } else if (isFlash) {
                $context.playerType = 'flash';
                player = new tcFlash();
            }
            else {
                embedInstall();
            }
        }
    }

    return $context;
};