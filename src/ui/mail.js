/* global T, dom, game, util, Panel, ContainerSlot, Vendor, Container */

"use strict";
function Mail() {}

Mail.prototype = {
    mailbox: null,
    mail: null,
    updateRequired: false,
    update: function() {
        this.updateRequired = true;
    },
    open: function(mailbox, mail) {
        this.mailbox = mailbox;
        this.mail = mail || [];
        this.updateRequired = false;
        this.tabs = [
            {
                title: T("Inbox"),
                update: (title, contents) => {
                    if (this.mail && !this.updateRequired) {
                        dom.setContents(contents, this.listView(this.mail));
                        return;
                    }
                    game.network.send("entity-use", {Id: this.mailbox.Id}, (data) => {
                        this.mail = data.Mail;
                        dom.setContents(contents, this.listView(data.Mail));
                    });
                },
            },
            {
                title: T("Compose"),
                update: (title, contents) => {
                    dom.setContents(contents, this.composeView());
                },
            }
        ];
        this.panel = new Panel("mail", "Mail", [dom.tabs(this.tabs)])
            .setTemporary(true)
            .setEntity(mailbox)
            .show();
    },
    formatDate: function(letter) {
        var created = new Date(letter.Created * 1000);
        return util.date.human(created) + " " + util.time.human(created);
    },
    hasAttachment: function(letter) {
        return letter.Items && letter.Items.length > 0;
    },
    letterId: function(letter) {
        return this.mail.indexOf(letter);
    },
    listView: function(mail) {
        if (!mail || mail.length == 0)
            return T("No mail");

        var self = this;
        return dom.wrap("letters", mail.map(function(letter) {
            if (letter.From == "Rogalia Shop") {
                letter.class = "shop";
                letter.From = T(letter.From);
                letter.Subject = T(letter.Subject);
                letter.Body = T(letter.Body);
            }
            var del = dom.button("x", "letter-delete");
            var row = dom.wrap("letter", [
                dom.div("letter-from", {text: letter.From}),
                dom.div("letter-subject", {text: letter.Subject}),
                self.hasAttachment(letter) ? dom.div("letter-has-attachment") : null,
                dom.wrap("letter-created", self.formatDate(letter)),
                del,
            ]);

            if (letter.class)
                row.classList.add(letter.class);

            del.onclick = function(event) {
                event.stopPropagation();
                game.popup.confirm(T("Delete") + "?", function() {
                    game.network.send(
                        "delete-letter",
                        {Id: self.mailbox.Id, Letter: self.letterId(letter)},
                        function() {
                            self.mail = _.pull(self.mail, letter);
                            var parent = row.parentNode;
                            dom.remove(row);
                            if (parent.children.length == 0) {
                                parent.textContent = T("No mail");
                            }
                        }
                    );
                });
            };
            row.onclick = function() {
                var content = self.tabs[0].tab.content;
                dom.setContents(content, self.letterView(letter));
            };
            return row;
        }));
    },
    letterView: function(letter) {
        var self = this;
        var attachment = makeAttachment(letter);
        var take = self.hasAttachment(letter) && dom.button(T("Take"), "take-button", function() {
            game.network.send(
                "take-attachment",
                {Id: self.mailbox.Id, Letter: self.letterId(letter)},
                function() {
                    dom.remove(attachment);
                    dom.remove(take);
                    letter.Items = null;
                })
            ;
        });
        return [
            dom.button(T("Back"), "back-button", function() {
                self.tabs[0].update();
            }),
            take,
            dom.wrap("letter-from", [
                T("From") + ": ",
                letter.From,
            ]),
            dom.wrap("letter-subject", [
                T("Subject") + ": ",
                letter.Subject,
            ]),
            dom.wrap("letter-created", [
                T("Date") + ": ",
                self.formatDate(letter),
            ]),
            dom.hr(),
            dom.wrap("letter-body", [
                letter.Body,
            ]),
            attachment,
        ];

        function makeAttachment() {
            if (!self.hasAttachment(letter))
                return null;
            var attachment = dom.div("letter-attachment");
            game.network.send("get-letter", {Id: self.mailbox.Id, Letter: self.letterId(letter)}, function(data) {
                dom.setContents(attachment, data.Items.map(function(item) {
                    var slot = new ContainerSlot({panel: self.panel, entity: {}}, 0);
                    var entity = new Entity(item.Type);
                    entity.sync(item);
                    slot.set(entity);
                    return slot.element;
                }));
            });
            return attachment;
        }
    },
    composeView: function() {
        var to = dom.input(T("To:"));
        var postage = Vendor.createPrice(30);
        var subject = dom.input(T("Subject:"));
        var body = dom.tag("textarea", "mail-body");
        var send = dom.button(T("Send"));

        var slots = util.dotimes(4, function() {
            var slot = dom.slot();
            slot.mail = true;
            slot.use = function(entity) {
                var from = Container.getEntityContainer(entity);
                if (!from)
                    return false;

                slot.containerSlot = from.findSlot(entity);
                slot.containerSlot.lock();

                slot.entity = entity;
                dom.setContents(slot, entity.icon());
                return true;
            };
            slot.cleanup = function() {
                if (!slot.entity)
                    return;

                slot.containerSlot.unlock();

                slot.entity = null;
                dom.clear(slot);
            };
            slot.addEventListener("mousedown", slot.cleanup, true);
            return slot;
        });

        var self = this;
        send.onclick = function() {
            game.network.send(
                "compose",
                {
                    Id: self.mailbox.Id,
                    To: to.value,
                    Subject: subject.value,
                    Body: body.value,
                    Items: slots.filter(function(slot) {
                        return slot.entity != null;
                    }).map(function(slot) {
                        return slot.entity.Id;
                    })
                },
                function() {
                    to.value = "";
                    subject.value = "";
                    body.value = "";
                    slots.forEach(function(slot) {
                        slot.cleanup();
                    });
                }
            );
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
};
