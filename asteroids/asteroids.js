
WIDTH = 1000;
HEIGHT = 600;
ASTEROID_RADIUS = 15;
SHIP_RADIUS = 20;
BULLET_RADIUS = 5;
ASTEROID_MAX_VEL = 5;
SHIP_MAX_VEL = 8;
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
        game.asteroids = _.without(game.asteroids, that);
        game.asteroids.push(Asteroid.newRandom(game));
      }
    }

  };



  Asteroid.newRandom = function (game) {

    var leftAndRight = Boolean(Math.round(Math.random()));

    if (leftAndRight) {
      var x = Math.round(Math.random()) * WIDTH;
      var y = Math.floor(Math.random() * HEIGHT);
    } else {
      var x = Math.floor(Math.random() * WIDTH);
      var y = Math.round(Math.random()) * HEIGHT;
    }

    return new Asteroid (
      x,
      y,
      { x: Math.floor(Math.random() * ASTEROID_MAX_VEL * 2) - ASTEROID_MAX_VEL,
        y: Math.floor(Math.random() * ASTEROID_MAX_VEL * 2) - ASTEROID_MAX_VEL
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

    that.angle = Math.PI/4;

    that.speed = 0;

    that.adjustSpeed = function (increment) {
      that.speed += increment;

      if (that.speed > SHIP_MAX_VEL) {
        that.speed = SHIP_MAX_VEL;
      } else if (that.speed < 0) {
        that.speed = 0;
      };

    };

    that.draw = function (ctx) {
      ctx.fillStyle = "rgb(255,0,0)";
      ctx.beginPath();
      ctx.arc(that.pos.x, that.pos.y,
              SHIP_RADIUS,
              that.angle - (Math.PI/2), (that.angle + (Math.PI/2)),
              true);
      ctx.fill();

    };

    that.update = function () {
      that.pos.x += (Math.cos(that.angle) * that.speed);
      that.pos.y += (Math.sin(that.angle) * that.speed);

      if (that.pos.x < 0) {
        that.pos.x = WIDTH;
      } else if (that.pos.y < 0) {
        that.pos.y = HEIGHT;
      } else if (that.pos.x > WIDTH) {
        that.pos.x = 0;
      } else if (that.pos.y > HEIGHT) {
        that.pos.y = 0;
      };

    };

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

    that.fireBullet = function (game) {
      var newBullet = new Bullet(that.pos.x, that.pos.y, that.angle, game);
      game.bullets.push(newBullet);
    };

    // that.changeDirection = function (dx, dy) {
    //   that.direction.x += dx;
    //   that.direction.y += dy;
    // };

  };

  function Bullet (x, y, angle, game) {
    var that = this;

    that.pos = {
      x: x,
      y: y
    };
    that.angle = angle;
    that.speed = 12;

    that.draw = function (ctx) {
      ctx.fillStyle = "rgb(0,255,0)";
      ctx.beginPath();
      ctx.arc(that.pos.x, that.pos.y, BULLET_RADIUS, 0, 2*Math.PI, true);
      ctx.fill();
    };

    that.update = function () {
      that.pos.x += (Math.cos(that.angle) * that.speed);
      that.pos.y += (Math.sin(that.angle) * that.speed);

      if (that.pos.x < 0 || that.pos.y < 0 ||
          that.pos.x > WIDTH || that.pos.y > HEIGHT) {
        game.bullets = _.without(game.bullets, that);
      };
    };

    that.hitAsteroid = function (asteroid) {
      var distance = Math.sqrt(
                     Math.pow(asteroid.pos.x - that.pos.x, 2) +
                     Math.pow(asteroid.pos.y - that.pos.y, 2));

      if (distance < (ASTEROID_RADIUS + BULLET_RADIUS)) {
        console.log("asteroid destroyed!!!");
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
    that.bullets = [];

    that.draw = function () {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      that.ship.draw(ctx);

      that.bullets.forEach(function(bullet) {
        bullet.draw(ctx);
      });
      that.asteroids.forEach(function(asteroid) {
        asteroid.draw(ctx);
      });
    };

    that.update = function () {
      that.ship.update();

      that.bullets.forEach(function(bullet) {
        bullet.update();
      });

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
        that.bullets.forEach(function(bullet) {
          if (bullet.hitAsteroid(asteroid)) {
            that.asteroids = _.without(that.asteroids, asteroid);
            that.bullets = _.without(that.bullets, bullet);
          };
        });
      });
    };

    that.replenishAsteroids = function () {
      _.times(10 - that.asteroids.length, function() {
        that.asteroids.push(Asteroid.newRandom(that));
      });
    }

    that.start = function () {
      that.timerId = setInterval(function () {
        that.replenishAsteroids();
        that.pressedKeyHandlers();
        that.update();
        that.draw();
        that.checkCollision();
      }, 1000/FPS);
    };

    that.pressedKeyHandlers = function() {

      if (key.isPressed("up")) {
        that.ship.adjustSpeed(0.25);
      };

      if (key.isPressed("down")) {
        that.ship.adjustSpeed(-0.25);
      };

      if (key.isPressed("left")) {
        that.ship.angle -= (Math.PI/32);
      };

      if (key.isPressed("right")) {
        that.ship.angle += (Math.PI/32);
      };

      key("space", function () {
        that.ship.fireBullet(that);
      })
    };


  };

  return {
    Asteroid: Asteroid,
    Game: Game
  };

})();



$(function () {
  var canvas = document.getElementById('asteroids');
  var ctx = canvas.getContext('2d');

  new Asteroids.Game(ctx).start();

})