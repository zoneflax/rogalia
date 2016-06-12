"use strict";

T.time = function(time) {
    var txt = "";
    var minutes = time / 60 | 0;

    function num(number, titles)
    {
        var cases = [2, 0, 1, 1, 1, 2];
        return titles[ (number%100>4 && number%100<20) ? 2 : cases[(number%10<5)?number%10:5] ];
    }

    if (minutes) {
        txt = minutes + " ";
        txt += num(minutes, ["минуту", "минуты", "минут"]);
    }
    var seconds = time % 60;
    if (seconds) {
        if (minutes)
            txt += " ";
        txt += seconds + " ";
        txt += num(seconds, ["секунду", "секунды", "секунд"]);
    }
    return txt;

};
