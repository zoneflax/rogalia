"use strict";

function Bank(npc) {
    var balance = dom.tag("label");
    var price = Vendor.createPriceInput();

    var deposit = dom.button(T("Deposit"), "", function() {
        game.network.send("deposit", {Id: npc.Id, Cost: price.cost()}, callback);
    });

    var withdraw = dom.button(T("Withdraw"), "", function() {
        game.network.send("withdraw", {Id: npc.Id, Cost: price.cost()}, callback);
    });

    var claimRent = dom.tag("label");
    var claimPaidTill = dom.tag("label");
    // var claimLastPaid = document.createElement("label");
    var claimPay = dom.button(T("Pay"), "", function() {
        game.confirm(T("Confirm?"), function() {
            game.network.send("pay-for-claim", {Id: npc.Id}, callback);
        });
    });


    var vault = dom.div("vault");

    var contents = [
        balance,
        dom.hr(),
        price,
        deposit,
        withdraw,
        dom.hr(),
        dom.make("div", [
            T("Claim"),
            claimRent,
            claimPaidTill,
            claimPay,
        ]),
        dom.hr(),
        vault,
    ];
    var panel = new Panel("bank", "Bank", contents);
    panel.hide();
    panel.entity = npc;

    game.network.send("get-bank-info", {id: npc.Id}, callback);

    function date(unixtime) {
        return dom.span(
            (unixtime > 0)
                ? util.date.human(new Date(unixtime * 1000))
                : "-"
        );
    }

    function callback(data) {
        if (!data.Bank)
            return callback;
        price.set(0, 0, 0);
        balance.innerHTML = T("Balance") + ": ";
        dom.append(balance, Vendor.createPrice(data.Bank.Balance));

        var claim = data.Bank.Claim;
        claimRent.innerHTML = T("Rent") + ": ";
        dom.append(claimRent, Vendor.createPrice(claim.Cost));


        claimPaidTill.innerHTML = T("Paid till") + ": ";
        dom.append(claimPaidTill, date(claim.PaidTill));

        // claimLastPaid.innerHTML = T("Last paid") + ": ";
        // claimLastPaid.appendChild(date(claim.LastPaid));

        dom.clear(vault);
        dom.setContents(vault, data.Bank.Vault.map(function(vaultSlot, i) {
            var slot = dom.slot();
            if (vaultSlot.Unlocked) {
                var entity = Entity.get(vaultSlot.Id);
                dom.append(slot, entity.icon());
                slot.onclick = function() {
                    Container.show(entity);
                };
            } else {
                slot.classList.add("plus");
                slot.onclick = function() {
                    var cost = Math.pow(100, i);
                    if (confirm(TT("Buy slot {cost} gold?", {cost: cost}))) {
                        game.network.send("buy-bank-vault-slot", {id: npc.Id}, callback);
                    };
                };
            }
            return slot;
        }));
        // //TODO: remove items on panel close?


        panel.show();
    };
}
