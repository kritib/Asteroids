
WIDTH = 1000;
HEIGHT = 600;
ASTEROID_RADIUS = 15;
SHIP_RADIUS = 10;
MAX_VEL = 5;
FPS = 32;

var Asteroids = (function() {
  function Asteroid (x, y, vel, game) {
    var that = this;

    that.pos = {
        x: x,
        y: y
      };

    that.vel = vel;

    that.draw = function (ctx) {
      ctx.fillStyle = "rgb(0,0,0)";
      ctx.beginPath();
      ctx.arc(that.pos.x, that.pos.y, ASTEROID_RADIUS, 0, 2*Math.PI, true);
      ctx.fill();
    }

    that.update = function () {
      that.pos.x += that.vel.x;
      that.pos.y += that.vel.y;

      if (that.pos.x < 0 || that.pos.y < 0 ||
          that.pos.x > WIDTH || that.pos.y > HEIGHT) {
        game.asteroids = _.without(game.asteroids, that)
      }
    }

  };



  Asteroid.newRandom = function (game) {
    return new Asteroid (
      Math.floor(Math.random() * WIDTH),
      Math.floor(Math.random() * HEIGHT),
      { x: Math.floor(Math.random() * MAX_VEL * 2) - MAX_VEL,
        y: Math.floor(Math.random() * MAX_VEL * 2) - MAX_VEL
      },
      game
    )
  };

  function Ship () {
    var that = this;

    that.pos = {
      x: WIDTH/2,
      y: HEIGHT/2
    };

    that.draw = function (ctx) {
      ctx.fillStyle = "rgb(255,0,0)";
      ctx.beginPath();
      ctx.arc(that.pos.x, that.pos.y, SHIP_RADIUS, 0, 2*Math.PI, true);
      ctx.fill();
    };

    // that.isHit = function (asteroids) {

    //   var isHitBool = false;

    //   asteroids.forEach( function (asteroid) {
    //     var distance = Math.sqrt(
    //                    Math.pow(asteroid.pos.x - that.pos.x, 2) +
    //                    Math.pow(asteroid.pos.y - that.pos.y, 2));

    //     if (distance < (ASTEROID_RADIUS + SHIP_RADIUS)) {
    //       console.log("ship is hit!!!");
    //       isHitBool = true;
    //     }
    //     return isHitBool;
    //   })

    // }

    that.isHit = function (asteroid) {

      var distance = Math.sqrt(
                     Math.pow(asteroid.pos.x - that.pos.x, 2) +
                     Math.pow(asteroid.pos.y - that.pos.y, 2));

      if (distance < (ASTEROID_RADIUS + SHIP_RADIUS)) {
        console.log("ship is hit!!!");
        return true;
      } else {
        return false;
      }

    };

  };



  function Game (ctx) {
    var that = this;

    that.asteroids = [];
    that.ship = new Ship;

    _.times(10, function() {
    that.asteroids.push(Asteroid.newRandom(that));
    });

    that.draw = function () {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      that.ship.draw(ctx);
      that.asteroids.forEach(function(asteroid) {
        asteroid.draw(ctx);
      });
    };

    that.update = function () {

      that.asteroids.forEach(function(asteroid) {
        asteroid.update();
      })
    };

    that.checkCollision = function () {
      that.asteroids.forEach(function(asteroid) {
        if (that.ship.isHit(asteroid)) {
          clearInterval(that.timerId);
          alert("Game Over");
        }
      })
    };

    that.start = function () {
      that.timerId = setInterval(function () {
        that.update();
        that.draw();
        that.checkCollision();
        console.log(that.asteroids);
      }, 1000/FPS);
    }


  };

  return {
    Asteroid: Asteroid,
    Game: Game
  };

})();



$(function () {
  var canvas = document.getElementById('asteroids');
  var ctx = canvas.getContext('2d');

  console.log('here');
  new Asteroids.Game(ctx).start();


})