
var Common = {};

Common.canvasHeight = 793;
Common.canvasWidth  = 1028;
Common.editBarHeight  = 182;
Common.canvasName   = 'container';
Common.mask = null;


Common.addMark = function (obj){
	$(obj).attr('editor','1');
}

Common.save = function (){
	Common.showMask();
    var objs = $('canvas');
	var canvas = $("<canvas>");
	canvas = canvas[0];
	canvas.width  = 500;
	canvas.height = 375;

    var context = canvas.getContext('2d');
	objs.each(function(){
		if($(this).attr('editor')!="1"){
			context.drawImage($(this)[0], 0, 0, canvas.width, canvas.height);
		}
	});
	localStorage.gift = canvas.toDataURL('image/png');
	location.href = "gift.html";
	Common.hideMask();
}

Common.showMask = function(){
	var obj = document.createElement('div');
	obj.style.width='100%';
	obj.style.height=document.body.scrollHeight;
	obj.style.position='absolute';
	obj.style.zIndex='999999999';
	obj.style.top='0';
	obj.style.left='0';
	obj.style.background='rgba(0,0,0,0.5)';
	obj.innerHTML = '<div style="position:fixed;top:50%;left:50%;width:100px;padding:50px 0;margin:-50px 0 0 -50px;background:#000;color:#fff;text-align:center">请等待</div>';
	document.body.appendChild(obj);
	Common.mask = obj;
}

Common.hideMask = function(){
	if(Common.mask){
		document.body.removeChild(Common.mask,document.body);
		Common.mask = null;
	}
}

Common.loadImage = function(objs,callback){
	var num = 0;
	var readyNum = 0;
	for(i in objs){
		if(typeof(objs[i]) != 'string'){
			break;
		}
		num ++;
	}
	for(i in objs){
		if(typeof(objs[i]) != 'string'){
			break;
		}
		var imageUriTmp   = objs[i] ;
		objs[i] = new Image();
		objs[i].onload = function(){
			readyNum ++ ;
			if(readyNum == num){
				callback();
			}
		}
		objs[i].src = imageUriTmp;
	}
}

function canvasInit(){
	$('.index').hide();
	$('.choose').hide();
	$('.editor').show();

	var stage = new Kinetic.Stage(Common.canvasName, Common.canvasWidth, Common.canvasHeight);
	var christmas = new Christmas (stage);
	christmas.init();
    var editorBar = new EditorBar (stage);	
	editorBar.init();

	
	dragFromLocal(stage);
	
}


function chooseInit(){
	window.location.href = 'choose.html';
	return;
	$('.index').hide();
	$('.choose').show();
	$('.editor').hide();
}


function Christmas(stage){
	this.stage = stage;
	this.imageList = {
		'canvasBackgroundTree'  : 'images/choose/tree_3d.png',
		'canvasBackground'  : 'images/background.png',
		//'canvasBackground'  : 'images/background.jpg',
		//'canvasBackground'  : 'images/background.jpg',
	};

	this.topCanvas = null;

	
}

Christmas.prototype.init = function(){
	var _that = this;
	Common.loadImage(this.imageList,function(){
		_that.canvasInit();
	})
}

Christmas.prototype.canvasInit = function (){
	//alert(document.body.clientWidth);
	//alert(document.body.clientHeight);
	
	var context = this.stage.getContext('2d');
	context.drawImage(this.imageList.canvasBackground ,0,0,Common.canvasWidth, Common.canvasHeight);

	var imageWidth = this.imageList.canvasBackgroundTree.width;
	var imageHeight = this.imageList.canvasBackgroundTree.height;
	context.drawImage(this.imageList.canvasBackgroundTree ,(Common.canvasWidth - imageWidth)/2,(Common.canvasHeight-imageHeight)/2,imageWidth, imageHeight);

	
}


//editor bar

