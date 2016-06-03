// Globals + constants start here. All comments until setup function
	var WIDTH = 1200;
	var HEIGHT = 900;
	var SCALE = 1;
	
// Constants for anchoring sprites
	var LEFT = 0;
	var TOP = 0;
	var MIDDLE = .5;
	var BOTTOM = 1;
	var RIGHT = 1;

// Aliases
	TextureImage = PIXI.Texture.fromImage;
	TextureFrame = PIXI.Texture.fromFrame;
	Sprite = PIXI.Sprite;
	Container = PIXI.Container;
	Renderer = PIXI.autoDetectRenderer;

// Gameport, renderer, All containers + stage
	var gameport = document.getElementById("gameport");
	var renderer = new Renderer(WIDTH, HEIGHT);
	
	gameport.appendChild(renderer.view);
	
	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

// Containers, I use many and manipulate them to handle game screens / buttons.
	var stage 			= new Container();
	var gameplayC		= new Container();
	var instructionsC 	= new Container();
	var menuC 			= new Container();
	var creditsC 		= new Container();
	var deckC		 	= new Container();
	var discardC		= new Container();
	var playerC			= new Container();
	var dealerC			= new Container();
	var buttonsC		= new Container();
	var textC 			= new Container();
	var losingC			= new Container();
	
	stage.scale.x = SCALE;
	stage.scale.y = SCALE;
	
// Globals needed throughout game

	// booleans
	var dealing;
	var handIsActive;
	var hasMoney;
	var betActive = false;
	var busted = false;
	var dealing = false;
	var dealerHidden = false;
	var muted = false;
	
	
	var character
	var deck = [];
	var discard = [];
	var playerHand = [];
	var dealerHand = [];
	var game;
	var deckSprite;
	var discardSprite;
	var bet = 0;
	var money = 100;
	var slide;
	
// Buttons + text
	var clearBetButton;
	var doubleButton;
	var hitButton;
	var insuranceButton;
	var newBetButton;
	var placeBetButton;
	var rebetButton;
	var splitButton;
	var standButton;
	var surrenderButton;
	
	var moneyText;
	var betText;
	var plus1;
	var plus5;
	var plus10;
	
	var menuButton;
	var musicButton;
	var mutedButton;

// Locations in game
	var discardX = 75;
	var discardY = 70;
	
	var deckLocationX = 950;
	var deckLocationY = 25;
	
	var playerCardX = 375;
	var playerCardY = 450;
	
	var dealerCardX = 375;
	var dealerCardY = 50;

// Gamestate used to manipulate the containers with controlState
	var gameState;
	
	
	PIXI.loader
		.add('Assets/Cards-sprite-sheet.json')
		.add('Assets/Menu-buttons-sprite-sheet.json')
		.add('Assets/Menu-sprite-sheet.json')
		.add('Assets/png/Board.png')
		.add('Assets/Dealcard.mp3')
		.load(setup);

function setup() {
	loadGame();
	animate();
}

function loadGame() {
	createDeck();
	createButtons();
	createTexts();
	fillContainers();
	
	slide = PIXI.audioManager.getAudio("Assets/Dealcard.mp3");
}

