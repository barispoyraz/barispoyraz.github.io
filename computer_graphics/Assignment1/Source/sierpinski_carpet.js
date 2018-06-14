/*
* Author: Barış Poyraz
* ID: 21401952
* CS465 - Computer Graphics - Assignment I
*/

/*
* Some important references that are used while doing the assignment
*
* References:
* [1] W3School
* [2] MDN Web Docs - WebGL
* [3] MDN Web Docs - JavaScript
* [4] MDN Web Docs - HTML
* [5] MDN Web Docs - Events
* [6] Edward_Angel_Example_Codes - gasket5 
* [7] Edward_Angel_Example_Codes - cad1
* [8] Edward_Angel_Example_Codes - square
* [9] Edward_Angel_Example_Codes - squarem
* [10] Edward_Angel_Example_Codes - cad2
* [11] Book
* [12] MDN Web Docs - Web
* [13] MDN Web Docs - File
* [14] MDN Web Docs - FileReader
*/

/* Global Variables */
var program;

var canvas;
var gl;

var points = [];
var NumTimesToSubdivide = 1;
var vertices;

//UI Components
var numIter = document.getElementById("num_iter");
var numIterSlider = document.getElementById("num_iter_range_slider");

var redInWebGLBackground = 1.0;
var greenInWebGLBackground = 1.0;
var blueInWebGLBackground = 1.0;

var redInWebGLForeground = 1.0;
var greenInWebGLForeground = 0.0;
var blueInWebGLForeground = 0.0;

var backgroundColor = document.getElementById("background_color");
var foregroundColor = document.getElementById("foreground_color");

var foregroundColorArray = [];

var colorMap = {};
var colorLoc;

var mouseDownVector;
var mouseUpVector;

var saveButton = document.getElementById("save_button");
var loadButton = document.getElementById("load_file");

var displayFractalType = document.getElementById("display_fractals");
var displayIndex = 0; //by default, the display is filled polygons which is index 0 in the option

/*  Description of the function init():
*
* This function is automatically called by the browser when the page is loaded.
* This function does the initializations, such as setting the vertices for drawing the rectangles,
* setting the colorMap variable in order to convert the RGB colors into Hexadecimal colors. Then it calls
* the divideRectangles to figure out the points in order to draw the sierpinski carpet. After that it calls the 
* configuration function in order to configure the WebGL, create the buffers and render. Then it calls bindUIComponentsWithEventListeners
* function to add event listeners into the ui components.
*
* REFERENCE: [6] The init function in the javascript file of the gasket5 from the example codes.
* I changed the vertices array since this is the carpet version of the sierpinski's gasket. I added
* the colorMap as an hashMap in order to use them later to convert the hexadecimal colors into RGB colors.
*/
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    colorLoc = gl.getUniformLocation(program, "color");
    gl.uniform4fv(colorLoc, new Float32Array([1.0, 0.0, 0.0, 1.0]));
        
    vertices = [
        vec2(-1,-1),
        vec2(-1,1),
        vec2(1,1),
        vec2(1,-1)
    ];
    
    //Sets the values in the hashmap named as color map.
    colorMap["0"] = 0;
    colorMap["1"] = 1;
    colorMap["2"] = 2;
    colorMap["3"] = 3;
    colorMap["4"] = 4;
    colorMap["5"] = 5;
    colorMap["6"] = 6;
    colorMap["7"] = 7;
    colorMap["8"] = 8;
    colorMap["9"] = 9;
    colorMap["a"] = 10;
    colorMap["b"] = 11;
    colorMap["c"] = 12;
    colorMap["d"] = 13;
    colorMap["e"] = 14;
    colorMap["f"] = 15;
    
    //Calls the divideRectangles function initially, because by default the fractal displaying is in filled polygons mode
    divideRectangels( vertices[0], vertices[1], vertices[2], vertices[3],
                  NumTimesToSubdivide);
    
    configuration();
    bindUIComponentsWithEventListeners();
    
    render();
};

