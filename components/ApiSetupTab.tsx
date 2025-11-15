import React from 'react';
import { DashboardCard } from './DashboardCard';
// FIX: Add CodeBracketIcon to imports
import { CodeBracketIcon, InformationCircleIcon } from './icons/Icons';
import { CreatorDetails } from '../types';
import { Button } from './Button';

interface ApiSetupTabProps {
    creatorDetails: CreatorDetails;
}

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

export const ApiSetupTab: React.FC<ApiSetupTabProps> = ({ creatorDetails }) => {
    return (
        <DashboardCard title="External API Server Setup" icon={<CodeBracketIcon className="w-6 h-6" />}>
            <div className="p-6 space-y-6">
                <div className="bg-amber-900/40 border border-amber-700 text-amber-200 p-4 rounded-lg">
                    <h4 className="font-bold text-lg flex items-center gap-2"><InformationCircleIcon className="w-5 h-5"/>Why Set This Up?</h4>
                    <p className="text-sm mt-1">
                        By default, this dashboard uses Firebase Storage for file uploads, which is reliable but has limitations and costs. For advanced users who want full control over their data, a self-hosted API server is the solution. It completely bypasses Firebase's 1MB document size limit, allowing you to upload large videos, audio, and high-res images without errors. This guide provides a simple Node.js Express server to handle these uploads.
                    </p>
                </div>
                
                <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Step 1: Download Server Source Code</h3>
                     <p className="text-gray-300 mb-3">
                        The complete, ready-to-run Node.js server is available on GitHub. Click the button below to go to the repository, then download the code as a ZIP file.
                    </p>
                    <a href={creatorDetails.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Button>
                            <CodeBracketIcon className="w-5 h-5 mr-2" />
                            Download Server Source from GitHub
                        </Button>
                    </a>
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
                    <p className="text-gray-300 mb-2">Unzip the downloaded source code folder onto your server. Navigate into the folder with your terminal and install the required dependencies.</p>
                    <CodeBlock language="bash">
                        {`# Navigate to the project folder you unzipped
cd bosjol-tactical-api-server

# Install all dependencies listed in package.json
npm install`}
                    </CodeBlock>
                </div>
                
                 <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Step 4: Server Code Overview</h3>
                    <p className="text-gray-300 mb-2">The main logic is in <code className="text-sm bg-zinc-700 p-1 rounded">server.js</code>. Here is the complete code with explanations. You don't need to change anything unless you want to customize it.</p>
                    <CodeBlock language="javascript">
                        {serverJsCode}
                    </CodeBlock>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Step 5: Running the Server with PM2</h3>
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
                    <h3 className="text-xl font-bold text-red-400 mb-2">Step 6: Expose to the Internet (Cloudflare Tunnels)</h3>
                    <p className="text-gray-300 mb-2">To make your local server securely accessible from the dashboard, the recommended method is using a free Cloudflare Tunnel. This avoids complex router configuration and is more secure.</p>
                    <ul className="list-decimal list-inside text-gray-300 space-y-2 pl-4">
                        <li>Follow the <a href="https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Cloudflare Tunnels Quickstart Guide</a> to install <code className="text-sm bg-zinc-700 p-1 rounded">cloudflared</code> and log in.</li>
                        <li>Run the tunnel command pointing to your local server's port. This creates a secure, public URL.</li>
                         <CodeBlock language="bash">cloudflared tunnel --url http://localhost:3001</CodeBlock>
                        <li>Cloudflare will output a public URL (e.g., <code className="text-sm bg-zinc-700 p-1 rounded">https://your-random-name.trycloudflare.com</code>). **Copy this URL.**</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Step 7: Final Configuration</h3>
                     <p className="text-gray-300 mb-2">Go to the main <span className="font-bold">'Settings'</span> tab in this dashboard. Paste the public URL you copied from Cloudflare into the <span className="font-bold">'API Server URL'</span> field and click 'Save All Settings'. The app will now automatically use your self-hosted server for all new file uploads.</p>
                </div>
            </div>
        </DashboardCard>
    );
};