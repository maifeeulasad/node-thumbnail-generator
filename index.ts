import * as fs from 'fs';
import { execSync } from 'child_process';
import * as path from 'path';

const ASSETS_DIRECTORY = './assets';
// ref: https://en.wikipedia.org/wiki/Help:Pictures#Thumbnail-sizes
const DEFAULT_THUMBNAIL_SIZE = 220;
const DEFAULT_THUMBNAIL_QUALITY = 100;

const constractImageCommand
  = (width: number, height: number): string =>
    `-geometry ${height} -extent ${width}X${height}`

const fileExtensionToMimeType = (extention: string): string => {
  const mimedb = JSON.parse(fs.readFileSync('./ext2mime.json', 'utf8'));
  return mimedb[extention];
}

const fileExtensionToFileType = (extention: string): string => {
  const mime = fileExtensionToMimeType(extention)
  return mime.split('/')[0];
}

const filePathToExtension
  = (filePath: string): string =>
    path.extname(filePath).slice(1);

const checkFileExists = (filePath: string): boolean => fs.existsSync(filePath)

const generateRandomFileName = (): string => `${Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000}`

const createDirectory = (directoryPath: string): void => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
    console.log(`Directory created: ${directoryPath}`);
  } else {
    console.log(`Directory already exists: ${directoryPath}`);
  }
};

const generatePdfUsingUnoConv = (input: string): string => {
  const tmpPath = `./${generateRandomFileName()}.pdf`;
  const pdfCommand = `unoconv -e PageRange=1 -o ${tmpPath} ${input}`;
  execSync(pdfCommand);

  return tmpPath;
}

const generateVideoThumbnail = (input: string, output: string) => {
  const command = `ffmpeg -y -i ${input} -vf thumbnail -frames:v 1 ${output}`;
  execSync(command);
}

const generateImageThumbnail = (input: string, output: string, options: Options) => {
  const { width, height, quality } = options;

  const command = `convert -quality ${quality} ${constractImageCommand(width, height)} -colorspace RGB ${input} ${output}`;
  execSync(command);
}

const generateUniversalThumbnail = (input: string, output: string, options: Options) => {
  const { width, height, quality } = options;

  const command = `convert -quality ${quality} ${constractImageCommand(width, height)} -colorspace RGB ${generatePdfUsingUnoConv(input)} ${output}`;
  execSync(command);
}

const generateGenericThumbnail = (inputExtension: string, input: string, output: string, options: Options) => {
  const fileType = fileExtensionToFileType(inputExtension);

  if (fileType === 'video') {
    generateVideoThumbnail(input, output);
  } else if (fileType === 'image') {
    generateImageThumbnail(input, output, options);
  } else {
    generateUniversalThumbnail(input, output, options);
  }
}

interface Options {
  width: number;
  height: number;
  quality: number;
}

const DEFAULT_OPTIONS: Options = {
  width: DEFAULT_THUMBNAIL_SIZE,
  height: DEFAULT_THUMBNAIL_SIZE,
  quality: DEFAULT_THUMBNAIL_QUALITY
}

const generateThumbnail
  = (input: string, options: Options = DEFAULT_OPTIONS)
    : (string | undefined) => {

    options = { ...options, ...DEFAULT_OPTIONS };

    if (!checkFileExists(input)) {
      return undefined;
    }

    createDirectory(ASSETS_DIRECTORY);
    const output = `${ASSETS_DIRECTORY}/${generateRandomFileName()}.png`;

    const inputExtension = filePathToExtension(input);

    try {
      generateGenericThumbnail(inputExtension, input, output, options);
      
      return output;
    } catch (error) {
      console.error('Error:', error);
      return undefined;
    }
  }

export { generateThumbnail };