/*  Description of the function rectangels(a, b, c, d)
*
* Given the points of the four corners of the rectangles
* this function pushes those points to the points array in order to 
* use the points in later drawing.
*
* REFERENCE: [6] The triangle function in the javascript file of the gasket5 from the example codes
* Modified the parameters of the function definition and the parameters inside the push function of 
* the points array
*/
function rectangles( a, b, c, d )
{    
    points.push( a, b, c, a, d, c);
}

/*  Description of the function divideRectangles(a, b, c, d, count) 
*
* Given the points for the corners of the rectangle and a count which is basically 
* the number of iterations the user wants for the rectangle, this function calculates 
* the points the respective rectangles, i.e for the first iteration we need to have 8 rectangles.
* The figure below in the recursive calls of this function illustrates this first iteration. 
* Briefly, it finds the points of each of the rectangles that is to be draw by using recursive calls.
* 
* REFERENCE: [6] The divideTriangle function in the javascript file of the gasket5 from the example codes
* I modified the code so that right now it has 8 recursive calls in it and it has 12 calls to the mix 
* function
*/
function divideRectangels( a, b, c, d, count )
{

    // check for end of recursion and call the rectangles function to push the points into the points array.  
    if ( count === 0 ) {
        rectangles( a, b, c, d );
    }
    else {
        //bisect the sides
        //The figure below in the recursive calls illustrates this for the first iteration
        var ab = mix(a, b, 1.0/3);
        var ba = mix(b, a, 1.0/3);
        
        var bc = mix(b, c, 1.0/3);
        var cb = mix(c, b, 1.0/3);
        
        var cd = mix(c, d, 1.0/3);
        var dc = mix(d, c, 1.0/3);
        
        var da = mix(d, a, 1.0/3);
        var ad = mix(a, d, 1.0/3);
        
        var ac = mix(a, c, 1.0/3);
        var ca = mix(c, a, 1.0/3);
        
        var bd = mix(b, d, 1.0/3);
        var db = mix(d, b, 1.0/3);
        
        --count;

        // eight new rectangles                  //Figure showing rectangle and how the variables are created - 1st iteration
        
        divideRectangels(a ,ab ,ac ,ad ,count);  //Rectangle 1           b----bc----cb----c
        divideRectangels(ab ,ba ,bd ,ac ,count); //Rectangle 2           | 3 3 | 4 4 | 5 5|
        divideRectangels(ba ,b ,bc ,bd ,count);  //Rectangle 3           | 3 3 | 4 4 | 5 5|
        divideRectangels(bd ,bc ,cb ,ca ,count); //Rectangle 4          ba----bd----ca----cd
        divideRectangels(ca ,cb ,c ,cd ,count);  //Rectangle 5           | 2 2 |     | 6 6|
        divideRectangels(db ,ca ,cd ,dc ,count); //Rectangle 6           | 2 2 |     | 6 6|
        divideRectangels(da ,db ,dc ,d ,count);  //Rectangle 7          ab----ac----db----dc
        divideRectangels(ad ,ac ,db ,da ,count); //Rectangle 8           | 1 1 | 8 8 | 7 7|
                                                            //           | 1 1 | 8 8 | 7 7|              
                                                            //           a----ad----da----d
    }
}

/*  Description of the function lines(a, b, c, d)
*
* Given 4 respective points, this function pushes these points into the points array
* when the mode is in Lines mode, so that the sierpinski carpet will be generated by using lines.
* It pushes the points in such a way that the successive elements in the push method are the two
* edges of a line. For example the first two parameters a & b denotes a line, then the second and 
* third parameters b & c denote a line, and so on.
*
* REFERENCE: [6] The triangle function in the javascript file of the gasket5 from the example codes
* Modified the parameters of the function definition and the parameters in the push function
* in order to generate lines with successive parameters (a-b), (b-c), ...
*/
function lines( a, b, c, d )
{   
    points.push( a, b, b, c, c, d, d, a);
}

