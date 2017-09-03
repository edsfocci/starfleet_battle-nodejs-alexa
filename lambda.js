
// 1. Text strings =====================================================================================================
//    Modify these strings and messages to change the behavior of your Lambda function

var languageStrings = {
    'en': {
        'translation': {
            'WELCOME' : "Welcome to Starfleet Battle!",
            'HELP'    : "Are you the Federation or Klingon Defense Force?", // TODO: handle wrong input
            'STOP'    : "Filthy petaQ!"
        }
    }
};

var ships = {
    "Bird of Prey": {
        "att": 6,
        "def": 4
    },
    "K't'inga": {
        "att": 3,
        "def": 7
    },
    "Vor'cha": {
        "att": 8,
        "def": 3
    },
    "Defiant": {
        "att": 8,
        "def": 2
    },
    "Intrepid": {
        "att": 3,
        "def": 7
    },
    "Galaxy": {
        "att": 7,
        "def": 4
    },
};

var fedShips = ['Defiant', 'Intrepid', 'Galaxy'];
var klinkShips = ["Bird of Prey", "K't'inga", "Vor'cha"];

var yourShip;
var opponentShip;

var currentAttacker;

var Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);

    // alexa.appId = 'amzn1.echo-sdk-ams.app.1234';
    ///alexa.dynamoDBTableName = 'YourTableName'; // creates new table for session.attributes
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        var say = this.t('WELCOME') + ' ' + this.t('HELP');
        this.emit(':ask', say, say);
    },

    'AboutIntent': function () {
        this.emit(':tell', this.t('ABOUT'));
    },

    'FleetIntent': function () {
        if (this.event.request.intent.slots.fleet.value === "federation") {
            yourShip = fedShips[Math.floor(Math.random() * fedShips.length)];
            opponentShip = klinkShips[Math.floor(Math.random() * klinkShips.length)];
        } else {
            yourShip = klinkShips[Math.floor(Math.random() * klinkShips.length)];
            opponentShip = fedShips[Math.floor(Math.random() * fedShips.length)];
        }

        var say = "Your ship is " + yourShip + " class. Red alert! " + opponentShip + " class ship sighted!";

        yourShip = JSON.parse(JSON.stringify(ships[yourShip]));
        opponentShip = JSON.parse(JSON.stringify(ships[opponentShip]));

        // Circular linked list
        yourShip.next = opponentShip;
        opponentShip.next = yourShip;

        this.emit(':tell', say);
    },

    'EngageIntent': function () {
        var winner = calcWinner();
        if (yourShip === winner) {
            var say = "The enemy has been destroyed, captain.";
        } else {
            var say = "You lose! Engage self destruct sequence!";
        }
        this.emit(':tell', say);
    },

    'AMAZON.NoIntent': function () {
        this.emit('AMAZON.StopIntent');
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', this.t('HELP'));
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP'));
    }

};

function calcWinner() {
    // function move(attacker, defender) {
    //   // TODO
    // }

    var initiateShip = Math.floor(Math.random() * 2);

    currentAttacker = (initiateShip === 0) ? yourShip : opponentShip;

    while (true) {
        if (currentAttacker.att >= currentAttacker.next.def) {
            return currentAttacker;
        }
        currentAttacker.next.def -= currentAttacker.att;

        currentAttacker = currentAttacker.next;
    }

    // if (initiateShip === 0) {
    //     while (true) {
    //         if (yourShip.att >= opponentShip.def) {
    //             return yourShip;
    //         }
    //         opponentShip.def -= yourShip.att;
    //
    //         if (opponentShip.att >= yourShip.def) {
    //             return opponentShip;
    //         }
    //         yourShip.def -= opponentShip.att;
    //     }
    // } else {
    //     while (true) {
    //         if(opponentShip.att >= yourShip.def) {
    //             return opponentShip;
    //         }
    //         yourShip.def -= opponentShip.att;
    //
    //         if (yourShip.att >= opponentShip.def) {
    //             return yourShip;
    //         }
    //         opponentShip.def -= yourShip.att;
    //     }
    // }
}
