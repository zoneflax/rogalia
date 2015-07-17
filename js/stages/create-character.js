function createCharacterStage() {
    var account = document.createElement("div");
    account.className = "lobby-account";
    account.textContent = game.login;

    var name = document.createElement("input");
    name.placeholder = T("Name");


    var male = util.dom.createRadioButton("", "sex");
    male.label.className = "new-sex checked";
    male.label.id = "new-male";
    male.sex = 0;
    male.checked = true;
    male.onclick = function() {
        male.label.classList.add("checked");
        female.label.classList.remove("checked");
    };

    var female = util.dom.createRadioButton("", "sex");
    female.label.className = "new-sex";
    female.label.id = "new-female";
    female.sex = 1;
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
            skills: {
                "Metalworking": 10,
                "Mining": 5,
            }
        },
        {
            name: "Tailor",
            skills: {
                "Tailoring": 10,
                "Leatherworking": 5,
            }
        },
        {
            name: "Alchemyst",
            skills: {
                Alchemy: 10,
                Mechanics: 5,
            }
        },
        {
            name: "Farmer",
            desc: "Пей кокосы, ешь бананы! Без фермеров жрать будет тупо нечего.",
            skills: {
                Farming: 10,
                Fishing: 5,
            }
        },
        {
            name: "Carpenter",
            skills: {
                Carpentry: 10,
                Lumberjacking: 5,
            }
        },
        {
            name: "Cook",
            skills: {
                Cooking: 10,
                Herbalism: 5,
            }
        },
        {
            name: "Hunter",
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


        var desc = document.createElement("p");
        desc.className = "profession-desc";
        desc.appendChild(document.createTextNode(T(prof.desc || "No description")));
        desc.appendChild(util.br());
        desc.appendChild(util.br());
        desc.appendChild(document.createTextNode(T("Main skills") + ":"));
        for (var skill in prof.skills) {
            var sli = document.createElement("li");
            sli.textContent = T(skill);
            desc.appendChild(sli);
        }

        var name = document.createElement("div");
        name.textContent = T(prof.name);

        var li = document.createElement("div");
        li.className = "profession hidden";
        li.appendChild(name);
        li.appendChild(desc);

        professions.appendChild(li);
        tabs.appendChild(icon);

        icon.onclick = function() {
            selectedProf = prof;
            util.dom.removeClass(".profession-tab", "active");
            icon.classList.add("active");

            util.dom.addClass(".profession", "hidden");
            util.dom.show(li);
        };
    });
    // activate default profession
    tabs.children[3].click();

    var submit = document.createElement("button");
    submit.textContent = T("Create");
    submit.onclick = function() {
        if (!name.value) {
            alert(T("Please enter name"));
            return false;
        }
        if (!selectedProf) {
            alert(T("Please select profession"));
            return false;
        }
        game.player.Name = name.value;
        game.network.send(
            "create-character",
            {
                Name: name.value,
                Skills: selectedProf.skills,
                Sex: document.querySelector('input[name="sex"]:checked').sex,
            }
        );
        return false;
    };

    var back = document.createElement("button");
    back.textContent = T("Back");
    back.onclick = function() {
        game.setStage("lobby");
    };

    var panel = new Panel("create-character", T("Create character"), [
        account,
        util.hr(),
        male.label,
        female.label,
        util.hr(),
        name,
        util.hr(),
        tabs,
        professions,
        util.hr(),
        submit,
        back,
    ]);
    panel.hideCloseButton();
    panel.show(LOBBY_X, LOBBY_Y);
    name.focus();

    this.sync = function(data) {
        if ("Warning" in data)
            alert(data.Warning);
        else
            game.setStage("loading", data);
    };
    this.end = function() {
        panel.close();
    };
}
Stage.add(createCharacterStage);