/*  Description of the function drawByLines(a, b, c, d, count)
* 
* Given the points a, b, c, d which will be used as the endpoints of the lines in the function lines(a, b, c, d)
* and count, this function generates the points by using recursive calls. This function is actually very similar with the 
* divideRectangles function, however I wanted to have a seperate function for better modularity, and to overcome the mistakes easily.
*
* REFERENCE: [6] The divideTriangle function in the javascript file of the gasket5 from the example codes
* The modifications are same with the divideRectangles function
*/
function drawByLines(a, b, c, d, count){
    // check for end of recursion and sends the endpoints to the lines function  
    if ( count === 0 ) {
        lines( a, b, c, d);
    }
    else { 
        //bisect the sides
        var ab = mix(a, b, 1.0/3);
        var ba = mix(b, a, 1.0/3);
        
        var bc = mix(b, c, 1.0/3);
        var cb = mix(c, b, 1.0/3);
        
        var cd = mix(c, d, 1.0/3);
        var dc = mix(d, c, 1.0/3);
        
        var da = mix(d, a, 1.0/3);
        var ad = mix(a, d, 1.0/3);
        
        var ac = mix(a, c, 1.0/3);
        var ca = mix(c, a, 1.0/3);
        
        var bd = mix(b, d, 1.0/3);
        var db = mix(d, b, 1.0/3);
    
        --count;
    
		//drawByLines(ac, bd, ca, db, count);
	
        drawByLines(a, ab, ac, ad, count);  
        drawByLines(ab, ba, bd, ac, count); 
        drawByLines(ba, b, bc, bd, count);
        drawByLines(bd, bc, cb, ca, count);
        drawByLines(ca, cb, c, cd, count);     
        drawByLines(db, ca, cd, dc, count);      
        drawByLines(da, db, dc, d, count);   
        drawByLines(ad, ac, db, da, count);
    }
}

/*  Description of the function render()
*
* This function clears the color buffer and checks the display fractal 
* mode in order to render the new points either with the mode filled polygons
* or with the mode lines
*
*/
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    //Checks whether the mode is filled polygons or lines; 0: filled polygons, 1: lines
    if(displayIndex === 0){
        gl.drawArrays( gl.TRIANGLES, 0, points.length );    
    }
    else{
        gl.drawArrays(gl.LINES, 0, points.length);
    }
}

