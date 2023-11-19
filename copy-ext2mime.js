const fs = require('fs');
const path = require('path');

const sourceFilePath = './ext2mime.json';
const destinationFilePath = './lib/ext2mime.json';

fs.copyFile(sourceFilePath, destinationFilePath, (err) => {
    if (err) {
        console.error('Error copying file:', err);
    } else {
        console.log('File copied successfully!');
    }
});
