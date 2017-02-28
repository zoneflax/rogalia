"use strict";

Talks.npcs = {
    "charles": {
        "default": {
            "male": [
                "Hello, pal!",
                "I'm Charles, the secretary of local Imperial chancellery. And I'm also an official ambassador of the Imperial Sinode here in these lands.",
		"You can take a rest from work and trade your stuff in this place.",
		"People are different here, so I'm the one who keeps the order.",
                "So, let's talk about:"
            ],
            "female": [
                "Have a good day, young lady!",
                "I'm Charles, the secretary of local Imperial chancellery. And I'm also an official ambassador of the Imperial Sinode here in these lands.",
		"You can take a rest from work and trade your stuff in this place.",
		"People are different here, so I'm the one who keeps the order.",
                "So, let's talk about:"
            ]
        },
        "empire": {
            "male": [
                "Glad to see you again, pal!",
                "It's good to see you still keeping your loyalty to the Emperor even when times are like this. Not lost your faith to the lord and not charmed with sweet tongue of confederates... Keep this up, friend! God help me and all my chancery if I won't help you, pal. I'm Charles and I'm your servant.",
            ],
            "female": [
                "Nice to meet you, lady!",
                "I'm so glad you did not turn away from Imperial laws. I hoped you'll stay with us, the town lacks sincere, open-minded girls who isn't fascinated with that confederates promises. I, the local Imperial chancery headmaster, am your servant and loyal knight. Ask me and I'll help you."
            ]
        },
        "confederation": {
            "male": [
                "Hey dude.",
                "So how's that going? I mean, your confeds service? I hope they feed you well at least. But sorry for my rudeness. We're all equal here, so I mustn't prefer those who keep loyal to our lord. Even if I'm the CEO of Emperor chancery, I have to keep an eye on this town. So I'll help you with all my kindness.",
            ],
            "female": [
                "Young lady!",
                "What problem brought you up to me? I feel sorrow for you joined that deadbeats, but don't worry, our relationship won't change. You sure had some reasons to do that, and I won't judge. We're all equal here but... I hoped you'll choose a more... gentle way. Anyway, Charles is your servant.",
            ]
        },
        "actions": {
            "Set citizenship": "I want to set my fraction.",
            "Get claim": "I want to claim a lands.",
        },
    },
    "diego": {
        "default": {
            "male": [
		"Hey! Name's Diego, I'm Taiterra ambassador here! But I like good fight better than that political doings. So if you wanna hunt a game I can show you places! Te-hee!"
	    ],
        },
        "actions": {
            "Show instances": "Show me places to hunt.",
        }
    },
    "scrooge": {
        "default": {
            "male": [
                "Welcome!",
                "We're always glad to see new customers. Come, take a sit. My name is Scrooge and I manage the greatest bank of Rogalia.",
                "Our bank is so great we can afford local offices at remote towns like this. Don't worry, the quality of our service stays the same.",
                "I can keep your money. Sad to say, you won't get any interest, but I'll keep them in the firm safe.",
                "Also, for landlords we could offer a savings fund service. If you have some revenue, all your incomes will automatically be saved on your account. The good profit and no extra bills.",
                "So, any questions?"
            ]
        },
        "actions": {
            "Bank": "Financial operations.",
            "Exchange": "Ingots and notes exchange.",
        },
    },
    "sabrina": {
        "default": {
            "male": [
                "Halt! Don't come! We-e-ell... A-ha... Okay... Ah, damn it. Sorry, I'm Sabrina, I'm the local alchemist. Everything for you: from a leaf of goose-grass to a potion which turns a stone alive! Te-hee, just kidding."
            ]
        },
        "actions": {
            "Trade": "I wanna take a look.",
        },
    },
    "larisa": {
        "default": {
            "male": [
                "Welcome to the Rogalia bargain house! Well, we're just a local branch of Imperial Auction Dome, but hey, we're no worse! I'm Larice, call me if you wanna trade."
            ]
        },
        "actions": {
            "Auction": "I wanna take a look.",
            "Get vendor license": "I want to get a vendor license."
        },
    },
    "shot": {
        "default": {
            "male": [
                "Hello, handsome, I'm Shot. Here, take a sit.",
                "Think, our pub \"The dancing coyote\" is the only place here which deserves any attention, disregard any talks of that brag Charles. We have cold water, warm meals and something very hot in the next room. But a man like you will manage that with no help.",
            ],
            "female": [
                "Hey, friend!",
                "I'm Shot, and I own \"The dancing coyote\". We have meals and water, and also we have something else, but girls are barely interested in things like that, so I won't even tell. The town is kinda nice, even if only red-necks and deadbeats gathered here. But no hard feelings, I think we'll develop a good friendship!",
            ]
        },
        "empire": {
            "male": [
                "What kind of delicate meal does this noble gentleman want today?",
                "We've got a potato seeds you can easily grow. Premium water in assortment: from the river, from the lake, and even from the pound. Hey, don't make that face. It's only a local pub, not the magestic restaurant at the middle of the Imperial capital. Or when you enter a pub named \"The dancing coyote\" you expect to see something else? I'm Shot, and I'm your servant.",
            ],
            "female": [
                "Ah! The Imperial lady comes for dinner!",
                "Well, hope I'll meet your expectations. Got seeds of any taste. What? A casual food? Do you think this seeds won't work any good? I'll have a water to water them, though. Just kidding.\
					You can drink it here. With our glasses, yeah. Yeah, rules is rules. You may write a complain, yeah. After my words: \"The pub's owner Shot, confederate and proud daughter of confederates, does not show any respect for the righteous Imperial women\"!"
            ]
        },
        "confederation": {
            "male": [
                "Hi, honey, name's Shot, take a sit.",
                "Think, our pub \"The dancing coyote\" is the only place here which deserves any attention, disregard any talks of that brag Charles. We have cold water, warm meals and something very hot in the next room just for you. I've heard you the confederate boys, consider this type of leisure a lot. But I think you'll manage that with no help.",
            ],
            "female": [
                "Hey-hey! Glad to see another daughter of Confederation here!",
                "\"The dancing coyote\" isn't that bad, right? Come more often, I'm sure we'll make a good friends. By the way, I'm Shot. I could feed you, trade some seeds, and, you know... Well, if you're open-minded enough, you may find something interesting in the next room...",
            ]
        },
        "actions": {
            "Trade": "I want to see what you got.",
            "Drink water": "I want a drink (5 silver)",
        }
    },
    "margo": {
        "default": {
            "male": [
                "Hey, sweetheart, don't pass by!",
		"Come on, let's have fun, you know who I am, don't you? I know the names you call people like me, but I prefer a \"night-fly\", 'cause I look like a butterfly, right? Silky wings, light body, majestic beauty, and I bring a pleasure to people, see, the special sort of pleasure. So, are you here to stare or even that bold boy of you needs some rest?",
            ],
            "female": [
                "Honey? Wrong door? Hey?",
		"Come on, don't be shy. I've read everything in your eyes, say no more. I am Margo, and I'm the one you need. Trust me, I can see the tension and reservation; you've come at the right place. We'll fight that. A woman should let herself out, show herself to the world and let her preconceptions away. Come, honey. Sit down. I'm not biting.",
            ]
        },
        "empire": {
            "male": [
                "Sweety, come, don't be shy.",
		"Well, if you're here, think you know I'm Margo and my service is very special. Take a sit, have a rest... You need some rest, don't you? I know you, the Emperor loyal men, do not like people like me, but throw away your doubts and let yourself a pleasure...",
            ],
            "female": [
                "Yes? Can I help you?",
		"Margo, that's me. A prostitute. A whore, if you prefer. Any questions? I see you have questions. Any Imperial would have them in case like this. But.. Oh! I can see the passion in your eyes? Oh my god, it's a passion. Pardon me for my rudeness. This place is kinda unstable, you know. Disregard things Charles says, the Empire and the Confederation will always stay enemies, even if we're on the desert island. But feel no worry, I'm loyal to all my customers. It's better to get rid of your stress with me than with these sweaty red-necks."
            ]
        },
        "confederation": {
            "male": [
                "Sweety, come, don't be shy.",
		"Wow, such a passion! You look like a manliest man here! I feel a male in you, your walk makes my legs shake! I think you've come for purpose, right? You guys let us night-flies spread all over Empire. So you are ought to know what to do, right? You may call me Margo or whatever you prefer, lay down and rest...",
            ],
            "female": [
                "Get in, pumpkin. Margo is always glad to see such a cute girls like you.",
		"In this Imperial place full of sweaty greasy rustics every girl needs some rest and fun sometimes, needs to release her tension, right? Pros like me give people what they want, and you wanna stay here with me, I guess? Take a sit, let momma Margo take care of you...",
            ]
        },
        "actions": {
            "Buy sex": "Use a whore's service (10 gold)",
        }
    },
    "bruno": {
        "default": {
            "male": [
                "Welcome to my modest shop, pal.",
		"I'm Bruno, glad to help you pick a clothes. You're here for clothes, right? I'm the best clothier in the whole Empire here to help you.",
            ],
            "female": [
                "Love, don't pass by, take a look!",
		"My name is Bruno, love, and this is my shop. You can get any clothes here for any taste. Pick something.",
            ]
        },
        "empire": {
            "male": [
                "Hey, gentleman!",
		"I'm Bruno the local tailor. If you feel need in new clothes, I'm here for you. Glad to serve a right Imperial.",
            ],
            "female": [
                "Love, come and see what I've got!",
		"It's always a pleasure to see a loyal face. I'm Bruno, and if you need best clothes, you'll get them for a modest price."
            ]
        },
        "confederation": {
            "male": [
                "Hey, pal!",
		"I can see you're confeds' servant. Skinny, wearing castoffs... Name's Bruno, come in, I'll bring you best clothes in the whole Rogalia!",
            ],
            "female": [
                "Hey, sweet-ass!",
		"The fact you're a confede-rat doesn't change that you need good outfit. I'm Bruno, the best tailor of alive ones!",
            ]
        },
        "actions": {
            "Trade": "I wanna see your goods.",
        },
    },
    "ahper": {
        "default": {
            "male": [
                "There was a times I could break a boulder in a moment... Te-hee. My pardon.",
            ]
        },
        "actions": {
            "Trade": "I wanna see your goods.",
        },
    },
    "cosmas": {
        "default": {
            "male": [
                "Hi. This is my smithy. You need a gear or an armor, maybe? Sigh... Everyone wants nails or hoops, like everyone.",
            ]
        },
        "actions": {
            "Trade": "I wanna see your goods.",
        },
    },
    "boris": {
        "default": {
            "male": [
                "Come in, son, our church always greets new parishioners.",
		"My name is Boris, I am the abbot of this abbey. Here, in this lands, I bring the light to everyone who needs it. You're here to absolve, I guess?",
            ],
            "female": [
                "Come in, daughter, our church always greets new parishioners.",
		"My name is Boris, I am the abbot of this abbey. Here, in this lands, I bring the light to everyone who needs it. You're here to absolve, I guess?",
            ]
        },
        "empire": {
            "male": [
                "Come in, son, our church always greets new parishioners.",
		"My name is Boris, I am the abbot of this abbey. Here, in this lands, I bring the light to everyone who needs it. You're here to absolve, I guess?",
            ],
            "female": [
                "Come in, daughter, our church always greets new parishioners.",
		"My name is Boris, I am the abbot of this abbey. Here, in this lands, I bring the light to everyone who needs it. You're here to absolve, I guess?",
            ]
        },
        "confederation": {
            "male": [
                "Come in, son, our church always greets new parishioners.",
		"My name is Boris, I am the abbot of this abbey. Here, in this lands, I bring the light to everyone who needs it. You're here to absolve, I guess?",
            ],
            "female": [
                "Come in, daughter, our church always greets new parishioners.",
		"My name is Boris, I am the abbot of this abbey. Here, in this lands, I bring the light to everyone who needs it. You're here to absolve, I guess?",
            ]
        },
        "actions": {
            "Trade": "I want to buy an indulgence",
        }
    },
    "bertran": {
        "default": {
            "male": [
                "Meeaatttt....",
                "Don't passss by, magessstic gentleman, come to visssit Bertram. I am the local butcher and I'm good at cutting carcassssses. I can cut your carcasssss, not the carcasss of yourssss, don't be afraid. I don't like to cut living flessshhh anymore. You may buy some meattt to cook.",
            ],
            "female": [
                "Sssuch a tasssty flesssshhh...",
                "I mean, such a tasty fillet I have here. I do LOVE fillet. Sssuch a pleasssure to cut it... Pardon me, lady. I lost my mind. I'm Bertram the local butcher. You may buy some meat here, I could teach you cooking, or... Nevermind, I know you not enough.",
            ]
        },
        "actions": {
            "Trade": "I wanna see your goods.",
        }

    },
    "vendor": {
        "default": {
            "male": [
                "Welcome to my modest shop, gentleman.",
            ],
            "female": [
                "Welcome to my modest shop, lady.",
            ],
        },
        "actions": {
            "Trade": "I wanna see your goods.",
        },
    },
    "ded-moroz": {
        "default": {
            "male": [
                "Happy new year!",
                "Hurry up and decorate your house!",
            ],
        },
    },
    "snegurochka": {
        "default": {
            "male": [
                "Hello!",
                "It's holidays! Let's decorate a Christmas tree and give gifts to each other!"
            ],
        },
    },
    "ivan": {
        "default": {
            "male": [
                "Hello! Come closer, don't be shy!",
                "I'm Ivan the local woodsman. Do you seek for a good saw or an axe or some other tools for lumberjacks? Ask me, let's pick you some stuff!",
            ],
        },
    },
    "plato": {
        "default": {
            "male": [
                "Have a good day, friend.",
                "I'm Plato, and my job is teaching newbees the bases of survival. Doesn't matter if you're here by will or the Emperor sent you here as a punishment. Listen and pay attention, so you won't come a dinner for the wild beasts.",
            ],
        },
    },
    "athena": {
        "default": {
            "male": [
                "A-ha! Arena fresh meat!",
		"My name is Athena, I'm arena fight manager. I don't care if you're man or woman, what age you are, what fraction do you prefer. I just wanna see a thirst for a blood in your eyes! You may contest your strength with people on this arena."
            ]
        },
    },
    "alfred": {
        "default": {
            "male": [
                "Welcome to the hotel, stranger.",
                "I'm Alfred the battler. If you're in need for a warm and cosy bed, you'll find it here. That's not a room for queen, but it'll provide you a good rest.",
            ],
        },
    },
    "angelina": {
        "default": {
            "male": [
                "Boooooooo!",
                "Ain't afraid too? Damn... I'm Angela the ghost. I tell tales and spooky stories. Sit down, I'll tell you one.",
            ],
        },
    },
};