// Creates the texts we use in the game (money, bet)
function createTexts() {
	var textOptions = { fill: '#1c7704' }
	var textOptions2 = { fill: '#ffffff' }
	
	// how much money the player has
	moneyText = new PIXI.Text(money, textOptions);
	moneyText.x = 155;
	moneyText.y = 855;
	
	// players current bet
	betText = new PIXI.Text(bet, textOptions);
	betText.x = 420;
	betText.y = 855;
	betText.interactive = true;
	
	// buttons to increase the bet
	plus1 = new PIXI.Text("+1", textOptions2);
	plus5 = new PIXI.Text("+5", textOptions2);
	plus10 = new PIXI.Text("+10", textOptions2);
	
	plus1.interactive = true;
	plus1.x = 600;
	plus1.y = 855;
	plus1.on('mousedown', function() { 
		if(!betActive) {
			if(bet + 1 <= money) {
				bet +=1; 
				betText.text = bet;
			}
		}
	} );
	
	plus5.interactive = true;
	plus5.x = 700;
	plus5.y = 855;
	plus5.on('mousedown', function() { 
		if(!betActive) {
			if(bet + 5 <= money) {
				bet +=5; 
				betText.text = bet;
			}
		}
	} );
	
	plus10.interactive = true;
	plus10.x = 800;
	plus10.y = 855;
	plus10.on('mousedown', function() {
		if(!betActive) {	
			if(bet + 10 <= money) {
				bet +=10; 
				betText.text = bet;
			}
		}
	} );
	
	// add these to textC, the container we don't remove from the stage as we change most states.
	textC.addChild(moneyText);
	textC.addChild(betText);
	textC.addChild(plus1);
	textC.addChild(plus5);
	textC.addChild(plus10);
}

// Create all the buttons that let us transition through the game states
function createButtons() {
	clearBetButton = new Button("Clear-bet", TextureFrame("Clear-bet-button.png") );
	clearBetButton.on('mousedown', function() {
	if (!betActive) {
		bet = 0;
		betText.text = bet;
	}
	} );
	
	placeBetButton = new Button("Place-bet", TextureFrame("Place-bet-button.png") );
	placeBetButton.on('mousedown', function() {
		if(bet > 0) {
			betActive = true;
			
			money -= bet;
			
			betText.text = bet;
			moneyText.text = money;
			controlState("newHand");
		}
	} );
	
	hitButton = new Button("Hit", TextureFrame("Hit-button.png") );
	hitButton.on('mousedown', function() {
		if(!busted && !dealing) {
			deck.deal('player');
			controlState('normalplay');
		}
		
	} );
	
	standButton = new Button("Stand", TextureFrame("Stand-button.png") );
	standButton.on('mousedown', function() {
	
		for(var i = buttonsC.children.length - 1; i >= 0; i--){
			buttonsC.removeChild(buttonsC.children[i]);
	}
	
	controlState('dealerActions');
		
	} );
	
	doubleButton = new Button("Double", TextureFrame("Double-button.png") );
	doubleButton.on('mousedown', function() {
		if(money > bet) {
		
			if(!busted && !dealing) {
				deck.deal('player');
				money -= bet;
				bet += bet;
				betText.text = bet;
				moneyText.text = money;
				
				for(var i = buttonsC.children.length - 1; i >= 0; i--){
					buttonsC.removeChild(buttonsC.children[i]);
				}
		
				controlState('dealerActions');
			}
		}
		
	} );
	
	insuranceButton = new Button("Insurance", TextureFrame("Insurance-button.png") );
	insuranceButton.on('mousedown', function() {
		
	} );
	
	surrenderButton = new Button("Surrender", TextureFrame("Surrender-button.png") );
	surrenderButton.on('mousedown', function() {
		
	} );

	menuButton = new Button("Menu", TextureFrame("Menu-button.png") );
	menuButton.on('mousedown', function() { controlState('menu'); } );
	menuButton.x = 1000;
	menuButton.y = 850;
	textC.addChild(menuButton);
	
	musicButton = new Button("Music", TextureFrame("Music-button1.png") );
	musicButton.on('mousedown', function() { muted = !muted; if(muted) { musicButton.texture = TextureFrame("Music-button2.png"); } else { musicButton.texture = TextureFrame("Music-button1.png" ); } } );
	musicButton.x = 1100;
	musicButton.y = 850;
	textC.addChild(musicButton);
	
	// we add menuButton and musicButton to textC since that container doesn't change with the normal game buttons.
	}

