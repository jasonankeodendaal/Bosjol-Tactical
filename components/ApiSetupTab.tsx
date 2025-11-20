
import React from 'react';
import { motion } from 'framer-motion';
import { DashboardCard } from './DashboardCard';
import { CodeBracketIcon, CloudArrowDownIcon, InformationCircleIcon, CheckCircleIcon, ExclamationTriangleIcon } from './icons/Icons';
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
        <div className="bg-zinc-950 rounded-lg border border-zinc-800 my-3 shadow-inner">
             {title && (
                <div className="px-4 py-2 border-b border-zinc-800 text-xs text-gray-400 font-mono bg-zinc-900/50 rounded-t-lg flex justify-between items-center">
                    <span>{title}</span>
                    <span className="text-zinc-600">{language}</span>
                </div>
            )}
            <div className="relative p-4 group">
                 <pre className="text-sm text-gray-300 overflow-x-auto font-mono leading-relaxed">
                    <code className={`language-${language}`}>
                        {children}
                    </code>
                </pre>
                <button
                    className="absolute top-3 right-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold py-1.5 px-3 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    onClick={handleCopy}
                >
                    {copyStatus}
                </button>
            </div>
        </div>
    );
};

const TipBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-blue-900/20 border border-blue-800/50 p-3 rounded-md flex gap-3 text-sm text-blue-200 my-3">
        <InformationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>{children}</div>
    </div>
);

const WarningBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-amber-900/20 border border-amber-800/50 p-3 rounded-md flex gap-3 text-sm text-amber-200 my-3">
        <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>{children}</div>
    </div>
);

