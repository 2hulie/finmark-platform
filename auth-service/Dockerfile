# Use Node.js LTS version

FROM node:18
RUN apt-get update && apt-get install -y netcat-openbsd

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port your service runs on
EXPOSE 5002

# Add wait-for-it.sh script and use it to wait for db before starting
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Wait for db before starting
CMD /wait-for-it.sh db:5432 -- npm start