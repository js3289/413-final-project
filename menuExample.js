var gameport = document.getElementById("gameport");

var renderer = PIXI.autoDetectRenderer(400, 400, {backgroundColor: 0x5544AA});
gameport.appendChild(renderer.view);

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

PIXI.loader
  .add('gamefont.fnt')
  .add('hand.png')
  .load(ready);

var stage = new PIXI.Container();
var hand;

function moveHand(y) {
  if (!hand) return;
  createjs.Tween.removeTweens(hand.position);
  createjs.Tween.get(hand.position).to({y: 10 + y}, 500, createjs.Ease.bounceOut);
}

var menu = StateMachine.create({
  initial: {state: 'fight', event: 'init'},
  error: function() {},
  events: [
    {name: "down", from: "fight", to: "magic"},
    {name: "down", from: "magic", to: "steal"},
    {name: "down", from: "steal", to: "item"},
    {name: "down", from: "item", to: "run"},
    {name: "down", from: "run", to: "run"},
    
    {name: "up", from: "fight", to: "fight"},
    {name: "up", from: "magic", to: "fight"},
    {name: "up", from: "steal", to: "magic"},
    {name: "up", from: "item", to: "steal"},
    {name: "up", from: "run", to: "item"}],
  callbacks: {
    onfight: function() { moveHand(0); },
    onmagic: function() { moveHand(19*1); },
    onsteal: function() { moveHand(19*2); },
    onitem: function() { moveHand(19*3); },
    onrun: function() { moveHand(19*4); }
  }
});

function keydownEventHandler(e) {

  if (e.keyCode == 87) { // W key
    menu.up();
  }

  if (e.keyCode == 83) { // S key
    menu.down();
  }
}

document.addEventListener('keydown', keydownEventHandler);

function ready() {
  stage.scale.x = 3;
  stage.scale.y = 3;
  
  var text = new PIXI.extras.BitmapText("fight\nmagic\nsteal\nitem\nrun", {font: "16px gamefont"});
  text.position.x = 26;
  text.position.y = 10;
  stage.addChild(text);
  
  hand = new PIXI.Sprite(PIXI.Texture.fromFrame("hand.png"));
  hand.position.x = 4;
  hand.position.y = 10;
  stage.addChild(hand);
  
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(stage);
}

