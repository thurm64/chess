const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const squareSize = width / 8;
const FILL_DARK_SQUARES = "#070812";
const FILL_LIGHT_SQUARES = "#242739";
const FILL_SELECTED_SQUARES = "#6c2025";
var isPieceSelected = false;
var selectedSquare = [-1, -1];
var blackKs = true;
var blackQs = true;
var whiteKs = true;
var whiteQs = true;
var epCol = -1;
var ply = 0;
var legalMoves = [];
var boardArray = [
  ["r","n","b","q","k","b","n","r"],
  ["p","p","p","p","p","p","p","p"],
  [" "," "," "," "," "," "," "," "],
  [" "," "," "," "," "," "," "," "],
  [" "," "," "," "," "," "," "," "],
  [" "," "," "," "," "," "," "," "],
  ["P","P","P","P","P","P","P","P"],
  ["R","N","B","Q","K","B","N","R"]
  ];
function sendDisplay(msg) {
	document.getElementById("boardOverlay").style.visibility = "visible"
	document.getElementById("boardOverlay").innerHTML = msg + "<br><a href = \"" + self.location + "\">Play Again</a>"
}

function makeFen() 
{
	try {
	var fen = "";
	for(var r in boardArray) {
		var spaceCount = 0;
		for(var c in boardArray[0]) {
			if(boardArray[r][c] !== " ") {
				if(spaceCount != 0) {
					fen += spaceCount;
					
				}
				fen += boardArray[r][c];
				spaceCount = 0;
			} else {
				spaceCount++;
			}
		}
		if(spaceCount != 0) {
			fen += spaceCount;
			
		}
		if(r != 7) {
		fen += "/";
		}
	}
	fen += " "
	if(whitePly) {
		fen += "w"
			
	} else {
		fen += "b"
	}
	fen += " ";
	if(whiteKs) {
		fen += "K"
	}
	if(whiteQs) {
		fen += "Q"
	}
	if(blackKs) {
		fen += "k"
	}
	if(blackQs) {
		fen += "q"
	} 
	fen += " ";
	if(epCol != -1) {
		if(whitePly) {
			fen += String.fromCharCode(65 + epCol) + 6;
		} else {
			fen += String.fromCharCode(65 + epCol) + 3;
		} 
	}
	fen += " 0 ";
	fen += Math.ceil(ply / 2);
	return fen;
	} catch(e) {window.alert(e)}
}

