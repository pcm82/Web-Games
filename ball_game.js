//todo: implement conservation of energy. 
var myGameArea;
var canvasHeight = 800;
var canvasWidth = 1000;
var mouseX = 0;
var mouseY = 0;
const t = 0.1; //this will be the time interval
earthRadius = 6.371*Math.pow(10,6);
earthMass = 5.972*Math.pow(10,24);

var myGamePieceWidth = 20;
var myGamePieceHeight = 20;

var ballRadius = 20;
var ballMass = 5*Math.pow(10,18); //add ball mass, 1 kg
const G = 6.67*Math.pow(10,-11);//should be 10^-11, but need to change units later

var canvas_obj = document.getElementById("canvas");
var context_obj = canvas_obj.getContext("2d");

//Node object, node position/information
let nodeMap = new Map();
var mouseNode;

var myCircle;

function startGame() {
    myGameArea.start();
    myGamePiece = new component( myGamePieceWidth, myGamePieceHeight,'red', 10, 30);

    mouseNode = new nodeComponent(0, 0, 0, 0, 'black', mouseX, mouseY);

    document.addEventListener("mousedown", function (event) {
        if(isInCanvas()){
            var clickedNodeObj = clickedNode();
            if (clickedNodeObj == null){
                //TODO: make sure that you don't add and make connection
                addNode();
            }
        }
    })
}

function isInCanvas(){
    var rect = canvas_obj.getBoundingClientRect();
    if (mouseX < rect.right && mouseX > 0 &&  
        mouseY < rect.bottom && mouseY > rect.top){
        
            return true;
            
        }
    return false;
}


function containsObject(obj, list) {
    var i;
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
    // var color ="#"+((1<<24)*Math.random()|0).toString(16);
    // var userMass = Math.pow(10,18)*window.prompt("Enter ball mass * 10^18kg: ");
    // var userRadius = window.prompt("Enter ball radius: ");
    // var userXVelocity = window.prompt("Enter XVelocity: ");
    // var userYVelocity = window.prompt("Enter YVelocity: ");
    // newNode = new nodeComponent(userXVelocity, userYVelocity, userMass, userRadius,'pink', mouseX, mouseY);
    newNode = new nodeComponent(0, 0, ballMass, ballRadius,'pink', mouseX, mouseY);
    //newNode = new nodeComponent(0, 0, ballMass, ballRadius,'pink', mouseX, mouseY);
    nodeMap.set(newNode, []);   
}

function getMapSize(x) {
    var len = 0;
    for (var count in x) {
            len++;
    }

    return len;
}


var myGameArea = {
    canvas: document.getElementById("canvas"),
    start: function () {
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;

        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        

        this.interval = setInterval(updateGameArea, t); //updates every millisecond
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



function nodeComponent(xVelocity, yVelocity, mass, radius, color, x, y) {
    this.xVelocity = xVelocity;
    this.yVelocity = yVelocity;
    this.mass = mass;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;

    var innerRad = 6;
    var outerRad = 20;

    this.update = function () {
        

        var gradient_center = ctx.createRadialGradient(this.x, this.y, innerRad, this.x, this.y, outerRad);
        gradient_center.addColorStop(0, 'pink');
        gradient_center.addColorStop(1, 'DeepPink');


        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = gradient_center;
        ctx.fill();  
    }
    this.update_gradient = function () {
        
        var gradient_outer = ctx.createRadialGradient(this.x, this.y, innerRad*10, this.x, this.y, outerRad);
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
    var rect = canvas_obj.getBoundingClientRect();
    mouseX = evt.clientX - rect.left;
    mouseY = evt.clientY - rect.top;
}

function force_vector(){
    this.x = 0;
    this.y = 0;
}

function touchingAnotherNode(node){
    var touching = false;
    // nodeMap.get(node) = [];
    for (let key of nodeMap.keys()) {
        if (key != node){
            if (Math.abs(node.x - key.x) < ballRadius*2){
                if (Math.abs(node.y - key.y) < ballRadius*2){
                    nodeMap.get(node).push(key); //delete again
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
    nodeMap.get(node).forEach(key2 => {
        var distance_before = Math.sqrt(Math.pow(key2.x - node.x,2) + Math.pow(key2.y-node.y,2));
        var distance_after = Math.sqrt(Math.pow((node.x+movement)-key2.x  ,2) + Math.pow(key2.y-node.y,2));
        

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

                var y_diff = (key1.y - key2.y);
                var x_diff = (key1.x - key2.x);

                var total_radius = Math.sqrt(Math.pow(x_diff,2)+Math.pow(y_diff,2));
                var rect = canvas_obj.getBoundingClientRect();
                var Xforce = -1*(x_diff/total_radius)*G*key1.mass*key2.mass/Math.pow(total_radius,2);
                var Yforce = -1*(y_diff/total_radius)*G*key1.mass*key2.mass/Math.pow(total_radius,2);

                if (key1.x > rect.right || key1.x < 0 ||  
                    key1.y > rect.bottom || key1.y < rect.top) {//this means it's touching the borders
             
                    nodeMap.delete(key1);
            }
                total_force.x += Xforce
                total_force.y += Yforce
        
            }

            if (Math.abs(x_diff) <= (key1.radius + key2.radius) && Math.abs(y_diff) <= (key1.radius + key2.radius) ){
                let D = 1; //damping factor
                let M = key1.mass + key2.mass;
                let v1x = key1.xVelocity;
                let v1y = key1.yVelocity;
                let v2x = key2.xVelocity;
                let v2y = key2.yVelocity;
                let m1 = key1.mass;
                let m2 = key2.mass;
                if (key1.xVelocity*(key2.x-key1.x) > 0) {
                    key1.xVelocity = D*(m1-m2)*v1x/M + (2*m2)*v2x/M
                    key2.xVelocity = D*(2*m1)*v1x/M + (m2-m1)*v2x/M
                }
                if (key1.yVelocity*(key2.y-key1.y) > 0) {
                    // total_force.y += -k*((key1.radius + key2.radius) - key2.y - node.y)
                    key1.yVelocity = D*(m1-m2)*v1y/M + (2*m2)*v2y/M
                    key2.yVelocity = D*(2*m1)*v1y/M + (m2-m1)*v2y/M
                }
                //if the x1 velocity is the same sign as x2 - x1, reverse the x velocity
                //if the y1 velocity is the same sign as the y2 - y1, reverse the y velocity
            }
        }
        //Actual Movement happens here
        key1.xVelocity += total_force.x/key1.mass*t/1000;
        key1.x += key1.xVelocity*t/1000
        key1.yVelocity += total_force.y/key1.mass*t/1000;
        key1.y += key1.yVelocity*t/1000
        
        key1.update();

    }

}
