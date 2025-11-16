


import React from 'react';
import { DashboardCard } from './DashboardCard';
// FIX: Add CodeBracketIcon to imports
import { CodeBracketIcon, InformationCircleIcon } from './icons/Icons';
import type { CreatorDetails } from '../types';
import { Button } from './Button';

const CodeBlock: React.FC<{ children: React.ReactNode, language?: string }> = ({ children, language = 'bash' }) => (
    <pre className={`bg-zinc-900 p-4 rounded-lg border border-zinc-700 text-sm text-gray-200 overflow-x-auto font-mono`}>
        <code className={`language-${language}`}>
            {children}
        </code>
    </pre>
);

const serverJsCode = `
// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- CONFIGURATION ---
const PORT = process.env.PORT || 3001;
const UPLOADS_DIR = 'uploads'; // The folder where files will be stored

// --- INITIALIZE EXPRESS APP ---
const app = express();

// --- MIDDLEWARE ---
// Enable Cross-Origin Resource Sharing for all routes
app.use(cors()); 
// Middleware to parse JSON bodies
app.use(express.json());
// Serve the uploaded files statically, making them accessible via URL
app.use(\`/\${UPLOADS_DIR}\`, express.static(path.join(__dirname, UPLOADS_DIR)));

// --- FILE UPLOAD SETUP (using Multer) ---
// Ensure the uploads directory exists, create it if it doesn't
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// Configure how files are stored
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR); // Save files to the 'uploads' directory
    },
    filename: (req, file, cb) => {
        // Create a unique filename to prevent overwriting existing files
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // Set a 100MB file size limit
});

// --- API ENDPOINTS ---

// The primary file upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    // 'file' in upload.single('file') must match the key in the FormData from the client

    if (!req.file) {
        return res.status(400).send({ error: 'No file was uploaded.' });
    }

    // Construct the public URL for the uploaded file
    // IMPORTANT: This URL must be reachable from the internet.
    // Replace 'http://localhost:3001' with your server's public URL (e.g., your Cloudflare Tunnel URL).
    // You can use an environment variable for this in production.
    const API_BASE_URL = process.env.API_BASE_URL || \`http://localhost:\${PORT}\`;
    const fileUrl = \`\${API_BASE_URL}/\${UPLOADS_DIR}/\${req.file.filename}\`;
    
    // Send the URL back to the client
    res.status(200).send({ url: fileUrl });
});

// A simple health-check endpoint
app.get('/health', (req, res) => {
    res.status(200).send({ status: 'ok', message: 'API server is running.' });
});


// --- START THE SERVER ---
app.listen(PORT, () => {
    console.log(\`✅ Bosjol API Server is running on http://localhost:\${PORT}\`);
    console.log(\`Static files served from: /uploads\`);
});
`;

const packageJsonCode = `
{
  "name": "bosjol-tactical-api-server",
  "version": "1.0.0",
  "description": "A simple Express server for handling file uploads for the Bosjol Tactical Dashboard.",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "author": "JSTYP.me",
  "license": "MIT",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
`;

// FIX: Define the ApiSetupTabProps interface.
interface ApiSetupTabProps {
    creatorDetails: CreatorDetails;
}