/*  Description of the function bindUIComponentsWithEventListeners()
*
* This function adds event listeners to the UI components in order to capture, detect
* and apply user actions to those components. It basically binds the event listeners to 
* the components one by one, and within those event listeners callback function it handles 
* the user actions
*
* REFERENCES: [5] I looked up the examples of event listeners from the MDN Web Docs
* [7], [8] & [9]: I looked up the example codes to understand the mouse events in the WebGL
*/
function bindUIComponentsWithEventListeners(){
    
    //Add Event Listener to the Range Slider
    numIterSlider.addEventListener("change", function(){
        document.getElementById("num_iter").innerHTML = "Number of Iterations: " + numIterSlider.value;
        
        NumTimesToSubdivide = parseInt(numIterSlider.value);
        
        //Reset the points array
        points = [];
        
        //Check whether the mode is in filled polygons or in lines mode
        //and according to that call either divideRectangles or drawByLines function
        //0: filled polygons, 1: lines
        if(displayIndex === 0){
           divideRectangels( vertices[0], vertices[1], vertices[2], vertices[3],
                    NumTimesToSubdivide); 
        }
        else{
            drawByLines( vertices[0], vertices[1], vertices[2], vertices[3],
                    parseInt(numIterSlider.value));
        }
        
        configuration();
    });
    
    //Add Event Listener to change the Background Color
    backgroundColor.addEventListener("change", function(){
        //Gets the hexadecimal color for the background color from the color picker 
        //and sends it to the convertToWebGLColors function to convert it into RGB colors.
        convertToWebGLColors(document.getElementById("background_color").value, "background");
    });
    
    //Add Event Listener to change the Foreground Color
    foregroundColor.addEventListener("change", function(){
        //Gets the hexadecimal color for the foreground color from the color picker 
        //and sends it to the convertToWebGLColors function to convert it into RGB colors.
        convertToWebGLColors(document.getElementById("foreground_color").value, "foreground");
    });
    
    //Add Event Listener to capture the coordinates of the mouse when the user presses the mouse
    //REFERENCE: [11] - In book page 152, the formula to convert to the coordinates to clip coordinates is given
    canvas.addEventListener("mousedown", function(event){
        //Gathers the x and y coordinates of the mouse where it is pressed
        var firstMousePositionX = event.offsetX;
        var firstMousePositionY = event.offsetY;
        
        //Converts the coordinates of the mouse into clip coordinates so can we can observe it from the canvas at the end
        var firstClipCoordinatesX = -1 + 2 * event.offsetX / canvas.width; 
        var firstClipCoordinatesY = -1 + 2 * (canvas.height - event.offsetY) / canvas.height;
        
        //Sets the mouseDownVector to a 2D vector to use the X & Y coordinates when generating the sierpinski's carpet
        mouseDownVector = vec2(firstClipCoordinatesX, firstClipCoordinatesY);
         
    });
    
    //Add Event Listener to capture the coordinates when the user releases the mouse
    //and gather both of these coordinates to draw the sierpinski carpet in that region
    //REFERENCE: [11] - In book page 152, the formula to convert to the coordinates to clip coordinates is given
    canvas.addEventListener("mouseup", function(event){
        var secondMousePositionX = event.offsetX;
        var secondMousePositionY = event.offsetY;
        
        //Converts the coordinates of the mouse into clip coordinates so can we can observe it from the canvas at the end
        var secondClipCoordinatesX = -1 + 2 * event.offsetX / canvas.width;
        var secondClipCoordinatesY = -1 + 2 * (canvas.height - event.offsetY) / canvas.height;
        
        //Sets the mouseUpVector to a 2D vector to use the X & Y coordinates when generating the sierpinski's carpet
        mouseUpVector = vec2(secondClipCoordinatesX, secondClipCoordinatesY);
        
        //Sets the for points of the rectangles before sending them to divdeRectangles or drawByLines function
        var rectangleCoordinatesA = mouseDownVector;
        var rectangleCoordinatesC = mouseUpVector; 
        var rectangleCoordinatesB = vec2(mouseDownVector[0], mouseUpVector[1]);
        var rectangleCoordinatesD = vec2(mouseUpVector[0], mouseDownVector[1]);
        
        //Resets the points array
        points = [];
        
        //Checks whether the mode is in filled polygons (0), or in lines(1) mode
        if(displayIndex === 0){
            divideRectangels(rectangleCoordinatesA, rectangleCoordinatesB, rectangleCoordinatesC, rectangleCoordinatesD, parseInt(numIterSlider.value));
        }
        else{
            drawByLines( rectangleCoordinatesA, rectangleCoordinatesB, rectangleCoordinatesC, rectangleCoordinatesD,
                    parseInt(numIterSlider.value));
        }
        
        configuration();      
    });
    
    //Add Event Listener to the save button in order to save the current state of the sierpinski carpet
    //The callback function takes the variables that are necessary to store the previous state, so that it can be loaded
    //REFERENCES: 1) https://stackoverflow.com/questions/10559660/how-can-i-build-a-json-string-in-javascript-jquery
    //I looked this to understand how to create JSON objects
    //[12] The API for Blob is used
    // https://stackoverflow.com/questions/34156282/how-do-i-save-json-to-local-text-file
    //I looked the references above to understand how to convert JSON object into txt file and then download it
    saveButton.addEventListener("click", function(){ //REFERENCE: [https://stackoverflow.com/questions/10559660/how-can-i-build-a-json-string-in-javascript-jquery] 
        //Create an empty map, which is used as a JSON object in the end
        var savedState = {};
        
        //Saves the variables into map by using different keys
        savedState["savedPoints"] = points;
        savedState["numberOfIterations"] = numIterSlider.value;
        
        savedState["redForeground"] = redInWebGLForeground;
        savedState["greenForeground"] = greenInWebGLForeground;
        savedState["blueForeground"] = blueInWebGLForeground;
        
        savedState["redBackground"] = redInWebGLBackground;
        savedState["greenBackground"] = greenInWebGLBackground;
        savedState["blueBackground"] = blueInWebGLBackground;
        
        savedState["displayType"] = displayIndex;
        
        //Convert this map into JSON object
        var savedStatesInJSON = JSON.stringify(savedState);
        
        //Show user what is stored
        alert(savedStatesInJSON);
        
        //Converts the JSON object to text file, then automatically downloads it to the Downloads folder
        //The name of the text file is the return value from the object Date
        var a = document.createElement("a");
        var fileToDownload = new Blob([savedStatesInJSON], {type: "text/plain"});
        a.href = URL.createObjectURL(fileToDownload);
        
        var fileName = new Date();
        
        a.download = fileName;
        a.click();
    });
    
    //Add Event Listener to the load button in order to load the previous(stored) state of the sierpinski carpet
    //This callback function uses the FileReader object of javascript in order to read the contents in the file, then it passes
    //the contents to parseAndDisplayThePreviousState function as a parameter in order to set the global variables to the stored 
    //variables
    //REFERENCES: [13] & [14]. I looked up for the examples of file reading operations from both File API and FileReader API.
    loadButton.addEventListener("change", function(){
        var userSelection = loadButton.files[0];
        var reader = new FileReader();
        var content;
        
        reader.onload = function(){
            content = reader.result;
        }
        reader.readAsText(userSelection);    
        
        reader.onloadend = function(){
            content = reader.result;
            parseAndDisplayThePreviousState(content);
        }  
    });
    
    //Add Event Listener to the combobox in order to change the mode of displaying
    //the fractals.
    //REFERENCES: [4] & [5] I looked up for the examples of <select> element to both handle the events and how to create them.
    displayFractalType.addEventListener("change", function(){
        var index = displayFractalType.selectedIndex; //index 0: filled polygon (default), 1: lines
        displayIndex = index;
        
        //Resets the points array
        points = [];
        
        //Checks for the mode that user selects and calls the functions in order to figure out the points and 
        //draw them in the end
        if(displayIndex === 0){
            divideRectangels( vertices[0], vertices[1], vertices[2], vertices[3],
                  parseInt(numIterSlider.value));
        }
        else{
            drawByLines( vertices[0], vertices[1], vertices[2], vertices[3],
                    parseInt(numIterSlider.value));
        }
        
        configuration();  
    });
    
}

