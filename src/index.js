(function () {
  /**
   * Realize drawing circle and line:
   * 1. Add events touchstart, touchmove, touchend
   * 2, touchstart judges whether the clicked position is in the circle getPosition, and it is initialized
   * lastpoint, restPoint
   * 3. What touchmove does is: draw a circle drawPoint and draw a line drawLine
   *
   * Realize the effect of automatic circle drawing
   * 1. Check whether the position moved by the gesture is within the circle
   * 2. If inside the circle, draw a circle drawPoint
   * 3. A circle that has been drawn with a solid circle, no need to repeat the inspection
   *
   * Achieve successful unlocking:
   * 1. Check whether the path is correct
   * 2. Reset if it is right, the circle turns green
   * 3. Reset if it’s wrong, the circle turns red
   * 4. Reset
   */

  window.canvasLock = function (obj) {
    this.height = obj.height;
    this.width = obj.width;
    this.chooseType = obj.chooseType;
  };

  // js way to dynamically generate dom
  canvasLock.prototype.initDom = function () {
    var wrap = document.createElement("div");
    var str = '<h4 id="title" class="title">Draw password</h4>';
    wrap.setAttribute(
      "style",
      "position: absolute;top:0;left:0;right:0;bottom:0;"
    );

    var canvas = document.createElement("canvas");
    canvas.setAttribute("id", "canvas");
    canvas.style.cssText =
      "background-color: #305066;display: inline-block;margin-top: 15px;";

    wrap.innerHTML = str;
    wrap.appendChild(canvas);

    var width = this.width || 300;
    var height = this.height || 300;

    document.body.appendChild(wrap);

    // HD screen lock
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    canvas.width = width;
    canvas.height = height;
  };
  canvasLock.prototype.drawCle = function (x, y) {
    // Initialize the unlock password panel

    this.ctx.strokeStyle = "#CFE6FF";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
    this.ctx.closePath();
    this.ctx.stroke();
  };
  canvasLock.prototype.createCircle = function () {
    // Create the coordinates of the unlock point, and distribute the radius evenly according to the size of the canvas

    var n = this.chooseType;
    var count = 0;
    this.r = this.ctx.canvas.width / (2 + 4 * n); // 公式计算
    this.lastPoint = [];
    this.arr = [];
    this.restPoint = [];
    var r = this.r;
    for (var i = 0; i < n; i++) {
      for (var j = 0; j < n; j++) {
        count++;
        var obj = {
          x: j * 4 * r + 3 * r,
          y: i * 4 * r + 3 * r,
          index: count,
        };
        this.arr.push(obj);
        this.restPoint.push(obj);
      }
    }

    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    for (var i = 0; i < this.arr.length; i++) {
      // Circle function

      this.drawCle(this.arr[i].x, this.arr[i].y);
    }
    //return arr;
  };

  // init
  canvasLock.prototype.init = function () {
    this.initDom();
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.touchFlag = false;

    // 1. Determine the radius
    // 2. Determine the center coordinate point of each circle
    // 3. 3 circles in a row have 14 radii, 4 circles in a row have 18 radii
    this.createCircle();
    this.bindEvent();
  };

  canvasLock.prototype.bindEvent = function () {
    var self = this;
    this.canvas.addEventListener(
      "touchstart",
      function (e) {
        // 2, touchstart judges whether the clicked position is in the circle getPosition, and it is initialized
        // * lastpoint, restPoint

        // po has x and y, and is compared to the canvas margin
        var po = self.getPosition(e);
        console.log(po.x);
        // judging whether it is in the circle: the extra line x/y <r is in the circle

        for (var i = 0; i < self.arr.length; i++) {
          if (
            Math.abs(po.x - self.arr[i].x) < self.r &&
            Math.abs(po.y - self.arr[i].y) < self.r
          ) {
            self.touchFlag = true;

            // lastPoint stores the x/y coordinates of the selected circle

            self.lastPoint.push(self.arr[i]);

            self.restPoint.splice(i, 1);
            break;
          }
        }
      },
      false
    );

    this.canvas.addEventListener(
      "touchmove",
      function (e) {
        // What touchmove does is: draw a circle drawLine and a line drawLine

        if (self.touchFlag) {
          self.update(self.getPosition(e));
        }
      },
      false
    );

    this.canvas.addEventListener(
      "touchend",
      function (e) {
        if (self.touchFlag) {
          self.storePass(self.lastPoint);
          setTimeout(function () {
            self.reset();
          }, 300);
        }
      },
      false
    );
  };

  canvasLock.prototype.getPosition = function (e) {
    // Get the coordinates of the touch point relative to the canvas
    var rect = e.currentTarget.getBoundingClientRect();
    var po = {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    };
    return po;
  };

  canvasLock.prototype.update = function (po) {
    // The core transform method is called when touchmove

    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Re-draw 9 circles

    for (var i = 0; i < this.arr.length; i++) {
      // Draw the panel first every frame

      this.drawCle(this.arr[i].x, this.arr[i].y);
    }

    this.drawPoint();
    this.drawLine(po);

    // 1. Check whether the position moved by the gesture is in the next circle
    // 2. If inside the circle, draw a circle drawPoint
    // 3. Circles that have been drawn with solid circles, no need to repeat inspection
    for (var i = 0; i < this.restPoint.length; i++) {
      if (
        Math.abs(po.x - this.restPoint[i].x) < this.r &&
        Math.abs(po.y - this.restPoint[i].y) < this.r
      ) {
        this.drawPoint();
        this.lastPoint.push(this.restPoint[i]);
        this.restPoint.splice(i, 1);
        break;
      }
    }

    console.log(this.lastPoint);
  };
  canvasLock.prototype.drawLine = function (po) {
    // Unlock track

    this.ctx.beginPath();
    this.ctx.lineWidth = 3;
    this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);
    for (var i = 1; i < this.lastPoint.length; i++) {
      this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
    }
    this.ctx.lineTo(po.x, po.y);
    this.ctx.stroke();
    this.ctx.closePath();
  };
  canvasLock.prototype.drawPoint = function () {
    // Initialize circle center

    for (var i = 0; i < this.lastPoint.length; i++) {
      this.ctx.fillStyle = "#CFE6FF";
      this.ctx.beginPath();
      this.ctx.arc(
        this.lastPoint[i].x,
        this.lastPoint[i].y,
        this.r / 2,
        0,
        Math.PI * 2,
        true
      );
      this.ctx.closePath();
      this.ctx.fill();
    }
  };

  // 1. Check whether the path is correct
  // 2. Reset if it is right, the circle turns green
  // 3. Reset if it’s wrong, the circle turns red
  // 4. Reset
  canvasLock.prototype.storePass = function () {
    if (this.checkPass()) {
      document.getElementById("title").innerHTML = "Successfully unlocked      ";
      this.drawStatusPoint("#2CFF26");
    } else {
      document.getElementById("title").innerHTML = "Fail to unlock";
      this.drawStatusPoint("red");
    }
  };
  canvasLock.prototype.checkPass = function () {
    var p1 = "123",
      p2 = "";
    for (var i = 0; i < this.lastPoint.length; i++) {
      p2 += this.lastPoint[i].index;
    }
    return p1 === p2;
  };
  canvasLock.prototype.drawStatusPoint = function (type) {
    for (var i = 0; i < this.lastPoint.length; i++) {
      this.ctx.strokeStyle = type;
      this.ctx.beginPath();
      this.ctx.arc(
        this.lastPoint[i].x,
        this.lastPoint[i].y,
        this.r,
        0,
        Math.PI * 2,
        true
      );
      this.ctx.closePath();
      this.ctx.stroke();
    }
  };
  canvasLock.prototype.reset = function () {
    this.createCircle();
  };
})();
