const { generateThumbnail } = require('./lib/index.js');

const thumbnailPath = generateThumbnail('./lib/index.js');

console.log(thumbnailPath);