function Ads() {
    function updateAds() {
        try {
            var adsence = document.getElementById("adsence");
            adsence.innerHTML = '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-5659182463296220" data-ad-slot="2188089399" data-ad-format="auto"></ins><div id="adsence-explanation">Откуда тут взялась реклама?</div>';
            (adsbygoogle = window.adsbygoogle || []).push({});
            //TODO: memory leak?
            document.getElementById("adsence-explanation").onclick = function() {
                var expl = document.createElement("div");
                expl.innerHTML = "Реклама?! Тут?! Почему?!<br><hr>" +
                    "Очевидно, потому что мне не хватает на яхту! Шютка.<br>" +
                    "На самом деле, скоро в строй вводится новый сервер, да и текущий неплохо бы улучшить.<br>" +
                    "А за железо нужно платить. На данный момент траты составляют 2000 рублей в месяц.<br><br>" +
                    "<img id='ad-jimmy' src='assets/bg/jimmy.jpg'><br>" +
                    "Впрочем, проект в любой момент можно <a href='#' id='ad-donate'>поддержать щедрыми пожертвованиями</a> " +
                    "или <a href='https://vk.com/settings?act=payments' target='_blank'>голосами</a> вконтакте.<br>" +
                    "В качестве благодарности, любому персонажу можно будет выбрать уникальную прическу ;)";
                var p = new Panel("adsence-explanation-panel", "Ты что еврей?!1й", [expl]);
                document.getElementById("ad-donate").onclick = function() {
                    new Donate();
                };
                p.show();
            };
        } catch(e) {
            game.sendErrorf("Ads error: %s", e);
        }
    }
    updateAds();
    setInterval(updateAds, 180000);

}
