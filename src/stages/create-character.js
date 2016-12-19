/* global game, T, dom, _, Image */

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
    game.professions.forEach(function(prof) {
        var icon = new Image();
        icon.className = "profession-tab";
        icon.src = "assets/icons/skills/" + prof.mainSkill + ".png";
        icon.title = T(prof.name);

        var desc = dom.make("p", [
            T(prof.desc || T("No description yet")),
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