// Add and fill our containers, the menu, board etc.
function fillContainers() {
	fillBoard();
	
	menuC.addChild(new Sprite(TextureFrame("Blackjack-background.png") ) );
	
	var playButton = new Sprite(TextureFrame("play-button.png") );
	var creditsButton = new Sprite(TextureFrame("Credit-button.png") );
	var instructionsButton = new Sprite(TextureFrame("instructions-button.png" ) );
	var backButton = new Sprite(TextureFrame("back-button.png") );
	
	playButton.x = 100;
	playButton.y = 600;
	playButton.interactive = true;
	playButton.on('mousedown', function() { 
								stage.addChild(gameplayC);
								controlState('start');
								} );
	
	creditsButton.x = 900;
	creditsButton.y = 500;
	creditsButton.interactive = true;
	creditsButton.on('mousedown', function() { creditsC.addChild(backButton); controlState('credits'); } );
	
	instructionsButton.x = 900;
	instructionsButton.y = 700;
	instructionsButton.interactive = true;
	instructionsButton.on('mousedown', function() { instructionsC.addChild(backButton); controlState('instructions'); } );
	
	backButton.anchor.x = MIDDLE;
	backButton.anchor.y = MIDDLE;
	backButton.x = 600;
	backButton.y = 800;
	backButton.interactive = true;
	backButton.on('mousedown', function() { controlState('menu') } );
	
	menuC.addChild(playButton);
	menuC.addChild(creditsButton);
	menuC.addChild(instructionsButton);
	
	creditsC.addChild(new Sprite(TextureFrame("Credits-page.png") ) );
	instructionsC.addChild(new Sprite(TextureFrame("Instructions-page.png") ) );
	
	stage.addChild(menuC);
	
	losingC.addChild(new Sprite(TextureFrame("You-lose-page.png") ) );
}

// Add all of our misc. containers to the board - allows easy manipulation of cards in play.
function fillBoard() {
	board = new Sprite(TextureFrame("Assets/png/Board.png") );	
	gameplayC.addChild(board);
	gameplayC.addChild(deckC);
	gameplayC.addChild(discardC);
	gameplayC.addChild(playerC);
	gameplayC.addChild(dealerC);
	gameplayC.addChild(textC);
	gameplayC.addChild(buttonsC);
	updateDeck();
	updateDiscard();
	deck.shuffle();
	controlState('menu');
	
}

