/* global game, T, dom, _, Image, Stage, Panel */

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
    male.label.title = T("Male");
    male.checked = true;
    male.onclick = function() {
        male.label.classList.add("checked");
        female.label.classList.remove("checked");
    };

    var female = dom.radioButton("", "sex");
    female.label.className = "new-sex";
    female.label.id = "new-female";
    female.label.title = T("Female");
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
        const li = dom.wrap("profession hidden", [
            dom.wrap("profession-name", T(prof.name)),
            dom.wrap("profession-desc-container", [
                dom.wrap("profession-desc", T(prof.desc || T("No description yet"))),
                dom.wrap("profession-skills-header", T("Main skills") + ":"),
                dom.wrap("profession-skills", _.map(prof.skills, (_, skill) => {
                    return dom.wrap("profession-skill", [
                        dom.img(`assets/icons/skills/${skill.toLowerCase()}.png`, "profession-skill-icon"),
                        T(skill),
                    ]);
                })),
            ]),
            dom.wrap(
                "profession-tip",
                T("Picking a profession gives you a little bonus of learning points. But you still can learn all the skills you need.")
            ),
        ]);

        const icon = dom.img(`assets/icons/skills/${prof.mainSkill}.png`, "profession-tab", {
            title: T(prof.name),
            onclick: () => {
                selectedProf = prof;
                dom.removeClass(".profession-tab", "active");
                icon.classList.add("active");

                dom.addClass(".profession", "hidden");
                dom.show(li);
            },
        });

        professions.appendChild(li);
        tabs.appendChild(icon);
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

    var panel = new Panel("create-character", "Create character", dom.make("form", [
        account,
        male.label,
        female.label,
        name,
        dom.hr(),
        tabs,
        professions,
        submit,
        back,
    ])).hideCloseButton().show().center(0.5, 0.05);

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