const StepCard: React.FC<{ number: number, title: string, children: React.ReactNode }> = ({ number, title, children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5 }}
            className="border border-zinc-800 bg-zinc-900/30 rounded-xl overflow-hidden"
        >
            <header className="flex items-center p-4 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white font-bold text-lg mr-4 flex-shrink-0 shadow-lg shadow-red-900/50">{number}</div>
                <h3 className="font-bold text-lg tracking-wide text-gray-100">{title}</h3>
            </header>
            <div className="p-5 text-gray-300 text-sm space-y-4 leading-relaxed">
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
        <div className="space-y-8 max-w-4xl mx-auto">
            <DashboardCard title="Hybrid Media Server: The Beginner's Guide" icon={<CodeBracketIcon className="w-6 h-6" />}>
                <div className="p-6 space-y-8">
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                        <h3 className="text-xl font-bold text-white mb-3">What are we building?</h3>
                        <p className="text-gray-400 mb-4">
                            The default database has a file size limit of 500KB (about half a photo). 
                            We are going to set up a "Storage Locker" on a separate server that can hold huge files like 4K images and videos. 
                            Your main app will talk to this locker to save and retrieve files.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-black/40 p-3 rounded border border-zinc-800">
                                <span className="block font-bold text-green-400 mb-1">Cost</span>
                                Free (Oracle) or ~$5/mo (DigitalOcean)
                            </div>
                            <div className="bg-black/40 p-3 rounded border border-zinc-800">
                                <span className="block font-bold text-blue-400 mb-1">Time</span>
                                Approx. 15 Minutes
                            </div>
                            <div className="bg-black/40 p-3 rounded border border-zinc-800">
                                <span className="block font-bold text-amber-400 mb-1">Difficulty</span>
                                Beginner (Copy & Paste)
                            </div>
                        </div>
                    </div>

                    <StepCard number={1} title="Get a Server & Connect">
                        <p>1. Purchase a generic <strong>Ubuntu 22.04</strong> VPS (Virtual Private Server). You will receive an <strong>IP Address</strong> and a <strong>Root Password</strong>.</p>
                        <p>2. Open the terminal program on your computer:</p>
                        <ul className="list-disc list-inside ml-4 text-zinc-400">
                            <li><strong>Windows:</strong> Search for "PowerShell" and open it.</li>
                            <li><strong>Mac:</strong> Search for "Terminal" and open it.</li>
                        </ul>
                        <p>3. Type the following command, replacing <code>1.2.3.4</code> with your actual IP address, and press <strong>Enter</strong>:</p>
                        <CodeBlock>ssh root@1.2.3.4</CodeBlock>
                        <WarningBox>
                            If it asks <em>"Are you sure you want to continue connecting?"</em>, type <code>yes</code> and press Enter.
                        </WarningBox>
                        <p>4. Enter your password when prompted. <span className="text-red-400 font-bold">Note: The cursor will NOT move while typing the password. This is normal security.</span> Just type it and press Enter.</p>
                    </StepCard>

                    <StepCard number={2} title="Prepare the Server Software">
                        <p>We need to install "Node.js", the engine that runs our code. Copy and paste this entire block into your terminal and press Enter.</p>
                        <TipBox>To paste in PowerShell or Terminal, usually just <strong>Right-Click</strong> anywhere in the window.</TipBox>
                        <CodeBlock title="Update & Install">
{`# Update the system list
apt update && apt upgrade -y

# Install Node.js (Version 18)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verify it worked (should show version numbers)
node -v
npm -v`}
                        </CodeBlock>
                    </StepCard>

                    <StepCard number={3} title="Create the Project Folder">
                        <p>Now we make a folder to hold our files and install the necessary libraries.</p>
                        <CodeBlock title="Setup Folder">
{`# Make the folder and go inside it
mkdir -p /opt/bosjol-media/uploads
cd /opt/bosjol-media

# Initialize a blank project
npm init -y

# Install web server tools
npm install express cors multer`}
                        </CodeBlock>
                    </StepCard>

                    <StepCard number={4} title="Write the Server Code">
                        <p>We will use a text editor called <code>nano</code> built into the terminal.</p>
                        <p>1. Type this command to open a new file:</p>
                        <CodeBlock>nano server.js</CodeBlock>
                        <p>2. Copy the code block below.</p>
                        <p>3. <strong>Right-Click</strong> in your terminal to paste it.</p>
                        
                        <CodeBlock title="server.js code" language="javascript">
{`const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Allow anyone to access this (modify if you have a specific domain)
app.use(cors());

// Configure where files are saved
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Rename file to avoid spaces and weird characters
        const cleanName = file.originalname.replace(/\\s+/g, '_').replace(/[^a-zA-Z0-9.\\-_]/g, '');
        cb(null, \`\${Date.now()}-\${cleanName}\`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // Limit: 100MB per file
});

// Serve the files back to the internet
app.use('/files', express.static('uploads'));

// The Upload Endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const fileUrl = \`\${protocol}://\${host}/files/\${req.file.filename}\`;

    console.log(\`Uploaded: \${fileUrl}\`);
    res.json({ url: fileUrl });
});

app.get('/health', (req, res) => res.send('Media Server Online'));

app.listen(PORT, () => console.log(\`🚀 Running on port \${PORT}\`));`}
                        </CodeBlock>

                        <WarningBox>
                            <strong>How to Save & Exit Nano:</strong><br/>
                            1. Press <code>Ctrl + O</code> (Letter O)<br/>
                            2. Press <code>Enter</code> (To confirm filename)<br/>
                            3. Press <code>Ctrl + X</code> (To exit)
                        </WarningBox>
                    </StepCard>

                    <StepCard number={5} title="Start the Server Forever">
                        <p>If we just run the server now, it will stop when you close the terminal. We use a tool called <code>PM2</code> to keep it running forever.</p>
                        <CodeBlock title="Start PM2">
{`# Install PM2
npm install -g pm2

# Start our server
pm2 start server.js --name "bosjol-media"

# Save the list so it starts on reboot
pm2 startup
pm2 save`}
                        </CodeBlock>
                        <p className="text-green-400 text-sm mt-2"><CheckCircleIcon className="inline w-4 h-4 mr-1"/> You should see a table with green text saying "online".</p>
                    </StepCard>

                    <StepCard number={6} title="Connect to the Internet (Securely)">
                        <p>We will use <strong>Cloudflare Tunnels</strong>. This gives you a secure HTTPS link (like <code>https://media.yourdomain.com</code>) without messing with router ports.</p>
                        <p className="text-xs text-gray-400 mb-4">Prerequisite: You need a free Cloudflare account and a domain name added to it.</p>

                        <ol className="space-y-4 list-decimal list-inside text-gray-300">
                            <li>Go to your Cloudflare Dashboard {'>'} <strong>Zero Trust</strong> (on the left sidebar).</li>
                            <li>Go to <strong>Networks</strong> {'>'} <strong>Tunnels</strong>.</li>
                            <li>Click <strong>Create a Tunnel</strong>.
                                <ul className="ml-6 mt-2 space-y-1 text-sm text-gray-400 list-disc">
                                    <li>Select <strong>Cloudflared</strong>. Click Next.</li>
                                    <li>Name it <code>media-server</code>. Click Save.</li>
                                </ul>
                            </li>
                            <li>Under "Install and run a connector":
                                <ul className="ml-6 mt-2 space-y-1 text-sm text-gray-400 list-disc">
                                    <li>Choose <strong>Debian</strong> (works for Ubuntu) and <strong>64-bit</strong>.</li>
                                    <li><strong>Copy</strong> the command block shown in the box.</li>
                                    <li><strong>Paste</strong> it into your VPS terminal and press Enter.</li>
                                </ul>
                            </li>
                            <li>Wait a moment. The "Connectors" status at the bottom of the Cloudflare page should turn <span className="text-green-400 font-bold">Connected</span>. Click Next.</li>
                            <li><strong>Route Traffic (The important part):</strong>
                                <ul className="ml-6 mt-2 space-y-1 text-sm text-gray-400 list-disc">
                                    <li><strong>Subdomain:</strong> Type <code>media</code> (or whatever you want).</li>
                                    <li><strong>Domain:</strong> Select your domain.</li>
                                    <li><strong>Service Type:</strong> <code>HTTP</code></li>
                                    <li><strong>URL:</strong> <code>localhost:3001</code></li>
                                </ul>
                            </li>
                            <li>Click <strong>Save Tunnel</strong>.</li>
                        </ol>
                    </StepCard>

                    <StepCard number={7} title="Link to Dashboard">
                        <p>1. Copy your new URL (e.g., <code>https://media.yourdomain.com</code>).</p>
                        <p>2. Go to the <strong>Settings</strong> tab in this Admin Dashboard.</p>
                        <p>3. Paste it into the <strong>API Server URL</strong> field.</p>
                        <p>4. Click <strong>Save All Settings</strong>.</p>
                        <div className="bg-green-900/20 p-3 rounded border border-green-800 mt-4 flex items-center gap-2 text-green-300 text-sm">
                            <CheckCircleIcon className="w-5 h-5" />
                            <span>Success! The status indicator in the footer should now turn blue.</span>
                        </div>
                    </StepCard>

                    <div className="mt-8 pt-8 border-t border-zinc-800">
                        <h3 className="text-xl font-bold text-red-400 mb-3">Shortcut</h3>
                        <p className="text-gray-400 mb-4">
                            Prefer to download the code files instead of creating them manually?
                        </p>
                        <a href={creatorDetails.sourceCodeZipUrl} target="_blank" rel="noopener noreferrer">
                            <Button>
                                <CloudArrowDownIcon className="w-5 h-5 mr-2" />
                                Download Server Files (.zip)
                            </Button>
                        </a>
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
};
