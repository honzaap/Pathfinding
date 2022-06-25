class Cell
{
    is_state(state){return this.State == state}
    reset(){this.make_state("null")}
    make_state(state){this.State = state;}
    draw(grid){ 
        grid.children[this.Y].children[this.X].classList.remove("animate")
        grid.children[this.Y].children[this.X].classList = "cell " + this.State + ` x${this.X}-y${this.Y}`;
        grid.children[this.Y].children[this.X].style.backgroundPosition = `${this.X * horizontal_cells * 0}px ${this.Y * vertical_cells / 4}px`;
        if(this.State != "null") grid.children[this.Y].children[this.X].classList.add("animate"); 
        
    }
    update_neighbours(grid, diagonal=true)
    {
        this.neighbours = []
        let space_top = this.Y > 0 && grid[this.Y-1][this.X];
        let space_down = this.Y < vertical_cells - 1 && grid[this.Y+1][this.X];
        let space_left = this.X > 0 && grid[this.Y][this.X-1];
        let space_right = this.X < horizontal_cells - 1 && grid[this.Y][this.X+1];

        let shiftXR = this.Y % 2 === 0 ? 0 : 1; 
        let shiftXL = this.Y % 2 === 0 ? 1 : 0; 
        
        let left = space_left && !grid[this.Y][this.X - 1].is_state("wall");
        let right = space_right && !grid[this.Y][this.X + 1].is_state("wall");

        let top_right =     space_top  && grid[this.Y-1][this.X + 1 - shiftXR] && !grid[this.Y-1][this.X + 1 - shiftXR].is_state("wall");
		let top_left =  	space_top  && grid[this.Y-1][this.X - 1 + shiftXL] && !grid[this.Y-1][this.X - 1 + shiftXL].is_state("wall");
        let down_right =    space_down && grid[this.Y+1][this.X + 1 - shiftXR] && !grid[this.Y+1][this.X + 1 - shiftXR].is_state("wall");
        let down_left =     space_down && grid[this.Y+1][this.X - 1 + shiftXL] && !grid[this.Y+1][this.X - 1 + shiftXL].is_state("wall");


        if(top_right) this.neighbours.push(grid[this.Y-1][this.X + 1 - shiftXR]);

        if(top_left) this.neighbours.push(grid[this.Y-1][this.X - 1 + shiftXL]);

        if(down_right) this.neighbours.push(grid[this.Y+1][this.X + 1 - shiftXR]);

        if(down_left) this.neighbours.push(grid[this.Y+1][this.X - 1 + shiftXL]);

        if(right) this.neighbours.push(grid[this.Y][this.X+1]);

        if(left) this.neighbours.push(grid[this.Y][this.X-1]);
    }

    update_wall_neighbours(grid,space=1)
    {
        this.wall_neighbours = []

        let space_top = this.Y > space;
        let space_down = this.Y < vertical_cells - 1 - space;
        let space_left = this.X > space;
        let space_right = this.X < horizontal_cells - 1 - space;

        if(space_top) this.wall_neighbours.push(grid[this.Y-1-space][this.X]);// UP

        if(space_down) this.wall_neighbours.push(grid[this.Y+1+space][this.X]);// DOWN

        if(space_right) this.wall_neighbours.push(grid[this.Y][this.X+1+space]);// RIGHT 

        if(space_left) this.wall_neighbours.push(grid[this.Y][this.X-1-space]);// LEFT
    }

    constructor(X,Y)
    {
        this.X = X;
        this.Y = Y;
        this.State = "null"
        this.neighbours = []
        this.wall_neighbours = []
    }
}

// Main grid
let grid = [];

// Grid element
let body = document.getElementsByTagName("body")[0];
let grid_HTML = document.getElementById("grid");
let navbar_HTML = document.getElementById("navbar");
let speed_range = document.getElementById("range-speed");
let algo_select = document.getElementById("algo-select");
let maze_algo_select = document.getElementById("maze-algo-select");

const window_y = body.scrollHeight - navbar_HTML.scrollHeight;
const window_x = body.scrollWidth;

let horizontal_cells;
let vertical_cells;
let tile_size ;
let placing_tiles = false;
let erasing_tiles = false;
let dragging_tile = false;
let dragged_tile = "";
let is_running = false;