var whitePly = true;
function moveHandler(x,y) {
	var epCap = false;
	for(var a = 0; a < legalMoves.length; a++) {
	var move = legalMoves[a];
	var sely = selectedSquare[0];
	var selx = selectedSquare[1];
	var piece = boardArray[selectedSquare[0]][selectedSquare[1]];
	epCol = -1;
	promote = null;
		
	
		if(move[0] == y && move[1] == x) {
			if(piece.toLowerCase() == "p" && Math.abs(sely - y) > 1) {
				epCol = x;
			} else if(piece == "p" && selx != x && boardArray[y][x] == " ") {
				boardArray[y-1][x] = " ";
				epCap = true;
			} else if(piece == "P" && selx != x && boardArray[y][x] == " ") {
				boardArray[y+1][x] = " ";
				epCap = true;
			}else if((piece == "R" && sely == 7 && selx == 7) || (boardArray[y][x] == "R" && y == 7 && x == 7)) {
				whiteKs = false;
			} else if((piece == "R" && sely == 7 && selx == 0) || (boardArray[y][x] == "R" && y == 7 && x == 0)) {
				whiteQs = false;
			} else if((piece == "r" && sely == 0 && selx == 7) || (boardArray[y][x] == "r" && y == 0 && x == 7)) {
				blackKs = false;
			}else if((piece == "r" && sely == 0 && selx == 0) || (boardArray[y][x] == "r" && y == 0 && x == 0)) {
				blackQs = false;
			}else if(piece == "P" && y == 0) {
				promote = document.getElementById("selectPromotion").value.toUpperCase();
			
			}else if(piece == "p" && y == 7) {
				promote = document.getElementById("selectPromotion").value;
			
			}
			  else if(piece == "K") {
				if(Math.abs(selx - x) > 1) {
			
				if(selx - x < 0) { // castling
					boardArray[7][7] = " ";
					boardArray[7][5] = "R";
				} else {
					boardArray[7][0] = " ";
					boardArray[7][2] = "R";
				}
			}
				whiteKs = false; 
				whiteQs = false;
					
			}else if(piece == "k") {
			 if(Math.abs(selx - x) > 1) {
			 	if(selx - x < 0) {// castling
					boardArray[0][7] = " ";
					boardArray[0][5] = "r";
				} else {
					boardArray[0][0] = " ";
					boardArray[0][2] = "r";
				}
			}
				blackQs = false; 
				blackKs = false;
			 
			} 
			var sound = null;
			if(boardArray[y][x] != " " || epCap) {
				sound = new Audio("sounds/capture.wav");
				
			} else {
				sound = new Audio("sounds/move.wav");
			}
			if(promote === null) {
			boardArray[y][x] = piece;
			boardArray[selectedSquare[0]][selectedSquare[1]] = " ";
			} else {
				boardArray[y][x] = promote;
				boardArray[selectedSquare[0]][selectedSquare[1]] = " ";
			}
			whitePly = !whitePly;

			if(isInCheck(boardArray)) {
				sound = new Audio("sounds/check.wav");
				
			} 
			sound.play();
			
			break;
		}
	}
		ply += 1;
	  legalMoves = [];
	  selectedSquare = [-1, -1];
	  drawPosition();
	  setTimeout(endCheck, 100);
	  document.getElementById("fen").value = makeFen();
}
function endCheck() {
	if(isInCheck(boardArray)) {
	if(!areLegalMoves(boardArray)) {
		if(whitePly) {
			sendDisplay("Checkmate. Black is victorious.");
		} else {
			sendDisplay("Checkmate. White is victorious.");
		}
	}
	} else if(!areLegalMoves(boardArray)) {
		sendDisplay("Game drawn by stalemate.")
	} else {
		console.log("nothing happened");
	}
}

document.oncontextmenu = function(event) {
	
	event.preventDefault();
	var mouseX = event.clientX;
  var mouseY = event.clientY;
  var x = Math.floor(mouseX / squareSize);
  var y = Math.floor(mouseY / squareSize);
  if(x < -1 || x > 7 || y < -1 || y > 7) {
	return;
}
  event.preventDefault();
		var color =  "rgba(192, 96, 96, 0.7)";
		if(event.shiftKey) {
			color =  "rgba(96, 192, 96, 0.7)"
		}
		if(event.ctrlKey) {
			color =  "rgba(96, 96, 192, 0.7)"
		}
		if(event.altKey) {
			color =  "rgba(192, 192, 96, 0.7)"
		}
	  if(isPieceSelected) {
	  	selectedSquare = [-1, -1]
	  	isPieceSelected = false;
	  	drawPosition();
	  }
	  if(selectedSquare[0] == -1) {  selectedSquare = [y, x]; return;} else {
	  drawArrow(ctx, x, y, selectedSquare[1], selectedSquare[0], color);
	  selectedSquare = [-1, -1];
	  
	  
}
}
function mouseAction(event) {
  var mouseX = event.clientX;
  var mouseY = event.clientY;
  var x = Math.floor(mouseX / squareSize);
  var y = Math.floor(mouseY / squareSize);
 if(event.button === 0) {
	if(selectedSquare[0] == -1 || !isPieceSelected || boardArray[y][x] != " ") {
		var piece = boardArray[y][x]
	  if(piece != " " && isTurn(piece)) {
	  		isPieceSelected = true;
	  		console.log(x);
			console.log(y);
			selectedSquare = [y, x];
			drawPosition();
			legalMoves = [];
			legalMoves = findLegalMoves(y, x, true);
			
			drawPosition();
			
	  } else {
        	moveHandler(x,y);
        	isPieceSelected = false;
	  }
		  
	  
	} else {
		moveHandler(x, y)   
		isPieceSelected = false;
	}							 
  }
}

