// This .js file contains the code used to implement the scrollable image gallery in gallery.html
// This is the primary file for my JavaScript submission for assignment 2 parts 2.3 and 2.4 

// Construct a scrollableGallery object with images pre-defined (probably a better way of doing this...?)
var scrollableGallery = {

    // Define the images and their associated alt/description text
    allImages : [
        'images/gallery/cheviot_tunnel_crosssections_front.png',
        'images/gallery/cheviot_tunnel_crosssections.png',
        'images/gallery/cheviot_tunnel_scan.png',
        'images/gallery/cheviot_tunnel.png',
        'images/gallery/dights_mill_2017.png',
        'images/gallery/eBee_summer.png',
        'images/gallery/eBee_winter.png',
        'images/gallery/foxbat.png',
        'images/gallery/gcp_spring.png',
        'images/gallery/GPS_summer.png',
        'images/gallery/GPS_winter.png',
        'images/gallery/great_alpine_road.png',
        'images/gallery/heli.png',
        'images/gallery/hotham_august2016.png',
        'images/gallery/hotham_october2016.png',
        'images/gallery/hotham_pointcloud.png',
        'images/gallery/jacka_historic.png',
        'images/gallery/jacka_scan.png',
        'images/gallery/me.png',
        'images/gallery/miz_and_me.png',
        'images/gallery/police_paddocks_reserve_eBee.png',
        'images/gallery/quarry_volumes.png',
        'images/gallery/HothamWinter.png',
        'images/gallery/HothamSpring.png'
                ],
    imageAlts : [
        'Cross-sections of Cheviot Tunnel viewed from above the north-western entrance.',
        'Profile of Cheviot Tunnel cross-sections.',
        'Dense point cloud of Cheviot Tunnel.',
        'North-western entrance to Cheviot Tunnel.',
        'Dights Mill with race at Dights Falls, Abbotsford Victoria - 2017.',
        'senseFly eBee and laptop ground control station. Mt Feathertop in the background - autumn 2016.',
        'senseFly eBee, tablet ground control station and VHF radio. Mt Feathertop in the background - winter 2016.',
        'Aeroprakt A-22 Foxbat at Moruya Airport after my first solo flight - 2021.',
        'Surveyed ground control point - October 2016.',
        'Trimble R8s used for summer survey.',
        'Trimble R8s used for placement of ground control - winter 2016.',
        'The Great Alpine Road near the summit of Mt. Hotham - spring 2016.',
        'The Falls Creek - Mt. Hotham Helilink, Mt. Hotham helipad - August 2008.',
        'Summit of Mt. Hotham covered in snow - winter 2016.',
        'Summit of Mt. Hotham during spring melt - spring 2016.',
        'Mt. Hotham point cloud captured winter 2016.',
        'Jacka Boulevard, St Kilda, Vic. c1920-1954. The Esplenade Vaults can be seen on the left.',
        'Point cloud from scan of Esplenade Vaults - 2017.',
        "Me in Canberra Aeroclub's Piper Archer VH-MIZ on a Canberra city flight - July 2022.",
        'Canberra Aeroclubs Piper Archer VH-MIZ and myself after my first solo flight at Canberra Airport - 2022.',
        'Softball fields at Police Paddocks Reserve, Dandenong, Vic. Taken by a senseFly eBee - 2016.',
        'Stockpile measurements from a UAV derived point cloud, limestone quarry Western Victoria - 2015.',
        'Winter snow depth map from a senseFly eBee derived point cloud. My masters project - 2016.',
        'Spring snow depth map from a senseFly eBee derived point cloud. My masters project - 2016.'
    ],

    //Track the image indexes that should be currently displayed on menu bar
    barImages : [0,1,2,3,4],

    //Adjust the menu bar image indexes to scroll images right
    scrollRight : function(){
        for (let i = 0; i < this.barImages.length-1; i++) {
            this.barImages[i] = this.barImages[i+1];
          }

        if(this.barImages[this.barImages.length-1] >= this.allImages.length-1){
            this.barImages[this.barImages.length-1] = 0;
        }else{
            this.barImages[this.barImages.length-1]++; 
        }
        view.displayBarImages();
    },

    //Adjust the menu bar image indexes to scroll images left
    scrollLeft : function(){
        for (let i = this.barImages.length-1; i > 0; i--){
            this.barImages[i] = this.barImages[i-1];
          }
          
        if(this.barImages[0] == 0){
            this.barImages[0] = this.allImages.length-1;
        }else{
            this.barImages[0]--; 
        }
        view.displayBarImages();
    }
}

//Display the menu bar images based on the barImages array containing image indexes
var view = {
    displayBarImages :function(){
        var barImagesElement = document.getElementById('barImages');

        var imageCols = barImagesElement.querySelectorAll('.imgcolumn');

        for (let i = 0; i < imageCols.length; i++){
            setimgnum = scrollableGallery.barImages[i];

            thisImage = imageCols[i].querySelector('img');
            
            thisImage.setAttribute('src',scrollableGallery.allImages[setimgnum])
            thisImage.setAttribute('alt',scrollableGallery.imageAlts[setimgnum])
          }
    }
}

//Display or change the main image 
function setMainImage(img) {
    //Set the expanded image to be the new image and change alt
    var expandImg = document.getElementById("expandedImg");
    expandImg.src = img.src;
    expandImg.alt = img.alt;

    //Set the image alt/description text to display above image
    var imgText = document.getElementById("imgtext");
    imgText.innerHTML = "<p>"+img.alt+"</p>";
  }




