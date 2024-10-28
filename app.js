require('dotenv').config();
const Minio = require('minio');
const fs = require('fs');
const readline = require('readline');

// Initialize client
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: 9000, // Change if your MinIO server uses a different port
    useSSL: false, // Set to false if not using SSL
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

// Function to upload a file
async function uploadFile(filePath) {
    const bucketName = process.env.MINIO_BUCKET;
    const objectName = filePath.split('/').pop(); // filename as the object name

    try {
        // Check if bucket exists, create if not
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`Bucket "${bucketName}" created.`);
        }

        // Upload the file
        await minioClient.fPutObject(bucketName, objectName, filePath);
        console.log(`File "${filePath}" uploaded successfully as "${objectName}" in bucket "${bucketName}".`);
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}

// Function to download a file 
async function downloadFile(objectName) {
    const bucketName = process.env.MINIO_BUCKET;
    const localFilePath = `./downloaded_${objectName}`;

    try {
        const stream = await minioClient.getObject(bucketName, objectName);
        const writeStream = fs.createWriteStream(localFilePath);
        stream.pipe(writeStream);

        writeStream.on('finish', () => {
            console.log(`File "${objectName}" downloaded successfully as "${localFilePath}".`);
        });
        
        writeStream.on('error', (error) => {
            console.error('Error downloading file:', error);
        });
    } catch (error) {
        console.error('Error fetching object:', error);
    }
}

// Function to handle user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function promptUser() {
    rl.question('Enter command (upload <file-path> | download <object-name> | exit): ', (input) => {
        const args = input.split(' ');
        
        if (args[0] === 'upload' && args[1]) {
            uploadFile(args[1]);
        } else if (args[0] === 'download' && args[1]) {
            downloadFile(args[1]);
        } else if (args[0] === 'exit') {
            console.log('Exiting...');
            rl.close();
            return;
        } else {
            console.log('Invalid command. Usage: upload <file-path> | download <object-name> | exit');
        }
        
        // Prompt again after handling the command
        promptUser();
    });
}

// Start the user prompt
promptUser();