function findLegalMoves(y, x, checkLegality) {
   
	var piece = boardArray[y][x];
	var pseudoLegal = [];
	var legalMoveMask = [];
		switch(piece.toLowerCase()) {
			case "k":
				legalMoveMask = [[1,1],[1,0],[1,-1],[0,1],[0,-1],[-1,1],[-1,0],[-1,-1]];
				if(piece == "K" && whiteKs && boardArray[7][5] == " " && boardArray[7][6] == " " && boardArray[7][7] == "R") {
					legalMoveMask.push([0,2]);
				}
			
				if(piece == "K" && whiteQs && boardArray[7][3] == " " && boardArray[7][2] == " " && boardArray[7][1] == " " && boardArray[7][0] == "R") {
					legalMoveMask.push([0,-3]);
				}
				
				if(piece == "k" && blackKs && boardArray[0][5] == " " && boardArray[0][6] == " " && boardArray[0][7] == "r") {
					legalMoveMask.push([0,2]);
				}
			
				if(piece == "k" && blackQs && boardArray[0][3] == " " && boardArray[0][2] == " " && boardArray[0][1] == " " && boardArray[0][0] == "r") {
					legalMoveMask.push([0,-3]);
				}
		    break;
		    case "n":
				legalMoveMask = [[2,1],[2,-1],[1,2],[1,-2],[-1,2],[-1,-2],[-2,1],[-2,-1]];
			break;
		    case "r":
		        try {
		        for(var i = 1; i < 8; i++) {
		            curr = boardArray[y+i][x];
		            if(curr == " ") {
		                legalMoveMask.push([i, 0]);
		            } else if(isObstructed(piece, curr)) {
		                break;
		            } else {
		                legalMoveMask.push([i, 0]);
		                break;
		            }
		        }
		        } catch(e) {}
		        try {
		        for(var i = -1; i > -8; i--) {
                    curr = boardArray[y+i][x]
                    if(curr == " ") {
                        legalMoveMask.push([i, 0]);
                    } else if(isObstructed(piece, curr)) {
                        break;
                    } else {
                        legalMoveMask.push([i, 0]);
                        break;
                    }
                }
		        } catch(e) {}
                
                try {
                for(var i = 1; i < 8; i++) {
                    curr = boardArray[y][x+i]
                    if(curr == " ") {
                        legalMoveMask.push([0, i]);
                    } else if(isObstructed(piece, curr)) {
                        break;
                    } else {
                        legalMoveMask.push([0, i]);
                        break;
                    }
                }
                } catch(e) {}
                try {
                for(var i = -1; i > -8; i--) {
                    curr = boardArray[y][x+i]
                    if(curr == " ") {
                        legalMoveMask.push([0, i]);
                    } else if(isObstructed(piece, curr)) {
                        break;
                    } else {
                        legalMoveMask.push([0, i]);
                        break;
                    }
                }
                } catch(e) {}
		break;
		case "q": 
			try {
			for(var i = 1; i < 8; i++) {
				curr = boardArray[y+i][x];
				if(curr == " ") {
					legalMoveMask.push([i, 0]);
				} else if(isObstructed(piece, curr)) {
					break;
				} else {
					legalMoveMask.push([i, 0]);
					break;
				}
			}
			} catch(e) {}
			try {
			for(var i = -1; i > -8; i--) {
				curr = boardArray[y+i][x]
				if(curr == " ") {
					legalMoveMask.push([i, 0]);
				} else if(isObstructed(piece, curr)) {
					break;
				} else {
					legalMoveMask.push([i, 0]);
					break;
				}
			}
			} catch(e) {}
			
			try {
			for(var i = 1; i < 8; i++) {
				curr = boardArray[y][x+i]
				if(curr == " ") {
					legalMoveMask.push([0, i]);
				} else if(isObstructed(piece, curr)) {
					break;
				} else {
					legalMoveMask.push([0, i]);
					break;
				}
			}
			} catch(e) {}
			try {
			for(var i = -1; i > -8; i--) {
				curr = boardArray[y][x+i]
				if(curr == " ") {
					legalMoveMask.push([0, i]);
				} else if(isObstructed(piece, curr)) {
					break;
				} else {
					legalMoveMask.push([0, i]);
					break;
				}
			}
			} catch(e) {}
		case "b":
        try {
        for(var i = 1; i < 8; i++) {
            curr = boardArray[y+i][x+i];
            if(curr == " ") {
                legalMoveMask.push([i, i]);
            } else if(isObstructed(piece, curr)) {
                break;
            } else {
                legalMoveMask.push([i, i]);
                break;
            }
        }
        } catch(e) {}
        try {
        for(var i = -1; i > -8; i--) {
            curr = boardArray[y+i][x-i]
            if(curr == " ") {
                legalMoveMask.push([i, -i]);
            } else if(isObstructed(piece, curr)) {
                break;
            } else {
                legalMoveMask.push([i, -i]);
                break;
            }
        }
        } catch(e) {}
        
        try {
        for(var i = 1; i < 8; i++) {
            curr = boardArray[y-i][x-i]
            if(curr == " ") {
                legalMoveMask.push([-i, -i]);
            } else if(isObstructed(piece, curr)) {
                break;
            } else {
                legalMoveMask.push([-i, -i]);
                break;
            }
        }
        } catch(e) {}
        try {
        for(var i = -1; i > -8; i--) {
            curr = boardArray[y-i][x+i]
            if(curr == " ") {
                legalMoveMask.push([-i, i]);
            } else if(isObstructed(piece, curr)) {
                break;
            } else {
                legalMoveMask.push([-i, i]);
                break;
            }
        }
        } catch(e) {}
        break;
        case "p": 
        	if(piece == "P") {
        		if(boardArray[y-1][x] == " ") {
        			legalMoveMask.push([-1,0]);
        			
        			if(y == 6 && boardArray[y-2][x] == " ") {
        				legalMoveMask.push([-2,0]);
        			}
        		
        		}
        		try {
	        		var curr = boardArray[y-1][x-1];
	        		if((y == 3 && epCol == x-1) || (curr != " " && !isFriendly(piece, curr))) {
	        			legalMoveMask.push([-1, -1]);
	        		}
        		} catch(e) {}
        		
        		try {
					var curr = boardArray[y-1][x+1];
					if((y == 3 && epCol == x+1) || (curr != " " && !isFriendly(piece, curr))) {
						legalMoveMask.push([-1, 1]);
					}
				} catch(e) {}
				
            } else {
				if(boardArray[y+1][x] == " ") {
					legalMoveMask.push([1,0]);
					
					if(y == 1 && boardArray[y+2][x] == " ") {
						legalMoveMask.push([2,0]);
					}
				
				}
				try {
					var curr = boardArray[y+1][x-1];
					if((y == 4 && epCol == x-1) || (curr != " " && !isFriendly(piece, curr))) {
						legalMoveMask.push([1, -1]);
					}
				} catch(e) {}
				
				try {
					var curr = boardArray[y+1][x+1];
					if((y == 4 && epCol == x+1) || (curr != " " && !isFriendly(piece, curr))) {
						legalMoveMask.push([1, 1]);
					}
				} catch(e) {}
			}
         break;
		}
		
		for(var i in legalMoveMask) {
		    var mask = legalMoveMask[i];
		    try {
		    var end = boardArray[y+mask[0]][x+mask[1]];
		    
		    if(end != undefined && (end == " " || !isFriendly(end,piece))) {
		    	pseudoLegal[pseudoLegal.length] = [y+mask[0], x+mask[1]];
		    }
			} catch(e) {}
		   	
		    
		}
	var legal = [];
	if(checkLegality) {
		
	
		for(var i in pseudoLegal) {
			var psl = pseudoLegal[i]
			var boardArray2 = deepCopyFunction(boardArray);
			
			var castlingCalc = [y - psl[0], x - psl[1]]
			if(piece == "K" && Math.abs(castlingCalc[1]) > 1) {
				var castle = true;
				for(var p = 1; p <= Math.abs(castlingCalc[1]); p++) {
					var sx = p * (castlingCalc[1] / Math.abs(castlingCalc[1]));
					boardArray[pseudoLegal[i][0]][x-sx] = "K";
					boardArray[y][x] = " ";
					
					if(isInCheck(boardArray)) {
						castle = false;
						boardArray = deepCopyFunction(boardArray2);
						break;
					}
					boardArray = deepCopyFunction(boardArray2);
				}
				if(castle) {
					legal.push(psl);
				}
			}else if(piece == "k" && Math.abs(castlingCalc[1]) > 1) {
				 var castle = true;
				 for(var p = 1; p <= Math.abs(castlingCalc[1]); p++) {
					 var sx = p * (castlingCalc[1] / Math.abs(castlingCalc[1]));
					 boardArray[pseudoLegal[i][0]][x-sx] = "k";
					 boardArray[y][x] = " ";
					 
					 if(isInCheck(boardArray)) {
						 castle = false;
						 boardArray = deepCopyFunction(boardArray2);
						 break;
					 }
					 boardArray = deepCopyFunction(boardArray2);
				 }
				 if(castle) {
					 legal.push(psl);
				 }
			 } else {
			
			
				var boardArray2 = deepCopyFunction(boardArray);
				try {
				boardArray[pseudoLegal[i][0]][pseudoLegal[i][1]] = boardArray[y][x];
				boardArray[y][x] = " ";

				if(!isInCheck(boardArray)) {
					console.log(boardArray);
					legal.push(pseudoLegal[i]);
					
				}
				} catch(e) {console.log(e)}
				boardArray = deepCopyFunction(boardArray2);
				
				
			}
			
		}
	
	
		
	} else { 
		legal = pseudoLegal;
	}

	return legal;
    
}

