//-----------------
//  SNAKE PATTERN     
//-----------------
var bgCanvas = document.getElementById("snakeCanvas");
var bgCtx = bgCanvas.getContext("2d");

function resizeBgCanvas(){
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
  drawSnakePattern();
}

function drawSnakePattern(){
  bgCtx.clearRect(0,0,bgCanvas.width, bgCanvas.height);
  //Retro 8-bit style watermark matching the palette 
  bgCtx.strokeStyle = "#768256";
  bgCtx.lineWidth = 32;
  bgCtx.lineCap = "square";
  bgCtx.lineJoin = "miter";

  var totalSnakes = 3; //To control how many snakes pattern generate on screen

  for (var i = 0; i <totalSnakes; i++){
    //Randomly start along the left edge, snapping it to the block grid
    var x = 0;
    var y = Math.floor(Math.random()*(bgCanvas.height/32))*32;

    bgCtx.beginPath();
    bgCtx.moveTo(x,y);

    var segmentLength = 64;
  
    while (x < bgCanvas.width){
      x += segmentLength; //Slithers strictyly up or down in sharp 90 degrees
      y += (Math.random() > 0.5 ? 96 : -96);

      //Bound the background path safety borders

      if (y < 32) y = 64;
      if (y > bgCanvas.height - 32) y = bgCanvas.height -64;

      bgCtx.lineTo(x,y);
    }
    bgCtx.stroke(); 
  }
}

window.addEventListener("resize", resizeBgCanvas);
resizeBgCanvas(); //To build the first background pattern immediately

//-----------
//    GAME   
//-----------
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

//Initializing the variables
var score = 0;
var count = 0;
var grid = 16;

//Variable to hold the custom frame delay based on slider value
var frameDelay = 6;

//Event Listener to update the speed dynamically when slider moves
var speedSlider = document.getElementById("speedSlider");
var speedValue = document.getElementById("speedValue");
if (speedSlider && speedValue){
  speedSlider.addEventListener("input", function(e){
    frameDelay = 17 - parseInt(e.target.value);
    speedValue.innerHTML = e.target.value;
  });
}

//Creating the objects
var snake = {
  x: 160,
  y: 160,
  dx: grid,
  dy: 0,
  cells: [],
  maxCells: 4,
};
var apple = {
  x: 320,
  y: 320,
};

//The Keys
document.addEventListener("keydown", function (e) {
  //left arrow key
  if (e.which === 37 && snake.dx === 0) {
    snake.dx = -grid;
    snake.dy = 0;
  }
  //Up arrow key
  else if (e.which === 38 && snake.dy === 0) {
    snake.dy = -grid;
    snake.dx = 0;
  }
  //Right arrow key
  else if (e.which === 39 && snake.dx === 0) {
    snake.dx = grid;
    snake.dy = 0;
  }
  //Down arrow key
  else if (e.which === 40 && snake.dy === 0) {
    snake.dy = grid;
    snake.dx = 0;
  }
});

//The Randomizer
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

//Game Loop
function Loop() {
  requestAnimationFrame(Loop);
  if (++count < frameDelay) {
    return;
  }
  count = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //Moving the snake velocity
  snake.x += snake.dx;
  snake.y += snake.dy;
  //Wrapping the snake position horizontally on the edge of the screen
  if (snake.x < 0) {
    snake.x = canvas.width - grid;
  } else if (snake.x >= canvas.width) {
    snake.x = 0;
  }
  //Wrapping the snake position vertically on the edge of the screen
  if (snake.y < 0) {
    snake.y = canvas.height - grid;
  } else if (snake.y >= canvas.height) {
    snake.y = 0;
  }
  //Keeping track of where the snake has been. Front of the array is always the heaf of the snake
  snake.cells.unshift({ x: snake.x, y: snake.y });
  //Removing the cells as we move away from them
  if (snake.cells.length > snake.maxCells) {
    snake.cells.pop();
  }
  //Drawing the apple
  ctx.fillStyle = "red";
  ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);
  //Drawing the snake one cell at a time
  ctx.fillStyle = "#a3b574";
  snake.cells.forEach(function (cell, index) {
    ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);
    //Snake ate the apple
    if (cell.x === apple.x && cell.y === apple.y) {
      score += 1;
      document.getElementById("score").innerHTML = score;
      snake.maxCells += 1;
      apple.x = getRandomInt(0, 25) * grid;
      apple.y = getRandomInt(0, 25) * grid;
    }
    for (var i = index + 1; i < snake.cells.length; i++) {
      if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
        snake.x = 160;
        snake.y = 160;
        snake.cells = [];
        snake.maxCells = 4;
        snake.dx = grid;
        snake.dy = 0;
        apple.x = getRandomInt(0, 25) * grid;
        apple.y = getRandomInt(0, 25) * grid;
      }
    }
  });
}
requestAnimationFrame(Loop);
