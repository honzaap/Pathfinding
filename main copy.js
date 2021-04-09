class Cell
{
    getG(){return this.G}
    getH(){return this.H}
    getF(){return this.G+this.H}
    getX(){return this.X}
    getY(){return this.Y}

    setG(G){this.G=G}
    setH(x1,y1){
        if(this.X==x1 && this.Y==y1)
        {
            this.H=0
        }
        else if(this.X == x1)
        {
            this.H=Math.abs(this.Y-y1);
        }
        else if(this.Y == y1)
        {
            this.H=Math.abs(this.X-x1);
        }
        else
        {
            var rx = Math.abs(this.X-x1);
            var ry = Math.abs(this.Y-y1);
            this.H=ry*1.4+(rx-ry);
        }
    }

    constructor(X,Y)
    {
        this.X = X;
        this.Y = Y;
    }
}



// Main grid
let grid = [];

// Grid element
let grid_HTML = document.getElementById("grid");
let navbar_HTML = document.getElementById("navbar");

const window_y = grid_HTML.scrollHeight;
const window_x = grid_HTML.scrollWidth;
let horizontal_cells = 80;
let vertical_cells = 40;

if(window_x < 1200)horizontal_cells = 65;
else if(window_x < 900)horizontal_cells = 55;
else if(window_x < 768)horizontal_cells = 40;



// Populating grid
for(var i = 0; i < vertical_cells; i++)
{
    var row_HTML = document.createElement("div");
    row_HTML.classList.add("row");
    for(var j = 0; j < horizontal_cells; j++)
    {
        var cell_HTML = document.createElement("div");
        cell_HTML.classList.add("cell");
        row_HTML.appendChild(cell_HTML);
    }
    grid_HTML.appendChild(row_HTML);
}

// Start and End nodes
let start_node = [23,26];
let end_node = [44,37];

// Populating grid
for(var i = 0; i < vertical_cells; i++)
{
    let row = [];
    for(var j = 0; j < horizontal_cells; j++)
    {
        let cell = new Cell(j,i);
        row.push(cell);
    }
    grid.push(row);
}


function RunAStar()
{
    SetHOfAllNodes();
    let open = getOpenNodes(start_node[1],start_node[0])
    let closed = []
    let start = grid[start_node[1]][start_node[0]];
    let start_HTML = grid_HTML.children[start_node[1]].children[start_node[0]];
    let end = grid[end_node[1]][end_node[0]];
    let end_HTML = grid_HTML.children[end_node[1]].children[end_node[0]];
    start_HTML.classList.add("start"); 
    end_HTML.classList.add("end");
    closed.push(start)
    while (false)
    {
        let current = 3;
    }
}

function SetHOfAllNodes()
{
    for(var row of grid)
    {
        for(var cell of row)
        {
            cell.setH(end_node[0],end_node[1])
        }
    }
}

function getOpenNodes(x,y){
    var res = []
    res = pushNode(x+1,y+1,res)
    res = pushNode(x,y+1,res)
    res = pushNode(x-1,y+1,res)
    res = pushNode(x+1,y,res)
    res = pushNode(x-1,y,res)
    res = pushNode(x+1,y-1,res)
    res = pushNode(x,y-1,res)
    res = pushNode(x-1,y-1,res)
    return res
}

function pushNode(x,y,list)
{
    if(horizontal_cells <= x || x < 0 || y < 0 || vertical_cells <= y)
    {
        return null;
    }
    list.push(grid[y][x]);
    return list;
}