export const ApiSetupTab: React.FC<ApiSetupTabProps> = ({ creatorDetails }) => {
    return (
        <DashboardCard title="External API Server Setup" icon={<CodeBracketIcon className="w-6 h-6" />}>
            <div className="p-6 space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">The Concept: Your PC as a Private Cloud</h3>
                    <p className="text-gray-300 mb-3">
                        Have you ever wanted to use a local folder on a dedicated, always-on PC as your global storage for all uploads? This guide shows you exactly how to achieve that.
                    </p>
                    <div className="bg-amber-900/40 border border-amber-700 text-amber-200 p-4 rounded-lg space-y-4">
                        <div>
                            <h4 className="font-bold text-lg flex items-center gap-2"><InformationCircleIcon className="w-5 h-5"/>How It Works (In Simple Terms)</h4>
                            <p className="text-sm mt-1">
                                Web browsers can't directly access local computer folders for security reasons. Instead, we turn your dedicated PC into a secure, private server that the dashboard can talk to.
                            </p>
                            <ol className="list-decimal list-inside text-sm mt-3 space-y-2 pl-2">
                                <li><strong>The PC Becomes a Server:</strong> You'll run a small application (provided in this guide) on your PC. This application is the *only* thing that can read and write to your chosen local folder (e.g., <code className="text-sm bg-zinc-700 p-1 rounded">C:\bosjol-uploads</code>).</li>
                                <li><strong>The Dashboard Communicates with Your Server:</strong> When a user uploads a file, the dashboard sends it securely over the internet to your server application. Your server then saves the file into your local folder. To display a file, the dashboard asks your server for it.</li>
                                <li><strong>Making It Global with a Tunnel:</strong> We use a free and secure service called Cloudflare Tunnels. It creates a public web address that safely "tunnels" into your PC, allowing the dashboard to find your server from anywhere in the world without complex network setup.</li>
                            </ol>
                        </div>
                        <div>
                             <h4 className="font-bold text-lg flex items-center gap-2">Why Do This?</h4>
                              <p className="text-sm mt-1">
                                By default, the dashboard stores files as text inside the database, which has a 1MB size limit. This self-hosted server setup completely <span className="font-bold">bypasses that limit</span>, allowing you to upload large videos, high-resolution images, and long audio files while keeping the files physically stored on your own hardware.
                            </p>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Step 1: Get Server Files</h3>
                     <p className="text-gray-300 mb-3">
                        You need two files to create the server: <code className="text-sm bg-zinc-700 p-1 rounded">server.js</code> (the application logic) and <code className="text-sm bg-zinc-700 p-1 rounded">package.json</code> (the list of dependencies). Create these two files in a new folder on your server PC (e.g., <code className="text-sm bg-zinc-700 p-1 rounded">C:\bosjol-api-server</code>) and copy the contents below into them.
                    </p>
                     <CodeBlock language="json">
                        {packageJsonCode}
                    </CodeBlock>
                    <CodeBlock language="javascript">
                        {serverJsCode}
                    </CodeBlock>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Step 2: Server Environment Prerequisites</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                        <li>A server environment (a VPS from providers like DigitalOcean/Vultr, a home server, or a Raspberry Pi).</li>
                        <li><a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Node.js</a> (version 18 or newer) installed on your server.</li>
                        <li>A process manager like <a href="https://pm2.keymetrics.io/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">PM2</a> to keep the server running reliably. Install it globally with: <code className="text-sm bg-zinc-700 p-1 rounded">npm install pm2 -g</code></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Step 3: Server Project Setup</h3>
                    <p className="text-gray-300 mb-2">Navigate into the folder you created with your terminal and install the required dependencies.</p>
                    <CodeBlock language="bash">
                        {`# Navigate to the project folder you created
cd C:\\bosjol-api-server

# Install all dependencies listed in package.json
npm install`}
                    </CodeBlock>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Step 4: Running the Server with PM2</h3>
                    <p className="text-gray-300 mb-2">Start the server using PM2. This runs it in the background, monitors it, and restarts it automatically if it crashes or the server reboots.</p>
                    <CodeBlock language="bash">
                        {`# Start the server and give it a name
pm2 start server.js --name "bosjol-api"

# Save the current process list to run on startup
pm2 save

# To monitor logs
pm2 logs bosjol-api`}
                    </CodeBlock>
                    <p className="text-gray-300 my-2">Your server is now running locally on your machine, typically on port 3001.</p>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Step 5: Expose to the Internet (Cloudflare Tunnels)</h3>
                    <p className="text-gray-300 mb-2">To make your local server securely accessible from the dashboard, the recommended method is using a free Cloudflare Tunnel. This avoids complex router configuration and is more secure.</p>
                    <ul className="list-decimal list-inside text-gray-300 space-y-2 pl-4">
                        <li>Follow the <a href="https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Cloudflare Tunnels Quickstart Guide</a> to install <code className="text-sm bg-zinc-700 p-1 rounded">cloudflared</code> and log in.</li>
                        <li>Run the tunnel command pointing to your local server's port. This creates a secure, public URL.</li>
                         <CodeBlock language="bash">cloudflared tunnel --url http://localhost:3001</CodeBlock>
                        <li>Cloudflare will output a public URL (e.g., <code className="text-sm bg-zinc-700 p-1 rounded">https://your-random-name.trycloudflare.com</code>). **Copy this URL.**</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Step 6: Final Configuration</h3>
                     <p className="text-gray-300 mb-2">Go to the main <span className="font-bold">'Settings'</span> tab in this dashboard. Paste the public URL you copied from Cloudflare into the <span className="font-bold">'API Server URL'</span> field and click 'Save All Settings'. The app will now automatically use your self-hosted server for all new file uploads.</p>
                </div>
                 <div className="mt-6 pt-6 border-t border-zinc-800">
                    <h3 className="text-xl font-bold text-red-400 mb-2">Dashboard Source Code</h3>
                     <p className="text-gray-300 mb-3">
                        The full source code for this dashboard application is available on GitHub.
                    </p>
                    <a href={creatorDetails.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Button>
                            <CodeBracketIcon className="w-5 h-5 mr-2" />
                            View Dashboard Source on GitHub
                        </Button>
                    </a>
                </div>
            </div>
        </DashboardCard>
    );
};