const deepCopyFunction = (inObject) => {
  let outObject, value, key

  if (typeof inObject !== "object" || inObject === null) {
	return inObject // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {}

  for (key in inObject) {
	value = inObject[key]

	// Recursively (deep) copy for nested objects, including arrays
	outObject[key] = deepCopyFunction(value)
  }

  return outObject
}

function isInCheck(pos) {
	//document.getElementById("moves").innerHtml = document.getElementById("moves").innerHtml + "\n";
	
	var kingX = -1;
	var kingY = -1;
	if(whitePly) {
		for(var r = 0; r < 8; r++) {
			for(var c = 0; c < 8; c++) {
				if(pos[r][c] == "K") {
					kingY = r;
					kingX = c;
					break;
				}
			}
			if(kingX != -1){
				break;
			}
		}
	} else {
		for(var r = 0; r < 8; r++) {
			for(var c = 0; c < 8; c++) {
				if(pos[r][c] == "k") {
					kingY = r;
					kingX = c;
					break;
				}
			}
			if(kingX != -1){
				break;
			}
		}
	}
	
		for(var r = 0; r < 8; r++) {
			for(var c = 0; c < 8; c++) {
				if(pos[r][c] != " " && !isTurn(pos[r][c])) {
					var moves = findLegalMoves(r, c, false);
					
						for(var mv in moves) {
							//sendDisplay("")
							
							if(moves[mv][1] == kingX && moves[mv][0] == kingY) {
								return true;
							}
						}
					}
				}
			}
		
		return false;

	
	
}

function areLegalMoves(pos) {
		var moveCount = 0;

		for(var r = 0; r < 8; r++) {
			for(var c = 0; c < 8; c++) {
				if(boardArray[r][c] != " " && isTurn(pos[r][c])) {
					
					var moves = findLegalMoves(r, c, true);
					console.log(moves.length);
					console.log(boardArray[r][c]);
						for(var mv in moves) {
							
								moveCount++;
							
							
						}
					
					
				}
			}
		}
		console.log(moveCount);
		console.log(moveCount > 0);

		return moveCount > 0;
}


function drawArrow(context, x2, y2, x, y, color) {
	var fromx = (x * squareSize) + squareSize / 2;
	var tox = (x2 * squareSize) + squareSize / 2;
	var fromy = (y * squareSize) + squareSize / 2;
	var toy = (y2 * squareSize) + squareSize / 2;
	var headlen = 25; // length of head in pixels
	var dx = tox - fromx;
	var dy = toy - fromy;
	var angle = Math.atan2(dy, dx);
	context.beginPath();
	context.lineCap = 'round'
	context.lineWidth = 10;
	context.strokeStyle = color;
	if(fromx == tox && fromy == toy) {
		ctx.arc(tox,toy,(squareSize - 2) / 2, 0,2*Math.PI);
	} else {
  
	  context.moveTo(fromx, fromy);
	  context.lineTo(tox, toy);
	  context.moveTo(tox, toy);
	  context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
	  context.moveTo(tox, toy);
	  context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
	}
	 context.stroke();
	
	
}

function isTurn(p1) {
  return (p1.toUpperCase() == p1) == whitePly;
}

function isFriendly(p1,p2) {
  return (p1.toLowerCase() == p1) == (p2.toLowerCase() == p2);
}
function isObstructed(p1,p2) {
  return p2 === undefined || ((p1.toLowerCase() == p1) == (p2.toLowerCase() == p2) && p2 != " ");
}
function drawPosition() {
	

	  ctx.fillStyle = FILL_DARK_SQUARES;
	  ctx.fillRect(0,0, canvas.width, canvas.height);
	  ctx.fillStyle = FILL_LIGHT_SQUARES;
	  
	  for(var r = 0; r < 8; r++) {
		for(var c = 0; c < 8; c++) {
		  
		  var offset = squareSize / 8;
		  var x = c * squareSize;
		  var y = r * squareSize;
		  setTimeout(function(args) {
				drawPiece(args);
			  }, 10, deepCopyFunction([r, c, x+offset, y+offset, squareSize - (2 * offset), squareSize - (2 * offset)]));
		  
		  if((r + c) % 2 == 0) {
			ctx.fillRect(x,y,squareSize,squareSize);
		  }
		  if(boardArray[r][c].toLowerCase() == "k" && isTurn(boardArray[r][c]) && isInCheck(boardArray)) {
			  ctx.fillStyle = "#aa2255";
			  ctx.fillRect(x,y,squareSize,squareSize);
			  ctx.fillStyle = FILL_LIGHT_SQUARES;
		  }
		  if(selectedSquare[0] == r && selectedSquare[1] == c) {
			ctx.fillStyle = "#445577";
			ctx.fillRect(x,y,squareSize,squareSize);
			ctx.fillStyle = FILL_LIGHT_SQUARES;
		  } else if(legalMoves != []) {
		  for(var a = 0; a < legalMoves.length; a++) {
		  	var move = legalMoves[a];
		  	if(move[0] == r && move[1] == c) {
		  	
		  		ctx.lineCap = 'round'
			  	ctx.lineWidth = offset / 2;
		  		ctx.strokeStyle = "#335577";
				ctx.strokeRect(x+(offset/2), y+(offset/2), squareSize - offset, squareSize - offset);
				break;	  
		  	}
		  }
		  }
		}
		  
	  }
  
  
} 



function letterToId(piece) {
  switch(piece) {
	case "P":
	  return "white-pawn"
	break;
	case "B":
	  return "white-bishop"
	break;
	case "N":
	  return "white-knight"
	break;  
	case "R":
	  return "white-rook"
	break;  
	case "K":
	  return "white-king"
	break;  
	case "Q":
	  return "white-queen"
	break;  
	case "p":
	  return "black-pawn"
	break;
	case "b":
	  return "black-bishop"
	break;
	case "n":
	  return "black-knight"
	break;  
	case "r":
	  return "black-rook"
	break;  
	case "k":
	  return "black-king"
	break;  
	case "q":
	  return "black-queen"
	break;
	default:
	  return null;
	break;
  }
}

function drawPiece(info) {
	var piece = boardArray[info[0]][info[1]];
	var x = info[2];
	var y = info[3];
	var xs = info[4];
	var ys = info[5];	
	var id = letterToId(piece);
	if(id == null) {
	  return;
	}
	var xml = new XMLSerializer().serializeToString(document.getElementById(id));
	 // make it base64
var svg64 = btoa(xml);
var b64Start = 'data:image/svg+xml;base64,';

// prepend a "header"
var image64 = b64Start + svg64;
img = new Image();
// set it as the source of the img element
img.src = image64;

// draw the image onto the canvas
setTimeout(function(img2, x2, y2, xs2, ys2) {canvas.getContext('2d').drawImage(img2, x2, y2, xs2, ys2)}, 10, img, x, y, xs, ys);
}
document.body.onclick = function() {
	
	document.getElementById("boardOverlay").style.visibility = "hidden"
  
}
document.body.onload = function() {
	

 // drawPosition();

	
  canvas.addEventListener("click", mouseAction);
}
