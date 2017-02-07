/* global Effects */


Effects.descriptions = {
    "Overeat": {
        "class": "bad",
        "effect": "Character movement speed decreases by 45.",
        "desc": "Gained when character's fullness gets 100 and higher.",
        "note": "Having food in this state decreases your vitamins even below zero. The fastest way to remove this buff is to poop on toilet, but it causes 50% health loss. Drinking water also helps to remove overeating faster.",
    },
    "Starving": {
        "class": "bad",
        "effect": "Slightly decreases your health",
        "desc": "Gained when character's fullness gets 0.",
        "note": "You may die from starving.",
    },
    "Thirsty": {
        "class": "bad",
        "effect": "Character's movement speed decreases to 45 and health slightly falls off. You cannot dig dirt, mine ore and lift items.",
        "desc": "Gained when character's stamina gets 0.",
        "note": "",
    },
    "Lifting": {
        "class": "",
        "effect": "Character's movement speed decreases to 45.",
        "desc": "Gained when your character lifts and moves items.",
        "note": "",
    },
    "Fire": {
        "class": "bad",
        "effect": "Character bears a periodic damage (30 damage points in 5 sec).",
        "desc": "Gained when attacked by some kinds of weapon or creatures.",
    },
    "Bleed": {
        "class": "bad",
        "effect": "Character bears a periodic damage.",
        "desc": "Gained when attacked by creatures.",
    },
    "Hangover": {
        "class": "",
        "effect": " +9 strength, -9 dexterity.",
        "desc": "Gained when character is having alcohol (beer, wine).",
        "note": "Is not stackable.",
    },
    "Sitting": {
        "class": "good",
        "effect": "Thirst and stamina loss speed decreases. Sitting next to table when having food decreases fullness growth.",
        "desc": "Gained when character sits on chair, throne or stump.",
        "note": "",
    },
    "MushroomTrip": {
        "class": "",
        "effect": "Increases movement speed to 135, revokes hallucinations, causes 3 health loss in a tick.",
        "desc": "Gained when character is having raw mushrooms.",
        "note": "Damage growth rateably to eaten mushrooms amount.",
    },
    "Sex": {
        "class": "good",
        "effect": "Spell causes fullness decrease by 10, stamina increase by 25.",
        "desc": "Buy from Margo.",
        "note": "Spell length is 1.5 minutes.",
    },
    "Arena": {
        "class": "",
        "effect": "No carma loss after the kill, all fines for death (hunger, vitamins, learning points and gear loss) do not apply.",
        "desc": "Gained when character gets on arena.",
        "note": "",
    },
    "Riding": {
        "class": "good",
        "effect": "Character movement speed greatly increases. A speed fine for item lifting does not apply.",
        "desc": "Gained when character rides a horse.",
        "note": "",
    },
    "Slowed": {
        "class": "bad",
        "effect": "Character movement speed decreases by 45.",
        "desc": "Gained when character stays in the attack area of monster with slow spell. Character must not be in this monster aggro list.",
        "note": "Do not stack.",
    },
    "High": {
        "class": "good",
        "effect": "Decreases fullness growth when having food. Quality 1 cigarette: 5%, quality 1 cigare: 10%, quality 1 joint: 15%. The higher quality gives the higher percentage.",
        "desc": "Gained when having cigarettes, cigares and joints.",
        "note": "Stacks with sitting next to table buff. Heals 12% of health in 12 ticks.",
    },
    "Weakness": {
        "class": "bad",
        "effect": "Character movement speed decreases by 45; character makes almost zero damage in fight.",
        "desc": "Gained when character resurrects after death.",
        "note": "Removes when having a strengthening potion.",
    },
    "ActivatedCarbon": {
        "class": "good",
        "effect": "Sets all vitamins to zero and removes negative effects of pooping.",
        "desc": "Gained when having an activated carbon.",
    },
    "Drunk": {
        "class": "good",
        "effect": "Heals a few health points, sometimes makes you talk things you think.",
        "desc": "Gained when having an alcohol.",
        "note": "If you drink too much, even an activated carbon won't save you from heavy hangover.",
    },
    "Plague": {
        "class": "bad",
        "effect": "Deprives your health to death.",
        "desc": "May get infected when standing next to a garbage pile, another patient or during a homosexual sex.",
        "note": "Can be cured with anti-plague potion.",
    },
    "SynodProtection": {
        "class": "good",
        "effect": "you take 80% less damage in pvp.",
        "desc": "Does not work under the ground, if you answered onto the attack or if you have negative karma.",
        "note": "Allows you to return to your respawn if there is one or to the city.",
    },
    "Prospecting": {
        "class": "good",
        "effect": "Allows you to see nearby veins",
        "desc": "Gained from using a prospector",
    },
    "NewbieProtection": {
        "class": "",
        "effect": "Death penalty.",
        "desc": "Lvl 1 to 9 - keep bag and equipment.\nLvl 10 to 19 - keep bag, but lose it's contents.\nFrom lvl 20 - losing all equipment and inventory.",
        "note": "On any level you lose all vitamins and learning points.",
    },
    "De": {
        "class": "fight",
    },
    "Su": {
        "class": "fight",
    },
    "Nya": {
        "class": "fight",
    },
    "Inspiration": {
        "class": "fight",
    },
};
