"use strict";
function createCharacterStage() {
    var account = document.createElement("div");
    account.className = "lobby-account";
    account.textContent = game.getLogin();

    var name = document.createElement("input");
    name.placeholder = T("Name");


    var male = dom.radioButton("", "sex");
    male.label.className = "new-sex checked";
    male.label.id = "new-male";
    male.checked = true;
    male.onclick = function() {
        male.label.classList.add("checked");
        female.label.classList.remove("checked");
    };

    var female = dom.radioButton("", "sex");
    female.label.className = "new-sex";
    female.label.id = "new-female";
    female.checked = false;
    female.onclick = function() {
        female.label.classList.add("checked");
        male.label.classList.remove("checked");
    };

    var selectedProf = null;

    var tabs = document.createElement("div");
    tabs.className = "profession-tabs";
    var professions = document.createElement("div");
    professions.className = "professions";
    [
        {
            name: "Blacksmith",
	    desc: {
                ru: "Куй железо, пока горячо! Кузнецы Рогалии создают инструменты, что так необходимы всем поселенцам: оружие, доспехи и множество прочих шедевров из металла!",
                en: "Blacksmiths make tools every settler need: armor, gear and other brilliant masterpieces of smithy!",
            },
            skills: {
                "Metalworking": 10,
                "Mining": 5,
            }
        },
        {
            name: "Tailor",
	    desc: {
                ru: "Самая романтичная профессия в Империи. Портные создают не только великолепную одежду и изделия из ткани, но и пишут восхитительной красоты картины.",
                en: "The most romantic job in the whole Empire. Tailors make majestic clothes and paint beautiful pictures.",
            },
            skills: {
                "Tailoring": 10,
                "Leatherworking": 5,
            }
        },
        {
            name: "Alchemyst",
	    desc: {
                ru: "Алхимики Рогалии — это люди, которых боятся и уважают все жители. Они способны управлять силой атомов, создавая гениальные изобретения, собирать сложные механизмы, а так же создавать магические свитки разрушительной мощи.",
                en: "Almost everyone respects Rogalia's alchemists. These mighty people can control the atomic powers, invent ingenious machinery and enchant a magic scrolls of destructive power.",
            },
            skills: {
                Alchemy: 10,
                Mechanics: 5,
            }
        },
        {
            name: "Farmer",
            desc: {
                ru: "Главные поставщики продовольствия. Они выращивают все, что можно вырастить в Новых Землях. Бескрайние поля, долгий и упорный труд — вот ваше ремесло.",
                en: "The primary food suppliers. They grow everything that grows in the New Lands. Hard and patient workers.",
            },
            skills: {
                Farming: 10,
                Fishing: 5,
            }
        },
        {
            name: "Carpenter",
	    desc: {
                ru: "Люди, создающие великолепные конструкции из древесины, которые всегда пользуются спросом у людей.",
                en: "People who make a beautiful and robust carpentry everyone need.",
            },
            skills: {
                Carpentry: 10,
                Lumberjacking: 5,
            }
        },
        {
            name: "Cook",
	    desc: {
                ru: "Повара Рогалии способны творить великолепные блюда из простых продуктов, которые будут не только райски вкусны, но и богаты витаминами, что так необходимы поселенцам в Новых Землях.",
                en: "Rogalia's cooks make delicious meals, tasty, juicy and full of vitamins.",
            },
            skills: {
                Cooking: 10,
                Herbalism: 5,
            }
        },
        {
            name: "Hunter",
	    desc: {
                ru: "Человек, знающий как выжить в дикой природе, найти себе ночлег и добыть еды. Ловкие и внимательные, в схватке с диким зверем выходят победителями.",
                en: "A men who know how to survive the wild lands, find a safe place to sleep and food to eat. Careful and agile, they win every battle with the beast.",
            },
            skills: {
                Swordsmanship: 10,
                Survival: 5,
            }
        }
    ].forEach(function(prof) {
        var mainSkill = Object.keys(prof.skills)[0].toLowerCase();
        var icon = new Image();
        icon.className = "profession-tab";
        icon.src = "assets/icons/skills/" + mainSkill + ".png";
        icon.title = T(prof.name);

        var desc = dom.make("p", [
            T(prof.desc[game.lang] || "No description"),
            dom.br(),
            dom.br(),
            T("Main skills") + ":",
        ]);
        for (var skill in prof.skills) {
            var sli = document.createElement("li");
            sli.textContent = T(skill);
            desc.appendChild(sli);
        }

        var li = dom.wrap("profession hidden", [
            dom.wrap("", T(prof.name)),
            desc,
            dom.make("p", T("Picking a profession gives you a little bonus of learning points. But you still can learn all the skills you need."))
        ]);

        professions.appendChild(li);
        tabs.appendChild(icon);

        icon.onclick = function() {
            selectedProf = prof;
            dom.removeClass(".profession-tab", "active");
            icon.classList.add("active");

            dom.addClass(".profession", "hidden");
            dom.show(li);
        };
    });
    // activate default profession
    tabs.children[3].click();

    var submit = document.createElement("button");
    submit.textContent = T("Create");
    submit.onclick = function() {
        if (!name.value) {
            game.popup.alert(T("Please enter name"));
            return false;
        }
        if (!selectedProf) {
            game.popup.alert(T("Please select profession"));
            return false;
        }
        game.playerName = name.value;
        game.network.send(
            "create-character",
            {
                Name: name.value,
                Skills: selectedProf.skills,
                Sex: (female.checked) ? 1 : 0,
            }
        );
        return false;
    };

    var back = document.createElement("button");
    back.textContent = T("Back");
    back.onclick = function() {
        game.setStage("lobby");
        return false;
    };

    var form = dom.tag("form");
    dom.append(form, [
        account,
        dom.hr(),
        male.label,
        female.label,
        dom.hr(),
        name,
        dom.hr(),
        tabs,
        professions,
        dom.hr(),
        submit,
        back,
    ]);
    var panel = new Panel("create-character", "Create character", [form]);
    panel.hideCloseButton();
    panel.show(LOBBY_X + game.offset.x, LOBBY_Y + game.offset.y);
    name.focus();

    this.sync = function(data) {
        if (data.Warning)
            game.popup.alert(T(data.Warning));
        else
            game.setStage("loading", data);
    };
    this.end = function() {
        panel.close();
    };
}
Stage.add(createCharacterStage);
