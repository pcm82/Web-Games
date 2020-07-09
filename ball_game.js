let myGameArea;
let canvasHeight = 600;
let canvasWidth = 800;
let mouseX = 0;
let mouseY = 0;

let myGamePieceWidth = 20; //meters
let myGamePieceHeight = 20; //meters

let ballRadius = 20; //meters
let ballMass = 1; //kilogram
const gravity = 9.81; //need to work where this means 9.81 m/s^2

let canvas_obj = document.getElementById("canvas");
let context_obj = canvas_obj.getContext("2d");

//Node object, node position/information
let nodeMap = new Map();
let mouseNode;

let myCircle;

function startGame() {
    myGameArea.start();
    myGamePiece = new component( myGamePieceWidth, myGamePieceHeight,'red', 10, 30);

    mouseNode = new nodeComponent(0, 0, 'black', mouseX, mouseY);

    document.addEventListener("mousedown", function (event) {
        if(isInCanvas()){
            let clickedNodeObj = clickedNode();
            if (clickedNodeObj == null){
                //TODO: make sure that you don't add and make connection
                addNode();
            }
        }
    })
}

function isInCanvas(){
    let rect = canvas_obj.getBoundingClientRect();
    if (mouseX < rect.right && mouseX > 0 &&  
        mouseY < rect.bottom && mouseY > rect.top){
        
            return true;
            
        }
    return false;
}


function containsObject(obj, list) {
    let i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}

function clickedNode(){
    for (let key of nodeMap.keys()) {
        if (mouseX > key.x-ballRadius*2 && mouseX < key.x+ ballRadius*2){
            if(mouseY > key.y-ballRadius*2 && mouseY < key.y+ ballRadius*2){
                return key;
            }
        }
    }
    return null;
}

function addNode(){
    // let color ="#"+((1<<24)*Math.random()|0).toString(16);
    newNode = new nodeComponent(mass, ballRadius,'pink', mouseX - ballRadius/2, mouseY - ballRadius/2);
    nodeMap.set(newNode, []);   
}

let myGameArea = {
    canvas: document.getElementById("canvas"),
    start: function () {
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;

        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        

        this.interval = setInterval(updateGameArea, 5);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    }
}

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.color = color;
    this.update = function () {
        ctx = myGameArea.context;
    }
}



function nodeComponent(mass, radius, color, x, y) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.mass = mass;

    let innerRad = 6;
    let outerRad = 20;

    this.update = function () {
        

        let gradient_center = ctx.createRadialGradient(this.x, this.y, innerRad, this.x, this.y, outerRad);
        gradient_center.addColorStop(0, 'pink');
        gradient_center.addColorStop(1, 'DeepPink');


        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = gradient_center;
        ctx.fill();  
    }
    this.update_gradient = function () {
        
        let gradient_outer = ctx.createRadialGradient(this.x, this.y, innerRad*10, this.x, this.y, outerRad);
        gradient_outer.addColorStop(0, 'rgba(52, 124, 232, 0.0)');
        gradient_outer.addColorStop(1, 'rgba(52, 124, 232, 0.4)');
    
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius*7, 0, 2 * Math.PI, false);
        ctx.fillStyle = gradient_outer;
        ctx.fill();
        
        
    }
}

function updateGameArea() {
    myGameArea.clear();

    canvas_obj.addEventListener("mousemove", getMousePos, false);

    myGamePiece.x = mouseX - myGamePieceWidth/2;
    myGamePiece.y = mouseY - myGamePieceHeight/2;

    //redraw all nodes on canvas
    for (let key of nodeMap.keys()) {
        key.update();
    }
    for (let key of nodeMap.keys()) {
        key.update_gradient();
    }

    moveBubbles();

    myGamePiece.update();
}

function getMousePos(evt) {
    let rect = canvas_obj.getBoundingClientRect();
    mouseX = evt.clientX - rect.left;
    mouseY = evt.clientY - rect.top;
}

function force_vector(){
    this.x = 0;
    this.y = 0;
}

