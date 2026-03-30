import { javascriptLanguage } from "@codemirror/lang-javascript";

/**
 * p5.js global functions, variables, and constants for autocomplete.
 * See https://p5js.org/reference/ for the full reference.
 */
const P5_GLOBALS = [
  // Lifecycle
  { label: "setup", type: "function", info: "Called once at program start. Put canvas creation and initial settings here." },
  { label: "draw", type: "function", info: "Called repeatedly (default 60fps) to animate the sketch." },
  { label: "preload", type: "function", info: "Called before setup(). Use it to load images, fonts, and sounds." },

  // Canvas
  { label: "createCanvas", type: "function", info: "createCanvas(w, h) — Creates a drawing canvas." },
  { label: "resizeCanvas", type: "function", info: "resizeCanvas(w, h) — Resizes the canvas." },
  { label: "width", type: "variable", info: "The width of the canvas in pixels." },
  { label: "height", type: "variable", info: "The height of the canvas in pixels." },
  { label: "windowWidth", type: "variable", info: "The width of the browser window." },
  { label: "windowHeight", type: "variable", info: "The height of the browser window." },
  { label: "windowResized", type: "function", info: "Called when the browser window is resized." },
  { label: "pixelDensity", type: "function", info: "pixelDensity(val) — Sets or gets the pixel density for high-DPI screens." },

  // Loop control
  { label: "noLoop", type: "function", info: "Stops draw() from running repeatedly." },
  { label: "loop", type: "function", info: "Resumes draw() after noLoop() was called." },
  { label: "frameRate", type: "function", info: "frameRate(fps) — Sets or gets the frame rate." },
  { label: "frameCount", type: "variable", info: "The number of frames drawn since the sketch started." },
  { label: "deltaTime", type: "variable", info: "Time in ms since the last frame was drawn." },
  { label: "redraw", type: "function", info: "Runs draw() once when the sketch is paused with noLoop()." },

  // Transform
  { label: "push", type: "function", info: "Saves the current drawing style and transforms." },
  { label: "pop", type: "function", info: "Restores drawing style and transforms saved by push()." },
  { label: "translate", type: "function", info: "translate(x, y) — Moves the origin of the canvas." },
  { label: "rotate", type: "function", info: "rotate(angle) — Rotates the coordinate system." },
  { label: "scale", type: "function", info: "scale(x, y) — Scales the coordinate system." },
  { label: "resetMatrix", type: "function", info: "Resets all transformations to the identity matrix." },
  { label: "angleMode", type: "function", info: "angleMode(mode) — Sets angle mode to DEGREES or RADIANS." },

  // Color
  { label: "background", type: "function", info: "background(r, g, b) or background(gray) — Fills the canvas with a color." },
  { label: "fill", type: "function", info: "fill(r, g, b) or fill(gray) — Sets the fill color for shapes." },
  { label: "noFill", type: "function", info: "Disables filling shapes." },
  { label: "stroke", type: "function", info: "stroke(r, g, b) — Sets the stroke (outline) color." },
  { label: "noStroke", type: "function", info: "Disables drawing the stroke (outline)." },
  { label: "color", type: "function", info: "color(r, g, b) — Creates a color value." },
  { label: "colorMode", type: "function", info: "colorMode(mode) — Changes the color mode (RGB or HSB)." },
  { label: "strokeWeight", type: "function", info: "strokeWeight(w) — Sets the width of the stroke." },
  { label: "clear", type: "function", info: "Clears the canvas to fully transparent." },
  { label: "alpha", type: "function", info: "alpha(color) — Returns the alpha value of a color." },
  { label: "red", type: "function", info: "red(color) — Returns the red value of a color." },
  { label: "green", type: "function", info: "green(color) — Returns the green value of a color." },
  { label: "blue", type: "function", info: "blue(color) — Returns the blue value of a color." },
  { label: "lerpColor", type: "function", info: "lerpColor(c1, c2, amt) — Blends two colors by an amount." },

  // Shapes
  { label: "point", type: "function", info: "point(x, y) — Draws a single point." },
  { label: "line", type: "function", info: "line(x1, y1, x2, y2) — Draws a line between two points." },
  { label: "rect", type: "function", info: "rect(x, y, w, h) — Draws a rectangle." },
  { label: "ellipse", type: "function", info: "ellipse(x, y, w, h) — Draws an ellipse (oval)." },
  { label: "circle", type: "function", info: "circle(x, y, d) — Draws a circle with center x,y and diameter d." },
  { label: "triangle", type: "function", info: "triangle(x1,y1, x2,y2, x3,y3) — Draws a triangle." },
  { label: "quad", type: "function", info: "quad(x1,y1, x2,y2, x3,y3, x4,y4) — Draws a quadrilateral." },
  { label: "square", type: "function", info: "square(x, y, s) — Draws a square." },
  { label: "arc", type: "function", info: "arc(x, y, w, h, start, stop) — Draws an arc." },
  { label: "beginShape", type: "function", info: "beginShape() — Begins recording vertices for a custom shape." },
  { label: "endShape", type: "function", info: "endShape(CLOSE?) — Ends recording vertices and draws the shape." },
  { label: "vertex", type: "function", info: "vertex(x, y) — Adds a vertex to a shape started with beginShape()." },
  { label: "curveVertex", type: "function", info: "curveVertex(x, y) — Adds a curved vertex." },
  { label: "bezierVertex", type: "function", info: "bezierVertex(cp1x,cp1y, cp2x,cp2y, x,y) — Adds a bezier vertex." },
  { label: "bezier", type: "function", info: "bezier(x1,y1, cx1,cy1, cx2,cy2, x2,y2) — Draws a Bezier curve." },
  { label: "curve", type: "function", info: "curve(x1,y1, x2,y2, x3,y3, x4,y4) — Draws a Catmull-Rom spline." },
  { label: "rectMode", type: "function", info: "rectMode(mode) — Changes how rect() coordinates are interpreted." },
  { label: "ellipseMode", type: "function", info: "ellipseMode(mode) — Changes how ellipse() coordinates are interpreted." },
  { label: "strokeCap", type: "function", info: "strokeCap(cap) — Sets the style for line endings." },
  { label: "strokeJoin", type: "function", info: "strokeJoin(join) — Sets the style for corners." },

  // Image
  { label: "loadImage", type: "function", info: "loadImage(path) — Loads an image file. Call in preload()." },
  { label: "image", type: "function", info: "image(img, x, y, w?, h?) — Draws an image to the canvas." },
  { label: "imageMode", type: "function", info: "imageMode(mode) — Changes how image() coordinates are interpreted." },
  { label: "tint", type: "function", info: "tint(r, g, b, a?) — Tints images with a color." },
  { label: "noTint", type: "function", info: "Removes any tint applied with tint()." },
  { label: "createImage", type: "function", info: "createImage(w, h) — Creates a blank image." },
  { label: "get", type: "function", info: "get(x, y, w?, h?) — Gets a pixel or region from the canvas." },
  { label: "set", type: "function", info: "set(x, y, color) — Sets a pixel color on the canvas." },
  { label: "loadPixels", type: "function", info: "Loads the pixel data for the canvas into the pixels[] array." },
  { label: "updatePixels", type: "function", info: "Updates the canvas with pixel data from pixels[]." },
  { label: "pixels", type: "variable", info: "Array of pixel color data for the canvas. Use with loadPixels()." },

  // Typography
  { label: "text", type: "function", info: "text(str, x, y) — Draws text on the canvas." },
  { label: "textSize", type: "function", info: "textSize(size) — Sets the font size." },
  { label: "textAlign", type: "function", info: "textAlign(horiz, vert?) — Sets text alignment." },
  { label: "textFont", type: "function", info: "textFont(font) — Sets the font used by text()." },
  { label: "textStyle", type: "function", info: "textStyle(style) — Sets the font style (NORMAL, ITALIC, BOLD)." },
  { label: "textWidth", type: "function", info: "textWidth(str) — Returns the width of a string in the current font." },
  { label: "textLeading", type: "function", info: "textLeading(leading) — Sets the spacing between lines of text." },
  { label: "loadFont", type: "function", info: "loadFont(path) — Loads a font file. Call in preload()." },

  // Math
  { label: "abs", type: "function", info: "abs(n) — Returns the absolute value of n." },
  { label: "ceil", type: "function", info: "ceil(n) — Rounds n up to the nearest integer." },
  { label: "floor", type: "function", info: "floor(n) — Rounds n down to the nearest integer." },
  { label: "round", type: "function", info: "round(n) — Rounds n to the nearest integer." },
  { label: "min", type: "function", info: "min(a, b) — Returns the smaller of two values." },
  { label: "max", type: "function", info: "max(a, b) — Returns the larger of two values." },
  { label: "constrain", type: "function", info: "constrain(n, low, high) — Clamps n between low and high." },
  { label: "dist", type: "function", info: "dist(x1,y1, x2,y2) — Calculates the distance between two points." },
  { label: "lerp", type: "function", info: "lerp(start, stop, amt) — Linearly interpolates between two values." },
  { label: "map", type: "function", info: "map(value, start1, stop1, start2, stop2) — Re-maps a number from one range to another." },
  { label: "norm", type: "function", info: "norm(value, start, stop) — Normalizes a value between 0 and 1." },
  { label: "sq", type: "function", info: "sq(n) — Squares n (n*n)." },
  { label: "sqrt", type: "function", info: "sqrt(n) — Returns the square root of n." },
  { label: "pow", type: "function", info: "pow(n, e) — Returns n raised to the power e." },
  { label: "log", type: "function", info: "log(n) — Returns the natural logarithm of n." },
  { label: "mag", type: "function", info: "mag(x, y) — Returns the magnitude of a vector." },
  { label: "random", type: "function", info: "random(low?, high?) — Returns a random number." },
  { label: "randomSeed", type: "function", info: "randomSeed(seed) — Sets the seed for random()." },
  { label: "randomGaussian", type: "function", info: "randomGaussian(mean?, sd?) — Returns a Gaussian-distributed random number." },
  { label: "noise", type: "function", info: "noise(x, y?, z?) — Returns smooth Perlin noise value (0-1)." },
  { label: "noiseDetail", type: "function", info: "noiseDetail(lod, falloff) — Adjusts the character of Perlin noise." },
  { label: "noiseSeed", type: "function", info: "noiseSeed(seed) — Sets the seed for noise()." },
  { label: "sin", type: "function", info: "sin(angle) — Returns the sine of an angle." },
  { label: "cos", type: "function", info: "cos(angle) — Returns the cosine of an angle." },
  { label: "tan", type: "function", info: "tan(angle) — Returns the tangent of an angle." },
  { label: "asin", type: "function", info: "asin(value) — Returns the arc sine of a value." },
  { label: "acos", type: "function", info: "acos(value) — Returns the arc cosine of a value." },
  { label: "atan", type: "function", info: "atan(value) — Returns the arc tangent of a value." },
  { label: "atan2", type: "function", info: "atan2(y, x) — Returns the angle to the point (x, y)." },
  { label: "degrees", type: "function", info: "degrees(radians) — Converts radians to degrees." },
  { label: "radians", type: "function", info: "radians(degrees) — Converts degrees to radians." },
  { label: "createVector", type: "function", info: "createVector(x, y, z?) — Creates a p5.Vector object." },

  // Mouse
  { label: "mouseX", type: "variable", info: "The current x position of the mouse." },
  { label: "mouseY", type: "variable", info: "The current y position of the mouse." },
  { label: "pmouseX", type: "variable", info: "The previous x position of the mouse." },
  { label: "pmouseY", type: "variable", info: "The previous y position of the mouse." },
  { label: "mouseIsPressed", type: "variable", info: "True if any mouse button is currently pressed." },
  { label: "mouseButton", type: "variable", info: "The mouse button last pressed: LEFT, RIGHT, or CENTER." },
  { label: "mousePressed", type: "function", info: "Called once when a mouse button is pressed." },
  { label: "mouseReleased", type: "function", info: "Called once when a mouse button is released." },
  { label: "mouseMoved", type: "function", info: "Called when the mouse is moved without a button pressed." },
  { label: "mouseDragged", type: "function", info: "Called when the mouse is moved while a button is pressed." },
  { label: "mouseClicked", type: "function", info: "Called when a mouse button is clicked." },
  { label: "doubleClicked", type: "function", info: "Called when a mouse button is double-clicked." },
  { label: "mouseWheel", type: "function", info: "Called when the mouse wheel scrolls. evt.delta for scroll amount." },

  // Keyboard
  { label: "keyIsPressed", type: "variable", info: "True if any key is currently pressed." },
  { label: "key", type: "variable", info: "The most recently pressed key as a string." },
  { label: "keyCode", type: "variable", info: "The numeric key code of the most recently pressed key." },
  { label: "keyPressed", type: "function", info: "Called once when a key is pressed." },
  { label: "keyReleased", type: "function", info: "Called once when a key is released." },
  { label: "keyTyped", type: "function", info: "Called when a key is pressed that produces a printable character." },
  { label: "keyIsDown", type: "function", info: "keyIsDown(code) — Returns true if the given key is currently held down." },

  // Touch
  { label: "touches", type: "variable", info: "Array of current touch points, each with x/y properties." },
  { label: "touchStarted", type: "function", info: "Called when a touch begins." },
  { label: "touchMoved", type: "function", info: "Called when a touch moves." },
  { label: "touchEnded", type: "function", info: "Called when a touch ends." },

  // Time
  { label: "millis", type: "function", info: "millis() — Returns the number of milliseconds since the sketch started." },
  { label: "second", type: "function", info: "second() — Returns the current second (0-59)." },
  { label: "minute", type: "function", info: "minute() — Returns the current minute (0-59)." },
  { label: "hour", type: "function", info: "hour() — Returns the current hour (0-23)." },
  { label: "day", type: "function", info: "day() — Returns the current day of the month." },
  { label: "month", type: "function", info: "month() — Returns the current month (1-12)." },
  { label: "year", type: "function", info: "year() — Returns the current year." },

  // DOM / Environment
  { label: "cursor", type: "function", info: "cursor(type) — Sets the cursor appearance." },
  { label: "noCursor", type: "function", info: "Hides the mouse cursor." },
  { label: "focused", type: "variable", info: "True if the browser window is focused." },

  // IO / Save
  { label: "save", type: "function", info: "save(obj?, filename?, options?) — Saves the canvas or data as a file." },
  { label: "saveCanvas", type: "function", info: "saveCanvas(filename?, extension?) — Saves the canvas as an image file." },
  { label: "loadJSON", type: "function", info: "loadJSON(path, callback?) — Loads a JSON file. Call in preload()." },
  { label: "loadStrings", type: "function", info: "loadStrings(path, callback?) — Loads a text file as an array of lines." },

  // Constants
  { label: "PI", type: "constant", info: "π ≈ 3.14159" },
  { label: "TWO_PI", type: "constant", info: "2π ≈ 6.28318" },
  { label: "HALF_PI", type: "constant", info: "π/2 ≈ 1.5708" },
  { label: "QUARTER_PI", type: "constant", info: "π/4 ≈ 0.7854" },
  { label: "TAU", type: "constant", info: "Alias for TWO_PI (2π)." },
  { label: "DEGREES", type: "constant", info: "Use with angleMode(DEGREES)." },
  { label: "RADIANS", type: "constant", info: "Use with angleMode(RADIANS)." },
  { label: "CENTER", type: "constant", info: "Use with rectMode(), ellipseMode(), imageMode(), or textAlign()." },
  { label: "LEFT", type: "constant", info: "Use with textAlign() or mouseButton." },
  { label: "RIGHT", type: "constant", info: "Use with textAlign() or mouseButton." },
  { label: "TOP", type: "constant", info: "Use with textAlign()." },
  { label: "BOTTOM", type: "constant", info: "Use with textAlign()." },
  { label: "BASELINE", type: "constant", info: "Use with textAlign() for baseline vertical alignment." },
  { label: "CORNER", type: "constant", info: "Use with rectMode() or imageMode()." },
  { label: "CORNERS", type: "constant", info: "Use with rectMode() or imageMode()." },
  { label: "RADIUS", type: "constant", info: "Use with rectMode() or ellipseMode()." },
  { label: "CLOSE", type: "constant", info: "Use with endShape(CLOSE) to close the shape." },
  { label: "OPEN", type: "constant", info: "Use with arc() for an open arc shape." },
  { label: "CHORD", type: "constant", info: "Use with arc() for a chord arc shape." },
  { label: "PIE", type: "constant", info: "Use with arc() for a pie arc shape." },
  { label: "RGB", type: "constant", info: "Use with colorMode(RGB)." },
  { label: "HSB", type: "constant", info: "Use with colorMode(HSB)." },
  { label: "HSL", type: "constant", info: "Use with colorMode(HSL)." },
  { label: "NORMAL", type: "constant", info: "Use with textStyle()." },
  { label: "ITALIC", type: "constant", info: "Use with textStyle()." },
  { label: "BOLD", type: "constant", info: "Use with textStyle()." },
  { label: "BOLDITALIC", type: "constant", info: "Use with textStyle()." },
  { label: "ROUND", type: "constant", info: "Use with strokeCap() or strokeJoin()." },
  { label: "SQUARE", type: "constant", info: "Use with strokeCap()." },
  { label: "PROJECT", type: "constant", info: "Use with strokeCap()." },
  { label: "MITER", type: "constant", info: "Use with strokeJoin()." },
  { label: "BEVEL", type: "constant", info: "Use with strokeJoin()." },
  { label: "UP_ARROW", type: "constant", info: "Key code for the up arrow key." },
  { label: "DOWN_ARROW", type: "constant", info: "Key code for the down arrow key." },
  { label: "LEFT_ARROW", type: "constant", info: "Key code for the left arrow key." },
  { label: "RIGHT_ARROW", type: "constant", info: "Key code for the right arrow key." },
  { label: "ENTER", type: "constant", info: "Key code for the Enter key." },
  { label: "RETURN", type: "constant", info: "Key code for the Return key." },
  { label: "BACKSPACE", type: "constant", info: "Key code for the Backspace key." },
  { label: "DELETE", type: "constant", info: "Key code for the Delete key." },
  { label: "ESCAPE", type: "constant", info: "Key code for the Escape key." },
  { label: "TAB", type: "constant", info: "Key code for the Tab key." },
  { label: "SHIFT", type: "constant", info: "Key code for the Shift key." },
  { label: "CONTROL", type: "constant", info: "Key code for the Control key." },
  { label: "ALT", type: "constant", info: "Key code for the Alt/Option key." },
];

function p5CompletionSource(context) {
  const word = context.matchBefore(/\w*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;
  return { from: word.from, options: P5_GLOBALS };
}

/**
 * CodeMirror extension that adds p5.js globals to JavaScript autocomplete.
 * Registers completions in the JavaScript language data so they integrate
 * seamlessly with basicSetup's existing autocompletion.
 */
export const p5Completions = javascriptLanguage.data.of({
  autocomplete: p5CompletionSource,
});
