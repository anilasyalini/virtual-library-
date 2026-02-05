'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BookOpen, Upload, Search, FileText, Download, X, Plus, Library, Users, Eye } from 'lucide-react';
import styles from './library.module.css';
import Link from 'next/link';

interface Resource {
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    fileType: string;
    category: string;
    createdAt: string;
}

export default function LibraryPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [previewResource, setPreviewResource] = useState<Resource | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Form states
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [formCategory, setFormCategory] = useState('');

    const derivedCategories = useMemo(() => {
        if (!Array.isArray(resources)) return ['All'];
        const cats = new Set(resources.map(r => r.category));
        return ['All', ...Array.from(cats)].sort();
    }, [resources]);

    const fetchResources = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/resources?q=${search}&category=${category}`);

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || `Server responded with ${res.status}`);
            }

            const data = await res.json();

            if (Array.isArray(data)) {
                setResources(data);
            } else {
                console.error('Expected array of resources but got:', data);
                setResources([]);
                setError('Received unexpected data format from server.');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch resources. Please check your connection.');
            setResources([]);
        }
        setLoading(false);
    }, [search, category]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchResources();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchResources]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchResources();
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', desc);
        formData.append('category', formCategory);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setIsUploadOpen(false);
                fetchResources();
                // Reset form
                setFile(null);
                setTitle('');
                setDesc('');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const stats = useMemo(() => {
        if (!Array.isArray(resources)) return { total: 0, categories: 0, recent: 0 };
        return {
            total: resources.length,
            categories: new Set(resources.map(r => r.category)).size,
            recent: resources.filter(r => {
                const date = new Date(r.createdAt);
                const now = new Date();
                return (now.getTime() - date.getTime()) < 24 * 60 * 60 * 1000;
            }).length
        };
    }, [resources]);

    if (!isMounted) {
        return <div className="container" style={{ minHeight: '100vh', opacity: 0 }} />;
    }

    const safeResources = Array.isArray(resources) ? resources : [];

    return (
        <div className="container">
            <header className={styles.libraryHeader}>
                <Link href="/" className={styles.libraryLogo}>
                    <BookOpen className="text-primary" />
                    <h1 className="font-display">UniLib Library</h1>
                </Link>
                <button className="btn-primary" onClick={() => setIsUploadOpen(true)}>
                    <Plus size={20} /> <span className={styles.uploadBtnText}>Upload Material</span>
                </button>
            </header>

            <div
                className={styles.statsContainer}
            >
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.total}</span>
                    <span className={styles.statLabel}>Total Resources</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.categories}</span>
                    <span className={styles.statLabel}>Categories</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.recent}</span>
                    <span className={styles.statLabel}>New Today</span>
                </div>
            </div>

            <div className={styles.searchBar}>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <input
                        type="text"
                        placeholder="Search for books, notes, or research papers..."
                        className={styles.searchInput}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? '...' : <Search size={20} />}
                    </button>
                </form>
            </div>

            <div className={styles.categoryContainer}>
                {derivedCategories.map((cat: string) => (
                    <div
                        key={cat}
                        className={`${styles.categoryCard} glass ${category === cat ? styles.active : ''}`}
                        onClick={() => setCategory(cat)}
                    >
                        {cat === 'All' ? <BookOpen className={styles.categoryIcon} /> : <Library className={styles.categoryIcon} />}
                        <span className={styles.categoryLabel}>{cat}</span>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Fetching academic repository...</p>
                </div>
            ) : error ? (
                <div className={styles.emptyState}>
                    <X size={48} color="#ef4444" />
                    <h3 style={{ color: '#ef4444' }}>Service Unavailable</h3>
                    <p>{error}</p>
                    <button onClick={() => fetchResources()} className="btn-primary" style={{ marginTop: '1rem' }}>
                        Try Again
                    </button>
                </div>
            ) : safeResources.length > 0 ? (
                <div className={styles.grid}>
                    {safeResources.map((res) => (
                        <div
                            key={res.id || Math.random()}
                            className={`${styles.resourceCard} glass`}
                        >
                            <div className={styles.resourceIcon}>
                                {(res.fileType || '').includes('pdf') ? <FileText color="#ef4444" /> :
                                    (res.fileType || '').includes('image') ? <Library color="#10b981" /> :
                                        <BookOpen color="var(--primary)" />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 className={styles.resourceTitle}>{res.title}</h3>
                                <p className={styles.resourceDescription}>
                                    {res.description || 'Premium academic resource available for download.'}
                                </p>
                            </div>
                            <div className={styles.resourceMeta}>
                                <span className={styles.badge}>{res.category}</span>
                                <span className={styles.resourceDate}>
                                    {isMounted ? new Date(res.createdAt).toLocaleDateString() : 'Loading...'}
                                </span>
                            </div>
                            <div className={styles.resourceActions}>
                                <button
                                    onClick={() => setPreviewResource(res)}
                                    className="btn-primary"
                                    style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.1)' }}
                                >
                                    <Eye size={18} /> Preview
                                </button>
                                <a href={res.fileUrl} download className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                    <Download size={18} /> Download
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <Search size={48} opacity={0.3} />
                    <h3>No resources found</h3>
                    <p>Try adjusting your search or category filters to find what you're looking for.</p>
                </div>
            )}

            {isUploadOpen && (
                <div className={styles.uploadOverlay}>
                    <div className={`${styles.uploadModal} glass`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h2 className="font-display">Upload Resource</h2>
                            <X style={{ cursor: 'pointer' }} onClick={() => setIsUploadOpen(false)} />
                        </div>
                        <form onSubmit={handleUpload}>
                            <div className={styles.formGroup}>
                                <label>Title</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Intro to Algorithms" required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Category (Topic)</label>
                                <input
                                    type="text"
                                    value={formCategory}
                                    onChange={(e) => setFormCategory(e.target.value)}
                                    placeholder="e.g. Quantum Physics, History, etc."
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Briefly describe the content..." />
                            </div>
                            <div className={styles.formGroup}>
                                <label>File</label>
                                <div className={styles.fileInput} onClick={() => document.getElementById('file-upload')?.click()}>
                                    {file ? file.name : 'Click to select or drag and drop'}
                                    <input
                                        type="file"
                                        id="file-upload"
                                        hidden
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
                                Complete Upload
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {previewResource && (
                <div
                    className={styles.previewOverlay}
                    onClick={() => setPreviewResource(null)}
                >
                    <div
                        className={styles.previewModal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.previewHeader}>
                            <h2 className="font-display">{previewResource.title}</h2>
                            <button className="btn-primary" onClick={() => setPreviewResource(null)} style={{ padding: '0.5rem' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className={styles.previewContent}>
                            {(previewResource.fileType || '').includes('pdf') ? (
                                <iframe src={previewResource.fileUrl} className={styles.previewIframe} />
                            ) : (previewResource.fileType || '').includes('image') ? (
                                <img src={previewResource.fileUrl} alt={previewResource.title} className={styles.previewImage} />
                            ) : (
                                <div className={styles.emptyState}>
                                    <FileText size={48} />
                                    <p>Preview not available for this file type.</p>
                                    <a href={previewResource.fileUrl} download className="btn-primary">
                                        Download to View
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