/* Description of the function parseAndDisplayThePreviousState(content)
*
* Given the parameter content which is the contents of the loaded text file, this function parses
* the information in the text file and sets the equivalent variables to the global variables. 
* At first the retrieved contents are converted into JSON objects. Then by using the key values of each
* of the variables that are stated in saveButton's event listener callback function, it sets the global variables
* to the stored variables
*
*/
function parseAndDisplayThePreviousState(content){
    
    //Converts the contents to JSON object in order to parse the necessary informations
    var contentJSON = JSON.parse(content);
    
    points = contentJSON["savedPoints"];
    numIterSlider.value = contentJSON["numberOfIterations"];
    NumTimesToSubdivide = numIterSlider.value;
    
    document.getElementById("num_iter").innerHTML = "Number of Iterations: " + numIterSlider.value;
    
    redInWebGLForeground = contentJSON["redForeground"];
    greenInWebGLForeground = contentJSON["greenForeground"];
    blueInWebGLForeground = contentJSON["blueForeground"];
    
    redInWebGLBackground = contentJSON["redBackground"];
    greenInWebGLBackground = contentJSON["greenBackground"];
    blueInWebGLBackground = contentJSON["blueBackground"];
    
    displayIndex = contentJSON["displayType"];
    if(displayIndex == 0)
        displayFractalType.querySelector("draw_by_filled_polygons");
    else{
        displayFractalType.querySelector("draw_by_lines");
    }
    
    configuration();
}

