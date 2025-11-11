# Mosaic Wall

A web application that allows users to take selfies and add them to a shared mosaic wall. Built with Node.js, Express, and vanilla JavaScript.

## 🚀 Deployment

This application is configured for easy deployment on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fmoisac-wall&project-name=moisac-wall&repository-name=moisac-wall)

### Manual Deployment

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=production
```

## 📦 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/moisac-wall.git
   cd moisac-wall
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

The application is pre-configured for Vercel deployment. The `vercel.json` file includes:

- Build configuration for Node.js
- Route handling for API and static files
- Proper routing for single-page applications

## Features

- Take photos using your device's camera
- Preview and retake photos before uploading
- View all uploaded photos in a responsive mosaic grid
- Clean, mobile-friendly interface
- Error handling for camera access and uploads

## Prerequisites

- Node.js (v14 or later)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd moisac-wall
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the server:
   ```bash
   npm start
   ```
   or for development with auto-reload:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Project Structure

- `server.js` - Main server file with Express setup and routes
- `public/` - Static files
  - `index.html` - Main camera interface
  - `dashboard.html` - Mosaic wall view
  - `script.js` - Client-side JavaScript
  - `uploads/` - Directory where uploaded images are stored (created automatically)

## How It Works

1. The application uses the device's camera to capture photos
2. Photos are converted to base64 and sent to the server
3. The server saves photos to the filesystem
4. The dashboard displays all uploaded photos in a responsive grid

## Security Notes

- The application runs on your local machine by default
- For production use, consider adding:
  - User authentication
  - File type validation
  - Rate limiting
  - Image compression
  - Secure file storage

## License

This project is open source and available under the MIT License.
