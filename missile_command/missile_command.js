WIDTH = 500;
HEIGHT = 600;
FPS = 32;

var MC = (function () {

  function Missile (x, angle) {
    var that = this;

    that.startPos = {
      x: x,
      y: 0
    };

    that.currentPos = {
      x: x,
      y: 0
    }

    that.angle = angle;
    that.speed = 4;

    that.draw = function (ctx) {
      ctx.strokeStyle = "rgb(255, 0, 0)";
      ctx.beginPath();
      ctx.moveTo(that.startPos.x, that.startPos.y);
      ctx.lineTo(that.currentPos.x, that.currentPos.y);
      ctx.stroke();
    };

    that.update = function () {
      that.currentPos.x += (Math.cos(that.angle) * that.speed);
      that.currentPos.y += (Math.sin(that.angle) * that.speed);
    };


  };

  Missile.newRandom = function () {
    x = Math.floor(Math.random() * WIDTH);
    angle = (Math.random() * (Math.PI/3)) + (Math.PI/3);

    return new Missile (x, angle);
  };


  function Base (x) {
    var that = this;

    that.pos = {
      x: x,
      y: HEIGHT - 10 };

    that.cannons = 10;

    that.draw = function (ctx) {
      ctx.fillText(that.cannons, that.pos.x, that.pos.y);

    };

    that.update = function () {

    };

    that.fireCannon = function(x, y, game) {
      that.cannons--;
      game.firedCannons.push(new Cannon(that.pos.x, that.pos.y, x, y));



    };

  };

  function Cannon (startX, startY, endX, endY) {
    var that = this;


    that.startPos = {
      x: startX,
      y: startY
    };

    that.currentPos = {
      x: startX,
      y: startY
    };

    that.angle = Math.atan((endY - startY)/(endX - startX));
    that.speed = 6;

    that.draw = function (ctx) {
      ctx.strokeStyle = "rgb(0, 255, 0)";
      ctx.beginPath();
      ctx.moveTo(that.startPos.x, that.startPos.y);
      ctx.lineTo(that.currentPos.x, that.currentPos.y);
      ctx.stroke();
    };

    that.update = function () {
      that.currentPos.x += (Math.cos(that.angle) * that.speed);
      that.currentPos.y += (Math.sin(that.angle) * that.speed);

      var distance = Math.sqrt(
                     Math.pow(that.currentPos.x - endX, 2) +
                     Math.pow(that.currentPos.y - endY, 2));

      if (distance < 10) {
        that.explode();
      };
    };

    that.explode = function () {
    }
  }

  function Game (ctx) {
    var that = this;

    that.missiles = [];

    _.times(10, function () {
      that.missiles.push(Missile.newRandom())
    });

    that.bases = [new Base(20),
                  new Base(WIDTH / 2),
                  new Base(WIDTH - 30)];

    that.firedCannons = [];

    that.setupCanvas = function () {

    }

    that.draw = function () {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      that.missiles.forEach(function (missile) {
        missile.draw(ctx);
      });

      that.bases.forEach(function (base) {
        base.draw(ctx);
      });

      that.firedCannons.forEach(function (firedCannon) {
        firedCannon.draw(ctx);
      });


    }

    that.update = function () {
      that.missiles.forEach(function (missile) {
        missile.update();
      });

      that.bases.forEach(function (base) {
        base.update();
      });

      that.firedCannons.forEach(function (firedCannon) {
        firedCannon.update();
      });
    }

    that.start = function () {
      that.mouseClickHandler();
      that.timerId = setInterval(function () {
        that.update();
        that.draw();
        // that.checkCollision();
      }, 1000/FPS);
    };

    that.closestBase = function (x) {
      var distance = WIDTH;
      var closest = null;

      that.bases.forEach(function (base) {
        if (base.cannons > 0) {
          if (Math.abs(base.pos.x - x) < distance) {
            closest = base;
            distance = Math.abs(base.pos.x - x);
          };
        };
      })
      return closest;
    };


    that.mouseClickHandler = function () {
      $('canvas').click(function (event) {
        var base = that.closestBase(event.pageX);
        base.fireCannon(event.pageX - 13, event.pageY - 13, that);


      })

    }




  };

  return {
    Game: Game
  }


})();


$(function () {
  var canvas = $("<canvas width='"+ WIDTH + "' height='"
              + HEIGHT + "'></canvas>");

  $('body').append(canvas);

  var ctx = canvas.get(0).getContext('2d');
  new MC.Game(ctx).start();

})