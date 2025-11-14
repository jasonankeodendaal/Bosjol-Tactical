import React from 'react';
import { DashboardCard } from './DashboardCard';
// FIX: Add CodeBracketIcon to imports
import { CodeBracketIcon, InformationCircleIcon } from './icons/Icons';

const CodeBlock: React.FC<{ children: React.ReactNode, language?: string }> = ({ children, language = 'bash' }) => (
    <pre className={`bg-zinc-900 p-4 rounded-lg border border-zinc-700 text-sm text-gray-200 overflow-x-auto font-mono`}>
        <code className={`language-${language}`}>
            {children}
        </code>
    </pre>
);

const serverJsCode = `
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const checkDiskSpace = require('check-disk-space').default;

// --- CONFIGURATION ---
const PORT = process.env.PORT || 3001;
const UPLOADS_DIR = 'uploads';

// --- FIREBASE ADMIN SDK SETUP ---
// IMPORTANT: Download your service account key from Firebase Console
// Project Settings > Service accounts > Generate new private key
// Save it as 'serviceAccountKey.json' in the same directory as this server file.
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
// Serve the uploaded files statically
app.use(\`/\${UPLOADS_DIR}\`, express.static(path.join(__dirname, UPLOADS_DIR)));

// --- FILE UPLOAD SETUP (Multer) ---
// Ensure the uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        // Create a unique filename to prevent overwrites
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- API ENDPOINTS ---

// 1. File Upload Endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: 'No file uploaded.' });
    }
    // IMPORTANT: Replace 'http://localhost:3001' with your server's public URL
    // This will likely be your Cloudflare Tunnel URL or public server IP.
    const API_BASE_URL = process.env.API_BASE_URL || \`http://localhost:\${PORT}\`;
    const fileUrl = \`\${API_BASE_URL}/\${UPLOADS_DIR}/\${req.file.filename}\`;
    res.status(200).send({ url: fileUrl });
});

// 2. Storage Info Endpoint
app.get('/storage-info', async (req, res) => {
    try {
        const diskSpace = await checkDiskSpace('/'); // Check root disk. Adjust path if needed.
        res.status(200).json(diskSpace);
    } catch (error) {
        res.status(500).send({ error: 'Failed to get disk space information.', details: error.message });
    }
});

// 3. Generic Firestore Endpoints
const createFirestoreEndpoints = (collectionName) => {
    // GET all documents
    app.get(\`/\${collectionName}\`, async (req, res) => {
        try {
            const snapshot = await db.collection(collectionName).get();
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.status(200).json(items);
        } catch (error) {
            res.status(500).send({ error: \`Failed to fetch \${collectionName}\`, details: error.message });
        }
    });

    // POST a new document
    app.post(\`/\${collectionName}\`, async (req, res) => {
        try {
            const newData = req.body;
            const docRef = await db.collection(collectionName).add(newData);
            res.status(201).send({ id: docRef.id, ...newData });
        } catch (error) {
            res.status(500).send({ error: \`Failed to create new item in \${collectionName}\`, details: error.message });
        }
    });
    
    // PUT (update) a document
    app.put(\`/\${collectionName}/:id\`, async (req, res) => {
        try {
            const { id } = req.params;
            const updatedData = req.body;
            await db.collection(collectionName).doc(id).set(updatedData, { merge: true });
            res.status(200).send({ id, ...updatedData });
        } catch (error) {
            res.status(500).send({ error: \`Failed to update item in \${collectionName}\`, details: error.message });
        }
    });
    
    // DELETE a document
    app.delete(\`/\${collectionName}/:id\`, async (req, res) => {
        try {
            const { id } = req.params;
            await db.collection(collectionName).doc(id).delete();
            res.status(204).send();
        } catch (error) {
            res.status(500).send({ error: \`Failed to delete item from \${collectionName}\`, details: error.message });
        }
    });
};

// Create endpoints for all your collections
[
    'players', 'events', 'ranks', 'badges', 'legendaryBadges',
    'gamificationSettings', 'sponsors', 'vouchers', 'inventory',
    'suppliers', 'transactions', 'locations', 'raffles',
    'socialLinks', 'carouselMedia'
].forEach(createFirestoreEndpoints);

// Special endpoint for single-document settings
app.get('/settings/:docId', async (req, res) => {
    try {
        const { docId } = req.params;
        const doc = await db.collection('settings').doc(docId).get();
        if (!doc.exists) return res.status(404).send({ error: 'Setting not found' });
        res.status(200).json({ ...doc.data() });
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch settings', details: error.message });
    }
});

app.put('/settings/:docId', async (req, res) => {
    try {
        const { docId } = req.params;
        await db.collection('settings').doc(docId).set(req.body, { merge: true });
        res.status(200).send({ ...req.body });
    } catch (error) {
        res.status(500).send({ error: 'Failed to update settings', details: error.message });
    }
});


// --- START SERVER ---
app.listen(PORT, () => {
    console.log(\`Server is running on http://localhost:\${PORT}\`);
});
`;

