var exo6;
var exo3;
var exo5;
var particleSystem = [];
var attractors = [];
var table;
var categories = {};
var catnums = {};
var aggregated = {};
var investors = {};
var particles = [];
var connections = [];


function preload(){
    table = loadTable("data/supertotal2.csv", "csv", "header");
    exo3 = loadFont("fonts/Exo2-Light.ttf");
    exo5 = loadFont("fonts/Exo2-Medium.ttf");
    exo6 = loadFont("fonts/Exo2-SemiBold.ttf");
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function setup() {
    var canvas = createCanvas(windowWidth, windowHeight);
    frameRate(30);
    colorMode(HSB, 360, 100, 100, 100);
    background(0);
    rectMode(CENTER);
    textAlign(CENTER);
    
    //+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+
    
    //MAKE AGGREGATED COMPANIES & INVESTORS ARRAYS
    for (var r = 0; r < table.getRowCount(); r++){
        var cname = table.getString(r, "company_name");
        var iname = table.getString(r, "investor_name");
        var category = table.getString(r, "category_code");
        var catnumb = table.getString(r, "category_num");
        var invested = table.getString(r, "amount_usd");
        invested = parseInt(invested);
        if(!isNaN(invested)){
            if(aggregated.hasOwnProperty(cname)){
                aggregated[cname] += invested;
            }else{
                aggregated[cname] = invested;
            }
        }
        
        investors[iname] = "whatever";
        categories[cname] = category;
        catnums[cname] = catnumb;

    }
    
    //create aAggregated array (with sum) 
    var aAggregated = [];
    Object.keys(aggregated).forEach(function(name_){
        var company = {};
        company.name = name_;
        company.category = categories[name_];
        company.cnum = catnums[name_];
        company.sum = aggregated[name_]
        aAggregated.push(company);
    });
    
    //create aaInvestors array
    var aInvestors = [];
    Object.keys(investors).forEach(function(name_){
        var investor = {};
        investor.name = name_;
        aInvestors.push(investor);
    });
    
    //sort by sum
    aAggregated.sort(function(companyA, companyB){
        return companyB.sum - companyA.sum;
    });    
    
    aAggregated = aAggregated.slice(0, 200);
    
    //+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+

    //MAKING CONNECTIONS ARRAY
    for (var r = 0; r < table.getRowCount(); r++){
        var compname = table.getString(r, "company_name");
        var invname = table.getString(r, "investor_name");
        var date = table.getString(r, "funded_at");
        var category = table.getString(r, "category_code");
        var amt = table.getString(r, "amount_usd");
        amt = parseInt(amt);
        
        //Add company
        var foundCompany = aAggregated.find(function(element, index, array){
            if(element.name == compname){
                return true;
            }else{
                return false;
            }
        });
        
        //Add investor
        var foundInvestor = false;
        if(foundCompany){
            foundInvestor = aInvestors.find(function(element, index, array){
                if(element.name == invname){
                    return true;
                }else{
                    return false;
                } 
            });
        }

        if(foundCompany && foundInvestor){
            var connection = {};
            connection.company = foundCompany;
            connection.investor = foundInvestor;
            connection.amount = amt;
            connection.date = date;
            connection.category = category;
            connections.push(connection);
        }
    
    }
  
    //+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+

    //# of objects in array AS PARTICLES
    for (var i=0; i<200; i++) {                                                  
        var p = new Particle(aAggregated[i].name, 
                             aAggregated[i].sum, 
                             aAggregated[i].category, 
                             aAggregated[i].cnum);
        particleSystem.push(p);
    }
    
    // attractor position & strength
    var at4 = new Attractor(createVector(width*.2, height*.5), 84);    
    attractors.push(at4);
    
    var at3 = new Attractor(createVector(width*.4, height*.5), 14);    
    attractors.push(at3);
    
    var at2 = new Attractor(createVector(width*.6, height*.5), 14);    
    attractors.push(at2);
    
    var at1 = new Attractor(createVector(width*.8, height*.5), 84);    
    attractors.push(at1);
    
}


function draw() {
    background(0, 0, 100, 100);
    
     for (var STEPS = 0; STEPS<3; STEPS++) {
            for (var i=0; i<particleSystem.length-1; i++){
                for (var j=i+1; j<particleSystem.length; j++){
                    var pa = particleSystem[i];
                    var pb = particleSystem[j];
                    var ab = p5.Vector.sub(pb.pos, pa.pos);
                    var distSq = ab.magSq();
                    if(distSq <= sq(pa.radius + pb.radius)){
                        var dist = sqrt(distSq);
                        var overlap = (pa.radius + pb.radius) - dist;
                        ab.div(dist);
                        //ab.normalize(); would do the same thing, basically.
                        ab.mult(overlap*0.5);
                        pb.pos.add(ab);
                        ab.mult(-1);
                        pa.pos.add(ab);
                        //friction
                        pa.vel.mult(0.98);
                        pb.vel.mult(0.98);
                        
                    }
                }
            }
        }
    
    
    
    particleSystem.forEach(function(p) {
        p.update();
        p.draw();
    });
    
    attractors.forEach(function(at){
        at.draw();
        }); 
    
}


var Particle = function(name, sum, category, cnum) {    
    this.name = name;
    this.sum = sum;
    this.category = category;
    this.cnum = cnum;
    var color = map(this.cnum, 0, 44, 120, 330);
    
    this.radius = sqrt(sum)/1600;           //particle size
    var initialRadius = this.radius;
    var maxRadius = 128;
    var tempAng = random(0, TWO_PI);
    this.pos = createVector(cos(tempAng), sin(tempAng));
    this.pos.div(this.radius);
    this.pos.mult(20000); //push from start?
    this.pos.set(this.pos.x + width/2, this.pos.y + height/2);
    this.vel = createVector(0, 0);
    var acc = createVector(0, 0);
    var isMouseOver = false;
        
    this.update = function() {
        
        checkMouse(this);
        
        attractors.forEach(function(A){
            var att = p5.Vector.sub(A.getPos(), this.pos);
            var distanceSq = att.magSq();
            if(distanceSq > 1){
                att.normalize();
                att.mult(initialRadius*.001);
                acc.add(att);
            }

        }, this);

        this.pos.add(this.vel);
        this.vel.add(acc);
        acc.mult(0);
        
    }
        
    this.draw = function() {
                        
        if(isMouseOver == true){
            //fill when hover
            fill(color, 50, 80, 100)
        }else{
            //fill default
            fill(color, 55, 80, 100)
        };

        noStroke();
        ellipse(this.pos.x, 
                this.pos.y, 
                this.radius*2-4,
                this.radius*2-4);
        
        //DRAW COMPANY NAME IN BUBBLE AT MAXRADIUS
        if(this.radius == maxRadius){
            
            //text color
            fill(0, 0, 100, 100);
            
            //show text for company name
            textFont(exo3);
            textSize(32);
            
            //with wrap:            
            text(this.name, 
                 this.pos.x, 
                 this.pos.y+10, 
                 maxRadius, maxRadius);

            //show text for sum
            textFont(exo5);
            textSize(16);
            dispSum = this.sum/1000000000
            text("$" + dispSum + "B", this.pos.x, this.pos.y+84);
            //text(this.category, this.pos.x, this.pos.y-40);
            
            //show text for category
            textFont(exo6);
            textSize(14);
            text(this.category, this.pos.x, this.pos.y+64);

            
        }
                   
    }
    
    
    
    function checkMouse(instance){
        var mousePos = createVector(mouseX, mouseY);
            if(mousePos.dist(instance.pos) <= instance.radius){
                incRadius(instance);
                isMouseOver = true;
            }else{
                decRadius(instance);
                isMouseOver = false;
            }
    }

    function incRadius(instance){
        instance.radius+=4;
        if(instance.radius > maxRadius){
            instance.radius = maxRadius;
        }

    }

    function decRadius(instance){
        instance.radius-=4;
        if(instance.radius < initialRadius){
            instance.radius = initialRadius;
        }

    }
      
}


var Attractor = function(pos, s){
        this.pos = pos.copy();
        var strength = s*10;
        this.draw = function(){ 
            noStroke();
            fill(230, 0, 0, 0);                                //attractor color
            ellipse(this.pos.x, this.pos.y, strength, strength);
        }
        
        this.getPos = function(){
            return this.pos.copy();
        }
    
        this.getStrength = function(){
            return strength*10;
        }
            
}

