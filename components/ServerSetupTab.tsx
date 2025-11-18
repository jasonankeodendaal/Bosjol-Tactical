
import React, { useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { CodeBracketIcon } from './icons/Icons';

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
        <div className="bg-zinc-900 rounded-lg border border-zinc-700 my-4">
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

export const ServerSetupTab: React.FC = () => {
    return (
        <div className="space-y-6">
            <DashboardCard title="Bosjol Tactical: Private Operations Server Guide" icon={<CodeBracketIcon className="w-6 h-6" />}>
                <div className="p-6 space-y-8 text-gray-300">
                    <div className="bg-blue-900/30 border border-blue-700/50 p-4 rounded-lg">
                        <h3 className="text-lg font-bold text-blue-400 mb-2">Objective</h3>
                        <p>Host the App, Database, API, and Storage for $0/month using Oracle Cloud's ARM Instance (Always Free Tier). This setup removes dependencies on Firebase and creates a completely self-owned infrastructure.</p>
                    </div>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-zinc-700 pb-2">🛑 Phase 1: Getting the Free Hardware</h2>
                        <ol className="list-decimal list-inside space-y-2 ml-2">
                            <li><strong>Sign Up:</strong> Go to <a href="https://www.oracle.com/cloud/free/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Oracle Cloud Free Tier</a>.</li>
                            <li><strong>Create Instance:</strong>
                                <ul className="list-disc list-inside ml-6 mt-1 text-sm space-y-1">
                                    <li><strong>Name:</strong> <code>bosjol-server</code></li>
                                    <li><strong>Image:</strong> Canonical Ubuntu 22.04</li>
                                    <li><strong>Shape:</strong> Ampere (VM.Standard.A1.Flex) with 4 OCPUs and 24GB RAM.</li>
                                </ul>
                            </li>
                            <li><strong>Networking:</strong> Ensure "Assign a public IPv4 address" is checked.</li>
                            <li><strong>SSH Keys:</strong> Select "Generate a key pair for me" and <strong>SAVE PRIVATE KEY</strong>.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-zinc-700 pb-2">🔓 Phase 2: Opening the Firewalls</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-white">Step A: Cloud Dashboard</h3>
                                <p className="text-sm mt-1">Go to Instance details {'>'} Subnet {'>'} Security Lists. Add Ingress Rules:</p>
                                <ul className="list-disc list-inside ml-4 mt-1 text-sm">
                                    <li>Source CIDR: <code>0.0.0.0/0</code></li>
                                    <li>Destination Ports: <code>80, 443, 3001, 9000, 9001</code></li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-zinc-700 pb-2">🔌 Phase 3: Connecting & Internal Setup</h2>
                        <p className="mb-2">Open your terminal (PowerShell or Terminal). Navigate to your key file folder.</p>
                        <CodeBlock title="Connect via SSH (Replace IP)">
                            ssh -i ssh-key-2024.key ubuntu@1.2.3.4
                        </CodeBlock>
                        
                        <p className="mt-4 mb-2">Fix Internal Firewall (Iptables) & Install Docker:</p>
                        <CodeBlock title="Run on Server">
{`# Switch to root
sudo -i

# Open Ports
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3001 -j ACCEPT
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 9000 -j ACCEPT
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 9001 -j ACCEPT
netfilter-persistent save

# Update System
apt update && apt upgrade -y

# Install Docker
apt install curl git unzip -y
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh`}
                        </CodeBlock>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-zinc-700 pb-2">📂 Phase 4: Project Structure</h2>
                        <CodeBlock title="Create Directories">
{`mkdir -p /opt/bosjol-tactical/api
mkdir -p /opt/bosjol-tactical/frontend
mkdir -p /opt/bosjol-tactical/mongo-data
mkdir -p /opt/bosjol-tactical/minio-data
cd /opt/bosjol-tactical`}
                        </CodeBlock>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-zinc-700 pb-2">🧠 Phase 5: The Backend API</h2>
                        
                        <h3 className="font-semibold text-white mt-4">1. API Dependencies</h3>
                        <p className="text-sm">Run <code>nano api/package.json</code> and paste:</p>
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

                        <h3 className="font-semibold text-white mt-4">2. API Logic</h3>
                        <p className="text-sm">Run <code>nano api/server.js</code> and paste:</p>
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

                        <h3 className="font-semibold text-white mt-4">3. API Dockerfile</h3>
                        <p className="text-sm">Run <code>nano api/Dockerfile</code> and paste:</p>
                        <CodeBlock title="api/Dockerfile" language="dockerfile">
{`FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]`}
                        </CodeBlock>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-zinc-700 pb-2">🏗️ Phase 6: Web Server (Nginx)</h2>
                        <p className="text-sm">Run <code>nano nginx.conf</code> in the root folder:</p>
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
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-zinc-700 pb-2">🧱 Phase 7: The Docker Stack</h2>
                        <p className="text-sm">Run <code>nano docker-compose.yml</code>. <strong>Replace YOUR_ORACLE_IP</strong> with your actual server IP.</p>
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
      # MUST MATCH YOUR ORACLE IP
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
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-zinc-700 pb-2">🚀 Phase 8: Uploading the App</h2>
                        <p className="text-sm">On your <strong>Local Computer</strong> (VS Code terminal):</p>
                        <CodeBlock title="Build & Upload">
{`# Build the React App
npm run build

# Upload to Server (Replace IP and key path)
scp -i path/to/ssh-key.key -r dist/* ubuntu@YOUR_ORACLE_IP:/opt/bosjol-tactical/frontend`}
                        </CodeBlock>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-zinc-700 pb-2">🔥 Phase 9: Launch</h2>
                        <p className="text-sm">Back on your <strong>Server Terminal</strong>:</p>
                        <CodeBlock title="Start Services">
{`cd /opt/bosjol-tactical
docker compose up -d --build`}
                        </CodeBlock>
                    </section>

                    <div className="bg-green-900/30 border border-green-700/50 p-4 rounded-lg">
                        <h3 className="text-lg font-bold text-green-400 mb-2">✅ Verification</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li><strong>App:</strong> <code>http://YOUR_ORACLE_IP</code></li>
                            <li><strong>MinIO Console:</strong> <code>http://YOUR_ORACLE_IP:9001</code> (User: admin, Pass: FreeSecurePassword123)</li>
                            <li><strong>API Health:</strong> <code>http://YOUR_ORACLE_IP:3001/health</code></li>
                        </ul>
                        <p className="mt-4 text-sm">Finally, go to <strong>Admin Dashboard {'>'} Settings</strong> and set <strong>API Server URL</strong> to <code>http://YOUR_ORACLE_IP:3001</code>.</p>
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
};
