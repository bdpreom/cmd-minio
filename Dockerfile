# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy the .env file to the working directory
COPY .env .env

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["node", "app.js"]
