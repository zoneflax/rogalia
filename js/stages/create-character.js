function createCharacterStage() {
    var name = util.dom.createInput(T("Name"));

    var male = util.dom.createRadioButton(T("Male"), "sex");
    male.sex = 0;
    male.checked = true;
    var female = util.dom.createRadioButton(T("Female"), "sex");
    female.sex = 1;

    var professions = document.createElement("div");
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
        var radio = util.dom.createRadioButton(T(prof.name), "profession");
        var desc = document.createElement("p");
        desc.className = "profession-desc hidden";
        for (var skill in prof.skills) {
            desc.appendChild(document.createTextNode(T(skill)));
            desc.appendChild(document.createElement("br"));
        }
        radio.desc = desc;
        radio.skills = prof.skills;
        radio.onclick = function() {
            util.dom.addClass(".profession-desc", "hidden");
            util.dom.show(radio.desc);
        };
        var li = document.createElement("div");
        li.appendChild(radio.label);
        li.appendChild(desc);
        professions.appendChild(li);
    });

    var submit = document.createElement("button");
    submit.textContent = T("Create");
    submit.onclick = function() {
        if (!name.value) {
            alert(T("Please enter name"));
            return false;
        }
        var prof = document.querySelector('input[name="profession"]:checked');
        if (!prof) {
            alert(T("Please select profession"));
            return false;
        }
        game.player.Name = name.value;
        game.network.send(
            "create-character",
            {
                Name: name.value,
                Skills: prof.skills,
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
        name.label,
        util.hr(),
        male.label,
        female.label,
        util.hr(),
        professions,
        util.hr(),
        submit,
        back,
    ]);
    panel.hideCloseButton();
    panel.show();
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
