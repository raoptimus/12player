if (!window.tcEmbed) {
    window.tcEmbed = new function() {

        var id = 0;
        var players = {};
        var $ = null;
        var pattern = ["vk.com", "embed", "mp4", "flv", "uppod", "tube", "video", "player", "720p", "480p", "360p", "240p"];

        //-> init
        if (window.tcConfig == undefined)
            return;

        var feedPath = tcConfig.url || "https://12place.com";

        if (typeof $tc == 'undefined')
            loadJs("tc-core.js");

        var waitTc = setInterval(function () {
            if (typeof $tc == 'undefined')
                return;

            $ = $tc;
            clearInterval(waitTc);
            $.ajax({
                type: "GET",
                url: "tc-invideo.js",
                dataType: "script",
                scriptCharset: "utf-8"
            }).done(ready);

        }, 50);
        //<--

        function loadJs(url) {
            var js = document.createElement('script');
            js.type = 'text/javascript';
            js.src = url;
            document.getElementsByTagName('head')[0].appendChild(js);
        }

        function ready() {
            $(document).ready(function() {
                findPlayer();
            });
        }

        function findPlayer() {
            var selector = "iframe, object, embed";
            var parentSelector = "body";

            $(parentSelector).find(selector).each(function() {
                var src = $(this).prop("src") || $(this).prop("data");

                if (!isPlayer(this, src))
                   return;

                id++;
                players[id] = $(this).tcEmbedAds(id, window.tcConfig);
                window['TC_InEmbedOverlay' + id] = function(data) {
                    if (typeof data != 'object' || data.blockId == undefined)
                        return;

                    players[+data.blockId].feeds.overlay.feedLoaded(data);
                };
            });
        }

        function isPlayer(elem, src){
            var $elem = $(elem);

            if ($elem.width() < 320 || $elem.height() < 200)
                return false;

            for (var k = 0; k < pattern.length; k++) {
                if (src.indexOf(pattern[k]) != -1)
                return true;
            }

            return false;
        }
    };
}