function EditorBar(stage){
	this.tabWidth = 98;
	this.tabHeight = 54;

	this.marginLeft = 40;

	this.stage = stage;
	this.decorations = {
		'1':'images/editor/item_bg.png',
		'2':'images/editor/item_bg.png',
		'3':'images/editor/item_bg.png',
		'4':'images/editor/item_bg.png',
		'5':'images/editor/item_bg.png',
		'6':'images/editor/item_bg.png',
		//'7':'images/editor/item_bg.png',
	};

	this.burshList = {
		'45|#ffc104':'images/editor/brush/g0.png',
		'30|#94ca5a':'images/editor/brush/g1.png',
		'15|#048cff':'images/editor/brush/g2.png',
	};

	this.eraserList = {
		'45':'images/editor/eraser/0.png',
		'30':'images/editor/eraser/1.png',
		'15':'images/editor/eraser/2.png',
	};



	this.imageList = {
		'editBarBackground' : 'images/editor/background.png',
		'editBarTab'		: 'images/editor/button.png',
		'editBarTabActive'  : 'images/editor/button_active.png',
		'editBarItemBg'     : 'images/editor/item_bg.png',
		'editBarSave'       : 'images/editor/save.png',
		'editBarCannel'     : 'images/editor/cannel.png',
	};

	this.tabs = {
		'decoration'  : {
			canvas : null,
			text   : 'Decoration'
		},
		'brush'  : {
			canvas : null,
			text   : 'Brush'
		},
		'eraser' : {
			canvas : null,
			text   : 'Eraser'
		}
		
	};

	this.decoration = null;
	this.brush = null;
	this.eraser = null;
}

EditorBar.prototype.init = function (){
	var _that = this;
	Common.loadImage(this.imageList,function(){
		
		

		_that.brush = new EditorBar.Brush(_that);
		_that.brush.touchLineInit();
		//_that.brush.showBrushList();

		_that.eraser = new EditorBar.Eraser(_that);
		_that.eraser.eraserLineInit();
		//_that.eraser.showEraserList();

		_that.decoration = new EditorBar.Decoration(_that);
		_that.decoration.loadDecorationList(function(){});

		_that.frameInit();
		
		
		
		
	});	
}

