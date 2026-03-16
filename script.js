function toggleMenu(){

let menu = document.getElementById("sidebar");

if(menu.style.left == "0px")
menu.style.left = "-220px";
else
menu.style.left = "0px";

}


function showPage(pageId)
{
let pages = document.querySelectorAll(".page");

pages.forEach(function(page)
{
page.classList.remove("active");
page.style.display="none";
});

let selected = document.getElementById(pageId);

selected.style.display="block";

setTimeout(function(){
selected.classList.add("active");
},10);
}



function calculateBricks(){

let L = document.getElementById("L").value * document.getElementById("Lu").value;
let B = document.getElementById("B").value * document.getElementById("Bu").value;
let H = document.getElementById("H").value * document.getElementById("Hu").value;

let bl = document.getElementById("bl").value * document.getElementById("blu").value;
let bb = document.getElementById("bb").value * document.getElementById("bbu").value;
let bh = document.getElementById("bh").value * document.getElementById("bhu").value;

let wall = L*B*H;
let brick = bl*bb*bh;

let total = Math.round(wall/brick);

document.getElementById("brickResult").innerHTML =
"Bricks Required : "+ total;

}



function calculateStaircase(){

let height = document.getElementById("height").value *
document.getElementById("heightUnit").value;

let length = document.getElementById("length").value *
document.getElementById("lengthUnit").value;

let horizontal = document.getElementById("horizontal").value *
document.getElementById("horizontalUnit").value;


let rise = 0.15;
let width = 1;
let thickness = 0.15;


/* Number of risers */

let risers = Math.round(height / rise);


/* Number of treads */

let treads = risers - 1;


/* Stair slope */

let slope = Math.sqrt((height*height) + (horizontal*horizontal));


/* Concrete volume */

let volume = slope * width * thickness;


/* Extra for steps */

volume = volume + 0.20;


/* Dry volume */

let dryVolume = volume * 1.54;


/* Cement */

let cement = (dryVolume / 5.5) / 0.035;


/* Sand */

let sand = (dryVolume * 1.5) / 5.5;


/* Aggregate */

let aggregate = (dryVolume * 3) / 5.5;


/* Steel */

let steel = volume * 80;



document.getElementById("stairResult").innerHTML =

"Number of Risers : "+risers+"<br>"+
"Number of Treads : "+treads+"<br><br>"+

"Concrete Volume : "+volume.toFixed(2)+" m³<br><br>"+

"Cement Bags : "+Math.ceil(cement)+"<br>"+
"Sand : "+sand.toFixed(2)+" m³<br>"+
"Aggregate : "+aggregate.toFixed(2)+" m³<br>"+
"Steel : "+steel.toFixed(0)+" kg";

}

function showBrickInfo(){

document.getElementById("brickInfo").style.display="block";

}

function closeBrickInfo(){

document.getElementById("brickInfo").style.display="none";

}