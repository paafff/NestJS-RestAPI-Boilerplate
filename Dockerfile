# Gunakan image Node.js sebagai base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Rebuild native modules
RUN npm rebuild bcrypt --build-from-source

# Copy seluruh kode aplikasi
COPY . .

# Expose port yang digunakan aplikasi
EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "run", "clean:run"]