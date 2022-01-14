//"use strict";
function DragResizeSnapElement(paneId, ghostpaneId) {


  // Minimum resizable area
  var minWidth = 60;
  var minHeight = 40;

  // Thresholds
  var FULLSCREEN_MARGINS = -10;
  var MARGINS = 4;
  var INNERDIVMARGIN = 50;
  // End of what's configurable.
  var clicked = null;
  var onRightEdge, onBottomEdge, onLeftEdge, onTopEdge;

  var rightScreenEdge, bottomScreenEdge;

  var preSnapped;

  var b, x, y;

  var redraw = false;

  var pane = document.getElementById(paneId);
  var ghostpane = document.getElementById(ghostpaneId);
  // console.log("pane",pane);
  function setBounds(element, x, y, w, h) {
    element.style.left = x + 'px';
    element.style.top = y + 'px';
    element.style.width = w + 'px';
    element.style.height = h + 'px';
    //console.log(element.style.x, element.style.y, element.style.width, element.style.height);
  }

  function hintHide() {
    setBounds(ghostpane, b.left, b.top, b.width, b.height);
    ghostpane.style.opacity = 0;

    // // // var b = ghostpane.getBoundingClientRect();
    // // // ghostpane.style.top = b.top + b.height / 2;
    // // // ghostpane.style.left = b.left + b.width / 2;
    // // // ghostpane.style.width = 0;
    // // // ghostpane.style.height = 0;
  }


  // Mouse events
  pane.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);

  // Touch events	
  // pane.addEventListener('touchstart', onTouchDown);
  // document.addEventListener('touchmove', onTouchMove);
  // document.addEventListener('touchend', onTouchEnd);


  // function onTouchDown(e) {
  //   //console.log(e)
  //   onDown(e.touches[0]);
  //   e.preventDefault();
  // }

  // function onTouchMove(e) {
  //   onMove(e.touches[0]);		
  // }

  // function onTouchEnd(e) {
  //   if (e.touches.length ==0) onUp(e.changedTouches[0]);
  // }

  function onMouseDown(e) {
    //console.log(e);
    onDown(e);
    e.preventDefault();
  }

  function onDown(e) {
    calc(e);

    var isResizing = onRightEdge || onBottomEdge || onTopEdge || onLeftEdge;

    clicked = {
      x: x,
      y: y,
      cx: e.clientX,
      cy: e.clientY,
      w: b.width,
      h: b.height,
      isResizing: isResizing,
      isMoving: !isResizing && canMove(),
      onTopEdge: onTopEdge,
      onLeftEdge: onLeftEdge,
      onRightEdge: onRightEdge,
      onBottomEdge: onBottomEdge
    };
  }

  function canMove() {
    return x > 0 && x < b.width && y > 0 && y < b.height
      && y < 30;
  }

  function calc(e) {
    //getBoundingClientRect() kendisine verilen elementin koordinatlarını döndürür. 
    b = pane.getBoundingClientRect();





    //console.log(b);
    x = e.clientX - b.left; //Mouse pozisyonundan (x pozisyonu), elementin sol üst köşesinin başlangıca olan uzaklığı. 

    y = e.clientY - b.top;
    //clientX, clientY mouse position relative to the viewport (Bulunduğu view'in koordinatlarını verir.)
    onTopEdge = y < MARGINS;
    onLeftEdge = x < MARGINS;
    onRightEdge = x >= b.width - MARGINS;
    onBottomEdge = y >= b.height - MARGINS;

    rightScreenEdge = window.innerWidth - MARGINS;
    bottomScreenEdge = window.innerHeight - MARGINS;
  }

  var e;

  function onMove(ee) {
    //console.log(ee)
    calc(ee);

    e = ee;

    redraw = true;

  }

  function animate() {

    requestAnimationFrame(animate);

    if (!redraw) return;

    redraw = false;

    if (clicked && clicked.isResizing) {

      if (clicked.onRightEdge) pane.style.width = Math.max(x, minWidth) + 'px';
      if (clicked.onBottomEdge) pane.style.height = Math.max(y, minHeight) + 'px';

      if (clicked.onLeftEdge) {
        var currentWidth = Math.max(clicked.cx - e.clientX + clicked.w, minWidth);

        if (currentWidth > minWidth) {
          pane.style.width = currentWidth + 'px';
          pane.style.left = e.clientX + 'px';
        }
      }

      if (clicked.onTopEdge) {
        var currentHeight = Math.max(clicked.cy - e.clientY + clicked.h, minHeight);
        if (currentHeight > minHeight) {
          pane.style.height = currentHeight + 'px';
          pane.style.top = e.clientY + 'px';
        }
      }

      hintHide();
      //todo:mevcut elementin id'si coords'dan alınıp, koordinatları güncellenecek 
      var cor = { left: parseInt(pane.style.left), top: parseInt(pane.style.top), width: parseInt(pane.style.width), height: parseInt(pane.style.height) };
      var existCoord = coords.filter(c => c[4] == pane.id.substring(4))[0];
      //top-right
      existCoord[1][0] = cor.left + cor.width;
      existCoord[1][1] = cor.top;
      //bottom-right
      existCoord[2][0] = cor.left + cor.width;
      existCoord[2][1] = cor.top + cor.height;
      return;
    }
    //ghostpane ayarlanıyor. 
    if (clicked && clicked.isMoving) {
      var innWidth = window.innerWidth;
      //console.log('innderWidth',innWidth);
      //console.log(FULLSCREEN_MARGINS)
      //Eğer element başka bir elementin üzerine sürükleniyorsa o elementin içinde ghostpane görünmeli. setBounds'un 2. ve 3. parametrelerini, 4. ve 5. parametrelerini bunlara göre ayarla. Üzerine gelinen elementin bilgilerini almak gerekir. 




      var insideInfo = calcIsInside(b);
      if (insideInfo.isInside) {
        //console.log(insideInfo.coord);
        var divWidth = insideInfo.coord[1][0] - insideInfo.coord[0][0];
        var divHeight = insideInfo.coord[2][1] - insideInfo.coord[1][1];
        setBounds(ghostpane, insideInfo.coord[0][0], insideInfo.coord[0][1]+ INNERDIVMARGIN, divWidth, divHeight);
        ghostpane.style.opacity = 0.2;

      }
      else if (b.top < FULLSCREEN_MARGINS || b.left < FULLSCREEN_MARGINS || b.right > innWidth - FULLSCREEN_MARGINS || b.bottom > window.innerHeight - FULLSCREEN_MARGINS) {
        // hintFull();
        setBounds(ghostpane, 0, 0, innWidth, window.innerHeight);
        ghostpane.style.opacity = 0.2;
      } else if (b.top < MARGINS) {
        // hintTop();
        setBounds(ghostpane, 0, 0, innWidth, window.innerHeight / 2);
        ghostpane.style.opacity = 0.2;
      } else if (b.left < MARGINS) {
        // hintLeft();
        setBounds(ghostpane, 0, 0, innWidth / 2, window.innerHeight);
        ghostpane.style.opacity = 0.2;
      } else if (b.right > rightScreenEdge) {
        // hintRight();
        setBounds(ghostpane, innWidth / 2, 0, innWidth / 2, window.innerHeight);
        ghostpane.style.opacity = 0.2;
      } else if (b.bottom > bottomScreenEdge) {
        // hintBottom();
        setBounds(ghostpane, 0, window.innerHeight / 2, innWidth, innWidth / 2);
        ghostpane.style.opacity = 0.2;
      } else {
        hintHide();
      }

      if (preSnapped) {
        setBounds(pane,
          e.clientX - preSnapped.width / 2,
          e.clientY - Math.min(clicked.y, preSnapped.height),
          preSnapped.width,
          preSnapped.height
        );
        return;
      }
      // console.log(e.clientY-clicked.y, e.clientX-clicked.x)
      // moving
      pane.style.top = (e.clientY - clicked.y) + 'px';
      pane.style.left = (e.clientX - clicked.x) + 'px';

      return;
    }

    // This code executes when mouse moves without clicking

    // style cursor
    if (onRightEdge && onBottomEdge || onLeftEdge && onTopEdge) {
      pane.style.cursor = 'nwse-resize';
    } else if (onRightEdge && onTopEdge || onBottomEdge && onLeftEdge) {
      pane.style.cursor = 'nesw-resize';
    } else if (onRightEdge || onLeftEdge) {
      pane.style.cursor = 'ew-resize';
    } else if (onBottomEdge || onTopEdge) {
      pane.style.cursor = 'ns-resize';
    } else if (canMove()) {
      pane.style.cursor = 'move';
    } else {
      pane.style.cursor = 'default';
    }
  }

  animate();

  function onUp(e) {
    //console.log(e)
    calc(e);

    if (clicked && clicked.isMoving) {
      // Snap
      var snapped = {
        width: b.width,
        height: b.height
      };

      //pane ayarlanıyor
      var insideInfo = calcIsInside(b);
      if (insideInfo.isInside) {
        //console.log(insideInfo.coord);
        var divWidth = insideInfo.coord[1][0] - insideInfo.coord[0][0];
        var divHeight = insideInfo.coord[2][1] - insideInfo.coord[1][1];
        setBounds(pane, insideInfo.coord[0][0], insideInfo.coord[0][1]+ INNERDIVMARGIN, divWidth, divHeight);
        preSnapped = snapped;

      }
      else if (b.top < FULLSCREEN_MARGINS || b.left < FULLSCREEN_MARGINS || b.right > window.innerWidth - FULLSCREEN_MARGINS || b.bottom > window.innerHeight - FULLSCREEN_MARGINS) {
        // hintFull();
        //sınırlar belirlenmesi gerekiyor. Eğer başka bir div'in üzerine gelinirse üzerinde olduğu div'in boyutlarını almalı.
        setBounds(pane, 0, 0, window.innerWidth, window.innerHeight);
        preSnapped = snapped;
      } else if (b.top < MARGINS) {
        // hintTop();
        setBounds(pane, 0, 0, window.innerWidth, window.innerHeight / 2);
        preSnapped = snapped;
      } else if (b.left < MARGINS) {
        // hintLeft();
        setBounds(pane, 0, 0, window.innerWidth / 2, window.innerHeight);
        preSnapped = snapped;
      } else if (b.right > rightScreenEdge) {
        // hintRight();
        setBounds(pane, window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
        preSnapped = snapped;
      } else if (b.bottom > bottomScreenEdge) {
        // hintBottom();
        setBounds(pane, 0, window.innerHeight / 2, window.innerWidth, window.innerWidth / 2);
        preSnapped = snapped;
      } else {
        preSnapped = null;
      }
      //todo:mevcut elementin id'si coords'dan alınıp, koordinatları güncellenecek 
      var cor = { left: parseInt(pane.style.left), top: parseInt(pane.style.top), width: parseInt(pane.style.width), height: parseInt(pane.style.height) };
      var existCoord = coords.filter(c => c[4] == pane.id.substring(4))[0];
      //top-left
      existCoord[0][0] = cor.left;
      existCoord[0][1] = cor.top;
      //top-right
      existCoord[1][0] = cor.left + cor.width;
      existCoord[1][1] = cor.top;
      //bottom-right
      existCoord[2][0] = cor.left + cor.width;
      existCoord[2][1] = cor.top + cor.height;
      //bottom-left
      existCoord[3][0] = cor.left;
      existCoord[3][1] = cor.top + cor.height;
      console.log(coords);
      console.log(existCoord);

      hintHide();

    }

    clicked = null;

  }
  function calcIsInside(movingInfo) {
    //console.log(movingInfo);
    //Begin Left-Top and go clockwise
    var movingPosition = [movingInfo.x, movingInfo.y]; //17,25
    // var coords = [[120,120],[160,120],[160,180],[120,180]];
    for (let index = 0; index < coords.length; index++) {
      const coord = coords[index];
      if (movingPosition[0] > coord[0][0] && movingPosition[0] < coord[1][0] && movingPosition[1] > coord[1][1] && movingPosition[1] < coord[2][1]) {
        return { 'isInside': true, 'coord': coord };
      }
      return { 'isInside': false, 'coord': coord };
    }
    return { 'isInside': false, 'coord': null };
  }
}
var coords = [];
function createNewElementWithCoord(coord) {
  //[[20,60],[30,60],[30,20],[20,20]];

  // <div id="pane2" class="pane">
  //   <div id="title" class="title">Resize, Drag or Snap Me!</div>
  // </div>
  // <div id="ghostpane2" class="ghostpane"></div>

  // width: 45%;
  // height: 45%;
  // top: 20%;
  // left: 20%;
  var idCounter = 2;
  if (coords.length > 0) {
    idCounter = coords[coords.length - 1][4];
    idCounter++;
  }
  var newElement = document.createElement("div");
  newElement.className = "pane";
  newElement.id = "pane" + idCounter;
  newElement.style.width = coord[1][0] - coord[0][0] + "px";
  newElement.style.height = coord[2][1] - coord[1][1] + "px";
  newElement.style.top = coord[0][1] + "px";
  newElement.style.left = coord[0][0] + "px";
  var newSubElement = document.createElement("div");
  newSubElement.className = "title";
  newSubElement.id = "title";
  newSubElement.innerHTML = "Resize, Drag or Snap Me!";
  newElement.appendChild(newSubElement);

  var newGhostElement = document.createElement("div");
  newGhostElement.className = "ghostpane";
  newGhostElement.id = "ghostpane" + idCounter;


  var container = document.getElementById("container");
  container.appendChild(newElement);
  container.appendChild(newGhostElement);
  DragResizeSnapElement('pane' + idCounter, 'ghostpane' + idCounter);
  coord.push(idCounter); //pane id
  coords.push(coord)
}
function createNew() {
  var c = [[120, 120], [460, 120], [460, 280], [120, 280]];
  createNewElementWithCoord(c);
}

