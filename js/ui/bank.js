"use strict";

function Bank(npc) {
    var balance = document.createElement("label");
    var price = Vendor.createPriceInput();

    var deposit = document.createElement("button");
    deposit.textContent = T("Deposit");
    deposit.onclick = function() {
        game.network.send("deposit", {Id: npc.Id, Cost: price.cost()}, callback);
    };

    var withdraw = document.createElement("button");
    withdraw.textContent = T("Withdraw");
    withdraw.onclick = function() {
        game.network.send("withdraw", {Id: npc.Id, Cost: price.cost()}, callback);
    };

    var claimRent = document.createElement("label");
    var claimPaidTill = document.createElement("label");
    // var claimLastPaid = document.createElement("label");
    var claimPay = document.createElement("button");
    claimPay.textContent = T("Pay");
    claimPay.onclick = function() {
        if (confirm(T("Confirm?"))) {
            game.network.send("pay-for-claim", {Id: npc.Id}, callback);
        }
    };

    var claim = document.createElement("div");
    claim.appendChild(document.createTextNode(T("Claim")));
    claim.appendChild(claimRent);
    claim.appendChild(claimPaidTill);
    // claim.appendChild(claimLastPaid);
    claim.appendChild(claimPay);

    var vault = dom.div("vault");

    var contents = [
        balance,
        dom.hr(),
        price,
        deposit,
        withdraw,
        dom.hr(),
        claim,
        dom.hr(),
        vault,
    ];
    var panel = new Panel("bank", "Bank", contents);
    panel.hide();
    panel.entity = npc;

    game.network.send("get-bank-info", {id: npc.Id}, callback);

    function date(unixtime) {
        var span = document.createElement("span");
        if (unixtime > 0)
            span.textContent = util.date.human(new Date(unixtime * 1000));
        else
            span.textContent = "-";
        return span;
    }

    function callback(data) {
        if (!data.Bank)
            return callback;
        price.set(0, 0, 0);
        balance.innerHTML = T("Balance") + ": ";
        balance.appendChild(Vendor.createPrice(data.Bank.Balance));

        var claim = data.Bank.Claim;
        claimRent.innerHTML = T("Rent") + ": ";
        claimRent.appendChild(Vendor.createPrice(claim.Cost));


        claimPaidTill.innerHTML = T("Paid till") + ": ";
        claimPaidTill.appendChild(date(claim.PaidTill));

        // claimLastPaid.innerHTML = T("Last paid") + ": ";
        // claimLastPaid.appendChild(date(claim.LastPaid));

        dom.clear(vault);
        dom.setContents(vault, data.Bank.Vault.map(function(vaultSlot, i) {
            var slot = dom.div("slot");
            if (vaultSlot.Unlocked) {
                var entity = Entity.get(vaultSlot.Id);
                slot.appendChild(entity.icon());
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