// ControlState - used to pass between initial turn, betting, dealer play, menu, etc.
function controlState(state) {
	for(var i = stage.children.length - 1; i >= 0; i--){
		stage.removeChild(stage.children[i]);
	}

	gameState = state;
	
	if(money === 0 && bet === 0 && gameState != "gameOver"){
			controlState("gameOver");
		}
		
	if(gameState === "start") {
	
		if(deck.cards.length <= 10) {
			deck.cards = deck.cards.concat(discard);
			deck.shuffle();
			deck.length = 52;
			discard = [];
			updateDeck();
			updateDiscard();
		}
		betActive = false;
		stage.addChild(gameplayC);

		placeBetButton.x = 380;
		placeBetButton.y = 775;

		clearBetButton.x = 580;
		clearBetButton.y = 775;
		
		
		plus1.visible = true;
		plus5.visible = true;
		plus10.visible = true;


		buttonsC.addChild(placeBetButton);
		buttonsC.addChild(clearBetButton);
	}
	
	else if(gameState === "newHand") {

		for(var i = buttonsC.children.length - 1; i >= 0; i--){
			buttonsC.removeChild(buttonsC.children[i]);
	}
		stage.addChild(gameplayC);
		plus1.visible = false;
		plus5.visible = false;
		plus10.visible = false;
		deck.dealHand();
		setTimeout( function() { controlState('2cards') }, 2000);

	}
	
	else if(gameState === "2cards") {
		stage.addChild(gameplayC);

		var playerscore = 0;
		var dealerscore = 0;
		var playerBJ = false;
		var dealerBJ = false;

		for(var i = 0; i < playerC.children.length; i++) {
			playerscore += playerC.children[i].value;
		}

		for(var j = 0; j < dealerC.children.length; j++) {
			dealerscore += dealerC.children[j].value;
		}
		if(playerscore === 11) {
			for(var i = 0; i < playerC.children.length; i++ ) {
				if(playerC.children[i].name === "Ace") {
					playerBJ = true;
				}
			}
		}

		if(dealerscore === 11) {
			for(var i = 0; i < dealerC.children.length; i++ ) {
				if(dealerC.children[i].name === "Ace") {
					dealerBJ = true;
				}
			}
		}
		if(dealerBJ && playerBJ) {
		
			dealerC.children[1].texture = dealerC.children[1].frontTexture;
			dealerHidden = false;
			
			setTimeout( function() {
				money += bet;
				bet = 0;
				moneyText.text = money;
				betText.text = bet;
	
				discardHand('player');
				setTimeout( function() {
					discardHand('dealer');
					controlState('start');
					return;
				}, 500 * playerC.children.length); }, 1000 )
		}
		
		else if(!dealerBJ && playerBJ) {
			
			dealerC.children[1].texture = dealerC.children[1].frontTexture;
			dealerHidden = false;
			setTimeout( function() {
				money += Math.floor(bet * 2.5);
				bet = 0;
				moneyText.text = money;
				betText.text = bet;
	
				discardHand('player');
				setTimeout( function() {
					discardHand('dealer');
					controlState('start');
					return;
				}, 500 * playerC.children.length); }, 1000 )
		}
		
		else if(dealerBJ && !playerBJ) {
			dealerC.children[1].texture = dealerC.children[1].frontTexture;
			dealerHidden = false;
			setTimeout( function() {
				bet = 0;
				moneyText.text = money;
				betText.text = bet;

				discardHand('player');
				setTimeout( function() {
					discardHand('dealer');
					controlState('start');
				}, 500 * playerC.children.length) }, 1000 )
		}
		
		
		else {
			hitButton.position.x = 300;
			hitButton.position.y = 770;
			standButton.position.x = 450;
			standButton.position.y = 770;
			doubleButton.position.x = 600;
			doubleButton.position.y = 770;

			buttonsC.addChild(hitButton);
			buttonsC.addChild(standButton);
			buttonsC.addChild(doubleButton);
		}
	}
	
	else if(gameState === "normalplay") {
	
		for(var i = buttonsC.children.length - 1; i >= 0; i--){
			buttonsC.removeChild(buttonsC.children[i]);
		}
	
		stage.addChild(gameplayC);
		
		var playerscore = 0;
		var dealerscore = 0;

		for(var i = 0; i < playerC.children.length; i++) {
			playerscore += playerC.children[i].value;
		}

		for(var j = 0; j < dealerC.children.length; j++) {
			dealerscore += dealerC.children[j].value;
		}
		
		if(playerscore > 21) {
			busted = true;
			dealerHidden = false;
			setTimeout( function() { controlState('lose') }, 1000 );
		}
		
		if(playerscore < 22) {
			setTimeout( function() {
				buttonsC.addChild(hitButton);
				buttonsC.addChild(standButton);
				hitButton.x += 75;
				standButton.x += 75; }, 500 );
		}
	}
	
	else if(gameState === "lose") {
		stage.addChild(gameplayC);
		
		for(var i = buttonsC.children.length - 1; i >= 0; i--){
			buttonsC.removeChild(buttonsC.children[i]);
		}
		
		bet = 0;
		moneyText.text = money;
		betText.text = bet;
		

		discardHand('player');
		busted = false;
		setTimeout( function() {
			discardHand('dealer');
			setTimeout ( function() {
				controlState('start'); 
				}, 1000 + (500 * dealerC.children.length) );
		}, 500 * playerC.children.length);
	}
	
	else if(gameState === "dealerActions") {
		dealerC.children[1].texture = dealerC.children[1].frontTexture;
		dealerHidden = false;
		stage.addChild(gameplayC);
		
		setTimeout( function() {
	
		
			var playerscore = 0;
			var dealerscore = 0;
			var i = 1;

			for(var i = 0; i < playerC.children.length; i++) {
				playerscore += playerC.children[i].value;
			}
	
			for(var j = 0; j < dealerC.children.length; j++) {
				dealerscore += dealerC.children[j].value;
			}
		
			finishDealerHand(dealerscore, playerscore);
		}, 1500);
	}
	
	else if (gameState === "instructions"){
		stage.addChild(instructionsC);
	}
	
	else if(gameState === "menu") {
		console.log(stage);
		stage.addChild(menuC);
	}
	
	else if(gameState === "credits") {
		stage.addChild(creditsC);
	}
	
	else if(gameState === "gameOver") {
		money = 100;
		moneyText.text = money;
		
		var instructionsButton = new Sprite(TextureFrame("instructions-button.png" ) );
		var backButton = new Sprite(TextureFrame("back-button.png") );
		
		backButton.anchor.x = MIDDLE;
		backButton.anchor.y = MIDDLE;
		backButton.x = 600;
		backButton.y = 800;
		backButton.interactive = true;
		backButton.on('mousedown', function() { controlState('menu') } );
		
		instructionsButton.x = 520;
		instructionsButton.y = 700;
		instructionsButton.interactive = true;
		instructionsButton.on('mousedown', function() { instructionsC.addChild(backButton); controlState('instructions'); } );
		
		
		
		losingC.addChild(instructionsButton);
		
		stage.addChild(losingC);
	}
}

