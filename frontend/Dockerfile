FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Vite Port
EXPOSE 5173

# Change permissions to non-root user for security (optional but best practice)
# Use the development server and bind to 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
