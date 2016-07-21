"use strict";

function Quests() {
    return {
        "tutorial-start": {
            name: {
                "en": "Tuition start",
                "ru": "Начало обучения"
            },
            desc: {
                "en": [
                    "Hello, settler.",
                    "Everyone who arrives here gets my Academy. My job here is to teach you survival basics.",
                    "You will receive: <i>3000 exp and 4 gold</i>.",
                ],
                "ru": [
                    "Здравствуй, поселенец.",
                    "Всякий, кто прибывает в эти земли, сначала попадает сюда, в мою Академию. Здесь я обучу тебя основам выживания.",
                    "По завершению ты получишь награду: <i>3000 опыта и 4 золотых монеты</i>.",
                    // "Если ты решишь уйти сейчас, дело твое, но помни, что ты лишишься всех преимуществ ученика, и выжить тебе будет очень сложно.",
                ],
            },
            final: {
                "en": "Great, let's begin. Remember: <i>wild beasts won't attack you 'till you get 10 level, and your bag will stay with you after death.</i>",
                "ru": "Отлично, приступим. Запоминай: <i>до 10 уровня на тебя не нападут дикие животные, а при смерти ты останешься со своей сумкой.</i>",
            },
        },
        "craft-1": {
            name: {
                "en": "Picking resources",
                "ru": "Сбор ресурсов",
            },
            desc: {
                "en": "You need some tools to survive this wild lands; and for tools you need resources. Pick four stones, two boughs and a branch.",
                "ru": "Для выживания в этих диких землях тебе необходимы инструменты, а чтобы их создать, нужны ресурсы. Собери четыре камня, два сучка и веточку.",
            },
            tip: {
                "en": "Right click on a tree and pick <rmb>Get a bough/a branch</rmb>. Right click and <rmb>Break</rmb> on a bough gives a stick, and breaking a branch gives a twig. Pick stones from the ground <lmb></lmb>.",
                "ru": "По дереву: <rmb>Сорвать ветку/сук</rmb>.<br><rmb>сломать</rmb> по суку даст палку, а из ветки выйдет прутик.<br>Собрать камни с земли <lmb></lmb>.",
            },
            final: {
                "en": "",
                "ru": "",
            },
        },
        "craft-2": {
            name: {
                "en": "Making a knife",
                "ru": "Делаем нож",
            },
            desc: {
                "en": "All right, everything is gathered. With all of these, you have to craft a  knife.",
                "ru": "Отлично, все необходимое собрано. Из этого всего тебе нужно сделать нож.",
            },
            tip: {
                "en": "<lmb></lmb> on a quest item opens a craft dialog and finds the recipe. <lmb></lmb> on an ingredient will find it in the craft list.",
                "ru": "<lmb></lmb> по иконке квестового предмета откроет окно крафта и найдет нужный рецепт. <lmb></lmb> по ингредиенту найдет его в списке крафта.",
            },
            final: {
                "en": "",
                "ru": "",
            },
        },
        "craft-3": {
            name: {
                "en": "Making a weapon",
                "ru": "Делаем оружие",
            },
            desc: {
                "en": "Ok, now we are going to craft a sharp stick — your first weapon.",
                "ru": "Ок, теперь будем крафтить острую палку — твое первое оружие.",
            },
            final: {
                "en": "",
                "ru": "",
            },
        },
        "stat-1": {
            name: {
                "en": "Thirst",
                "ru": "Жажда",
            },
            desc: {
                "en": "Now I shall teach you to obtain food and water. You'll find a small water source in the next room. Rip off some bark from a tree and make yourself a mug, then fill it with water from that source. Don't worry, the water is clean here.",
                "ru": "Теперь я научу тебя, как добывать еду и воду. В следующей комнате ты найдешь небольшой водоем. Сорви кору с дерева и сделай кружку, затем наполни ее водой из источника. Не волнуйся, вода здесь чистая.",
            },
            tip: {
                "en": "<rmb>Drink</rmb> on a mug will increase your stamina. <br>You should stay in a shallow water to fill a mug.<br> Click on your avatar in the upper left corner to get character's data.",
                "ru": "<rmb>Пить</rmb> по кружке увеличит вашу выносливость. <br>Чтобы наполнить кружку, встаньте в мелкую воду.<br>Чтобы получить информацию по персонажу, кликните по иконке персонажа в верхнем левом углу.",
            },
            final: {
                "en": "",
                "ru": "",
            },
        },
        "stat-2": {
            name: {
                "en": "Hunger",
                "ru": "Голод",
            },
            desc: {
                "en": "It's the time to get some food and have it. Kill a chicken and gut it, or pick some apples from a tree. Be careful, don't eat more you need, otherwise, food won't help you with vitamins. You need vitamins to improve your stats and skills. By the way, if you've overate, use the toilet next to me.",
                "ru": "Самое время добыть еды и поесть. Убей и разделай курицу, либо нарви яблок с дерева. Будь внимателен, не переедай, иначе еда не принесет тебе пользы в виде витаминов. Витамины нужны для улучшения твоих характеристик, а характеристики влияют на твои навыки. Если ты вдруг переел, туалет тут рядом, воспользуйся им. ",
            },
            tip: {
                "en": "Vitamins amount displays in the \"Stats\" dialog. You cannot level your skill upper than the stat related to it. You shall also check your skill level in the \"Skills\" dialog. New skills levels open with your learning points.",
                "ru": "Информация по витаминам в окне \"Характеристики\". Навык невозможно повысить выше связанного с ним стата. При это надо следить за уровнем навыка в окне \"Навыки\". Изучаются навыки при помощи очков опыта.",
            },
            final: {
                "en": "",
                "ru": "",
            },
        },
        "fight": {
            name: {
                "en": "Fight and fighting combos",
                "ru": "Бой и боевые комбинации",
            },
            desc: {
                "en": "Well, I see you prepared for your first fight. You'll find a combat mannequin in the next room. Take your sharp stick in the right hand and hit it.",
                "ru": "Вот ты и готов к своему первому бою. В следующей комнате стоит боевой менекен. Возьми в правую руку свою острую палку и ударь его.",
            },
            tip: {
                "en": "You should take the sharp stick in the right (upper) hand. The fight commands are grouped at the panel below. The best effect reached when using fight combos, like 3-2-1-1 and others. The biggest button at the panel shows a possible action with the item in your hand.",
                "ru": [
                    "Острую палку нужно поместить в правую (верхнюю) руку персонажа. На панели внизу приведены кнопки боя, но эффективнее использовать боевые комбинации. Например, 3-2-1, 1. Есть и другие комбо. Большая кнопка на нижней панели отражает возможное действие с предметом в руках.",
                ],
            },
            final: {
                "en": "",
                "ru": "",
            },
        },
        "dead": {
            name: {
                "en": "Death",
                "ru": "Смерть",
            },
            desc: {
                "en": "Great! If you attack the enemy who is stronger than you or aggressive beast follows you, you will hardly run away and possibly die. But death only means you lose all your vitamins, learning points and all your gear and stuff. You will spawn next to your spawn stone or, if you don't have one, in the town. If you want to contest your fighting abilities, talk to Diego, he can lead you to the hunting places for a modest fee. Also you can fight other people at the arena with no fines for death and murder.",
                "ru": "Отлично! Если ты нападешь на противника, а он окажется сильнее тебя, либо на тебя побежит агрессивное животное, то вряд ли у тебя выйдет убежать на своих двоих и ты умрешь. Но тут смерть значит лишь потерю витаминов, что накопились в твоем организме, небольшая амнезия, из-за которой ты потеряешь опыт, а так же свои вещи. Оживешь ты около своего респауна или в городе. Если хочешь проверить свои силы, можешь поговорить с Диего, он наверняка знает места, где собираются коты и может тебя отвести за скромную плату. А с другими игроками ты можешь сразиться на арене, не получив при этом штрафов за смерть и убийство.",
            },
            final: {
                "en": "",
                "ru": "",
            },
        },
        "claim": {
            name: {
                "en": "Your claim is your fortress",
                "ru": "Клейм - твоя крепость",
            },
            desc: {
                "en": "Anyone can attack you. You need to build a claim to keep your property. With a claim, you will protect a tiny patch of land on which you can build and garden with no fear of being robbed or attacked. If you're 10 lvl and higher, you may obtain a claim license from Charles for 8 gold.",
                "ru": "Помимо всего, на тебя может напасть и другой человек. Чтобы не потерять нажитое тобой имущество, тебе необходимо построить клейм. С его помощью ты оградишь для себя небольшой участок, на нем можно строить, возделывать землю, не боясь, что на тебя нападут или украдут все нажитое. Лицензию на клейм ты можешь получить у Чарльза за 8 золотых, когда достигнешь 10 уровня.",
            },
            tip: {
                "en": "Experience gained when you craft items and kill enemies. Some enemies loot money; you may also trade stuff in the town.",
                "ru": "Опыт накапливается при создании предметов и при убийствах противников. Монеты падают с некоторых противников, а так же можно продать ресурсы на Рынке в городе.",
            },
            final: {
                "en": "",
                "ru": "",
            },
        },
        "finish": {
            name: {
                "en": "The end of tuition",
                "ru": "Конец обучения",
            },
            desc: {
                "en": "Well, I did my job. It's time to move to the town.",
                "ru": "Ну вот я и обучил тебя основам выживания в этих землях. Пора отправляться в город.",
            },
            final: {
                "en": "",
                "ru": "",
            },
        },
        "in-city": {
            name: {
                "en": "To the town",
                "ru": "В город",
            },
            desc: {
                "en": [
                    "Look around the town.",
                    "Check the bargain house, you may trade your stuff there. You better keep money in the bank; and you can pay for your claim from your account.",
                    "Our pub can offer you drinks, food and some kinds of chance games. Ah, yeah, go visit Margo, she's amazing.",
                    "At the Craftsmantown you can buy stuff you cannot craft. Arena and Church are near the Bank.",
                    "Also, you can find portals through which you will get to a random wild lands. Build a respawn stone to return to town. Well, good luck!",
                ],
                "ru": [
                    "Осмотрись в городе.",
                    "Загляни на Рынок, там ты сможешь продать легкодобываемые ресурсы. Деньги лучше хранить в Банке, там же можно и оплатить свой клейм.",
                    "В Таверне ты сможешь перекусить, выпить, а так же сыграть в азартные игры. Ах да, и с Марго познакомься, удивительная девушка.",
                    "В Квартале ремесленников можно приобрести ресурсы, которые вряд ли ты сможешь сделать на данный момент. Тут же Арена и Церковь.",
                    "Помимо этого, в городе есть порталы, с помощью которых ты попадешь в дикие земли. В город можно вернуться, построив респаун. Ну что ж, в добрый путь!",
                ]
            },
            tip: {
                "en": "If you consider to build more than 1 respawn set the one you will spawn next to. <rmb></rmb> on respawn and pick \"Set the spawn\"",
                "ru": "При построении нескольких респаунов следует отмечать тот, на который нужно будет вернуться через ПКМ по респауну -> Назначить место возрождения.",
            },
            final: {
                "en": "",
                "ru": "",
            },
        },



        "faction-daily-1": {
            name: {
                "en": "Help your fraction (daily)",
                "ru": "Помощь фракции (ежедневный)",
            },
            desc: {
                "en": "Increase your status within the fraction",
                "ru": "Повысить статус внутри фракции",
            },
            final: {
                "en": "",
                "ru": "",
            },
        },
        "garland-daily": {
            name: {
                "en": "Garland (daily)",
                "ru": "Гирлянда (ежедневный)",
            },
            desc: {
                "en": "Help Santa to make a garland",
                "ru": "Помоги деду морозу сделать гирлянду",
            },
            final: {
                "en": "",
                "ru": "",
            },
        },
        "chrismas-flags-daily": {
            name: {
                "en": "Flags (daily)",
                "ru": "Флажки (ежедневный)",
            },
            desc: {
                "en": "Help Santa to make some paper flags",
                "ru": "Помоги Деду Морозу сделать бумажные флажки",
            },
            final: {
                "en": "",
                "ru": "",
            },
        },
        "chrismas-decoration-daily-1": {
            name: {
                "en": "Decoration (daily)",
                "ru": "Бумажные украшения (ежедневный)",
            },
            desc: {
                "en": "Help Santa's daughter make some paper decorations",
                "ru": "Помоги Снегурочке сделать бумажные украшения",
            },
            final: {
                "en": "",
                "ru": "",
            },
        },
        "chrismas-decoration-daily-2": {
            name: {
                "en": "Glass decoration (daily)",
                "ru": "Стеклянные украшения (ежедневный)",
            },
            desc: {
                "en": "Help Santa's daughter make some glass decorations",
                "ru": "Помоги Снегурочке сделать стеклянные украшения",
            },
            final: {
                "en": "",
                "ru": "",
            },
        },
    };
};
