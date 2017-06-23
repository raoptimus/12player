/**
 * Copyright 2014 12player.tv 12traff.com
 */
var $_tc = {
    player: function (options) { //if iframe

        var cnt = document.getElementById(options.containerId);

        var width = 0;
        var height = 0;

        var cntWidth = function() { return cnt.clientWidth; };
        var cntHeight = function() { return cnt.clientHeight; };

        var init = function()
        {
            width = cntWidth();
            height = cntHeight();

            var path = options.path || ".";
            options.debug = options.debug || false;
            window.DEBUG = options.debug;
            var suf = !options.debug ? ".min" : "";
            window[options.containerId + "cfg"] = options;
            options.frameId = options.containerId + "frm";

            var ifr = document.createElement("iframe");
            ifr.frameBorder = 0;
            ifr.scrolling = "no";
            ifr.vspace = 0;
            ifr.hspace = 0;
            ifr.src = "";
            ifr.marginwidth = 0;
            ifr.marginheight = 0;
            //ifr.width = width;
            //ifr.height = height;
            ifr.id = options.frameId;
            ifr.style.width = width + "px";
            ifr.style.height = height + "px";
            ifr.setAttribute("allowfullscreen", "");

            setInterval(function(){
                if (cntWidth() + "px" != ifr.style.width || cntHeight() + "px" != ifr.style.height) {
                    ifr.style.width = cntWidth() + "px";
                    ifr.style.height = cntHeight() + "px";
                }
            }, 300);

            cnt.appendChild(ifr);

            var html = '<!DOCTYPE html>' +
                '<html>' +
                '<head>' +
                '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' +
                '<link href="' + path + '/skin/tcdark/css/normalise.min.css" rel="stylesheet">' +
                '<link href="' + path + '/skin/tcdark/css/font.css" rel="stylesheet">' +
                '<link href="' + path + '/skin/tcdark/css/main.css?19112014" rel="stylesheet">' +
                '<script src="' + path + '/tc-core-custom' + suf + '.js?1" charset="utf-8"></script>' +
                '<script src="' + path + '/tc-tcplayer' + suf + '.js?1" charset="utf-8"></script>';

            if (options.ads) {
                options.ads.debug = options.debug;
                options.ads.containerId = options.containerId;
                options.ads.translate = options.translate;

                html += '<script src="' + (path.indexOf("cdn.12player.tv") > -1 || path.indexOf("12traffic.com") > -1 ? path : "http://cdn.12player.tv/last") + '/tc-player-ads.min.js" charset="utf-8"></script>';
            }

            html += '</head>' +
            '<body>' +
            '<div id="' + options.containerId + '" style="width: '+width+'px; height: '+height+'px"><p style="color: #666; padding: 40px;">Video player loading ...</p></div>' +
            '<script>' +
            'var wait = setInterval(function(){' +
                'window.DEBUG=window.top.DEBUG;' +
                'var options = window.top["' + options.containerId + "cfg" + '"];' +
                'if (typeof $tc != "undefined" && typeof $tc.fn.tcPlayer != "undefined") {' +
                'clearInterval(wait);' +
                'var $ = $tc;' +
                'var $player = $("#" + options.containerId).tcPlayer(options);' +
                'if (options.ads) {' +
                    'var waitAds = setInterval(function(){' +
                        'if (typeof $tc.fn.tcPlayerAds != "undefined") {' +
                            'clearInterval(waitAds);' +
                            '$player.tcPlayerAds(options, $player);' +
                        '}' +
                    '}, 300);' +
                '}' +
                'document.documentElement.addEventListener("click", function(e) { window.top.document.documentElement.dispatchEvent(new MouseEvent("click")); }, false);' +
                'setInterval(function(){' +
                    'if ($("body").width() != $("#" + options.containerId).width() || $("body").height() != $("#" + options.containerId).height()) {' +
                        '$("#" + options.containerId).width($("body").width());' +
                        '$("#" + options.containerId).height($("body").height());' +
                    '}' +
                '}, 300);' +
            '}' +
            '}, 300);' +
            '</script>' +
            '</body>' +
            '</html>';

            setTimeout(function(){
                ifr.contentDocument.write(html);
            }, 100);

            return {};
        };

        if (document.readyState === "complete") {
            init();
        }
        else {
            if (window.addEventListener)
                window.addEventListener("load", init, false);
            else if (window.attachEvent)
                window.attachEvent("onload", init);
            else window.onload = init;
        }
    }
};