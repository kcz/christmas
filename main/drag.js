jQuery.event.props.push("dataTransfer");
var IMAGES = {};


//, "http://www.w3schools.com/images/compatible_chrome.gif"
/*
loadImages(["images/round.png"], function(icons){
	IMAGES.rotate = icons[0];
    loadImages(["images/darth-vader.jpg", "images/yoda.jpg"], function(loadedImages){
	    initStage(loadedImages);
	});
});
*/

function dragFromLocal(stage){
	var node = $('<div style="width:100%;height:100%;position:absolute;left:0; top:0;z-index:200000;"></div>');
	$("#container").prepend(node);
	node.on({
		"dragenter" : function(event){
			$(this).data("width", $(this).width());
			$(this).animate({"width" : "+=100"});
			//$(this).html('<h1>Drop the dom here.<br />It will be deleted!</h1>');
		},
		"dragleave" : function(event){
			$(this).animate({"width" : $(this).data("width")});
			$(this).html("");
		},		
		"dragover" : function(event){
			//this code is critical in case that drop event won't be invoked
			event.preventDefault();
		},
		"drop" : function(event){
			//$(this).remove();
			var files = event.dataTransfer.files;
			for (var i = 0, f; f = files[i]; i++) {
				var reader = new FileReader();
				reader.onload = (function(f){
					return function(e){
						var image = new Image();
						image.onload = function(){
							initStage(stage, [image]);
							initStage.moveToTop();							
						}
						image.src = e.target.result;
						image.xDiff = 600;
						image.yDiff = -5;

					};
				})(f);
				// reader.readAsBinaryString(f);
				//reader.readAsText(f);
				reader.readAsDataURL(f);
			}
		}
	});
}

