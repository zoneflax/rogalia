/* global Quest */

Quest.quests =  {
    "tutorial-start": {
        name: "Tuition start",
        voice: true,
        desc: [
            "Hello, settler.",
            "Everyone who arrives here gets my Academy. My job here is to teach you survival basics.",
            "You will receive: <i>3000 exp and 4 gold</i>.",
        ],
        final: "Great, let's begin. Remember: <i>wild beasts won't attack you 'till you get 10 level, and your bag will stay with you after death.</i>",
    },
    "craft-1": {
        name: "Picking resources",
        voice: true,
        desc: "You need some tools to survive this wild lands; and for tools you need resources. Pick four stones, two boughs and a branch.",
        tip: "Right click on a tree and pick <rmb>Get a bough/a branch</rmb>. Right click and <rmb>Break</rmb> on a bough gives a stick, and breaking a branch gives a twig. Pick stones from the ground <lmb></lmb>.",
    },
    "craft-2": {
        voice: true,
        name: "Making a knife",
        desc: "All right, everything is gathered. With all of these, you have to craft a  knife.",
        tip: "<lmb></lmb> on a quest item opens a craft dialog and finds the recipe. <lmb></lmb> on an ingredient will find it in the craft list.",
    },
    "craft-3": {
        voice: true,
        name: "Making a weapon",
        desc: "Ok, now we are going to craft a sharp stick — your first weapon.",
    },
    "stat-1": {
        voice: true,
        name:  "Thirst",
        desc: "Now I shall teach you to obtain food and water. You'll find a small water source in the next room. Rip off some bark from a tree and make yourself a mug, then fill it with water from that source. Don't worry, the water is clean here.",
        tip: "<rmb>Drink</rmb> on a mug will increase your stamina. <br>You should stay in a shallow water to fill a mug.<br> Click on your avatar in the upper left corner to get character's data.",
    },
    "stat-2": {
        voice: true,
        name: "Hunger",
        desc: "It's the time to get some food and have it. Kill a chicken and gut it, or pick some apples from a tree. Be careful, don't eat more you need, otherwise, food won't help you with vitamins. You need vitamins to improve your stats and skills. By the way, if you've overate, use the toilet next to me.",
        tip: "Vitamins amount displays in the \"Stats\" dialog. You cannot level your skill upper than the stat related to it. You shall also check your skill level in the \"Skills\" dialog. New skills levels open with your learning points.",
    },
    "fight": {
        voice: true,
        name: "Fight and fighting combos",
        desc: "Well, I see you prepared for your first fight. You'll find a combat mannequin in the next room. Take your sharp stick in the right hand and hit it.",
        tip: "You should take the sharp stick in the right (upper) hand. The fight commands are grouped at the panel below. The best effect reached when using fight combos, like 3-2-1-1 and others. The biggest button at the panel shows a possible action with the item in your hand.",
    },
    "dead": {
        voice: true,
        name: "Death",
        desc: "Great! If you attack the enemy who is stronger than you or aggressive beast follows you, you will hardly run away and possibly die. But death only means you lose all your vitamins, learning points and all your gear and stuff. You will spawn next to your spawn stone or, if you don't have one, in the town. If you want to contest your fighting abilities, talk to Diego, he can lead you to the hunting places for a modest fee. Also you can fight other people at the arena with no fines for death and murder.",

    },
    "claim": {
        voice: true,
        name: "Your claim is your fortress",
        desc: "Anyone can attack you. You need to build a claim to keep your property. With a claim, you will protect a tiny patch of land on which you can build and garden with no fear of being robbed or attacked. You may obtain a claim license from Charles for 8 gold.",
        tip: "Experience gained when you craft items and kill enemies. Some enemies loot money; you may also trade stuff in the town.",
    },
    "finish": {
        voice: true,
        name: "The end of tuition",
        desc: "Well, I did my job. It's time to move to the town.",
    },
    "in-city": {
        voice: true,
        name: "To the town",
        desc: [
            "Look around the town.",
            "Check the bargain house, you may trade your stuff there. You better keep money in the bank; and you can pay for your claim from your account.",
            "Our pub can offer you drinks, food and some kinds of chance games. Ah, yeah, go visit Margo, she's amazing.",
            "At the Craftsmantown you can buy stuff you cannot craft. Arena and Church are near the Bank.",
            "Also, you can find portals through which you will get to a random wild lands. Build a respawn stone to return to town. Well, good luck!",
        ],
        tip: "If you consider to build more than 1 respawn set the one you will spawn next to. <rmb></rmb> on respawn and pick \"Set the spawn\"",
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
    "chrismas-decoration-daily-1": {
        name: "Decoration (daily)",
        desc: "Help Santa's daughter make some paper decorations",
    },
    "chrismas-decoration-daily-2": {
        name: "Glass decoration (daily)",
        desc: "Help Santa's daughter make some glass decorations",
    },
    "buy-small-indulgence": {
        name: "Small indulgence",
        desc: "..",
        customReward: "+100 Karma",
    },
    "buy-average-indulgence": {
        name: "Average indulgence",
        desc: ".."
    },
    "buy-big-indulgence": {
        name: "Big indulgence",
        desc: ".."
    }
};