tile_size = "big"
horizontal_cells = Math.floor(window_x / 35);
vertical_cells = Math.floor(window_y / 35);

horizontal_cells = Math.floor( (window_x - horizontal_cells) /35);
vertical_cells = Math.floor( (window_y - vertical_cells) / 35);

grid_HTML.style.width = `${horizontal_cells * 35}px`;
grid_HTML.style.height = `${vertical_cells * 30}px`;


// Start and End nodes
let start_node = [Math.floor(horizontal_cells/3) , Math.floor(vertical_cells/2)];
let end_node = [Math.floor(horizontal_cells/3*2) , Math.floor(vertical_cells/2)];

let start_node_initial = [Math.floor(horizontal_cells/3) , Math.floor(vertical_cells/2)]
let end_node_initial = [Math.floor(horizontal_cells/3*2) , Math.floor(vertical_cells/2)]

// Populating grid
for(var i = 0; i < vertical_cells; i++)
{
    let row = [];
    let odd = i % 2 === 0;
    var row_HTML = document.createElement("div");
    row_HTML.classList = "row " + tile_size +  (odd ? " odd" : "");
    for(var j = 0; j < horizontal_cells; j++)
    {
        let cell = new Cell(j,i);
        row.push(cell);

        var cell_HTML = document.createElement("div");
        cell_HTML.classList.add("cell");
        row_HTML.appendChild(cell_HTML);
    }
    grid.push(row);

    grid_HTML.appendChild(row_HTML);
}
// Setting tile placing
for(var i = 0; i < vertical_cells; i++)
{
    for(var j = 0; j < horizontal_cells; j++)
    {
        grid[i][j].draw(grid_HTML);
        grid_HTML.children[i].children[j].X=j;
        grid_HTML.children[i].children[j].Y=i;

        grid_HTML.children[i].children[j].onmouseover = function() 
            { 
                if(placing_tiles) PlaceTile(this.X,this.Y);
                else if(erasing_tiles) ResetTile(this.X,this.Y); 

                if(dragging_tile) this.classList = "cell "+dragged_tile
            } ;
        grid_HTML.children[i].children[j].onmouseleave = function() 
            {
                if(dragged_tile) grid[this.Y][this.X].draw(grid_HTML);
            }
        grid_HTML.children[i].children[j].onmousedown = function() {
            if(this.X == start_node[0] && this.Y == start_node[1] || this.X == end_node[0] && this.Y == end_node[1]){
                dragging_tile = true;
                dragged_tile = grid[this.Y][this.X].State;
            }
            else{
                if(grid[this.Y][this.X].is_state("wall")) erasing_tiles = true;
                else placing_tiles = true;

                if(placing_tiles) PlaceTile(this.X,this.Y);
                if(erasing_tiles) ResetTile(this.X,this.Y)
            }
        }
        grid_HTML.children[i].children[j].onmouseup = function() {
            if(dragging_tile)
            {
                dragging_tile = false;
                PlaceTile(this.X,this.Y,dragged_tile)
            }
        }
        grid_HTML.children[i].children[j].ondragstart = function(){return false};
        grid_HTML.children[i].children[j].ondrop = function(){return false};
    }
}

grid_HTML.onmouseup = function() {
    placing_tiles = false
    erasing_tiles = false
}

PlaceTile(start_node_initial[0],start_node_initial[1],"start")
PlaceTile(end_node_initial[0],end_node_initial[1],"end")

async function SelectChange(select)
{
    if(select == "maze-algo-select")
    {
        await RunMaze();
    }
}

function PlaceTile(x,y,tile = "wall")
{
    if(is_running) return;
    let is_start = start_node.length != 0 ? x==start_node[0] && y==start_node[1] : false;
    let is_end = end_node.length != 0 ? x==end_node[0] && y==end_node[1] : false;

    if(start_node.length == 0 || tile == "start"){
        if(!is_end){
            if(start_node.length != 0) ResetTile(start_node[0],start_node[1], true);

            grid[y][x].make_state("start");
            start_node = [x,y];
        }
    }
    else if(end_node.length == 0 || tile == "end"){
        if(!is_start){
            if(end_node.length != 0) ResetTile(end_node[0],end_node[1], true);

            grid[y][x].make_state("end");
            end_node = [x,y]        
        }
    }
    else{
        if(!is_start && !is_end){
            grid[y][x].make_state("wall");
        }
    }
    grid[y][x].draw(grid_HTML);
}

