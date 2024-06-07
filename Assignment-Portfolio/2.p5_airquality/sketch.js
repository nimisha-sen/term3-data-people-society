let data;
let currentIndex = 0;
let blobs = [];
let colorsPalette;

function preload() {
  // Load the CSV data file
  data = loadTable('data.csv', 'csv', 'header');
}

function setup() {
  createCanvas(700, 700);
  frameRate(2); // Set to 1 frame per second to loop through data slowly
  
  // Define colors for the blobs with 20% opacity
  colorsPalette = [
    color(255, 0, 0, 51), // Red
    color(0, 255, 0, 51), // Green
    color(0, 0, 255, 51), // Blue
    color(255, 255, 0, 51) // Yellow
  ];

  // Initialize blobs with different pm values
  blobs.push(new Organic(65, width / 2, height / 2, 100, colorsPalette[0], 'pm003'));
  blobs.push(new Organic(70, width / 2, height / 2, 120, colorsPalette[1], 'pm01'));
  blobs.push(new Organic(75, width / 2, height / 2, 140, colorsPalette[2], 'pm02'));
  blobs.push(new Organic(80, width / 2, height / 2, 160, colorsPalette[3], 'pm10'));
}

function draw() {
  // Get current values from the data
  let temp = data.getNum(currentIndex, 'temp');
  let hum = data.getNum(currentIndex, 'hum');
  let pm003 = data.getNum(currentIndex, 'pm003');
  let pm01 = data.getNum(currentIndex, 'pm01');
  let pm02 = data.getNum(currentIndex, 'pm02');
  let pm10 = data.getNum(currentIndex, 'pm10');
  
  // Map temperature to a pale yellow background
  background(map(temp, 19, 20, 255, 240), 240, 190);

  // Add graininess to the background based on humidity
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let grain = random(-hum / 10, hum / 10); // Graininess based on humidity
    pixels[i] += grain; // Red
    pixels[i + 1] += grain; // Green
    pixels[i + 2] += grain; // Blue
  }
  updatePixels();

  // Draw the index at the top
  drawIndex(temp, hum, pm003, pm01, pm02, pm10);

  // Update and display each blob
  for (let blob of blobs) {
    let value = data.getNum(currentIndex, blob.pmValue);
    if (value >= 0) { // Avoiding negative values
      blob.radius = map(value, 0, 3500, 50, 300); // Adjust mapping as needed
    }
    blob.show();
  }

  // Increment the index to loop through the data
  currentIndex = (currentIndex + 1) % data.getRowCount();
}

function drawIndex(temp, hum, pm003, pm01, pm02, pm10) {
  fill(0);
  noStroke();
  textSize(14);
  textAlign(LEFT, TOP);
  text(`Temp: ${temp} | Hum: ${hum} | PM003: ${pm003} | PM01: ${pm01} | PM02: ${pm02} | PM10: ${pm10}`, 10, 10);
}

class Organic {
  constructor(radius, xpos, ypos, roughness, color, pmValue) {
    this.radius = radius; // radius of blob
    this.xpos = xpos; // x position of blob
    this.ypos = ypos; // y position of blob
    this.roughness = roughness * 0.5; // decrease the roughness by half
    this.color = color; // color of the blob
    this.pmValue = pmValue; // pm value field name
  }

  show() {
    noStroke();
    fill(this.color);

    push(); // Enclose transformations
    translate(this.xpos, this.ypos);
    rotate(frameCount * 0.5); // Rotate slowly over time
    beginShape(); // Begin a shape based on vertex points

    let off = 0;
    for (let i = 0; i < TWO_PI; i += 0.1) {
      // Increase roughness for a more cloud-like appearance
      let offset = map(noise(off, frameCount * 0.01), 0, 1, -this.roughness, this.roughness);
      let r = this.radius + offset;
      let x = r * cos(i);
      let y = r * sin(i);
      vertex(x, y);
      off += 0.15; // Increase noise increment for more variation
    }

    endShape(CLOSE); // End and create the shape
    pop();
  }
}
