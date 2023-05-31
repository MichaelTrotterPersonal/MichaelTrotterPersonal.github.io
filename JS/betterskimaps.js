
// This script contains the JavaScript code used to call the Better Ski Maps deployed web app for retrieving the live ski area/lift status map
// This is the secondaery file for my JavaScript submission for assignment 2 parts 2.3 and 2.4 
// I know this seems like pretty minimal JavaScript, but a lot of work went into my turning a simple 
// locally run Python script into a deployed and hosted Web App with Google Cloud Enigne!
// I appreciate that standing up a web app was not in the assignment description though...

var handlers = {
    // Function for taking the resort name as input and setting the image source to the relevant 
    //lift status map to be returned from the web app
    getMap: function(resort) {
        
        // Clear any currently displayed map
        const myNode = document.getElementById("mapimage");
        myNode.innerHTML = '';

        //Select the image, replace the source with correct web app address and change alt text
        var elem = document.createElement("img");
        elem.setAttribute("src", "https://comp1710app.ts.r.appspot.com/".concat(resort));
        elem.setAttribute("alt", resort);
        
        //Apply a fixed height to map and insert into page
        elem.style.height = '800px';
        document.getElementById("mapimage").appendChild(elem);
    }
};
