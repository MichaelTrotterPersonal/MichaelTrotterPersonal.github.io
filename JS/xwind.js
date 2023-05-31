
function start() {
    //Get the location and run the code for determining first/last light from user position
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);    

    //Initialise the runways plot with green background
    runwayPlot.plotRunways();

    //Initialise the wind plot with light blue background
    runwayPlot.plotWind();
}

function httpGet(url){
    // Function for sending a GET request using a url argument and returning the response text

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false ); 
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

const successCallback = (position) => {
    // If the getCurrentPosition request is succesfull

    // Use the position to send a GET request to the sunrise-sunset API and parse the json response
    resjson = httpGet("https://api.sunrise-sunset.org/json?lat="+position.coords.latitude+"&lng="+position.coords.longitude+"&date=today")
    res = JSON.parse(resjson);    
    
    // Get the civil twilight times from the response (these are in UTC)
    ct_begin = res["results"]["civil_twilight_begin"]
    ct_end = res["results"]["civil_twilight_end"]

    // Get todays date as a string
    today_date = new Date().toISOString().slice(0,10)
    
    // Construct a UTC date-time string with the results
    var local_day_start = new Date(today_date+" "+ct_begin+" UTC")
    var local_day_end = new Date(today_date+" "+ct_end+" UTC")

    // Get the elements in the DOM to write results to
    var fromtime = document.getElementById("fromtime");
    var untiltime = document.getElementById("untiltime");

    // Write out the first/last light times after converting from UTC time to local time
    fromtime.innerHTML = "First light : " + local_day_start.toLocaleTimeString().slice(0,5);
    untiltime.innerHTML = "Last light : " + local_day_end.toLocaleTimeString().slice(0,5);

};
  
const errorCallback = (error) => {
    // If no position obtained write 'location needed...' in output locations
    var fromtime = document.getElementById("fromtime");
    var untiltime = document.getElementById("untiltime");
    fromtime.innerHTML = "First light : Location needed..." 
    untiltime.innerHTML = "Last light : Location needed..." 
};