EditorBar.prototype.frameInit = function (){
	var _that = this;
	

	var editorBackground = new Kinetic.Shape(function(){
        var context = this.getContext();
        context.beginPath();
        context.drawImage(_that.imageList.editBarBackground,0,Common.canvasHeight-Common.editBarHeight,Common.canvasWidth,Common.editBarHeight);
		context.rect(0,Common.canvasHeight-Common.editBarHeight,Common.canvasWidth,Common.editBarHeight);
		//context.strokeStyle = 'red';
		
        context.closePath();
		//context.stroke();
		Common.addMark(editorBackground.getCanvas());
    });
	this.stage.add(editorBackground);
	
	var marginLeft = 860;

	var saveButton = new Kinetic.Shape(function(){
        var context = this.getContext();
        context.beginPath();
        context.drawImage(_that.imageList.editBarSave,marginLeft,Common.canvasHeight-Common.editBarHeight + 20,_that.imageList.editBarSave.width,_that.imageList.editBarSave.height);
		context.rect(marginLeft,Common.canvasHeight-Common.editBarHeight + 20,_that.imageList.editBarSave.width,_that.imageList.editBarSave.height);
        context.closePath();
		Common.addMark(saveButton.getCanvas());
    });

	saveButton.addEventListener('click',function(){
		Common.save();
	});
	saveButton.addEventListener('touchstart',function(){
		Common.save();
	});
	this.stage.add(saveButton);

	var cannelButton = new Kinetic.Shape(function(){
        var context = this.getContext();
        context.beginPath();
        context.drawImage(_that.imageList.editBarCannel,marginLeft,Common.canvasHeight-Common.editBarHeight+_that.imageList.editBarCannel.height+30,_that.imageList.editBarCannel.width,_that.imageList.editBarCannel.height);
		context.rect(marginLeft,Common.canvasHeight-Common.editBarHeight+_that.imageList.editBarCannel.height+30,_that.imageList.editBarCannel.width,_that.imageList.editBarCannel.height);
        context.closePath();
		Common.addMark(cannelButton.getCanvas());
    });
	this.stage.add(cannelButton);

	cannelButton.addEventListener('click',function(){
		history.go(-1);
	});
	cannelButton.addEventListener('touchstart',function(){
		history.go(-1);
	});	

	var editors = [editorBackground,saveButton,cannelButton]
	
	var marginLeft = 80;

	for(var i in this.decorations){
		if(i>6){
			break;
		}
		var itemBg = new Kinetic.Shape(function(){
			var context = this.getContext();
			context.beginPath();
			context.drawImage(_that.imageList.editBarItemBg,marginLeft,Common.canvasHeight-Common.editBarHeight+25,93,106);
			context.closePath();
		});
		this.stage.add(itemBg);
		editors.push(itemBg)
		Common.addMark(itemBg.getCanvas());

		marginLeft += 120;
	}

	
	for(var i in this.tabs){
		(function(){
			var index = i;
			_that.tabs[index].canvas = new Kinetic.Shape(function(){
				if(i == 'decoration'){
					_that.draw(true,_that.tabs[index]);
				}
				else{
					_that.draw(false,_that.tabs[index]);
				}

				Common.addMark(_that.tabs[index].canvas.getCanvas());
			});
		
			_that.tabs[index].canvas.addEventListener('mousedown',function(){
				_that.changeTab(_that.tabs[index],editors);
			})

			_that.tabs[index].canvas.addEventListener('touchstart',function(){
				_that.changeTab(_that.tabs[index],editors);
			})
			_that.stage.add(_that.tabs[index].canvas);
		})();
	}
	
	editorBackground.addEventListener('touchstart',function(event){
	});

	editorBackground.addEventListener('touchend',function(event){
	});

	editorBackground.addEventListener('touchmove',function(event){
	});
	
	editorBackground.addEventListener('mouseover',function(event){
	});

	editorBackground.addEventListener('mouseout',function(){
	});

	editorBackground.addEventListener('click',function(event){
	});

	editorBackground.addEventListener('mousedown',function(){
	});

	editorBackground.addEventListener('mouseup',function(){
	});

	editorBackground.addEventListener('mousemove',function(){
	});


	var decos = [
		"new_static/gift/gift01.png",
		"new_static/gift/gift02.png",
		"new_static/gift/gift03.png",
		"new_static/gift/gift04.png",
		"new_static/gift/gift05.png"
	];
	loadImages(["images/round.png"], function(icons){
		IMAGES.rotate = icons[0];
	    loadImages(decos, function(loadedImages){
		    initStage(_that.stage, loadedImages);
		});
	});
	
}

EditorBar.prototype.changeTab = function(canvas,background){
	var _that = this;
	this.marginLeft = 40;
	for(var i =0;i<background.length;i++){
		background[i].moveToTop();
	}

	for (var i in this.tabs){
		if(this.tabs[i] == canvas){
			this.draw(true,canvas);
			show(i);
		}else{
			hide(i)
			this.draw(false,this.tabs[i]);
		}
		this.tabs[i].canvas.moveToTop();
	}

	function hide(tabName){
		switch(tabName){
			case 'brush':
				_that.brush.closeDraw();
				break;
			case 'eraser':
				_that.eraser.closeEraser();
				break;
		}
	}

	function show(tabName){
		switch(tabName){
			case 'decoration':
				initStage.moveToTop();
				//_that.decoration.showDecorationList();
				break;
			case 'brush':
				_that.brush.readyToDraw();
				_that.brush.showBrushList();
				break;
			case 'eraser':
				_that.eraser.readyEraser();
				_that.eraser.showEraserList();
				break;
		}
	}

	
}

EditorBar.prototype.draw = function(isActive,canvas){
	var context = canvas.canvas.getContext();
		context.beginPath();
		context.clearRect(0,0,Common.canvasWidth,Common.canvasHeight);
		if(isActive){
			context.drawImage(this.imageList.editBarTabActive,this.marginLeft,Common.canvasHeight-Common.editBarHeight-this.tabHeight+20,this.tabWidth,this.tabHeight);
		}
		else{
			context.drawImage(this.imageList.editBarTab,this.marginLeft,Common.canvasHeight-Common.editBarHeight-this.tabHeight+20,this.tabWidth,this.tabHeight);
		}
		context.font = '14px sans-serif';
		context.fillStyle = 'black';
		context.fillText(canvas.text,15+this.marginLeft,Common.canvasHeight-Common.editBarHeight);
		context.rect(this.marginLeft,Common.canvasHeight-Common.editBarHeight-this.tabHeight+20,this.tabWidth,this.tabHeight);
		context.closePath();
		//context.save();
		//context.rotate(Math.PI/4);
		context.restore();
		

		this.marginLeft += this.tabWidth;

}