function touchingAnotherNode(node){
    let touching = false;
    // nodeMap.get(node) = [];
    for (let key of nodeMap.keys()) {
        if (key != node){
            if (Math.abs(node.x - key.x) < ballRadius*2){
                if (Math.abs(node.y - key.y) < ballRadius*2){
                    if (!nodeMap.get(node).includes(key)){
                        nodeMap.get(node).push(key);
                    }
                    touching = true;
                }
            }
        }
    }
    return touching;
}


function canMoveX(node, movement){
    nodeMap.get(node).forEach(connectedNode => {
        let distance_before = Math.sqrt(Math.pow(connectedNode.x - node.x,2) + Math.pow(connectedNode.y-node.y,2));
        let distance_after = Math.sqrt(Math.pow((node.x+movement)-connectedNode.x  ,2) + Math.pow(connectedNode.y-node.y,2));
        

        console.log("Distance before: " + distance_before.toString() + " Distance After: " + distance_after.toString());
        if (distance_before > distance_after){
            
            node.color = 'blue';
            return false;
        } else {
            node.color = 'yellow';
        }
    });
    return true;
}



function moveBubbles(){
    //check each node 
    //if the node is in the gravitational feild of another node
        //move a little bit
    //cycle through nodes until equilibrium
    for (let key1 of nodeMap.keys()) {
        // key1.color = "#"+((1<<24)*Math.random()|0).toString(16);
        let total_force = new force_vector();
        for (let key2 of nodeMap.keys()) {
            if(key1 != key2){

                let y_diff = (key2.y - key1.y);
                let x_diff = (key2.x - key1.x);

                let angle = Math.abs(Math.atan(y_diff/x_diff));
                let total_radius = Math.sqrt(Math.pow(x_diff,2)+Math.pow(y_diff,2));
                
                let force = 1/Math.pow(total_radius,2);

                total_force.x += Math.sign(x_diff)*force*Math.cos(angle);
                total_force.y += Math.sign(y_diff)*force*Math.sin(angle);
            }
        }
        
        
        if (Math.abs(total_force.x) > 0.00001){ // Move x
            if(!touchingAnotherNode(key1)){
                key1.x += total_force.x*1000;
            } else { // key1 is touching another node
                if(nodeMap.get(key1).length <= 1 && nodeMap.size>2){
                    key1.color = 'LightCoral'
                    //make vector from this node to middle of touching node
                    let otherNode = nodeMap.get(key1)[0];
                    let vect_y= ( otherNode.y - key1.y);
                    let vect_x = (otherNode.x - key1.x);
                    let cw_vector = new force_vector();
                    cw_vector.x = vect_y;
                    cw_vector.y = -1*vect_x;
                    let ccw_vector = new force_vector();
                    ccw_vector.x = -1*vect_y;
                    ccw_vector.y = vect_x;

                    //find distance between cw and force
                    let x_diff_cw = total_force.x - cw_vector.x;
                    let y_diff_cw = total_force.y - cw_vector.y;
                    let dist_cw = Math.sqrt(Math.pow(x_diff_cw,2) + Math.pow(y_diff_cw,2));

                    //find distance between ccw and force
                    let x_diff_ccw = total_force.x - ccw_vector.x;
                    let y_diff_ccw = total_force.y - ccw_vector.y;
                    let dist_ccw = Math.sqrt(Math.pow(x_diff_ccw,2) + Math.pow(y_diff_ccw,2));
                    
                    // move to either cw or ccw
                    if(dist_cw < dist_ccw){ //cw is closer to force vector
                        key1.x += Math.sign(cw_vector.x);
                        key1.y += Math.sign(cw_vector.y);
                    } else { //ccw is closer to force vector
                        key1.x += Math.sign(ccw_vector.x);
                        key1.y += Math.sign(ccw_vector.y);
                    }
                } else {
                    key1.color = 'DeepPink';
                }
            }
        }


        if (Math.abs(total_force.y) > 0.00001){ // Move y
            if(!touchingAnotherNode(key1)){
                key1.y += total_force.y*1000;
            }
        }

        key1.update();

    }

}