// When the player stands, this function recursively handles the dealer's actions and decides the winner
function finishDealerHand(dealerscore, playerscore) {
	var pHasAce = 0;
	var dHasAce = 0;
	
	for(var i = 0; i < playerC.children.length; i++) {
		if(playerC.children[i].name === "Ace") {
			pHasAce += 1;
			console.log("Player has : " + pHasAce + " aces." );
		}
	}
	
	if(dealerscore < 17) {	
	
		for(var i = 0; i < dealerC.children.length; i++) {
			if(dealerC.children[i].name === "Ace") {
				dHasAce += 1;
				console.log("Dealer has : " + dHasAce + " aces." );
			}
		}
		
		if(dHasAce) {
			console.log("Here becuase dealer has an ace!");
			console.log("dealerscore pre-ace: " + dealerscore);
			if(dealerscore + 10 >= 17 && dealerscore + 10 < 22) {
				dealerscore += 10;
				console.log("Dealerscore : " + dealerscore);
				finishDealerHand(dealerscore, playerscore);
			}
			else {
				deck.deal('dealer');
				dealerscore = 0;
		
				for(var j = 0; j < dealerC.children.length; j++) {
					dealerscore += dealerC.children[j].value;
				}
		
				setTimeout( function() { finishDealerHand(dealerscore, playerscore) }, 500 );
			}
		}
		
		else {
			deck.deal('dealer');
			dealerscore = 0;
		
			for(var j = 0; j < dealerC.children.length; j++) {
				dealerscore += dealerC.children[j].value;
			}
		
			setTimeout( function() { finishDealerHand(dealerscore, playerscore) }, 500 );
		}
	}
	
	else if(dealerscore > 21) {
		money += bet * 2;
		bet = 0;
		moneyText.text = money;
		betText.text = bet;
		discardHand('player');
		setTimeout( function() {
			discardHand('dealer');
			controlState('start');
		}, 500 * playerC.children.length);
	}
	
	else {
		console.log(pHasAce);
		while(pHasAce > 0){
			console.log("player has one ace for this line of code");
			if(playerscore + 10 < 22) {
				playerscore += 10;
				console.log("Playerscore: " + playerscore + " pHasAce : " + pHasAce);
				pHasAce -= 1;
			}
		}
		console.log("Playerscore : " + playerscore);
		console.log("Dealerscore : " + dealerscore);
		if(playerscore > dealerscore) {
			money += bet * 2;
			bet = 0;
			moneyText.text = money;
			betText.text = bet;
			discardHand('player');
			setTimeout( function() {
				discardHand('dealer');
				controlState('start');
			}, 500 * playerC.children.length);
		}
		
		else if(playerscore < dealerscore) {
			bet = 0;
			moneyText.text = money;
			betText.text = bet;

			discardHand('player');
			setTimeout( function() {
				discardHand('dealer');
				controlState('start');
			}, 500 * playerC.children.length);
		}
		else if(playerscore === dealerscore) {
			money += bet;
			bet = 0;
			moneyText.text = money;
			betText.text = bet;

			discardHand('player');
			setTimeout( function() {
				discardHand('dealer');
				controlState('start');
			}, 500 * playerC.children.length);
		}
	}
}

