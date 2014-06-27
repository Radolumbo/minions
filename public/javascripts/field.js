//Playing field
function Field(size){

  //Even for non-uniform fields, there will still be a rightmost/topmost tile
  this.length = size;
  this.width = size;
  
  //2D array of all tiles in the field
  this.tiles = [];

}

//Single "square" of the field
function Tile(x,y){

  //"id" of tile
  this.xid = x;
  this.yid = y;

  //Position visually (for selecting tiles mostly)
  this.x = x*TILE_WIDTH;
  this.y = y*TILE_HEIGHT;

  //Implement height later
  this.height = 0;

  //Is this tile accessible?
  this.access = true;

  //Who is occupying this tile?
  this.occupant = -1;

}

//Initialize a playing area
function createField(size){


  var field = new Field(size);
  
  //Generate all other tiles
  for(var i = 0; i<size; i++){
    field.tiles[i] = new Array(size);
    for(var j =0; j<size; j++){
      field.tiles[i][j] = new Tile(i,j);
    }
  }

  return field;

}