/*  Description of the function configuration()
*
* This function configures the WebGL and sets the background color of canvas with
* respect to the global variables 
*
*/
function configuration(){
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( redInWebGLBackground, greenInWebGLBackground, blueInWebGLBackground, 1.0 );

    //  Load shaders and initialize attribute buffers
    
    configureAndDisplay(program);
}

/*  Description of the function configureAndDisplay(program)
*
* This function creates the data buffers and stores the points inside these buffers
* Also this function changes the foreground color in the canvas. In the end, it calls
* the render function to render those points and draw the sierpinski carpet
*
*/
function configureAndDisplay(program){   
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    //Set the foreground color of the canvas with respect to the global variables - REFERENCE: https://stackoverflow.com/questions/26533414/how-to-use-uniform-to-change-color-in-webgl , the comment section 
    gl.uniform4fv(colorLoc, new Float32Array([redInWebGLForeground, greenInWebGLForeground, blueInWebGLForeground, 1.0]));
    
    window.requestAnimationFrame(function(){
        render();
    });
}

/*  Description of the function convertToWebGLColors(hexColor, choice)
*
* This function takes a hexadecimal color and a choice as parameter
* and converts the color into RGB colors to use in WebGL. The choice parameter
* is used to assign the new colors either into the foreground color or background color.
* To achieve this, this function takes the hexadecimal color which is in the format (#000000)
* and then partitions the red, green and blue parts by using substring function. After that
* it converts the red, green, and blue parts of the color by multiplying the zero'th index
* value with 16 and add it with the first index value. To use this RGB color in WebGL, it
* multiplies the colors with 1.0 and divides them with 255 to get a number between 0.0 and 1.0
*
*/
function convertToWebGLColors(hexColor, choice){
    //Gets the red, green, and blue parts of the hexadecimal color by using the substring function
    var redString = hexColor.substring(1,3);
    var greenString = hexColor.substring(3,5);
    var blueString = hexColor.substring(5,7);
    
    //Converts the each part into RGB format 0 - 255
    var redInRGB = 16 * colorMap[redString.substring(0,1)] + 1 * colorMap[redString.substring(1,2)];
    var greenInRGB = 16 * colorMap[greenString.substring(0,1)] + 1 * colorMap[greenString.substring(1,2)];
    var blueInRGB = 16 * colorMap[blueString.substring(0,1)] + 1 * colorMap[blueString.substring(1,2)];
    
    //Checks whether the new color is going to be assigned to background color or foreground color
    if (choice === "background"){
        redInWebGLBackground = 1.0 * redInRGB / 255;
        greenInWebGLBackground = 1.0 * greenInRGB / 255;
        blueInWebGLBackground = 1.0 * blueInRGB / 255;
        configuration();    
    }
    else{
        foregroundColorArray = [];
        redInWebGLForeground = 1.0 * redInRGB / 255;
        greenInWebGLForeground = 1.0 * greenInRGB / 255;
        blueInWebGLForeground = 1.0 * blueInRGB / 255;
        
        foregroundColorArray.push(vec4(redInWebGLForeground, greenInWebGLForeground, blueInWebGLForeground, 1.0));
        configuration();
    }   
}

