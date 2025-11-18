

import React from 'react';
import { motion } from 'framer-motion';
import { DashboardCard } from './DashboardCard';
import { CodeBracketIcon, CloudArrowDownIcon } from './icons/Icons';
import type { CreatorDetails } from '../types';
import { Button } from './Button';

const CodeBlock: React.FC<{ children: React.ReactNode, language?: string, fileName?: string }> = ({ children, language = 'bash', fileName }) => {
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
             {fileName && (
                <div className="px-4 py-2 border-b border-zinc-700 text-xs text-gray-400 font-mono">
                    {fileName}
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
    creatorDetails: CreatorDetails & { apiSetupGuide: any[] };
}


export const ApiSetupTab: React.FC<ApiSetupTabProps> = ({ creatorDetails }) => {
    let stepNumber = 0;
    
    return (
        <DashboardCard title="Optional: Self-Hosted File Server Guide" icon={<CodeBracketIcon className="w-6 h-6" />}>
            <div className="p-6 space-y-6">
                {creatorDetails.apiSetupGuide.map((step) => {
                     const isNumbered = !step.codeBlock || step.content;
                     if(isNumbered) stepNumber++;

                     const contentWithLinks = step.content.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-red-400 hover:underline">$1</a>');
                     const contentWithCode = contentWithLinks.replace(/`(.*?)`/g, '<code class="text-sm bg-zinc-700 p-1 rounded font-mono">$1</code>');

                    return (
                         <StepCard key={step.id} number={isNumbered ? stepNumber : undefined} title={step.title}>
                            {step.content && <div dangerouslySetInnerHTML={{ __html: contentWithCode }} />}
                            {step.codeBlock && (
                                <CodeBlock language={step.codeLanguage} fileName={step.fileName}>
                                    {step.codeBlock}
                                </CodeBlock>
                            )}
                        </StepCard>
                    )
                })}

                 <div className="mt-6 pt-6 border-t border-zinc-800">
                    <h3 className="text-xl font-bold text-red-400 mb-2">Download Server Source</h3>
                     <p className="text-gray-300 mb-3">
                        Download a zip file containing the pre-configured `server.js` and `package.json` files to get started quickly.
                    </p>
                    <a href={creatorDetails.sourceCodeZipUrl} target="_blank" rel="noopener noreferrer">
                        <Button>
                            <CloudArrowDownIcon className="w-5 h-5 mr-2" />
                            Download Server Files
                        </Button>
                    </a>
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