/* global Effects, T */

Effects.descriptions = {
    "Overeat": {
        "class": "bad",
        "effect": "キャラクターの移動速度が 45.",
        "desc": "キャラクターの空腹値が100以上になると付与される。",
        "note": "この状態で更に食べ物を摂取すると、ビタミンもゼロ以下にまで減少します。効果を取り除く最速の方法は、トイレを利用することですが50％のヘルスを失います。 飲料水は過食を早く取り除くのにも役立ちます。",
    },
    "Starving": {
        "class": "bad",
        "effect": "ヘルスを少し低下させる",
        "desc": "キャラクターの空腹値が0になったときに付与される。",
        "note": "あなたは餓えて死ぬかもしれません。",
    },
    "Thirsty": {
        "class": "bad",
        "effect": "キャラクターの移動速度が45に、ヘルスも下がり、採掘したり、アイテムを持ち上げたりすることができなくなります。",
        "desc": "キャラクターのスタミナが0になったときに付与される。",
        "note": "",
    },
    "Lifting": {
        "class": "",
        "effect": "キャラクターの移動速度が 45.",
        "desc": "あなたのキャラクターがアイテムを持ち上げて移動するときに付与される。",
        "note": "",
    },
	"Fire": {
        "class": "bad",
        "effect": "キャラクターは定期的なダメージを受ける (５秒間隔で３０ダメージ).",
        "desc": "いくつかの武器やクリーチャーによって攻撃された場合に付与されます。",
    },
    "Bleed": {
        "class": "bad",
        "effect": "キャラクターは定期的なダメージを受ける.",
        "desc": "クリーチャーによって攻撃されたときに受ける",
    },
    "Hangover": {
        "class": "",
        "effect": " +9 力, -9 素早さ.",
        "desc": "キャラクターがアルコールを飲んでいるときに得られる (beer, wine).",
        "note": "重複効果なし",
    },
    "Sitting": {
        "class": "good",
        "effect": "食べ物を食べるとテーブルの横に座って満腹感が増します。",
        "desc": "キャラクターが椅子、玉座または切り株に座ったときに付与される。",
        "note": "",
    },
	"MushroomTrip": {
        "class": "",
        "effect": "移動速度を135に上げ、幻覚を取り消し、1ダメージで3回のヘルス・ダメージを引き起こす。",
        "desc": "キャラクターがマッシュルームを食べると得られる",
        "note": "マッシュルームを食べた量によって被害は大きくなる",
    },
    "Sex": {
        "class": "good",
        "effect": "呪文を10減少させ、,  スタミナが25増加します。",
        "desc": "マーゴから授かる",
        "note": "効果時間　1.5分",
    },
    "Arena": {
        "class": "",
        "effect": "死亡時のカルマ喪失、死の罰金（飢餓、ビタミン、ラーニングポイント、ギアロス）などのペナルティーはありません。",
        "desc": "キャラクターがアリーナにに参加したときに付与される。",
        "note": "",
    },
    "Riding": {
        "class": "good",
        "effect": "キャラクターの移動速度が大幅に向上します。 Liftingによるペナルティーは適用されません。",
        "desc": "キャラクターが馬に乗ったときに付与される。",
        "note": "",
    },
    "Slowed": {
        "class": "bad",
        "effect": "キャラクター移動速度が45に減少します。",
        "desc": "呪文を唱えるモンスターの攻撃範囲に内に位置すると得られる。 キャラクターはこのモンスターの範囲に入ってはいけません。",
        "note": "重複効果なし",
    },
    "High": {
        "class": "good",
        "effect": "食べ物を食べた時の肥満効果を減少させます。 cigarettesの品質1：5％、cigaresの品質1：10％、jointsの品質1：15％。 品質が高いほどパーセンテージが高くなります。",
        "desc": "cigarettes, cigares,jointsなどを使用すると付与されます。",
        "note": "12ティックで体力の12％を回復します。",
    },
	"Weakness": {
        "class": "bad",
        "effect": "キャラクターの移動速度は45に減少します。さらにキャラクターは戦闘でほとんどダメージを与えられなくなります。",
        "desc": "死後キャラクターが復活したときに付与される。",
        "note": "増強薬を使用すると消えます。",
    },
    "ActivatedCarbon": {
        "class": "good",
        "effect": "すべてのビタミンをゼロに設定し、吐き気の悪影響を取り除きます。",
        "desc": "活性薬を飲むと付与されます。",
    },
    "Drunk": {
        "class": "good",
        "effect": "ヘルスポイントを回復することができます。",
        "desc": "アルコールを飲むと付与される。",
        "note": "あなたが飲み過ぎると、活性薬でさえ、あなたが大量の二日酔いから救うことはできません。",
    },
    "Plague": {
        "class": "bad",
        "effect": "ヘルスを奪う。",
        "desc": "セックスをすると付与される場合があります。",
        "note": "抗生剤を飲むと治療できます。",
    },
    "SynodProtection": {
        "class": "good",
        "effect": "あなたはpvpで80％少ないダメージを受けます。",
        "desc": "しかし、負のカルマの状態や反撃をした場合には効果を発揮しません。",
        "note": "領有地に復活の石があれば、そこに戻ることができます。",
    },
    "NewbieProtection": {
        "class": "",
        "effect": "死の罰",
        "desc": "Lvl 1〜9：バッグの中身は失いません。\nLvl 10〜19：バッグはありますが、中身は失われます。\n Lvl 20：全てを失います。",
        "note": "どのレベルでも、すべてのビタミンとラーニング・ポイントを失います。",
    },
    "De": {
        "class": "fight",
        "effect": T.help.combos.de.effect,
        "desc": T.help.combos.de.desc,
   },
    "Su": {
        "class": "fight",
        "effect": T.help.combos.su.effect,
        "desc": T.help.combos.su.desc,
    },
    "Nya": {
        "class": "fight",
        "effect": T.help.combos.nya.effect,
        "desc": T.help.combos.nya.desc,
    },
    "Inspiration": {
        "class": "fight",
        "effect": "Increases crit chance; with [де] increases damage absorption.",
        "desc": "AoE buff"
    },
};
