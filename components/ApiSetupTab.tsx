import React from 'react';
import { DashboardCard } from './DashboardCard';
import { CodeBracketIcon, InformationCircleIcon } from './icons/Icons';

const CodeBlock: React.FC<{ children: React.ReactNode, language?: string }> = ({ children, language = 'bash' }) => (
    <pre className={`bg-zinc-900 p-4 rounded-lg border border-zinc-700 text-sm text-gray-200 overflow-x-auto font-mono`}>
        <code className={`language-${language}`}>
            {children}
        </code>
    </pre>
);

const serverJsCode = `
// --- Bosjol Tactical API Server ---
// This server handles file uploads and can be extended to manage all database interactions.

// --- Import Required Packages ---
const express = require('express');
const cors = require('cors'); // Allows your dashboard to talk to this server
const multer = require('multer'); // Handles file uploads
const path = require('path'); // Works with file paths
const fs = require('fs'); // Works with the file system
const admin = require('firebase-admin'); // Firebase's toolkit for servers
const checkDiskSpace = require('check-disk-space').default; // Checks server storage

// --- 1. CONFIGURATION ---
const PORT = process.env.PORT || 3001;
const UPLOADS_DIR = 'uploads'; // The folder where files will be stored

// --- 2. FIREBASE ADMIN SDK SETUP ---
// IMPORTANT: Download this file from your Firebase Console.
// Go to Project Settings > Service accounts > Generate new private key.
// Rename the downloaded file to 'serviceAccountKey.json' and place it in the same folder as this server.js file.
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

// --- 3. MIDDLEWARE SETUP ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Allow server to understand JSON data
// Serve the uploaded files so they can be accessed via a URL
app.use(\`/\${UPLOADS_DIR}\`, express.static(path.join(__dirname, UPLOADS_DIR)));

// --- 4. FILE UPLOAD LOGIC (using Multer) ---
// Ensure the 'uploads' directory exists, if not, create it.
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// Define how files are stored on disk
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        // Create a unique filename (e.g., file-1678886400000-123456789.jpg)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- 5. API ENDPOINTS ---

// Endpoint for the dashboard to send files to
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: 'No file uploaded.' });
    }
    // IMPORTANT: This URL must be your server's PUBLIC address.
    // e.g., your Cloudflare Tunnel URL or public server IP.
    // You can set this as an environment variable for production.
    const API_BASE_URL = process.env.API_BASE_URL || \`http://localhost:\${PORT}\`;
    const fileUrl = \`\${API_BASE_URL}/\${UPLOADS_DIR}/\${req.file.filename}\`;
    
    // Send the public URL back to the dashboard
    res.status(200).send({ url: fileUrl });
});

// Endpoint for the dashboard to check server storage space
app.get('/storage-info', async (req, res) => {
    try {
        // Checks the disk space of the server's main drive.
        const diskSpace = await checkDiskSpace('/'); 
        res.status(200).json(diskSpace);
    } catch (error) {
        res.status(500).send({ error: 'Failed to get disk space information.', details: error.message });
    }
});


// --- 6. START THE SERVER ---
app.listen(PORT, () => {
    console.log(\`Bosjol API Server is running on http://localhost:\${PORT}\`);
});
`;

