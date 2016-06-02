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

	var stage 			= new Container();
	var gameplayC		= new Container();
	var titleC 			= new Container();
	var instructionsC 	= new Container();
	var menuC 			= new Container();
	var creditsC 		= new Container();
	var deckC		 	= new Container();
	var discardC		= new Container();
	var playerC			= new Container();
	var dealerC			= new Container();
	
	stage.scale.x = SCALE;
	stage.scale.y = SCALE;
	
// Misc globals needed throughout game
	var dealing;
	var handIsActive;
	var hasMoney;
	var character
	var deck = [];
	var discard = [];
	var playerHand = [];
	var dealerHand = [];
	var game;
	var deckSprite;
	var discardSprite;

// Locations in game
	var discardX = 75;
	var discardY = 70;
	
	var deckLocationX = 950;
	var deckLocationY = 25;
	
	var playerCardX = 375;
	var playerCardY = 450;
	
	var dealerCardX = 375;
	var dealerCardY = 50;
	var gameState;
	
	
	PIXI.loader
		.add('Assets/Cards-sprite-sheet.json')
		.add('Assets/Menu-buttons-sprite-sheet.json')
		.add('Assets/png/Board.png')
		.load(setup);

function setup() {
	createDeck();
	fillContainers();
	animate();
}

function fillContainers() {
	fillBoard();
	stage.addChild(gameplayC);
}

function fillBoard() {

	board = new Sprite(TextureFrame("Assets/png/Board.png") );	
	gameplayC.addChild(board);
	gameplayC.addChild(deckC);
	gameplayC.addChild(discardC);
	gameplayC.addChild(playerC);
	gameplayC.addChild(dealerC);
	updateDeck();
	updateDiscard();
	deck.shuffle();
	controlState('play');
	
}

function controlState(state) {
	for(var i = stage.children.length - 1; i >= 0; i--){
		stage.removeChild(stage.children[i]);
	}
	
	gameState = state;
	
	if(gameState === "play") {
		stage.addChild(gameplayC);
	}
	else if(gameState === "main") {
		stage.addChild(mainMenuC);
	}
	else if (gameState === "title"){
		stage.addChild(titleC);
	}
	else if (gameState === "instructions"){
		stage.addChild(instructionsC);
	}
	else if(gameState === "win") {
		stage.addChild(winC);
	}
	
	else if(gameState === "menu") {
		stage.addChild(menuC);
	}
	
	else if(gameState === "credits") {
		stage.addChild(creditsC);
	}
	
}
function updateDeck() {
	for(var i = deckC.length - 1; i >= 0; i--) {
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

function updateDiscard() {

	for(var i = discardC.length - 1; i >= 0; i--) {
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

function createDeck() {
	deck = new Deck();
	deck.fill();
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(stage);
}

class EnhSprite extends PIXI.Sprite {
	constructor(name, texture) {
		super(texture);
		this.name = name;
	}
}

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

class Deck {
	constructor() {
		this.cards = [];
		this.length = 0;
	}
	
	fill() {
		var name;
		var suit;
		
		for(var i = 0; i < 13; i++ ) {
			switch(i) {
				case 0:
					name = 'Ace';
					break;
				case 1:
					name = 'Two';
					break;
				case 2:
					name = 'Three';
					break;
				case 3:
					name = 'Four';
					break;
				case 4:
					name = 'Five';
					break;
				case 5:
					name = 'Six';
					break;
				case 6:
					name = 'Seven';
					break;
				case 7:
					name = 'Eight';
					break;
				case 8:
					name = 'Nine';
					break;
				case 9:
					name = 'Ten';
					break;
				case 10:
					name = 'Jack';
					break;
				case 11:
					name = 'Queen';
					break;
				case 12:
					name = 'King';
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
					var card = new Card(name, suit, i+1, (TextureFrame(name + 's' + j + '.png' ) ) );
				}
				catch(error) {
					var card = new Card(name, suit, i+1, (TextureFrame(name + 'es' + j + '.png' ) ) );
					
				}
				this.cards.push(card);
				this.length += 1;
			}
		}
	}
	
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

	deal(entity) {
		
		var card = this.cards.shift();
		card.x = deckLocationX;
		card.y = deckLocationY;
		
		if(entity === 'player') {
			playerHand.push(card);
			playerC.addChild(card);
			createjs.Tween.get(card.position).to({x: playerCardX, y: playerCardY }, 500);
			playerCardX += 135;
		}
		
		else if(entity === 'dealer') {
			dealerHand.push(card);
			dealerC.addChild(card);
			createjs.Tween.get(card.position).to({x: dealerCardX, y: dealerCardY }, 500);
			dealerCardX += 135;
		}
		
		this.length -= 1;
	}
	
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
					deck.deal('dealer'); },
					1900);
				
	}
}