// This object contains all the plots and inputs/outputs for the runways/wind and associated calculations
var runwayPlot = {

    runways : [], //Stores the runway directions
    windDir : null, //Stores wind direction
    windSpeed : null, //Stores wind speed
    bestRunway : null, //Stores the calculated best runway with least crosswind
    crosswind_angle : null, //Stores the calculated crosswind angle 

    addRunway: function() {
        // Function for adding a runway (both directions) to the list of runways 

        var rway = document.getElementById("runway");
        var rwayresponse = document.getElementById("rwayresponse");

        if (rway.value != "" && rway.value >= 1 && rway.value <= 36){
            // Add the given runway bearing to the list
            this.runways.push(rway.value*10);
            
            // Add the opposite direction to the list of runways 
            oppositeRunway = (parseInt(rway.value)+18)*10;
            if (oppositeRunway > 360){
                this.runways.push(oppositeRunway-360);
            }else{
                this.runways.push(oppositeRunway);
            }

            // Calculate the new best runway, crosswinds, then redraw runways
            this.pickBestRunway();
            this.calcXwinds();
            this.plotRunways();
            
            // Clear error message
            rwayresponse.innerHTML = "" 

        } else{
            // Runway value outside expected bounds - print an error message
            rwayresponse.innerHTML = "Runway must be a one or two digit number between 01 and 36 !" 
        }
        rway.value = "";

    },

    pickBestRunway: function() {
        // Function for selecting the best runway based on wind direction

        if (this.runways.length!=0 && this.windDir!=null){

            // Loop through all the runway directions and find the one with minimum difference to wind direction
            min_diff = 360;
            min_diff_runway = -1;
            for (let i = 0; i < this.runways.length; i++) {
                
                // Get the crosswind angle for this runway 
                this_runway = this.runways[i]
                diff  = Math.abs(this_runway-this.windDir)
                if (diff > 180) {
                    diff = 360-diff;
                }
    
                // Store it as the new minimum diff if needed
                if (diff < min_diff) {
                    min_diff = diff;
                    min_diff_runway = i;
                }
            } 

            // Store the found best runway and crosswind angle for doing the calculations/plotting
            this.bestRunway = min_diff_runway;
            this.crosswind_angle = min_diff;
    
            // Write the best runway to outputs
            var bestrunway = document.getElementById("bestrunway");
            bestrunway.innerHTML = "Best runway : " + String(this.runways[this.bestRunway]/10).padStart(2, '0');
            
        }

    },

    clearRunways: function() {
        // Remove all runways and redo plot without them
        this.runways = [];
        this.plotRunways();
    },

    setWindDir: function() {
        // Function for setting the wind direction

        var winddir = document.getElementById("winddir");
        var winddirresponse = document.getElementById("winddirresponse");

        if (winddir.value!="" && (winddir.value >= 0 && winddir.value <= 360)){
            // Set the wind direction
            this.windDir = winddir.value;

            // Plot the new wind direction, pick the new best runway, calculate crosswinds and replot runways
            this.plotWind();
            this.pickBestRunway();
            this.calcXwinds();
            this.plotRunways();
            
            // Write the wind direction to outputs
            var winddirval = document.getElementById("winddirval");
            winddirval.innerHTML = "Wind direction (degrees) : " + this.windDir;
            
            // Clear error messages
            winddirresponse.innerHTML = ""

        } else {
            // Wind direction outside the expected bounds, write error message
            winddirresponse.innerHTML = "Wind direction must be between 0 and 360 degrees!"
        }
        winddir.value = "";
    },

    setWindSpeed: function() {
        // Function for setting the wind speed

        var windspd = document.getElementById("windspd");
        var windspdresponse = document.getElementById("windspdresponse");

        if(windspd.value!="" && (windspd.value >= 0 && windspd.value <= 500)) {
            this.windSpeed = windspd.value;
            
            // Plot the new wind speed and do crosswind calculations
            this.plotWind();
            this.calcXwinds();

            // Write the wind speed to outputs
            var windspdval = document.getElementById("windspdval");
            windspdval.innerHTML = "Wind speed : " + this.windSpeed;
            
            // Clear error messages
            windspdresponse.innerHTML = ""
        }else {
            // Wind speed outside the expected bounds, write error message
            windspdresponse.innerHTML = "Wind speed must be between 0 and 500!"
        }
        windspd.value = "";
    },

    plotRunways: function() {
        // Function for plotting the runways
        
        const canvas = document.getElementById("runwayplot");
        width = canvas.width;
        height = canvas.height;

        // Runways scaled to match min dimensions of canvas
        runwayLength = (2/3) * Math.min(width,height);
        runwayWidth = runwayLength/20;

        if (canvas.getContext) {
            const ctx = canvas.getContext("2d");

            // Add a green 'grass' background to runways plot
            ctx.fillStyle = "#31ad4c"; // green
            ctx.fillRect(0, 0, width, height); 

            // Plot each of the runways
            for (let i = 0; i < this.runways.length; i=i+2) {
                // If this is the best runway, wait until the end to draw it so it has higher draw order
                if (this.bestRunway!=null && this.bestRunway-(this.bestRunway%2)==i) {
                    continue
                }

                // If there is no best runway calculated then all are black, otherwise all are grey except for the best which is black
                heading = this.runways[i];
                if (this.bestRunway != null){
                    this.plotRunway(runwayLength,runwayWidth,heading,width,height,ctx,"#adadad") //light grey
                } else{
                    this.plotRunway(runwayLength,runwayWidth,heading,width,height,ctx,"#000000") //black
                }
            }

            // Finally plot the best runway if there is one
            if (this.bestRunway!=null){
                heading = this.runways[this.bestRunway-(this.bestRunway%2)];
                this.plotRunway(runwayLength,runwayWidth,heading,width,height,ctx,"#000000") //black
            }
        }
    },

    plotRunway: function(runwayLength,runwayWidth,heading,width,height,ctx,colour){
        // Function for plotting an individual runway

        //Convert degree bearing to radians and adjust for cardinal to canvas
        rotation = heading * (Math.PI / 180) - (Math.PI/2) 

        // All runways cross at centre of canvas
        var x      = (width/2)-(runwayLength/2); 
        var y      = (height/2)-(runwayWidth/2);
        var rwidth  = runwayLength;
        var rheight = runwayWidth
        var cx     = x + 0.5 * rwidth;   // x of shape center
        var cy     = y + 0.5 * rheight;  // y of shape center

        ctx.translate(cx, cy);              // Translate shape centre
        ctx.rotate(rotation);               // Rotate to runway angle
        ctx.translate(-cx, -cy);            // Translate centre back to 0,0

        // Draw runway 
        ctx.fillStyle = colour;
        ctx.fillRect(x, y, rwidth, rheight);  
    
        // Draw dashes on runway
        dash_length = 10;
        dash_width = 2;
        for (let xstart = x+10; (xstart+dash_length) < x+rwidth; xstart=xstart+20){
            tlx = xstart;
            tly =  height/2;
            ctx.fillStyle = "#FFFFFF"; //white
            ctx.fillRect(tlx,tly,dash_length,dash_width);
        }

        ctx.translate(cx, cy);              // Translate shape centre
        ctx.rotate(-rotation);              // Rotate back to original angle
        ctx.translate(-cx, -cy);            // Translate centre back to 0,0

    }, 

    plotWind: function(){
        // Function for plotting the wind arrow
        
        const canvas = document.getElementById("windplot");
        width = canvas.width;
        height = canvas.height;

        if (canvas.getContext) {
            const ctx = canvas.getContext("2d");
            
            // Add a background to the wind plot
            ctx.fillStyle = "#BBC9FD"; // light blue
            ctx.fillRect(0, 0, width, height);
            
            if(this.windDir!=null){
                // Wind arrow starts in middle of plot
                fromx = width/2;
                fromy =  height/2;

                // Get the wind direction in radians 
                wnddir = this.windDir * (Math.PI / 180) + (Math.PI/2);
                
                // Calculate an appropriate size for the wind vector (non-zero minimum, max still fits in plot)
                max_vector = Math.min(width/2,height/2);
                if (this.windSpeed!=null){
                    wind_vector = Math.max(Math.min(1,this.windSpeed/30),.15) * max_vector;
                } else{
                    wind_vector = .3 * max_vector;
                }

                // Get the coords for tip of wind vector
                tox = fromx + Math.cos(wnddir) * wind_vector;
                toy = fromy + Math.sin(wnddir) * wind_vector;
    
                // Draw the wind vector
                ctx.beginPath();
                this.canvas_arrow(ctx,fromx,fromy,tox,toy);
                ctx.stroke();
            }

        }
    },

    canvas_arrow: function (context, from_x, from_y, to_x, to_y) {
        // Function for drawing an arrow 

        var hlen = 10; // length of arrow head 

        // Move the origin to the start of arrow
        context.moveTo(from_x, from_y);
        
        // Draw the shaft of the arrow 
        var dx = to_x - from_x;
        var dy = to_y - from_y;
        var theta = Math.atan2(dy, dx);
        context.lineTo(to_x, to_y);

        // Draw the two heads of the arrow 
        context.lineTo(to_x - hlen * Math.cos(theta - Math.PI / 6), to_y - hlen * Math.sin(theta - Math.PI / 6));
        context.moveTo(to_x, to_y);
        context.lineTo(to_x - hlen * Math.cos(theta + Math.PI / 6), to_y - hlen * Math.sin(theta + Math.PI / 6));
        
        // Move the origin back to 0,0
        context.moveTo(-from_x, -from_y);
    },

    calcXwinds: function(){
        // Function for calculating the cross-winds

        // Runway, wind direction, and wind speed all required 
        if(this.windDir != null && this.windSpeed != null && this.runways.length > 0){

            // Get the best runway and get the angle to the wind direction in radians
            bestdir = this.runways[this.bestRunway];
            xwind_angle = Math.abs(bestdir - this.windDir);
            if (xwind_angle>180){
                xwind_angle = Math.abs(xwind_angle-360);
            }
            xwind_angle = xwind_angle * (Math.PI / 180);
            
            // Calculate the crosswind and headwind
            xwindcomp = this.windSpeed * Math.sin(xwind_angle);
            headwindcomp = this.windSpeed * Math.cos(xwind_angle);

            // Round to one decimal place 
            xwindcomp = Math.round(xwindcomp * 10) / 10;
            headwindcomp = Math.round(headwindcomp * 10) / 10;

            // Write the crosswind outputs
            var xwind = document.getElementById("xwind");
            xwind.innerHTML = "Crosswind component : " + xwindcomp;
            xwind.style.color = 'red';

            // Write the headwind outputs
            var headwind = document.getElementById("headwind");
            headwind.innerHTML = "Headwind component : " + headwindcomp;
            headwind.style.color = 'blue';
        }
    },
}