export const ApiSetupTab: React.FC = () => {
    return (
        <DashboardCard title="External API Server Setup" icon={<CodeBracketIcon className="w-6 h-6" />}>
            <div className="p-4 space-y-8">
                <div className="bg-amber-900/40 border border-amber-700 text-amber-200 p-4 rounded-lg">
                    <h4 className="font-bold text-lg flex items-center gap-2"><InformationCircleIcon className="w-5 h-5"/>What Is This & Why Should I Use It?</h4>
                    <p className="text-sm mt-2">
                        Firebase (our database) has a 1MB size limit for any single piece of data. This means uploading large files like videos, audio, or high-resolution images can cause "Permission Denied" or other saving errors.
                    </p>
                    <p className="text-sm mt-2">
                        This guide helps you set up a separate, optional "API Server" on your own computer or a hosting service. When configured, the dashboard sends all large files to this server instead of trying to save them in the database. This completely solves the file size limit and is the recommended setup for advanced users.
                    </p>
                </div>
                
                <div>
                    <h3 className="text-2xl font-bold text-red-400 mb-3">Step 1: Get Your Tools Ready</h3>
                    <p className="text-gray-300 mb-2">You'll need a couple of free tools installed on the computer where you'll run the server.</p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 pl-2">
                        <li>
                            <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline font-bold">Node.js</a>: A program that lets you run JavaScript code outside of a web browser. Download and install the "LTS" version.
                        </li>
                        <li>
                            <a href="https://pm2.keymetrics.io/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline font-bold">PM2</a>: A process manager. This is a small tool that keeps your server running 24/7 and automatically restarts it if it crashes. After installing Node.js, open your terminal or command prompt and run this command:
                             <CodeBlock language="bash">{`npm install pm2 -g`}</CodeBlock>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-red-400 mb-3">Step 2: Create the Server Project</h3>
                    <p className="text-gray-300 mb-2">Open your terminal or command prompt and run these commands one by one. This will create a folder for your server and install the necessary code packages.</p>
                    <CodeBlock language="bash">
                        {`# 1. Create a new folder for your project and move into it
mkdir bosjol-api
cd bosjol-api

# 2. Initialize a new Node.js project (creates a package.json file)
npm init -y

# 3. Install the required packages for the server
npm install express cors multer firebase-admin check-disk-space`}
                    </CodeBlock>
                </div>
                
                <div>
                    <h3 className="text-2xl font-bold text-red-400 mb-3">Step 3: Get Your Firebase Admin Key</h3>
                    <p className="text-gray-300 mb-2">Your server needs a special key to securely communicate with your Firebase database. This is different from the keys used in the dashboard app itself.</p>
                    <ol className="list-decimal list-inside text-gray-300 space-y-2 pl-2">
                        <li>Go to your <span className="font-bold">Firebase Console</span>.</li>
                        <li>Click the gear icon next to "Project Overview" and select <span className="font-bold">Project settings</span>.</li>
                        <li>Go to the <span className="font-bold">Service accounts</span> tab.</li>
                        <li>Click the <span className="font-bold">"Generate new private key"</span> button. A warning will appear; confirm by clicking "Generate key".</li>
                        <li>A JSON file will download. <strong className="text-amber-300">This file is highly sensitive! Do not share it or commit it to a public GitHub repository.</strong></li>
                        <li>Rename the downloaded file to exactly <code className="text-sm bg-zinc-700 p-1 rounded">serviceAccountKey.json</code> and place it inside your <code className="text-sm bg-zinc-700 p-1 rounded">bosjol-api</code> folder.</li>
                    </ol>
                </div>

                 <div>
                    <h3 className="text-2xl font-bold text-red-400 mb-3">Step 4: Create the Server File</h3>
                    <p className="text-gray-300 mb-2">Create a new file named <code className="text-sm bg-zinc-700 p-1 rounded">server.js</code> in your <code className="text-sm bg-zinc-700 p-1 rounded">bosjol-api</code> folder. Copy and paste the complete code block below into it.</p>
                    <CodeBlock language="javascript">
                        {serverJsCode}
                    </CodeBlock>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-red-400 mb-3">Step 5: Run Your Server</h3>
                    <p className="text-gray-300 mb-2">In your terminal (while inside the `bosjol-api` folder), start the server using PM2.</p>
                    <CodeBlock language="bash">
                        pm2 start server.js --name "bosjol-api"
                    </CodeBlock>
                    <p className="text-gray-300 my-2">Your server is now running! You can check its status with <code className="text-sm bg-zinc-700 p-1 rounded">pm2 list</code> or view its logs with <code className="text-sm bg-zinc-700 p-1 rounded">pm2 logs bosjol-api</code>.</p>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-red-400 mb-3">Step 6: Expose Server to the Internet (Cloudflare Tunnels)</h3>
                    <p className="text-gray-300 mb-2">Your server is only running on your local machine. To connect it to the dashboard, you need a public URL. The easiest and most secure way to do this is with a free Cloudflare Tunnel.</p>
                     <ol className="list-decimal list-inside text-gray-300 space-y-2 pl-4">
                        <li>Follow the <a href="https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Cloudflare Tunnels Quickstart Guide</a> to install `cloudflared` and log in.</li>
                        <li>Run the tunnel command, pointing it to your local server's port (3001):
                            <CodeBlock>{`cloudflared tunnel --url http://localhost:3001`}</CodeBlock>
                        </li>
                        <li>Cloudflare will give you a public URL that looks something like <code className="text-sm bg-zinc-700 p-1 rounded">https://random-words.trycloudflare.com</code>. <strong className="text-amber-300">This is your public API Server URL.</strong> Keep it safe!</li>
                    </ol>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-red-400 mb-3">Step 7: Connect the Dashboard</h3>
                     <p className="text-gray-300 mb-2">Finally, tell your dashboard where to find your new server.</p>
                     <ol className="list-decimal list-inside text-gray-300 space-y-2 pl-4">
                        <li>Go to the <span className="font-bold">"Settings"</span> tab in this admin dashboard.</li>
                        <li>Find the <span className="font-bold">"External API Server"</span> section.</li>
                        <li>Paste your public Cloudflare Tunnel URL into the "API Server URL" input field.</li>
                        <li>Click the <span className="font-bold">"Connect & Migrate"</span> button. This will save the URL and prepare the app to use your server for file uploads.</li>
                    </ol>
                </div>
            </div>
        </DashboardCard>
    );
};