EditorBar.Eraser =function(parent){
	this.parent = parent;
	this.startDraw = false;
	this.items = [];
	this.size	= 15;
	//_that.parent.stage.topCanvas

}

EditorBar.Eraser.prototype.eraserLineInit = function (){
	var _that = this;
	this.eraserLineListener = document.createElement('canvas');
	this.eraserLineListener.width = Common.canvasWidth;
	this.eraserLineListener.height = Common.canvasHeight - Common.editBarHeight;
	this.eraserLineListener.style.position = 'absolute'; 
	this.eraserLineListener.style.zIndex   = '1';
	$('#' + Common.canvasName).append(this.eraserLineListener);

	this.eraserListen(this.eraserLineListener);
}

EditorBar.Eraser.prototype.eraserListen = function (obj){
	var _that = this;
	obj.onmousemove = moveTouchListener;
	obj.onmousedown = downTouchListener;
	obj.onmouseup   = upTouchListener;

	obj.ontouchmove = moveTouchListener;
	obj.ontouchstart = downTouchListener;
	obj.ontouchend   = upTouchListener;

	function downTouchListener(event){
		_that.parent.stage.mouseDown = true;
		_that.parent.stage.handleEvent(event);
		_that.startDraw = new PrintLine();
		var mousePos = _that.parent.stage.getTouchPos() || _that.parent.stage.getMousePos();
	}

	function moveTouchListener(){
		var mousePos = _that.parent.stage.getTouchPos() || _that.parent.stage.getMousePos();
		if(_that.startDraw){
			if(!_that.parent.stage.topCanvas){
				return;
			}
			var context = _that.parent.stage.topCanvas.getContext();           
            context.clearRect(mousePos.x,mousePos.y,_that.size,_that.size);
			context.restore();
		}
	}

	function upTouchListener(){
		_that.startDraw = false;
	}
}

EditorBar.Eraser.prototype.closeEraser = function(){
	this.eraserLineListener.style.zIndex = 1;
}

EditorBar.Eraser.prototype.readyEraser = function(){
	this.eraserLineListener.style.zIndex = 1000000;
}

EditorBar.Eraser.prototype.loadEraserList = function (callback){
	var _that = this;
	this.isLoaded = true;
	Common.loadImage(this.parent.eraserList,function (){
		var marginLeft = 80;
		
		for(var i in _that.parent.eraserList){
			(function(){
				var index = i;
			
				var darthImgFunc = Kinetic.drawImage(_that.parent.eraserList[i],marginLeft,Common.canvasHeight-Common.editBarHeight+25,93,106);
				var item = new Kinetic.Shape(darthImgFunc);

				item.addEventListener('click',function(){
					_that.size = index;
				});

				item.addEventListener('touchstart',function(){
					_that.size = index;
				});

				_that.parent.stage.add(item);
				Common.addMark(item.getCanvas());
				_that.items.push(item);

				marginLeft += 120;
			})();
		}
		callback();
	});
}

EditorBar.Eraser.prototype.showEraserList = function (){
	console.log(2);
	var _that = this;
	if(!this.isLoaded){
		this.loadEraserList(show);
		return;
	}
	show();
	function show(){
		
		for(var i=0;i<_that.items.length;i++){
			_that.items[i].moveToTop();
		}
	}
}

EditorBar.Brush = function(parent){
	this.parent = parent;
	this.touchLineListener = null;
	this.touchLineCanvas   = null;
	this.startDraw = false;
	this.items = [];
	this.size	= 15;
	this.color  = 'white';
}

