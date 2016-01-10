"use strict";
function Mail(mailbox, mail) {
    this.mailbox = mailbox;
    this.mail = mail;
    var tabs = [
        {
            title: T("Inbox"),
            update: this.update.bind(this),
        },
        {
            title: T("Compose"),
            contents: this.composeTab(),
        }
    ]
    this.panel = new Panel("mail", "Mail", [dom.tabs(tabs)]);
    this.panel.show();
}

Mail.prototype = {
    update: function(title, contents) {
        var self = this;
        var letters = dom.div("letters");
        this.mail.forEach(function(letter, id) {
            var del = dom.button("x", "letter-delete");
            del.onclick = function() {
                game.network.send("letter-delete", {Id: self.mailbox.Id, Letter: id})
            };
            dom.append(letters, [
                dom.wrap("letter", [
                    dom.div("letter-from", {text: letter.From}),
                    dom.div("letter-subject", {text: letter.Subject}),
                    // dom.div("letter-sent", {// TODO: ext: util.date.human(letter.Created * 1000)})
                    del,
                ]),
                dom.hr(),
            ]);
        });
        dom.clear(contents);
        dom.append(contents, [
            letters,
            dom.button(T("Delete all")),
        ])
    },
    view: function(letter) {
    },
    composeTab: function() {
        var to = dom.input(T("To:"));
        var postage = Vendor.createPrice(30);
        var subject = dom.input(T("Subject:"))
        var body = dom.tag("textarea", "mail-body");
        var send = dom.button(T("Send"));

        var slots = [];
        for (var i = 0; i < 4; i++)
            slots.push(dom.slot());

        var self = this;
        send.onclick = function() {
            game.network.send("compose", {
                Id: self.mailbox.Id,
                To: to.value,
                Subject: subject.value,
                Body: body.value,
                // Items: slots.filter(function(e) { return !!e}).map(function(e) { return e.Id; })
            }, function() {
                to.value = "";
                subject.value = "";
                body.value = "";
            })
        };
        return [
            dom.wrap("mail-to", [
                to.label, to, postage
            ]),
            dom.wrap("mail-subject", [
                subject.label, subject
            ]),
            dom.hr(),
            body,
            dom.wrap("mail-send", slots.concat(send)),
        ];
    }
}
