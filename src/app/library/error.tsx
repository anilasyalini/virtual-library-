'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Library route error:', error);
    }, [error]);

    return (
        <div className="container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <AlertTriangle size={64} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
            <h2 className="font-display" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong!</h2>
            <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', maxWidth: '600px', width: '100%' }}>
                <p style={{ color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Error Details:</p>
                <code style={{
                    display: 'block',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'left',
                    overflowX: 'auto',
                    fontSize: '0.85rem'
                }}>
                    {error.message || 'Unknown runtime error'}
                    {error.digest && <div style={{ opacity: 0.5, marginTop: '0.5rem' }}>ID: {error.digest}</div>}
                </code>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    className="btn-primary"
                    onClick={() => reset()}
                >
                    <RefreshCcw size={18} /> Try Again
                </button>
                <Link href="/" className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <Home size={18} /> Back Home
                </Link>
            </div>
        </div>
    );
}
