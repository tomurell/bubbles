// mar15 > TOP 100 COMPANIES + THEIR TOP 200 INVESTORS

//var exo2;
var exo6;
var exo3;
var exo5;
var particleSystem = [];
var investorSystem = [];
var attractors = [];
var repulsors = [];
var table;
var categories = {};
var catnums = {};
var aggregated = {};
var investors = [];
var selectInvestors = [];
var particles = [];
var connections = [];
var iOpacity = 100;
var mouseState = false;

function preload(){
    table = loadTable("data/supertotal2.csv", "csv", "header");
    exo3 = loadFont("fonts/Exo2-Light.ttf");
    exo5 = loadFont("fonts/Exo2-Medium.ttf");
    exo6 = loadFont("fonts/Exo2-SemiBold.ttf");
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

//+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+
//SETUP
function setup() {
    var canvas = createCanvas(windowWidth, windowHeight);
    frameRate(30);
    colorMode(HSB, 360, 100, 100, 100);
    background(0);
    rectMode(CENTER);
    textAlign(CENTER, CENTER);
    
    //+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+
    
    //MAKE AGGREGATED COMPANIES & INVESTORS ARRAYS
    for (var r = 0; r < table.getRowCount(); r++){
        var cname = table.getString(r, "company_name");
        var iname = table.getString(r, "investor_name");
        var category = table.getString(r, "category_code");
        var catnumb = table.getString(r, "category_num");
        var invested = table.getString(r, "amount_usd");
        invested = parseInt(invested);
        
        //total investment (to companies)
        if(!isNaN(invested)){
            if(aggregated.hasOwnProperty(cname)){
                aggregated[cname] += invested;
            }else{
                aggregated[cname] = invested;
            }
        }
        
        //total investment (from investors)
        if(!isNaN(invested)){
            if(investors.hasOwnProperty(iname)){
                investors[iname] += invested;
            }else{
                investors[iname] = invested;
            }
        }
        
        categories[cname] = category;
        catnums[cname] = catnumb;

    }
    
    //create aAggregated array 
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
        investor.iname = name_;
        investor.totalInv = investors[name_];
        aInvestors.push(investor);
    });
    
    //sort by sum
    aAggregated.sort(function(companyA, companyB){
        return companyB.sum - companyA.sum;
    });    
    
    aAggregated = aAggregated.slice(0, 100);
    
    //+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+
    //MAKING CONNECTIONS ARRAY
    for (var r = 0; r < table.getRowCount(); r++){
        var compname = table.getString(r, "company_name");
        var invname = table.getString(r, "investor_name");
        var date = table.getString(r, "funded_at");
        var category = table.getString(r, "category_code");
        var amt = table.getString(r, "amount_usd");
        amt = parseInt(amt);
        
        var foundCompany = aAggregated.find(function(element, index, array){
            if(element.name == compname){
                return true;
            }else{
                return false;
            }
        });
        
        if(foundCompany){
            var foundInvestor = false;
            foundInvestor = aInvestors.find(function(element, index, array){
                if(element.iname == invname){
                    return true;
                }else{
                    return false;
                } 
            });
            
            if(foundInvestor){
                var connection = {};
                connection.company = foundCompany;
                connection.investor = foundInvestor;
                connection.amount = amt;
                //connection.date = date;
                //connection.category = category;
                connections.push(connection);  
            }

        }
                                              
    }
    
    print(connections);
    
    //+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+

    //Make selectInvestors array from connections
    connections.forEach(function(connection){
        var found = selectInvestors.find(function(selectInvestor){
        return selectInvestor == connection.investor;
            });
        if(!found) selectInvestors.push(connection.investor) 
    });
    
    //sort by totalInv
    selectInvestors.sort(function(inameA, inameB){
        return inameB.totalInv - inameA.totalInv;
    });    
    
    selectInvestors = selectInvestors.slice(0, 200);
    
    
    //+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+

    //# of objects in array AS PARTICLES
    for (var i=0; i<aAggregated.length; i++) {
        var p = new Particle(aAggregated[i].name, 
                             aAggregated[i].sum, 
                             aAggregated[i].category, 
                             aAggregated[i].cnum);
        particleSystem.push(p);
    }
    
    for (var h=0; h<selectInvestors.length; h++) {
        var j = new investorParticle(selectInvestors[h].iname,
                                     selectInvestors[h].totalInv);
        investorSystem.push(j);
    }
    
    // attractor position & strength
    var at = new Attractor(createVector(width*.5, height*.5), 84);
    attractors.push(at);
    
    // repulsor position & strength
    var rp = new Repulsor(createVector(width*.5, height*.5), 84);
    repulsors.push(rp);
    
}