export const ApiSetupTab: React.FC = () => {
    return (
        <DashboardCard title="External API Server Setup" icon={<CodeBracketIcon className="w-6 h-6" />}>
            <div className="p-6 space-y-6">
                <div className="bg-amber-900/40 border border-amber-700 text-amber-200 p-4 rounded-lg">
                    <h4 className="font-bold text-lg flex items-center gap-2"><InformationCircleIcon className="w-5 h-5"/>Why Set This Up?</h4>
                    <p className="text-sm mt-1">
                        Firebase has a 1MB limit for individual database documents. Uploading large files like videos, audio, or high-resolution images directly into the settings can cause save errors. This optional API server acts as a middleman. All file uploads are sent to your server, which stores them and tells the dashboard the URL. This completely solves the file size limit and is the recommended setup for advanced users.
                    </p>
                </div>
                
                <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Step 1: Prerequisites</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                        <li>A server environment (like a VPS, Raspberry Pi, or even your local machine for testing).</li>
                        <li><a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Node.js</a> installed on your server.</li>
                        <li>A process manager like <a href="https://pm2.keymetrics.io/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">PM2</a> to keep the server running. Install with: <code className="text-sm bg-zinc-700 p-1 rounded">npm install pm2 -g</code></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Step 2: Server Project Setup</h3>
                    <p className="text-gray-300 mb-2">Create a new folder on your server and initialize a Node.js project.</p>
                    <CodeBlock language="bash">
                        {`mkdir bosjol-api
cd bosjol-api
npm init -y`}
                    </CodeBlock>
                    <p className="text-gray-300 my-2">Install the required dependencies:</p>
                    <CodeBlock language="bash">
                        npm install express cors multer firebase-admin check-disk-space
                    </CodeBlock>
                </div>
                
                <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Step 3: Firebase Service Account</h3>
                    <p className="text-gray-300 mb-2">The server needs permission to access your Firebase project. Go to your <span className="font-bold">Firebase Console &gt; Project Settings &gt; Service accounts</span>. Click "Generate new private key". This will download a JSON file. Rename this file to <code className="text-sm bg-zinc-700 p-1 rounded">serviceAccountKey.json</code> and place it in your <code className="text-sm bg-zinc-700 p-1 rounded">bosjol-api</code> folder.</p>
                </div>

                 <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Step 4: Server Code</h3>
                    <p className="text-gray-300 mb-2">Create a file named <code className="text-sm bg-zinc-700 p-1 rounded">server.js</code> in your <code className="text-sm bg-zinc-700 p-1 rounded">bosjol-api</code> folder and paste the following code into it. This code sets up all necessary endpoints for both file uploads and database management.</p>
                    <CodeBlock language="javascript">
                        {serverJsCode}
                    </CodeBlock>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Step 5: Running the Server</h3>
                    <p className="text-gray-300 mb-2">Start the server using PM2. This will ensure it runs in the background and restarts automatically if it crashes.</p>
                    <CodeBlock language="bash">
                        pm2 start server.js --name "bosjol-api"
                    </CodeBlock>
                    <p className="text-gray-300 my-2">Your server is now running locally on your machine, typically on port 3001.</p>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Step 6: Expose to the Internet (Recommended: Cloudflare Tunnels)</h3>
                    <p className="text-gray-300 mb-2">To make your local server accessible from anywhere, you can use a service like Cloudflare Tunnels (which is free). This is more secure than opening ports on your router.</p>
                    <ul className="list-decimal list-inside text-gray-300 space-y-2 pl-4">
                        <li>Follow the <a href="https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Cloudflare Tunnels Quickstart Guide</a>.</li>
                        <li>When you run the command <code className="text-sm bg-zinc-700 p-1 rounded">cloudflared tunnel run --url http://localhost:3001 &lt;TUNNEL_NAME&gt;</code>, it will give you a public URL (e.g., <code className="text-sm bg-zinc-700 p-1 rounded">https://your-tunnel-name.trycloudflare.com</code>).</li>
                        <li>This public URL is what you will use as your "API Server URL" in the main settings tab.</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Step 7: Production & Vercel Setup</h3>
                    <p className="text-gray-300 mb-2">Once you have a permanent public URL for your API server, you should set it as an environment variable in your Vercel project for this dashboard.</p>
                    <ul className="list-decimal list-inside text-gray-300 space-y-2 pl-4">
                        <li>In your Vercel project dashboard, go to <span className="font-bold">Settings &gt; Environment Variables</span>.</li>
                        <li>Create a new variable with the name <code className="text-sm bg-zinc-700 p-1 rounded">VITE_API_SERVER_URL</code>.</li>
                        <li>Set the value to your public API server URL (e.g., <code className="text-sm bg-zinc-700 p-1 rounded">https://your-tunnel-name.trycloudflare.com</code>).</li>
                        <li>Save and redeploy your Vercel project. The dashboard will now automatically use this URL, overriding any value saved in the settings UI.</li>
                    </ul>
                </div>
            </div>
        </DashboardCard>
    );
};