EditorBar.Brush.prototype.closeDraw = function(){
	this.touchLineListener.style.zIndex = 1;
	this.touchLineCanvas.style.zIndex   = 2;
}

EditorBar.Brush.prototype.readyToDraw = function(){
	this.touchLineListener.style.zIndex = 1000000;
	this.touchLineCanvas.style.zIndex   = 999999;
}

EditorBar.Brush.prototype.touchLineInit = function (){
	var _that = this;
	this.touchLineListener = document.createElement('canvas');
	this.touchLineListener.width = Common.canvasWidth;
	this.touchLineListener.height = Common.canvasHeight - Common.editBarHeight;
	this.touchLineListener.style.position = 'absolute'; 
	this.touchLineListener.style.zIndex   = '1';
	$('#' + Common.canvasName).append(this.touchLineListener);

	this.touchLineCanvas  = this.touchLineListener.cloneNode();
	this.touchLineCanvas.style.zIndex   = '0';
	$('#' + Common.canvasName).append(this.touchLineCanvas);

	this.touchListen(this.touchLineListener,this.touchLineCanvas);
}

EditorBar.Brush.prototype.touchListen = function (obj,canvas){
	var _that = this;
	obj.onmousemove = moveTouchListener;
	obj.onmousedown = downTouchListener;
	obj.onmouseup   = upTouchListener;

	obj.ontouchmove = moveTouchListener;
	obj.ontouchstart = downTouchListener;
	obj.ontouchend   = upTouchListener;

	function downTouchListener(event){
		_that.startDraw = new PrintLine();
		var mousePos =  _that.parent.stage.getTouchPos() || _that.parent.stage.getMousePos();
	}

	function moveTouchListener(){
		var mousePos = _that.parent.stage.getTouchPos() || _that.parent.stage.getMousePos();
		if(!_that.startDraw){
			return;
		}
		var context = canvas.getContext('2d'); 		          
		_that.startDraw.addX(mousePos.x);
		_that.startDraw.addY(mousePos.y);
		var x = _that.startDraw.getX();
		var y = _that.startDraw.getY();
		var i = x.length -1 ;
		context.beginPath();
		if(!i){
			context.moveTo(x[i], y[i]);
		}else{
			context.moveTo(x[i-1], y[i-1]);
		}
		context.lineTo(x[i], y[i]);
		context.closePath();
		context.strokeStyle = _that.color;
		context.lineJoin = "round";
		context.lineWidth = _that.size;
		context.stroke();
	}

	function upTouchListener(){
		if(!_that.startDraw){
			return;
		}
		var mousePos =  _that.parent.stage.getTouchPos() ||  _that.parent.stage.getMousePos();
		var context = canvas.getContext('2d'); 
		context.beginPath();
		context.clearRect(0,0,Common.canvasWidth,Common.canvasHeight);
		context.closePath();
		context.restore();

		var newPrintLine = new Kinetic.Shape(function(){
            var context = this.getContext();
            var x = _that.startDraw.getX();
            var y = _that.startDraw.getY();

            context.beginPath();
            for(var i = 0 ;i<x.length;i++){
                if(!i){
                    context.moveTo(x[i], y[i]);
                }
                context.lineTo(x[i], y[i]);
            }
			
			for(var i = x.length-1;i>-1;i--){
                context.lineTo(x[i], y[i]);
            }
			context.closePath();
			
            context.strokeStyle = _that.color;
            context.lineJoin = "round";
            context.lineWidth = _that.size;
            context.stroke();

            //画一个闭合路径
            context.beginPath();
            for(var i = 0 ;i<x.length;i++){
                if(!i){
                    context.moveTo(x[i] - _that.size/2, y[i] -_that.size/2);
                }
                context.lineTo(x[i]-_that.size/2, y[i]-_that.size/2);
            }
            for(var i = x.length-1 ; i > -1 ; i --){
                context.lineTo(x[i]+_that.size/2, y[i]+_that.size/2);
            }
            context.closePath();
            context.restore();
			_that.parent.stage.topCanvas = newPrintLine;
        });

		newPrintLine.addEventListener('touchstart',function(){
			newPrintLine.moveToTop();
			_that.parent.stage.topCanvas = newPrintLine;
		});

		newPrintLine.addEventListener('mousedown',function(){
			newPrintLine.moveToTop();
			_that.parent.stage.topCanvas = newPrintLine;
		});

		_that.parent.stage.add(newPrintLine);
		_that.startDraw = false;
	}
}