// discard the hands after the final hand state is reached
function discardHand(entity) {
	var pcards = playerC.children.length;
	var dcards = dealerC.children.length;
	
	if(entity === 'player') {
		for(var i = 1; i < pcards + 1; i++) {
			createjs.Tween.get(playerC.getChildAt(i - 1).position).wait(500 * i).to({x : discardX, y : discardY}, 500);
			
			setTimeout(function () { 
				card = playerC.children.shift();
				discard.push(card);
				
				updateDiscard();
				updateDeck();
			
			}, (i+1) * 500);
		}
	}
	
	else if(entity === 'dealer') {
		for(var i = 1; i < dcards + 1; i++) {
			createjs.Tween.get(dealerC.getChildAt(i - 1).position).wait(500 * i).to({x : discardX, y : discardY}, 500);
			
			setTimeout(function () { 
				card = dealerC.children.shift();
				discard.push(card);
				
				updateDiscard();
				updateDeck();
				
				
			}, (i+1) * 500);
		}
	}
}

// keeps the sprites for the deck looking nice based on cards left in deck.
function updateDeck() {

	var deckLocationX = 950;
	var deckLocationY = 25;

	for(var i = deckC.children.length - 1; i >= 0; i--) {
		deckC.removeChild(deckC.children[i]);
	}
	
	for(var i = 0; i < deck.length; i++) {
		if(i >= 10) {
			return;
		}
		else {
			deckSprite = new Sprite(TextureFrame("Card-back.png") );
		
			deckLocationX -= 1;
			deckLocationY += 1;
		
			deckSprite.x = deckLocationX;
			deckSprite.y = deckLocationY;
			deckC.addChild(deckSprite);
		}
	}
}

// keeps discard looking nice, especially when the deck is shuffled.
function updateDiscard() {
	
	var discardX = 75;
	var discardY = 70;
	
	for(var i = discardC.children.length - 1; i >= 0; i--) {
		discardC.removeChild(discardC.children[i]);
	}
	
	for(var i = 0; i < discard.length; i++) {
		if(i >= 10) {
			return;
		}
		else {
			discardSprite = new Sprite(TextureFrame("Card-back.png") );
			
			discardX += 1;
			discardY += 1;
			
			discardSprite.x = discardX;
			discardSprite.y = discardY;
			
			discardC.addChild(discardSprite);
		}
	}
}

// creates our deck
function createDeck() {
	deck = new Deck();
	deck.fill();
}

// helper function
function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// basic animation
function animate() {
	requestAnimationFrame(animate);
	renderer.render(stage);
}

// enhanced sprite class I have used in all of my projects
class EnhSprite extends PIXI.Sprite {
	constructor(name, texture) {
		super(texture);
		this.name = name;
	}
}

// button class that just makes sure the buttons are interactive
class Button extends EnhSprite {
	constructor(name, texture) {
		super(name, texture);
		
		this.interactive = true;
	}
}