function ResetTile(x,y,full=false)
{
    if(is_running) return
    if(full){
        grid[y][x].reset();
        grid[y][x].draw(grid_HTML);
        return;
    }
    if(grid[y][x].is_state("wall"))
    {
        grid[y][x].reset();
    }
    grid[y][x].draw(grid_HTML);
}

async function ReconstructPath(came_from, current)
{
    while(came_from[""+current.X+"y"+current.Y] != undefined){
        current = came_from[""+current.X+"y"+current.Y]
        current.make_state("path")
        current.draw(grid_HTML);
        await sleep(25)
    }
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function ResetPath()
{
    if(is_running) return
    for(var i = 0; i < vertical_cells; i++){
        for(var j = 0; j < horizontal_cells; j++){
            let cell = grid[i][j];
            if(!cell.is_state("wall") && !cell.is_state("start") && !cell.is_state("end")){
                grid[i][j].reset();
                grid[i][j].draw(grid_HTML);
            }
        }
    }
}

function ClearWalls()
{
    if(is_running) return
    for(var i = 0; i < vertical_cells; i++){
        for(var j = 0; j < horizontal_cells; j++){
            let cell = grid[i][j];
            if(cell.is_state("wall")){
                grid[i][j].reset();
                grid[i][j].draw(grid_HTML);
            }
        }
    }
}

function ClearGrid()
{
    if(is_running) return
    start_node = [];
    end_node = [];
    for(var i = 0; i < vertical_cells; i++){
        for(var j = 0; j < horizontal_cells; j++){
            grid[i][j].reset();
            grid[i][j].draw(grid_HTML);
        }
    }
    PlaceTile(start_node_initial[0],start_node_initial[1])
    PlaceTile(end_node_initial[0],end_node_initial[1])
}

async function Run()
{
    let algo = algo_select.value;
    switch(algo){
        case "AStar":
            await RunAStar();
            break;
        case "Dijkstra":
            await RunDijkstra();
            break;
        case "BFS":
            await RunBFS();
            break;
        case "DFS":
            await RunDFS();
            break;
        case "Greedy":
            await RunGreedy();
            break;
    }
}

async function RunAStar()
{
    if(is_running) return;
    ResetPath();
    is_running = true;
    let start = grid[start_node[1]][start_node[0]]; 
    let end = grid[end_node[1]][end_node[0]];
    for (var row of grid)
    {
        for (var cell of row)
        {
            cell.update_neighbours(grid)
        }
    }
    let count = 0;
    let open_set = [];
    open_set.push([0,count,start]);
    let came_from = {}

    let g_score = {}
    for(let row of grid){
        for(let cell of row){
            g_score[""+cell.X+"y"+cell.Y] =  Number.MAX_VALUE
        }
    }
    g_score[""+start.X+"y"+start.Y] = 0;
    let f_score = {}
    for(let row of grid){
        for(let cell of row){
            f_score[""+cell.X+"y"+cell.Y] = Number.MAX_VALUE  
        }
    }
    f_score[""+start.X+"y"+start.Y] = H(start_node[0],start_node[1],end_node[0],end_node[1]);

    let open_set_hash = new Set();
    open_set_hash.add(start);

    while(!open_set.length == 0)
    {
        let current = open_set[0][2] 
        let current_smallest = Number.MAX_VALUE  
        let temp_index = 0;
        for(let cell = 0; cell < open_set.length; cell ++)
        {
            if(open_set[cell][0] < current_smallest) 
            {
                temp_index = cell;
                current = open_set[cell][2]
                current_smallest = open_set[cell][0]
            }
        }
        open_set.splice(temp_index, 1);
        open_set_hash.delete(current)
        if(current == end)
        {
            // make path           
            end.make_state("end")
            start.make_state("start")
            end.draw(grid_HTML);
            start.draw(grid_HTML)
            await ReconstructPath(came_from,end)
            end.make_state("end")
            start.make_state("start")
            end.draw(grid_HTML);
            start.draw(grid_HTML)
            is_running = false;
            return 
        }

        for(var neighbour of current.neighbours){
            let temp_g_score = g_score[""+current.X+"y"+current.Y]+1
            if(temp_g_score < g_score[""+neighbour.X+"y"+neighbour.Y] || g_score[""+neighbour.X+"y"+neighbour.Y] == undefined){
                came_from[""+neighbour.X+"y"+neighbour.Y] = current
                g_score[""+neighbour.X+"y"+neighbour.Y] = temp_g_score
                f_score[""+neighbour.X+"y"+neighbour.Y] = temp_g_score + H(neighbour.X,neighbour.Y, end.X,end.Y)
                if(!open_set_hash.has(neighbour)){
                    count++;
                    open_set.push([f_score[""+neighbour.X+"y"+neighbour.Y],count,neighbour])
                    open_set_hash.add(neighbour)
                    neighbour.make_state("open")
                }
                neighbour.draw(grid_HTML)
            }
        }
        if(current != start)
        {
            current.make_state("closed");
            current.draw(grid_HTML)
        }

        await sleep(200-speed_range.value)
    }
    is_running = false;
}

function H(x1,y1,x2,y2){
    return Math.abs(x1-x2)+Math.abs(y1-y2);
}

async function RunDijkstra()
{
    if(is_running) return;
    ResetPath();
    is_running = true;
    let start = grid[start_node[1]][start_node[0]]; 
    let end = grid[end_node[1]][end_node[0]];

    let dist = {};
    let prev = {};
    let Q = []


    for (var row of grid)
    {
        for (var cell of row)
        {
            cell.update_neighbours(grid)
        }
    }

    for(var row of grid){
        for(var cell of row){
            dist[""+cell.X+"y"+cell.Y] = Number.MAX_VALUE;
            prev[""+cell.X+"y"+cell.Y] = null;
            Q.push(cell)
        }
    }
    dist[""+start.X+"y"+start.Y] = 0;

    while (Q.length > 0)
    {
        let u = Q[0];
        let current_smallest = Number.MAX_VALUE;
        let temp_index = 0;
        for(let cell = 0; cell < Q.length; cell ++)
        {
            if(parseFloat(dist[""+Q[cell].X+"y"+Q[cell].Y]) < current_smallest)
            {   
                temp_index = cell;
                current_smallest = parseFloat(dist[""+ Q[cell].X+"y"+ Q[cell].Y]);
                u = Q[cell];
            }
        }
        Q.splice(temp_index, 1);

        if(current_smallest == Number.MAX_VALUE) 
        {
            is_running = false;
            return;
        }
        for(let v of u.neighbours)
        {
            if(Q.indexOf(v) != -1)
            {
                let alt = parseFloat(dist[""+u.X+"y"+u.Y]) + H(u.X,u.Y,v.X,v.Y);
                if(alt <  parseFloat(dist[""+v.X+"y"+v.Y])){
                    dist[""+v.X+"y"+v.Y] = alt;
                    prev[""+v.X+"y"+v.Y] = u;
                }
                v.make_state("open");
                v.draw(grid_HTML);
            }
            if(v == end)
            {
                end.make_state("end")
                start.make_state("start")
                end.draw(grid_HTML);
                start.draw(grid_HTML)
                await ReconstructPath(prev,end)
                end.make_state("end")
                start.make_state("start")
                end.draw(grid_HTML);
                start.draw(grid_HTML)
                is_running = false;
                return
            }
        }

        if(u != start && u != end)
        {
            u.make_state("closed");
            u.draw(grid_HTML);
        }
        await sleep(200-speed_range.value)
    }
    is_running = false;
}

async function RunBFS()
{
    if(is_running) return;
    ResetPath();
    is_running = true;
    let start = grid[start_node[1]][start_node[0]]; 
    let end = grid[end_node[1]][end_node[0]];

    let disc = [];
    let prev = {};
    let Q = []

    disc.push(start)
    Q.push(start)

    for (var row of grid)
    {
        for (var cell of row)
        {
            cell.update_neighbours(grid)
        }
    }

    while(Q.length > 0)
    {
        let v = Q[0];
        Q.splice(0,1);

        for(var n of v.neighbours)
        {
            if(disc.indexOf(n) == -1)
            {
                disc.push(n);
                Q.push(n);
                n.make_state("open");
                n.draw(grid_HTML);
                prev[""+n.X+"y"+n.Y] = v;
                if(n == end)
                {
                    end.make_state("end")
                    start.make_state("start")
                    end.draw(grid_HTML);
                    start.draw(grid_HTML)
                    await ReconstructPath(prev,end)
                    end.make_state("end")
                    start.make_state("start")
                    end.draw(grid_HTML);
                    start.draw(grid_HTML)
                    is_running = false;
                    return
                } 
            }
        }
        if(v != start && v != end)
        {
            v.make_state("closed");
            v.draw(grid_HTML);
        }
        await sleep(200-speed_range.value)
    }
    is_running = false;
}

async function RunDFS()
{
    if(is_running) return;
    ResetPath();
    is_running = true;
    let start = grid[start_node[1]][start_node[0]]; 
    let end = grid[end_node[1]][end_node[0]];

    let disc = [];
    let prev = {};
    let S = []

    S.push(start)

    for (var row of grid)
    {
        for (var cell of row)
        {
            cell.update_neighbours(grid,false)
        }
    }

    while(S.length > 0)
    {
        let v = S.pop();
        disc.push(v);

        for(var i = v.neighbours.length-1;i>=0;i--)
        {
            let n = v.neighbours[i];
            if(disc.indexOf(n) == -1)
            {
                n.make_state("open");
                n.draw(grid_HTML);
                prev[""+n.X+"y"+n.Y] = v;
                if(n == end)
                {
                    end.make_state("end")
                    start.make_state("start")
                    end.draw(grid_HTML);
                    start.draw(grid_HTML)
                    await ReconstructPath(prev,end)
                    end.make_state("end")
                    start.make_state("start")
                    end.draw(grid_HTML);
                    start.draw(grid_HTML)
                    is_running = false;
                    return
                } 
                else{
                    S.push(n)
                }
            }
        }
        if(v != start && v != end)
        {
            v.make_state("closed");
            v.draw(grid_HTML);
        }
        await sleep(200-speed_range.value)
    }
    is_running = false;
}

async function RunGreedy()
{
    if(is_running) return;
    ResetPath();
    is_running = true;
    let start = grid[start_node[1]][start_node[0]]; 
    let end = grid[end_node[1]][end_node[0]];

    let dist = {}
    let disc = []
    let prev = {};
    let Q = []

    for (var row of grid)
    {
        for (var cell of row)
        {
            cell.update_neighbours(grid)
        }
    }

    for(let row of grid){
        for(let cell of row){
            dist[""+cell.X+"y"+cell.Y] = Number.MAX_VALUE  
        }
    }
    dist[""+start.X+"y"+start.Y] = H(start.X,start.Y,end.X,end.Y);
    Q.push(start);

    while(Q.length > 0){
        let u = Q[0];
        let current_smallest = Number.MAX_VALUE;
        let temp_index = 0;
        for(let cell = 0; cell < Q.length; cell ++)
        {
            if(parseFloat(dist[""+Q[cell].X+"y"+Q[cell].Y]) < current_smallest)
            {   
                temp_index = cell;
                current_smallest = parseFloat(dist[""+ Q[cell].X+"y"+ Q[cell].Y]);
                u = Q[cell];
            }
        }
        Q.splice(temp_index, 1);
        disc.push(u);

        if(u == end)
        {
            end.make_state("end")
            start.make_state("start")
            end.draw(grid_HTML);
            start.draw(grid_HTML)
            await ReconstructPath(prev,end)
            end.make_state("end")
            start.make_state("start")
            end.draw(grid_HTML);
            start.draw(grid_HTML)
            is_running = false;
            return
        } 

        for(var n of u.neighbours)
        {
            if(disc.indexOf(n) == -1)
            {
                dist[""+n.X+"y"+n.Y] = H(n.X,n.Y,end.X,end.Y);
                disc.push(n);
                Q.push(n);
                n.make_state("open");
                n.draw(grid_HTML);
                prev[""+n.X+"y"+n.Y] = u;
            }
        }
        if(u != start && u != end)
        {
            u.make_state("closed");
            u.draw(grid_HTML);
        }
        await sleep(200-speed_range.value)
    }
    is_running = false;
}



// MAZES
async function RunMaze()
{
    ClearGrid();
    is_running = true;
    for (var row of grid)
    {
        for (var cell of row)
        {
            cell.update_wall_neighbours(grid);
            cell.update_neighbours(grid,false);
            cell.visited_fill = null;
            cell.visited = null;
            cell.connect_visited = null;
        }
    }

    

    let ctX = Math.floor(horizontal_cells/2);
    let ctY = Math.floor(vertical_cells/2);

    if(grid[ctY][ctX].is_state("start") || grid[ctY][ctX].is_state("end") && !grid[ctY+1][ctX].is_state("start") && !grid[ctY+1][ctX].is_state("end"))
    {
        ctY++;
    }
    else if(grid[ctY+1][ctX].is_state("start") || grid[ctY+1][ctX].is_state("end") && !grid[ctY][ctX+1].is_state("start") && !grid[ctY][ctX+1].is_state("end")){
        ctX++;
    }



    let algo = maze_algo_select.value;
    switch(algo){
        case "DFS":
            FillWithWalls();
            await RecursiveMazeDFS(ctY,ctX);
            break;
        case "Prim":
            FillWithWalls();
            await MazePrim(grid[ctY][ctX]);
            break;
        case "Random":
            FillWithWalls();
            await RecursiveMazeRandom(grid[ctY][ctX]);
            break;
    }

    is_running = false;


}


function FillWithWalls()
{
    if(!grid[0][0].is_state("start") && !grid[0][0].is_state("end"))
    {
        RecursiveFillWithWalls(grid[0][0]);
    }
    else if(!grid[0][1].is_state("start") && !grid[0][1].is_state("end"))
    {
        RecursiveFillWithWalls(grid[0][1]);
    }
    else{
        RecursiveFillWithWalls(grid[1][0]);
    }

}

function RecursiveFillWithWalls(current)
{
    if(current.is_state("start") || current.is_state("end")) return;
    current.make_state("wall");
    current.draw(grid_HTML);
    current.visited_fill = true;
    for(let n of current.neighbours)
    {
        if(n.visited_fill != true)RecursiveFillWithWalls(n);
    }
}

async function RecursiveMazeRandom(current)
{
    current.visited = true;
    let neighbours = current.wall_neighbours;
    while(neighbours.length > 0)
    {
        let idx = Math.floor(Math.random() * neighbours.length);
        let n = neighbours[idx];
        neighbours.splice(idx,1);

        if(n.visited != true)
        {
            n.visited = true;
            let wall = [];
            if(n.X == current.X) wall = [n.X, n.Y>current.Y ? current.Y+1 : n.Y+1 ];
            else wall = [n.X>current.X ? current.X+1 : n.X+1, n.Y ];

            let wall_cell = grid[wall[1]][wall[0]]
            if(!wall_cell.is_state("start") && !wall_cell.is_state("end"))
            {
                wall_cell.make_state("null");
                wall_cell.draw(grid_HTML);
            }
            await sleep(1);
            await RecursiveMazeRandom(wall_cell);

        }
    }
}

async function RecursiveMazeDFS(r,c)
{
    let randDirs = [1,2,3,4];
    shuffle(randDirs);
    for (var i = 0; i < randDirs.length; i++) {

        switch(randDirs[i]){
            case 1: 
                if (r - 2 <= 0 )
                        continue;
                    if (grid[r - 2][c].State != "null") {
                        if(!grid[r-2][c].is_state("start") && !grid[r-2][c].is_state("end")) grid[r-2][c].make_state("null");
                        if(!grid[r-1][c].is_state("start") && !grid[r-1][c].is_state("end")) grid[r-1][c].make_state("null");

                        grid[r-2][c].draw(grid_HTML);
                        grid[r-1][c].draw(grid_HTML);

                        await sleep(1);
                        RecursiveMazeDFS(r - 2, c);
                    }
                break;
            case 2: 
                if (c +  2 >= horizontal_cells - 1)
                    continue;
                if (grid[r][c + 2].State != "null") {
                    if(!grid[r][c + 2].is_state("start") && !grid[r][c + 2].is_state("end")) grid[r][c + 2].make_state("null");
                    if(!grid[r][c + 1].is_state("start") && !grid[r][c + 1].is_state("end")) grid[r][c + 1].make_state("null");

                    grid[r][c + 2].draw(grid_HTML);
                    grid[r][c + 1].draw(grid_HTML);

                    await sleep(1);
                    RecursiveMazeDFS(r, c + 2);
                }
                break;
            case 3: 
                if (r + 2 >= vertical_cells - 1)
                    continue;
                if (grid[r + 2][c].State != "null") {
                    if(!grid[r+2][c].is_state("start") && !grid[r+2][c].is_state("end")) grid[r+2][c].make_state("null");
                    if(!grid[r+1][c].is_state("start") && !grid[r+1][c].is_state("end")) grid[r+1][c].make_state("null");

                    grid[r+2][c].draw(grid_HTML);
                    grid[r+1][c].draw(grid_HTML);

                    await sleep(1);
                    RecursiveMazeDFS(r + 2, c);
                }
                break;
            case 4: 
                if (c - 2 <= 0)
                    continue;
                if (grid[r][c - 2].State != "null") {
                    if(!grid[r][c - 2].is_state("start") && !grid[r][c - 2].is_state("end")) grid[r][c - 2].make_state("null");
                    if(!grid[r][c - 1].is_state("start") && !grid[r][c - 1].is_state("end")) grid[r][c - 1].make_state("null");

                    grid[r][c - 2].draw(grid_HTML);
                    grid[r][c - 1].draw(grid_HTML);

                    await sleep(1);
                    RecursiveMazeDFS(r, c - 2);
                }
                break;
        }
    }

}

async function MazePrim(start)
{

    for(var row of grid){
        for(var cell of row){
            cell.update_wall_neighbours(grid,0);
        }
    }

    start.make_state("null");
    start.draw(grid_HTML);
    start.visited = true;

    let walls = [];
    
    for(let n of start.wall_neighbours){
        if(n.is_state("wall")) walls.push(n);
    }

    while(walls.length > 0)
    {
        let idx = Math.floor(Math.random() * walls.length);
        let r = walls[idx];
        walls.splice(idx,1);

        if( !(r.X <= 0 || r.X >= horizontal_cells-1) ){
        
            let prev = grid[r.Y][r.X-1];
            let next = grid[r.Y][r.X+1];
    
            if(prev.visited != true && next.visited == true){
                if(!r.is_state("start") && !r.is_state("end")){
                    r.make_state("null");
                    r.draw(grid_HTML);
                }

                prev.visited = true;
                if(!prev.is_state("start") && !prev.is_state("end")){
                    prev.make_state("null");
                    prev.draw(grid_HTML);
                }
    
                for(var n of prev.wall_neighbours){
                    if(n.is_state("wall")) walls.push(n);
                }
            }
            else if(prev.visited == true && next.visited != true){
                if(!r.is_state("start") && !r.is_state("end")){
                    r.make_state("null");
                    r.draw(grid_HTML);
                }

                next.visited = true;
                if(!next.is_state("start") && !next.is_state("end")){
                    next.make_state("null");
                    next.draw(grid_HTML);
                }
    
                for(var n of next.wall_neighbours){
                    if(n.is_state("wall")) walls.push(n);
                }
            }
        }

        if( !(r.Y <= 0 || r.Y >= vertical_cells-1) ){
            let prev = grid[r.Y-1][r.X];
            let next = grid[r.Y+1][r.X];
    
            if(prev.visited != true && next.visited == true){
                if(!r.is_state("start") && !r.is_state("end")){
                    r.make_state("null");
                    r.draw(grid_HTML);
                }

                prev.visited = true;
                if(!prev.is_state("start") && !prev.is_state("end")){
                    prev.make_state("null");
                    prev.draw(grid_HTML);
                }
                
                for(var n of prev.wall_neighbours){
                    if(n.is_state("wall")) walls.push(n);
                }
            }
            else if(prev.visited == true && next.visited != true){
                if(!r.is_state("start") && !r.is_state("end")){
                    r.make_state("null");
                    r.draw(grid_HTML);
                }

                next.visited = true;
                if(!next.is_state("start") && !next.is_state("end")){
                    next.make_state("null");
                    next.draw(grid_HTML);
                }
    
                for(var n of next.wall_neighbours){
                    if(n.is_state("wall")) walls.push(n);
                }
            }
        }
        await sleep(0);
    }

}

function RecursiveAreConnected(start,end)
{
    if(start == end) return true;
    start.connect_visited = true;
    let connected = false;
    start.update_neighbours(grid,false);
    for(var n of start.neighbours)
    {
        if(n == end) return true;
        if(n.connect_visited != true) connected = connected || RecursiveAreConnected(n,end);
    }
    return connected;

}

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}