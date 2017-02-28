/* global Quest */

Quest.quests =  {
    "tutorial-start": {
        name: "Tutorial start",
        desc: [
            "Hello, settler.",
            "Everyone who arrives here gets my Academy. My job here is to teach you survival basics.",
        ],
        final: "Great, let's begin.",
    },
    "craft-1": {
        name: "Picking resources",
        desc: "You need some tools to survive this wild lands; and for tools you need resources. Pick four stones, two boughs and a branch.",
        tip: "<rmb>Get bough</rmb> and <rmb>Get branch</rmb> on a tree.<br><lmb></lmb> on a stone to pick it up from the ground.",
    },
    "craft-1-2": {
        name: "Making a knife handle",
        desc: "Now make sticks from the boughs and twigs from the branches. We will use them to make a handle.",
        tip: "<rmb>Break off</rmb> on a bough gives a stick, the same for a branch gives a twig.",
    },
    "craft-2": {
        name: "Making a knife blade",
        desc: "The knife should has a blade. Try to make it from the sharp stones.",
        tip: "<lmb></lmb> on the sharp stone icon.<br>Move stones into the recipe and press <hl>Create</hl>",
    },
    "craft-2-1": {
        name:  "Making a knife",
        desc: "Perfect, everything is ready. Finally let's make a knife.",
        tip: "To simplify things you can click on the <hl>Auto</hl> button and then <hl>Create</hl>",
    },
    "craft-3": {
        name: "Making a weapon",
        desc: "Good, now let's craft a sharp stick — your first weapon. You will need it later.",
    },
    "stat-1": {
        name: "Thirst",
        desc: "Now I shall teach you how to obtain food and water.<br>Rip off some bark from a tree and make a mug. Then fill it with water. Don't worry, the water is clean here.",
        tip: "Go into a water and <rmb>Fill</rmb> on a mug.<br><rmb>Drink</rmb> will increase your stamina.",
    },
    "stat-2": {
        name: "Hunger",
        desc: "It's the time to get some food. Pick some apples from a tree. Be careful, don't eat more then you need, otherwise, food won't give you vitamins and you become very slow. By the way, if you've overate, use the toilet next to me.",
    },
    "fight": {
        name: "Fight and fighting combos",
        desc: "Well, I see you prepared for your first fight.<br>Equip your sharp stick and hit a training dummy.",
        tip: "Attack will follow the mouse pointer.<br>Skill buttons and hotkeys can be found in the bottom panel.",
    },
    "finish": {
        name: "The end of tutorial",
        desc: "Well, I did my job.",
        final: "It's time to move to the town."
    },
    "tp-return-home": {
        name: "Teleportation: return to home" ,
        desc: "Are you interested in portals? I'll tell you about the ways you travel around the world.<br> While you're on the surface and under the Synode protection you can easily return to your homestead. I mean, to your respawn stone, if you built one, or to the town. Give it a try.",
        "tip": "<rmb>Click on your picture (see left top part of the screen)</rmb> to return to your home.",
    },
    "tp-respawn": {
        name: "Teleportation: respawn",
        desc: "Town respawn stones are connected to your respawn stone.<br> You can travel using a respawn stone but its primary task is to ressurect you after death. When you build your own respawn stone you'll notice it's looks different from others.",
        tip: "<lmb></lmb> on the closest respawn."
    },
    "tp-scrolls": {
        name: "Teleportation: scrolls",
        desc: "Teleportation scrolls allow you to return home from the very dangerous places. They make a good help when you're exploring underground levels.<br>I'll give you a couple but you can buy or make them yourself.",
    },
    "faction-daily-1": {
        name: "Help your faction (daily)",
        desc: "Increase your status within the faction",
    },
    "garland-daily": {
        name: "Garland (daily)",
        desc: "Help Santa to make a garland",
    },
    "chrismas-flags-daily": {
        name: "Flags (daily)",
        desc: "Help Santa to make some paper flags",
    },
    "chrismas-decoration-daily-2": {
        name: "Decoration (daily)",
        desc: "Help Santa's daughter make some paper decorations",
    },
    "chrismas-decoration-daily-1": {
        name: "Glass decoration (daily)",
        desc: "Help Santa's daughter make some glass decorations",
    },
    "chrismas": {
        name: "Christmas hat",
        desc: "Merry Christmas and Happy New Year! I present you a Christmas Hat!",
        final: "Here is your hat.",
        customReward: "Christmas hat",
    },
    "chrismas-presents": {
        name: "Christmas present (daily).",
        desc: "Finally! Christmas! Do you want a present?",
        final: "Here is your present.",
    },
    "buy-small-indulgence": {
        name: "Small indulgence",
        desc: [
            "You can always make a confession here.",
        ],
        customReward: "+100 Karma",
    },
    "buy-average-indulgence": {
        name: "Average indulgence",
        desc: [
            "You can always make a confession here.",
        ],
        customReward: "+1000 Karma",
    },
    "buy-big-indulgence": {
        name: "Big indulgence",
        desc: [
            "You can always make a confession here.",
        ],
        customReward: "+10000 Karma",
    }
};