function initStage(stage, loadedImages){
	var rectangles = [];
	for (var i=0; i < loadedImages.length; i++) {
		var loadedImage = loadedImages[i];
		var xDiff = loadedImage.xDiff || 0;
		var yDiff = loadedImage.yDiff || 0;		
		rectangles[i] = {
			    image: loadedImage,
			    x: 80+120*i + xDiff,
			    y: 645 + yDiff,
				width:90,
				height:100,
			    dragging: false,
			    resizeCorner: null,
			    scaleX: 1,
			    scaleY: 1
		};
	}
	
	var imageShapeList = [];
	var currentImageShape = null;
	// drag and drop globals
	var offsetX = 0, offsetY = 0;
	var resizingOffsetX = 0, resizingOffsetY = 0;
	var originalPos;
	
	var draggingShape, resizingShape;
	
	//var stage = new Kinetic.Stage("container", 960, 800);
	var container = stage.getContainer();
	var context = stage.getContext();
	var canvas = stage.getCanvas();

    // when using KineticJS, we need to draw the shapes with the highest z-index
    // first and the shapes with the lowest z-index last in order to 
    // correctly handle shape layering
	//context.globalCompositeOperation = "destination-over";

	for (var i=0; i < rectangles.length; i++) {
		(function(){
			var thisShape = rectangles[i];
			//var imageFunc = Kinetic.drawImage(thisShape.image, thisShape.x, thisShape.y, thisShape.width, thisShape.height);
			var imageShape = new Kinetic.Shape(function(){
		        var context = this.getContext();
		        context.drawImage(this.image, 0, 0, this.width, this.height);
		        context.beginPath();
		        context.rect(0, 0, this.width, this.height);
		        context.closePath();
			});
			imageShape.x = thisShape.x;
			imageShape.y = thisShape.y;
			
			imageShape.image = thisShape.image;
			imageShape.scaleRate = 1;
			imageShape.width = thisShape.width;
			imageShape.height = thisShape.height;
		
			imageShape.addEventListener("mousedown", onImageShapeMouseDown);
			imageShape.addEventListener("touchstart", onImageShapeMouseDown);
			
			imageShape.addEventListener("mouseover", function(){
				document.body.style.cursor = "pointer";
			});
			imageShape.addEventListener("mouseout", function(){
				document.body.style.cursor = "default";
			});
			imageShape.resizeShapes = [];
			stage.add(imageShape);
			
			var resizeShapeWidth = 30, resizeShapeHeight = 30;
			var resizeShape = new Kinetic.Shape(function(){
		        var context = this.getContext();
				var imageShape = this.imageShape;
				context.save();
				trace("drawing resizeShape: "+(imageShape.x+imageShape.width) + " : " + (imageShape.y+imageShape.height));
				context.translate(imageShape.x+imageShape.width, imageShape.y+imageShape.height);
		        context.drawImage(IMAGES.rotate, 0, 0, this.width, this.height);
		        context.beginPath();
		        context.rect(0, 0, this.width, this.height);
		        context.closePath();
				context.restore();
			});
			resizeShape.width = resizeShapeWidth;
			resizeShape.height = resizeShapeHeight;
			
			resizeShape.imageShape = imageShape;
			resizeShape.addEventListener("mousedown", onResizeShapeMouseDown);
			resizeShape.addEventListener("mouseup", onResizeShapeMouseUp);

			resizeShape.addEventListener("touchstart", onResizeShapeMouseDown);
			resizeShape.addEventListener("touchend", onResizeShapeMouseUp);
						
			stage.add(resizeShape);
			resizeShape.clear();
			Common.addMark(resizeShape.getCanvas());
			imageShape.resizeShapes.push(resizeShape);
			
			imageShape.moveToTop();
			resizeShape.moveToTop();
			stage.topCanvas = imageShape;
			imageShapeList.push(imageShape);
	
			function onImageShapeMouseDown(){
				draggingShape = imageShape;
				var mousePos = stage.getTouchPos() || stage.getMousePos();
				imageShape.moveToTop();
				for(var i=0;i<draggingShape.resizeShapes.length;i++){
					var resizeShape = draggingShape.resizeShapes[i];
					resizeShape.moveToTop();
				}				

				offsetX = mousePos.x -draggingShape.x;
				offsetY = mousePos.y - draggingShape.y;
				console.log("mousedown: " + offsetX + " : " + offsetY);
				
				if(currentImageShape){
					currentImageShape.resizeShapes[0].clear();
				}
				currentImageShape = draggingShape;				
			}
			function onResizeShapeMouseDown(){
				var mousePos = stage.getTouchPos() || stage.getMousePos();
				resizingShape = resizeShape;
				
				resizingOffsetX = mousePos.x -resizeShape.x;
				resizingOffsetY = mousePos.y - resizeShape.y;
				
				originalPos = mousePos;
								
				trace("resize mousedown: " + originalPos.x+","+originalPos.y);				
			}
			function onResizeShapeMouseUp(){
				resizingShape = null;
				trace("resize mouseup");
			}
		})();
	}
	
	container.addEventListener("mouseup", onMouseUp, false);
	container.addEventListener("mousemove", onContainerMove, false);
	
	container.addEventListener("touchend", onMouseUp, false);
	container.addEventListener("touchmove", onContainerMove, false);	
	
	function onMouseUp(){
		draggingShape = null;
		resizingShape = null;		
	}
	
	function onContainerMove(){
		var mousePos = stage.getTouchPos() || stage.getMousePos();
		if(draggingShape){
			draggingShape.x = mousePos.x - offsetX;
			draggingShape.y = mousePos.y - offsetY;
			

	
			trace("dragging mousemove: " + draggingShape.x + " : " + draggingShape.y);
			for(var i=0;i<draggingShape.resizeShapes.length;i++){
				var resizeShape = draggingShape.resizeShapes[i];			
				resizeShape.draw(); 
			}
			
			draggingShape.draw();
		}
		if(resizingShape){
			var xDiff = mousePos.x - originalPos.x;
			var yDiff = mousePos.y - originalPos.y;
			var imageShape = resizingShape.imageShape;
			var width = imageShape.width;
			
			trace("before resizing: "+imageShape.width + " : "+imageShape.height);
			imageShape.width += xDiff;
			imageShape.height += yDiff;
			trace("after resizing: "+imageShape.width + " : "+imageShape.height);			
			
			imageShape.draw();
			
			trace(imageShape.x + " : " + imageShape.width*imageShape.scale.x);

			resizingShape.draw();					
		}
		
		originalPos = mousePos;
	}
	
	initStage.moveToTop = function(){
		trace(imageShapeList)
		for (var i=0; i < imageShapeList.length; i++) {
			imageShapeList[i].moveToTop();
			imageShapeList[i].resizeShapes[0].moveToTop();
		};
	}
}

function loadImages(sources, callback){
    var loadedImages = [];
    for (var i = 0; i < sources.length; i++) {
        var image = new Image();
        image.onload = (function(image){
			return function(){
				loadedImages.push(image);
	            if (loadedImages.length >= sources.length) {
	                callback(loadedImages);
	            }
			}
        })(image);
        image.src = sources[i];
    }
}

function trace(message){
	console.log(message);
}