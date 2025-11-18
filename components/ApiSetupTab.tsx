
import React from 'react';
import { motion } from 'framer-motion';
import { DashboardCard } from './DashboardCard';
import { CodeBracketIcon, CloudArrowDownIcon } from './icons/Icons';
import type { CreatorDetails } from '../types';
import { Button } from './Button';

const CodeBlock: React.FC<{ children: React.ReactNode, language?: string, title?: string }> = ({ children, language = 'bash', title }) => {
    const [copyStatus, setCopyStatus] = React.useState('Copy');

    const handleCopy = () => {
        if (typeof children === 'string') {
            navigator.clipboard.writeText(children.trim());
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus('Copy'), 2000);
        }
    };
    
    return (
        <div className="bg-zinc-900 rounded-lg border border-zinc-700 my-2">
             {title && (
                <div className="px-4 py-2 border-b border-zinc-700 text-xs text-gray-400 font-mono bg-zinc-800/50 rounded-t-lg">
                    {title}
                </div>
            )}
            <div className="relative p-4">
                 <pre className="text-sm text-gray-200 overflow-x-auto font-mono">
                    <code className={`language-${language}`}>
                        {children}
                    </code>
                </pre>
                <button
                    className="absolute top-3 right-3 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-semibold py-1 px-2 rounded-md transition-colors"
                    onClick={handleCopy}
                >
                    {copyStatus}
                </button>
            </div>
        </div>
    );
};

const StepCard: React.FC<{ number?: number, title: string, children: React.ReactNode }> = ({ number, title, children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="border border-zinc-800/80 rounded-lg shadow-lg overflow-hidden bg-zinc-900/50"
        >
            <header className="flex items-center p-4 border-b border-red-600/30 bg-black/20">
                {number && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white font-bold text-lg mr-4 flex-shrink-0">{number}</div>
                )}
                <h3 className="font-bold text-xl tracking-wider uppercase text-gray-200">{title}</h3>
            </header>
            <div className="p-5 text-gray-300 text-sm space-y-3 leading-relaxed">
                {children}
            </div>
        </motion.div>
    );
};

interface ApiSetupTabProps {
    creatorDetails: CreatorDetails;
}

export const ApiSetupTab: React.FC<ApiSetupTabProps> = ({ creatorDetails }) => {
    return (
        <div className="space-y-6">
            <DashboardCard title="Hybrid Media Server Setup Guide" icon={<CodeBracketIcon className="w-6 h-6" />}>
                <div className="p-6 space-y-8">
                    <div className="bg-blue-900/30 border border-blue-700/50 p-4 rounded-lg text-gray-300">
                        <h3 className="text-lg font-bold text-blue-400 mb-2">Objective</h3>
                        <p>Create a simple, self-hosted server dedicated solely to storing and serving large files (images, videos). This bypasses the 500KB database limit while keeping the main app logic on Firebase.</p>
                    </div>

                    <StepCard number={1} title="Server Preparation">
                        <p>1. <strong>Get a Linux VPS</strong> (Ubuntu 22.04 recommended).</p>
                        <p>2. <strong>SSH into your server:</strong> <code>ssh root@YOUR_SERVER_IP</code></p>
                        <p>3. <strong>Update and Install Node.js:</strong></p>
                        <CodeBlock title="Terminal Command">
{`# Update system
apt update && apt upgrade -y

# Install Node.js (Version 18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verify install
node -v
npm -v`}
                        </CodeBlock>
                    </StepCard>

                    <StepCard number={2} title="Create the Media Server">
                         <p>1. <strong>Create Directory:</strong></p>
                         <CodeBlock>{`mkdir -p /opt/bosjol-media/uploads\ncd /opt/bosjol-media`}</CodeBlock>

                         <p>2. <strong>Initialize Project & Install Dependencies:</strong></p>
                         <CodeBlock>{`npm init -y\nnpm install express cors multer`}</CodeBlock>

                         <p>3. <strong>Create Server Script (<code>server.js</code>):</strong></p>
                         <p>Run <code>nano server.js</code> and paste the following:</p>
                         <CodeBlock title="server.js" language="javascript">
{`const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// 1. Allow requests from anywhere (CORS)
app.use(cors());

// 2. Configure Storage (Save files to 'uploads' folder with timestamp)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Clean filename: remove spaces, add timestamp
        const cleanName = file.originalname.replace(/\\s+/g, '_').replace(/[^a-zA-Z0-9.\\-_]/g, '');
        cb(null, \`\${Date.now()}-\${cleanName}\`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB Limit per file
});

// 3. Serve the 'uploads' folder publicly
app.use('/files', express.static('uploads'));

// 4. Upload Endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Construct the public URL
    // NOTE: We use the 'Host' header to determine the domain automatically
    const protocol = req.protocol; 
    const host = req.get('host');
    const fileUrl = \`\${protocol}://\${host}/files/\${req.file.filename}\`;

    console.log(\`File uploaded: \${fileUrl}\`);
    res.json({ url: fileUrl });
});

// 5. Health Check
app.get('/health', (req, res) => res.send('Media Server Online'));

app.listen(PORT, () => {
    console.log(\`🚀 Media Server running on port \${PORT}\`);
});`}
                         </CodeBlock>
                    </StepCard>

                    <StepCard number={3} title="Run Permanently (PM2)">
                        <p>Use PM2 to keep the server running in the background.</p>
                        <CodeBlock title="Terminal Command">
{`npm install -g pm2
pm2 start server.js --name "bosjol-media"
pm2 startup
pm2 save`}
                        </CodeBlock>
                    </StepCard>

                    <StepCard number={4} title="Expose to Internet (Cloudflare Tunnel)">
                        <p>This is the easiest way to get a secure HTTPS URL.</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li>Sign up for a free <strong>Cloudflare</strong> account and add your domain.</li>
                            <li>Go to <strong>Zero Trust {'>'} Access {'>'} Tunnels</strong> and create a tunnel.</li>
                            <li>Run the provided connector command on your VPS.</li>
                            <li>Configure a Public Hostname in Cloudflare:
                                <ul className="list-disc list-inside ml-6 text-xs text-gray-400">
                                    <li><strong>Subdomain:</strong> <code>media</code></li>
                                    <li><strong>Service:</strong> <code>HTTP : localhost:3001</code></li>
                                </ul>
                            </li>
                        </ol>
                    </StepCard>

                    <StepCard number={5} title="Connect Dashboard">
                        <p>1. Go to the <strong>Settings</strong> tab in this dashboard.</p>
                        <p>2. Find <strong>API Server URL</strong>.</p>
                        <p>3. Enter your new URL (e.g., <code>https://media.yourdomain.com</code> or <code>http://YOUR_IP:3001</code>).</p>
                        <p>4. Click <strong>Save Settings</strong>.</p>
                    </StepCard>
                    
                     <div className="mt-6 pt-6 border-t border-zinc-800">
                        <h3 className="text-xl font-bold text-red-400 mb-2">Download Template</h3>
                        <p className="text-gray-300 mb-3">
                            Download a zip file containing the code above to get started quickly.
                        </p>
                        <a href={creatorDetails.sourceCodeZipUrl} target="_blank" rel="noopener noreferrer">
                            <Button>
                                <CloudArrowDownIcon className="w-5 h-5 mr-2" />
                                Download Server Files
                            </Button>
                        </a>
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
};
