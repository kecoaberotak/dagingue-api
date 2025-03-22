# Menggunakan Node.js versi terbaru sebagai base image
FROM node:18

# Menentukan working directory di dalam container
WORKDIR /app

# Menyalin package.json dan package-lock.json terlebih dahulu
COPY package*.json ./

# Menginstal dependencies
RUN npm install

# Menyalin semua file proyek ke dalam container
COPY . .

# Build TypeScript ke JavaScript
RUN npm run build

# Menentukan perintah yang akan dijalankan saat container dimulai
CMD ["node", "dist/index.js"]