EditorBar.Brush.prototype.loadBrushList = function (callback){
	var _that = this;
	this.isLoaded = true;
	Common.loadImage(this.parent.burshList,function (){
		var marginLeft = 80;
		
		for(var i in _that.parent.burshList){
			
			(function(){
				var index = i;
				var darthImgFunc = Kinetic.drawImage(_that.parent.burshList[i],marginLeft,Common.canvasHeight-Common.editBarHeight+25,93,106);
				var item = new Kinetic.Shape(darthImgFunc);

				item.addEventListener('click',function(){
					var tmp = index.split('|');
					_that.size  = tmp[0];
					_that.color = tmp[1];
				});

				item.addEventListener('touchstart',function(){
					var tmp = index.split('|');
					_that.size  = tmp[0];
					_that.color = tmp[1];
				});

				_that.parent.stage.add(item);

				Common.addMark(item.getCanvas());
				_that.items.push(item);

				marginLeft += 120;
			})();
		}
		callback();
	});
}

EditorBar.Brush.prototype.showBrushList = function (){
	console.log(3);
	var _that = this;
	if(!this.isLoaded){
		this.loadBrushList(show);
		return;
	}
	show();
	function show(){
		
		for(var i=0;i<_that.items.length;i++){
			_that.items[i].moveToTop();
		}
	}
}

//装饰抽象

EditorBar.Decoration = function(parent){
	this.parent = parent;
	this.isLoaded = false;
	this.items  = [];
}



//EditorBar.Decoration.prototype = new EditorBar();

EditorBar.Decoration.prototype.loadDecorationList = function (callback){
	var _that = this;
	this.isLoaded = true;
	Common.loadImage(this.parent.decorations,function (){
		var marginLeft = 80;
		
		for(var i in _that.parent.decorations){
			

			var darthImgFunc = Kinetic.drawImage(_that.parent.decorations[i],marginLeft,Common.canvasHeight-Common.editBarHeight+25,1,1);
			var item = new Kinetic.Shape(darthImgFunc);

			item.addEventListener('click',function(){
				_that.itemClick(item,_that.parent.decorations[i]);
			});

			item.addEventListener('mousedown',function(){
				_that.itemDown(item,_that.parent.decorations[i]);
			});

			item.addEventListener('mouseup',function(){
				_that.itemUp(item,_that.parent.decorations[i]);
			});

			item.addEventListener('mousemove',function(){
				_that.itemMove(item,_that.parent.decorations[i]);
			});

			_that.parent.stage.add(item);

			Common.addMark(item.getCanvas());
			_that.items.push(item);
			marginLeft += 120;
		}
		callback();
	});
}

EditorBar.Decoration.prototype.showDecorationList = function (){
	console.log(1);
	var _that = this;
	if(!this.isLoaded){
		this.loadDecorationList(show);
		return;
	}

	show();
	
	function show(){
		for(var i=0;i<_that.items.length;i++){
			_that.items[i].moveToTop();
		}
	}
	
}

EditorBar.Decoration.prototype.itemClick = function(item,imageObj){
}

EditorBar.Decoration.prototype.itemDown = function(item,imageObj){
}

EditorBar.Decoration.prototype.itemMove = function(item,imageObj){
}

EditorBar.Decoration.prototype.itemUp = function(item,imageObj){
}


//Christmas.prototype = new PrintLine();


function PrintLine(){
    var clickX = [];
    var clickY = [];

    this.addX = function (x){
        clickX.push(x);
    }

    this.addY = function (y){
        clickY.push(y);
    }

    this.getX = function (){
        return clickX;
    }

    this.getY = function (){
        return clickY;
    }

    this.getLastX = function (){
        return clickX;
    }

    this.getLastY = function (){
        return clickY;
    }
}

