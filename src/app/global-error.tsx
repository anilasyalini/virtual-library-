'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to console for user to see in browser dev tools
        console.error('CRITICAL APP ERROR:', error);
    }, [error]);

    return (
        <html lang="en">
            <body style={{
                background: '#020617',
                color: 'white',
                fontFamily: 'sans-serif',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh'
            }}>
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    maxWidth: '600px',
                    width: '90%'
                }}>
                    <AlertCircle size={80} color="#ef4444" style={{ marginBottom: '2rem' }} />
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Application Crash</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2rem' }}>
                        A critical error occurred that prevented the application from loading.
                    </p>

                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        textAlign: 'left',
                        marginBottom: '2.5rem',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#ef4444' }}>Technical Details:</p>
                        <code style={{
                            display: 'block',
                            fontSize: '0.85rem',
                            wordBreak: 'break-all',
                            lineHeight: '1.4'
                        }}>
                            {error.message || 'Unknown Runtime Error'}
                            {error.digest && <div style={{ opacity: 0.5, marginTop: '0.5rem' }}>ID: {error.digest}</div>}
                        </code>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => reset()}
                            style={{
                                background: '#6366f1',
                                color: 'white',
                                border: 'none',
                                padding: '1rem 2rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <RefreshCcw size={20} /> Reload Application
                        </button>
                        <Link href="/" style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            textDecoration: 'none',
                            padding: '1rem 2rem',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <Home size={20} /> Back Home
                        </Link>
                    </div>
                </div>
            </body>
        </html>
    );
}