// Basic card that makes cards interactive and anchors them correctly, etc
class Card extends EnhSprite {
	constructor(name, suit, value, texture) {
		super(name, texture);
		this.suit = suit;
		this.value = value;
		
		this.width = 225;
		this.height = 315;
		
		this.interactive = true;
		
		this.anchor.x = LEFT;
		this.anchor.y = TOP;
	}
}

// Deck class used in our blackjack game.
class Deck {
	constructor() {
		this.cards = [];
		this.length = 0;
	}
	
	// fills our deck with new card objects
	fill() {
		var name;
		var suit;
		var value;
		
		for(var i = 0; i < 13; i++ ) {
			switch(i) {
				case 0:
					name = 'Ace';
					value = 1;
					break;
				case 1:
					name = 'Two';
					value = 2;
					break;
				case 2:
					name = 'Three';
					value = 3;
					break;
				case 3:
					name = 'Four';
					value = 4;
					break;
				case 4:
					name = 'Five';
					value = 5;
					break;
				case 5:
					name = 'Six';
					value = 6;
					break;
				case 6:
					name = 'Seven';
					value = 7;
					break;
				case 7:
					name = 'Eight';
					value = 8;
					break;
				case 8:
					name = 'Nine';
					value = 9;
					break;
				case 9:
					name = 'Ten';
					value = 10;
					break;
				case 10:
					name = 'Jack';
					value = 10;
					break;
				case 11:
					name = 'Queen';
					value = 10;
					break;
				case 12:
					name = 'King';
					value = 10;
					break;
			}
			
			for(var j = 1; j < 5; j++ ) { 
				
				switch(j) {
					case 1:
						suit = 'Hearts';
						break;
					case 2:
						suit = 'Diamonds';
						break;
					case 3:
						suit = 'Spades';
						break;
					case 4:
						suit = 'Clubs';
						break;
				}
				try {
					var card = new Card(name, suit, value, (TextureFrame(name + 's' + j + '.png' ) ) );
				}
				catch(error) {
					var card = new Card(name, suit, value, (TextureFrame(name + 'es' + j + '.png' ) ) );
					
				}
				this.cards.push(card);
				this.length += 1;
			}
		}
	}
	
	// shuffles deck
	shuffle() {
		var index = this.cards.length;
		
		while(index) {
			var i = randInt(0, index);
			index--;
			
			var temp = this.cards[index];
			this.cards[index] = this.cards[i];
			this.cards[i] = temp;
		}
	
	}

	// handles everything from getting a card from the deck to the player/dealer
	deal(entity) {
		dealing = true;
		var card = this.cards.shift();
		card.x = deckLocationX;
		card.y = deckLocationY;
		
		if(entity === 'player') {
			playerHand.push(card);
			playerC.addChild(card);
			createjs.Tween.get(card.position).to({x: playerCardX, y: playerCardY }, 500);
			if(!muted) {
				slide.play();
			}
			playerCardX += 65;
		}
		
		else if(entity === 'dealer') {
			dealerHand.push(card);
			dealerC.addChild(card);
			if(dealerHidden) {
				card.frontTexture = card.texture;
				card.texture = (TextureFrame('Card-back.png'));
			}
			createjs.Tween.get(card.position).to({x: dealerCardX, y: dealerCardY }, 500);
			if(!muted) {
				slide.play();
			}
			dealerCardX += 65;
		}
		
		setTimeout( function() {
			dealing = false;
			}, 500);

		this.length -= 1;
	}
	
	// starts hands this way, allows me to make dealer card hidden.
	dealHand(entity) {
		playerCardX = 375;
		playerCardY = 450;
	
		dealerCardX = 375;
		dealerCardY = 50;
	
	
		setTimeout( function() {
					deck.deal('player'); },
					475);
		setTimeout( function() {
					deck.deal('player'); },
					1425);
		setTimeout( function() {
					deck.deal('dealer') },
					950);
		setTimeout( function() {
					dealerHidden = true;
					deck.deal('dealer');
					dealerHidden = false;},
					1900);
	}
}