//+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+
//DRAW
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
    
    for (var STEPS = 0; STEPS<3; STEPS++) {
            for (var i=0; i<investorSystem.length-1; i++){
                for (var j=i+1; j<investorSystem.length; j++){
                    var pa = investorSystem[i];
                    var pb = investorSystem[j];
                    var ab = p5.Vector.sub(pb.pos, pa.pos);
                    var distSq = ab.magSq();
                    if(distSq <= sq(pa.radius + pb.radius)){
                        var dist = sqrt(distSq);
                        var overlap = (pa.radius + pb.radius) - dist;
                        ab.div(dist);
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
    
    investorSystem.forEach(function(j) {
        j.update();
        j.draw();
    });
    
    particleSystem.forEach(function(p) {
        p.update();
        p.draw();
    });
    
    attractors.forEach(function(at){
        at.draw();
    });
    
    repulsors.forEach(function(rp){
        rp.draw();
    }); 
    
}

//+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+
//INVESTOR PARTICLE
var investorParticle = function(iname, totalInv) {    
    this.iname = iname;
    this.totalInv = totalInv;
    var iColor = random(16, 32);
    this.opacity = iOpacity;
    this.radius = sqrt(this.totalInv)/2000;
    var initialRadius = this.radius;
    var maxRadius = 88;
    var angleInc = TWO_PI / random(0.1, PI);
    var ang = -0.75;    
    ang = ang + angleInc;
    this.pos = createVector(sin(ang), cos(ang));
    this.pos.mult(460);
    this.pos.add(width/2, height/2);
    this.vel = createVector(0, 0);
    var acc = createVector(0, 0);
    var isMouseOver = false;
        
    this.update = function() {
        
        checkMouse(this);
        this.opacity = iOpacity;

        attractors.forEach(function(A){
            var att = p5.Vector.sub(A.getPos(), this.pos);
            var distanceSq = att.magSq();
            if(distanceSq > 1){
                att.normalize();
                att.mult(5);
                att.mult(initialRadius*.001);
                acc.add(att);
            }

        }, this);
        
        //REPULSOR
        repulsors.forEach(function(R){
            var rpp = p5.Vector.sub(R.getPos(), this.pos);
            var distanceSq = rpp.magSq();
            if(distanceSq > 1){
                rpp.normalize();
                rpp.mult(5*-1);
                rpp.mult(initialRadius*.001);
                acc.add(rpp);
            }

        }, this);

        this.pos.add(this.vel);
        this.vel.add(acc);
        acc.mult(0);
        
    }
        
    this.draw = function() {
                        
        if(isMouseOver == true){
            //fill when hover
            fill(iColor, 50, 80, 100)
        }else{
            //fill default
            fill(iColor, 55, 80, this.opacity)
        };

        noStroke();
        ellipse(this.pos.x, 
                this.pos.y, 
                this.radius*2-4,
                this.radius*2-4);
        
        //DRAW INVESTOR NAME IN BUBBLE AT MAXRADIUS
        if(this.radius == maxRadius){
            
            //this.opacity = 50;
            //text color
            fill(0, 0, 100, 100);
            
            //show text for company name
            textFont(exo5);
            textSize(22);
            
            //with wrap:            
            text(this.iname, 
                 this.pos.x, 
                 this.pos.y-12, 
                 maxRadius, maxRadius);

            //show text for sum
            textFont(exo6);
            textSize(14);
            text("invested:", this.pos.x, this.pos.y+50);
            dispSum = nfc(this.totalInv/1000000000, 2);
            text("$" + dispSum + "B", this.pos.x, this.pos.y+64);
            
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
        instance.radius+=6;
        if(instance.radius > maxRadius){
            instance.radius = maxRadius;
        }

    }

    function decRadius(instance){
        instance.radius-=8;
        if(instance.radius < initialRadius){
            instance.radius = initialRadius;
        }

    }
      
}

//+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+
//COMPANY PARTICLE
var Particle = function(name, sum, category, cnum) {    
    this.name = name;
    this.sum = sum;
    this.category = category;
    this.cnum = cnum;
    var color = map(this.cnum, 0, 44, 120, 330);
    this.opacity = 100;
    this.radius = sqrt(sum)/2000;
    var initialRadius = this.radius;
    var maxRadius = 108;
    var tempAng = random(0, TWO_PI);
    this.pos = createVector(cos(tempAng), sin(tempAng));
    this.pos.div(this.radius);
    this.pos.mult(15000);
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
                att.mult(4);
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
            fill(color, 50, 80, 100)
        }else{
            fill(color, 55, 80, this.opacity)
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
                 this.pos.y-10, 
                 maxRadius, maxRadius);

            //show text for sum
            textFont(exo5);
            textSize(16);
            dispSum = nfc(this.sum/1000000000, 2);
            text("$" + dispSum + "B", this.pos.x, this.pos.y+78);
            
            //show text for category
            textFont(exo5);
            textSize(16);
            text(this.category, this.pos.x, this.pos.y+60);
            
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
        instance.radius+=6;
        if(instance.radius > maxRadius){
            instance.radius = maxRadius;
        }

    }

    function decRadius(instance){
        instance.radius-=8;
        if(instance.radius < initialRadius){
            instance.radius = initialRadius;
        }

    }
      
}

//+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+
//ATTRACTOR + REPULSOR
var Attractor = function(pos, s){
        this.pos = pos.copy();
        var strength = s*10;
        this.draw = function(){ 
            noStroke();
            fill(230, 0, 0, 0);
            ellipse(this.pos.x, this.pos.y, strength, strength);
        }
        
        this.getPos = function(){
            return this.pos.copy();
        }
    
        this.getStrength = function(){
            return strength*10;
        }
            
}

var Repulsor = function(pos, s){
        this.pos = pos.copy();
        var strength = s*10;
        this.draw = function(){ 
            noStroke();
            fill(230, 0, 0, 0);
            ellipse(this.pos.x, this.pos.y, strength, strength);
        }
        
        this.getPos = function(){
            return this.pos.copy();
        }
    
        this.getStrength = function(){
            return strength*10;
        }
            
}

