# ✅ Use the latest LTS version of Node.js with a lightweight Alpine Linux image
FROM node:lts-alpine

# ✅ Set the working directory inside the container to /app
WORKDIR /app

COPY package*.json ./

COPY client/package*.json client/
# ✅ Install only production dependencies to keep the image lean
RUN npm run install-client 

COPY server/package*.json server/
RUN npm run install-server --omit=dev

# ✅ Run the frontend build command from the client folder
COPY client/ client/
RUN npm run build --prefix client

COPY server/ server/


# ✅ Switch to a non-root user (best practice for security)
USER node

# ✅ Run the server using the npm start script located in the server directory
# basically use command in different form (Array of string (exec form))
CMD ["npm", "start", "--prefix", "server"]

# ✅ Expose port 8000 to allow outside access to the app (useful in deployment)
EXPOSE 8000