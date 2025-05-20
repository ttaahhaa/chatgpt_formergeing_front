"use client";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"; // choose your preferred style

interface ChatBubbleProps {
    message: string;
    isUser: boolean;
}

interface CodeProps {
    node?: any;
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
}

export default function ChatBubble({ message, isUser }: ChatBubbleProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    // Add copy button to code blocks
    useEffect(() => {
        if (!contentRef.current) return;

        const codeBlocks = contentRef.current.querySelectorAll('pre');

        codeBlocks.forEach(block => {
            // Skip if already has copy button
            if (block.querySelector('.copy-button')) return;

            // Create copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button absolute top-2 right-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-1 opacity-60 hover:opacity-100 transition-opacity';
            copyButton.textContent = 'Copy';

            // Position the pre container if not already positioned
            if (block.style.position !== 'relative') {
                block.style.position = 'relative';
            }

            // Add click handler
            copyButton.addEventListener('click', () => {
                const code = block.querySelector('code');
                if (code) {
                    navigator.clipboard.writeText(code.textContent || '')
                        .then(() => {
                            copyButton.textContent = 'Copied!';
                            setTimeout(() => {
                                copyButton.textContent = 'Copy';
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Failed to copy:', err);
                            copyButton.textContent = 'Failed';
                        });
                }
            });

            // Add button to block
            block.appendChild(copyButton);
        });
    }, [message]);

    return (
        <div
            ref={contentRef}
            className={`my-2 ${isUser ? "text-right" : "text-left"}`}
        >
            <div
                className={`inline-block px-4 py-3 rounded-xl max-w-2xl text-sm whitespace-pre-wrap ${isUser
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-white"
                    }`}
            >
                <ReactMarkdown
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                        // Enhance links to open in new tab
                        a: ({ node, ...props }) => (
                            <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-300 hover:underline"
                            />
                        ),
                        // Add styling to code blocks
                        code: ({ node, inline, className, children, ...props }: CodeProps) => {
                            if (inline) {
                                return (
                                    <code
                                        className="bg-gray-700 text-gray-100 px-1 py-0.5 rounded text-xs"
                                        {...props}
                                    >
                                        {children}
                                    </code>
                                );
                            }

                            return (
                                <code className={`${className} block p-4 rounded-md overflow-x-auto`} {...props}>
                                    {children}
                                </code>
                            );
                        },
                        // Enhance headings
                        h1: ({ node, ...props }) => (
                            <h1 className="text-xl font-bold mt-4 mb-2" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                            <h2 className="text-lg font-bold mt-3 mb-2" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                            <h3 className="text-md font-bold mt-3 mb-1" {...props} />
                        ),
                        // Enhance lists
                        ul: ({ node, ...props }) => (
                            <ul className="pl-6 my-2 list-disc" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                            <ol className="pl-6 my-2 list-decimal" {...props} />
                        ),
                        // Enhance blockquotes
                        blockquote: ({ node, ...props }) => (
                            <blockquote
                                className="border-l-4 border-gray-500 pl-3 italic my-3 text-gray-300"
                                {...props}
                            />
                        ),
                        // Enhance tables
                        table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-4">
                                <table className="min-w-full border-collapse" {...props} />
                            </div>
                        ),
                        thead: ({ node, ...props }) => (
                            <thead className="bg-gray-700" {...props} />
                        ),
                        th: ({ node, ...props }) => (
                            <th className="border border-gray-600 px-4 py-2 text-left" {...props} />
                        ),
                        td: ({ node, ...props }) => (
                            <td className="border border-gray-600 px-4 py-2" {...props} />
                        ),
                    }}
                >
                    {message}
                </ReactMarkdown>
            </div>
        </div>
    );
}