
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardCard } from './DashboardCard';
import { CodeBracketIcon, InformationCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, CloudArrowDownIcon } from './icons/Icons';
import type { CreatorDetails } from '../types';
import { Button } from './Button';

const CodeBlock: React.FC<{ children: React.ReactNode, title?: string, language?: string }> = ({ children, title, language = 'bash' }) => {
    const [copyStatus, setCopyStatus] = useState('Copy');

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
        <div className="space-y-6 max-w-4xl mx-auto">
            <DashboardCard title="Ultimate Server Guide: Zero to Hero" icon={<CodeBracketIcon className="w-6 h-6" />}>
                <div className="p-6 space-y-8 text-gray-300">
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 rounded-xl border border-zinc-800">
                        <h3 className="text-xl font-bold text-white mb-3">The Mission</h3>
                        <p className="text-gray-400 mb-4">
                            We are going to build a completely private, self-hosted infrastructure for your app. 
                            Instead of relying on Firebase or other paid services, you will host the Database, File Storage, API, and Frontend yourself on a powerful free server.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-black/40 p-3 rounded border border-zinc-800">
                                <span className="block font-bold text-green-400 mb-1">Cost</span>
                                $0.00 / Forever
                            </div>
                            <div className="bg-black/40 p-3 rounded border border-zinc-800">
                                <span className="block font-bold text-blue-400 mb-1">Specs</span>
                                4 CPUs, 24GB RAM
                            </div>
                            <div className="bg-black/40 p-3 rounded border border-zinc-800">
                                <span className="block font-bold text-amber-400 mb-1">Difficulty</span>
                                Advanced (Step-by-Step)
                            </div>
                        </div>
                    </div>

                    <StepCard number={1} title="Acquire the Hardware (Oracle Cloud)">
                        <p>We will use Oracle Cloud's "Always Free" tier. It is the only provider generous enough for this stack.</p>
                        <ol className="list-decimal list-inside space-y-3 ml-2">
                            <li><strong>Sign Up:</strong> Go to <a href="https://www.oracle.com/cloud/free/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Oracle Cloud Free Tier</a>. You will need a credit card for identity verification, but you won't be charged.</li>
                            <li><strong>Create Instance:</strong> Once logged in, click <strong>"Create a VM instance"</strong>.</li>
                            <li><strong>Image &amp; Shape (Crucial):</strong>
                                <ul className="list-disc list-inside ml-6 mt-1 text-sm space-y-1 text-gray-400">
                                    <li>Click "Change Image" &rarr; Select <strong>Canonical Ubuntu 22.04</strong>.</li>
                                    <li>Click "Change Shape" &rarr; Select <strong>Ampere</strong> (VM.Standard.A1.Flex).</li>
                                    <li>Set <strong>OCPUs</strong> to <strong>4</strong> and <strong>Memory</strong> to <strong>24 GB</strong>.</li>
                                </ul>
                            </li>
                            <li><strong>Networking:</strong> Ensure "Assign a public IPv4 address" is checked.</li>
                            <li><strong>SSH Keys (DO NOT SKIP):</strong>
                                <ul className="list-disc list-inside ml-6 mt-1 text-sm space-y-1 text-gray-400">
                                    <li>Select "Generate a key pair for me".</li>
                                    <li>Click <strong>SAVE PRIVATE KEY</strong>. This downloads a <code>.key</code> file.</li>
                                    <li><strong>Keep this file safe.</strong> Without it, you cannot access your server.</li>
                                </ul>
                            </li>
                            <li>Click <strong>Create</strong>. Wait for the instance to turn Green (Running). copy your <strong>Public IP Address</strong>.</li>
                        </ol>
                    </StepCard>

                    <StepCard number={2} title="Open the Cloud Firewall">
                        <p>Oracle has a firewall outside the server that blocks traffic by default. We need to open ports for our app.</p>
                        <ol className="list-decimal list-inside space-y-2 ml-2">
                            <li>On your Instance details page, click the link under <strong>"Subnet"</strong>.</li>
                            <li>Click the link under <strong>"Security Lists"</strong> (usually starts with <code>Default Security List...</code>).</li>
                            <li>Click <strong>"Add Ingress Rules"</strong>.</li>
                            <li>Fill in the following:
                                <ul className="list-disc list-inside ml-6 mt-1 text-sm space-y-1 text-gray-400">
                                    <li><strong>Source CIDR:</strong> <code>0.0.0.0/0</code></li>
                                    <li><strong>Destination Port Range:</strong> <code>80, 443, 3001, 9000, 9001</code></li>
                                </ul>
                            </li>
                            <li>Click <strong>"Add Ingress Rules"</strong>.</li>
                        </ol>
                    </StepCard>

                    <StepCard number={3} title="Connect via Terminal">
                        <p>Now we log into the server to control it.</p>
                        
                        <h4 className="font-bold text-white mt-4">Windows Users:</h4>
                        <ol className="list-decimal list-inside space-y-1 ml-2 text-sm text-gray-400">
                            <li>Find the <code>.key</code> file you downloaded. Move it to a simple folder like <code>C:\Users\YourName\</code>.</li>
                            <li>Search for "PowerShell" and open it.</li>
                            <li>Type <code>cd C:\Users\YourName\</code> to go to that folder.</li>
                            <li>Run the command below (Replace <code>1.2.3.4</code> with your Oracle IP):</li>
                        </ol>

                        <h4 className="font-bold text-white mt-4">Mac/Linux Users:</h4>
                        <ol className="list-decimal list-inside space-y-1 ml-2 text-sm text-gray-400">
                            <li>Open Terminal.</li>
                            <li>Navigate to your key folder (e.g., <code>cd ~/Downloads</code>).</li>
                            <li>Run <code>chmod 400 your-key-name.key</code> to secure the key.</li>
                            <li>Run the command below:</li>
                        </ol>

                        <CodeBlock title="SSH Connection Command">
                            ssh -i your-key-name.key ubuntu@1.2.3.4
                        </CodeBlock>
                        <WarningBox>Type <code>yes</code> if asked "Are you sure you want to continue connecting?".</WarningBox>
                    </StepCard>

                    <StepCard number={4} title="Prepare the Server Environment">
                        <p>You are now inside the server! We need to switch to the administrator user (root), fix the internal firewall, and install Docker.</p>
                        <p><strong>Copy and paste this entire block</strong> into your terminal and press Enter:</p>
                        <CodeBlock title="Setup Script">
{`# Switch to root user
sudo -i

# Open internal ports (iptables)
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3001 -j ACCEPT
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 9000 -j ACCEPT
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 9001 -j ACCEPT
netfilter-persistent save

# Update Linux
apt update && apt upgrade -y

# Install Utilities & Docker
apt install curl git unzip -y
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh`}
                        </CodeBlock>
                    </StepCard>

                    <StepCard number={5} title="Create Project Folders">
                        <p>We need a place to store our app files. Run this command block:</p>
                        <CodeBlock title="Create Directories">
{`mkdir -p /opt/bosjol-tactical/api
mkdir -p /opt/bosjol-tactical/frontend
mkdir -p /opt/bosjol-tactical/mongo-data
mkdir -p /opt/bosjol-tactical/minio-data
cd /opt/bosjol-tactical`}
                        </CodeBlock>
                    </StepCard>

                    <StepCard number={6} title="Setup API: Configuration">
                        <p>Now we create the files. We will use the <code>nano</code> text editor.</p>
                        <p>1. Create the package file:</p>
                        <CodeBlock>nano api/package.json</CodeBlock>
                        <p>2. Paste this content:</p>
                        <CodeBlock title="api/package.json" language="json">
{`{
  "name": "bosjol-api",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.3",
    "multer": "^1.4.5-lts.1",
    "minio": "^7.0.32",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  }
}`}
                        </CodeBlock>
                        <TipBox>
                            <strong>To Save &amp; Exit Nano:</strong><br/>
                            1. Press <code>Ctrl + O</code> (Save)<br/>
                            2. Press <code>Enter</code> (Confirm)<br/>
                            3. Press <code>Ctrl + X</code> (Exit)
                        </TipBox>
                    </StepCard>

                    <StepCard number={7} title="Setup API: The Code">
                        <p>1. Create the server script:</p>
                        <CodeBlock>nano api/server.js</CodeBlock>
                        <p>2. Paste this code:</p>
                        <CodeBlock title="api/server.js" language="javascript">
{`const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Minio = require('minio');
const cors = require('cors');
const app = express();

const PORT = 3001;
const MINIO_BUCKET = 'bosjol-media';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- DATABASE ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const AnySchema = new mongoose.Schema({}, { strict: false });
const getModel = (collectionName) => mongoose.model(collectionName, AnySchema, collectionName);

// --- STORAGE ---
const minioClient = new Minio.Client({
    endPoint: 'minio',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER,
    secretKey: process.env.MINIO_ROOT_PASSWORD
});

const initMinio = async () => {
    try {
        const exists = await minioClient.bucketExists(MINIO_BUCKET);
        if (!exists) {
            await minioClient.makeBucket(MINIO_BUCKET, 'us-east-1');
            const policy = {
                Version: "2012-10-17",
                Statement: [{
                    Effect: "Allow",
                    Principal: { AWS: ["*"] },
                    Action: ["s3:GetObject"],
                    Resource: [\`arn:aws:s3:::\${MINIO_BUCKET}/*\`]
                }]
            };
            await minioClient.setBucketPolicy(MINIO_BUCKET, JSON.stringify(policy));
            console.log(\`✅ Bucket '\${MINIO_BUCKET}' created.\`);
        }
    } catch (err) {
        console.error('❌ MinIO Init Error:', err);
    }
};
setTimeout(initMinio, 10000);

// --- ROUTES ---
const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    try {
        const fileName = \`\${Date.now()}-\${req.file.originalname.replace(/\\s/g, '_')}\`;
        await minioClient.putObject(MINIO_BUCKET, fileName, req.file.buffer, req.file.size, { 
            'Content-Type': req.file.mimetype 
        });
        const fileUrl = \`\${process.env.PUBLIC_MINIO_URL}/\${MINIO_BUCKET}/\${fileName}\`;
        res.json({ url: fileUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

app.get('/health', (req, res) => res.send('Tactical Systems Online'));
app.listen(PORT, () => console.log(\`🚀 API running on port \${PORT}\`));`}
                        </CodeBlock>
                        <p>3. Save and exit (<code>Ctrl+O, Enter, Ctrl+X</code>).</p>
                    </StepCard>

                    <StepCard number={8} title="Setup API: Dockerfile">
                        <p>1. Create the Docker instruction file:</p>
                        <CodeBlock>nano api/Dockerfile</CodeBlock>
                        <p>2. Paste this:</p>
                        <CodeBlock title="api/Dockerfile" language="dockerfile">
{`FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]`}
                        </CodeBlock>
                        <p>3. Save and exit.</p>
                    </StepCard>

                    <StepCard number={9} title="Setup Web Server (Nginx)">
                        <p>1. Create the web server config:</p>
                        <CodeBlock>nano nginx.conf</CodeBlock>
                        <p>2. Paste this:</p>
                        <CodeBlock title="nginx.conf" language="nginx">
{`server {
    listen 80;
    client_max_body_size 100M;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://api:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`}
                        </CodeBlock>
                        <p>3. Save and exit.</p>
                    </StepCard>

                    <StepCard number={10} title="Orchestrate Everything (Docker Compose)">
                        <p>This file tells Docker how to run the Database, Storage, API, and Frontend together.</p>
                        <p>1. Create the compose file:</p>
                        <CodeBlock>nano docker-compose.yml</CodeBlock>
                        <p>2. Paste the code below.</p>
                        <WarningBox>
                            <strong>IMPORTANT:</strong> You MUST replace <code>YOUR_ORACLE_IP</code> (e.g., <code>129.154.x.x</code>) in the code below with your actual server IP address.
                        </WarningBox>
                        <CodeBlock title="docker-compose.yml" language="yaml">
{`version: '3.8'

services:
  mongo:
    image: mongo:6.0
    restart: always
    volumes:
      - ./mongo-data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: FreeSecurePassword123

  minio:
    image: quay.io/minio/minio
    command: server /data --console-address ":9001"
    restart: always
    volumes:
      - ./minio-data:/data
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: FreeSecurePassword123
    ports:
      - "9000:9000"
      - "9001:9001"

  api:
    build: ./api
    restart: always
    ports:
      - "3001:3001"
    environment:
      MONGO_URI: mongodb://admin:FreeSecurePassword123@mongo:27017/bosjol?authSource=admin
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: FreeSecurePassword123
      # REPLACE THIS WITH YOUR REAL IP
      PUBLIC_MINIO_URL: http://YOUR_ORACLE_IP:9000
    depends_on:
      - mongo
      - minio

  frontend:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
    volumes:
      - ./frontend:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf`}
                        </CodeBlock>
                        <p>3. Save and exit.</p>
                    </StepCard>

                    <StepCard number={11} title="Upload Your App">
                        <p><strong>Switch back to your Local Computer (VS Code).</strong></p>
                        <p>1. Open your local terminal in the project folder.</p>
                        <p>2. Build the project to create the <code>dist</code> folder:</p>
                        <CodeBlock>npm run build</CodeBlock>
                        <p>3. Upload the files to your server. Replace fields as needed:</p>
                        <CodeBlock title="Upload Command">
                            scp -i path/to/ssh-key.key -r dist/* ubuntu@YOUR_ORACLE_IP:/opt/bosjol-tactical/frontend
                        </CodeBlock>
                        <TipBox>
                            If you get a "Permission denied" error, it's because the `ubuntu` user doesn't own `/opt`.<br/>
                            <strong>Workaround:</strong><br/>
                            1. Upload to home folder: <code>scp -i ... -r dist/* ubuntu@IP:~/frontend_temp</code><br/>
                            2. SSH into server: <code>ssh -i ... ubuntu@IP</code><br/>
                            3. Move files as root: <code>sudo cp -r ~/frontend_temp/* /opt/bosjol-tactical/frontend/</code>
                        </TipBox>
                    </StepCard>

                    <StepCard number={12} title="Launch the System">
                        <p><strong>Back on your Server Terminal:</strong></p>
                        <p>1. Go to the folder:</p>
                        <CodeBlock>cd /opt/bosjol-tactical</CodeBlock>
                        <p>2. Start the engine:</p>
                        <CodeBlock>docker compose up -d --build</CodeBlock>
                        <p>Docker will download everything and start your services. This might take a few minutes.</p>
                    </StepCard>

                    <div className="bg-green-900/30 border border-green-700/50 p-6 rounded-xl">
                        <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                            <CheckCircleIcon className="w-6 h-6"/> System Verification
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li>
                                <strong>Web App:</strong> Open <code>http://YOUR_ORACLE_IP</code> in your browser. You should see the dashboard!
                            </li>
                            <li>
                                <strong>Storage Console:</strong> Open <code>http://YOUR_ORACLE_IP:9001</code>.<br/>
                                <span className="text-xs text-gray-500">Login: <code>admin</code> / <code>FreeSecurePassword123</code></span>
                            </li>
                            <li>
                                <strong>API Health:</strong> Open <code>http://YOUR_ORACLE_IP:3001/health</code>. It should say "Tactical Systems Online".
                            </li>
                        </ul>
                        
                        <div className="mt-6 pt-4 border-t border-green-800/50">
                            <p className="font-bold text-white">Final Configuration Step:</p>
                            <p className="text-sm mt-1">
                                Log in to your new Dashboard as Admin. Go to <strong>Settings</strong>. 
                                Set <strong>API Server URL</strong> to <code>http://YOUR_ORACLE_IP:3001</code>.
                                Save.
                            </p>
                        </div>
                    </div>

                    {creatorDetails.sourceCodeZipUrl && (
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
                    )}
                </div>
            </DashboardCard>
        </div>
    );
};
