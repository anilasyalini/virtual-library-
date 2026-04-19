'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    BookOpen, Upload, Search, FileText, Download, X, Plus,
    Library, Eye, GraduationCap, Grid, List, ChevronRight,
    Folder, FolderOpen, File, ImageIcon, Filter, SortAsc,
    MoreVertical, Clock, Star, Home, ChevronDown
} from 'lucide-react';
import Link from 'next/link';

interface Resource {
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    fileType: string;
    category: string;
    course: string;
    specialization: string;
    createdAt: string;
    starredBy?: { id: string }[];
}

interface DBSpecialization {
    id: string;
    name: string;
}

interface DBCourse {
    id: string;
    name: string;
    specializations: DBSpecialization[];
}

type ViewMode = 'list' | 'grid';

export default function LibraryPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [selectedCourse, setSelectedCourse] = useState('All');
    const [selectedSpecialization, setSelectedSpecialization] = useState('All');
    const [activeTab, setActiveTab] = useState<'library' | 'recent' | 'starred'>('library');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [dbCourses, setDbCourses] = useState<DBCourse[]>([]);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isManageOpen, setIsManageOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [previewResource, setPreviewResource] = useState<Resource | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
    const [activeContextMenu, setActiveContextMenu] = useState<string | null>(null);

const COURSE_SPECIALIZATIONS: Record<string, string[]> = {
    'MCA': ['Artificial Intelligence', 'Data Science', 'Cyber Security', 'Cloud Computing', 'Software Engineering'],
    'BCA': ['Artificial Intelligence', 'Data Science', 'Cyber Security', 'Web Development', 'Mobile Computing'],
    'MBA': ['Finance', 'Marketing', 'Human Resources', 'Operations', 'Business Analytics'],
    'BBA': ['Finance', 'Marketing', 'Human Resources', 'International Business', 'Entrepreneurship'],
    'BCom': ['Accounting', 'Finance', 'Taxation', 'Banking', 'E-Commerce'],
    'MCom': ['Accounting', 'Finance', 'Taxation', 'Business Economics', 'Financial Markets'],
};

    // Filter state
    const [filterFileType, setFilterFileType] = useState<string[]>([]);
    const [filterDateRange, setFilterDateRange] = useState<string>('');
    const [filterCourse, setFilterCourse] = useState<string>('');
    const [filterSpec, setFilterSpec] = useState<string>('');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const filterBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
        fetchCourses();
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try { setCurrentUser(JSON.parse(userStr)); } catch (e) {}
        }
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/courses');
            const data = await res.json();
            if (Array.isArray(data)) setDbCourses(data);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        }
    };

    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [formCategory, setFormCategory] = useState('Notes');
    const [formCourse, setFormCourse] = useState('');
    const [formSpecialization, setFormSpecialization] = useState('');
    const [newCourseName, setNewCourseName] = useState('');
    const [newSpecName, setNewSpecName] = useState('');
    const [targetCourseId, setTargetCourseId] = useState('');

    const derivedCategories = useMemo(() => {
        if (!Array.isArray(resources)) return ['All'];
        const cats = new Set(resources.map(r => r.category));
        return ['All', ...Array.from(cats)].sort();
    }, [resources]);

    const fetchResources = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (search) params.append('q', search);
            if (category !== 'All') params.append('category', category);
            
            const finalCourse = filterCourse || (selectedCourse !== 'All' ? selectedCourse : null);
            if (finalCourse) params.append('course', finalCourse);
            
            const finalSpec = filterSpec || (selectedSpecialization !== 'All' ? selectedSpecialization : null);
            if (finalSpec) params.append('specialization', finalSpec);
            
            if (filterFileType.length > 0) params.append('fileType', filterFileType.join(','));
            
            // Apply active tab logic
            if (activeTab === 'recent') params.append('dateRange', 'today');
            else if (filterDateRange) params.append('dateRange', filterDateRange);

            if (activeTab === 'starred') {
                params.append('starred', 'true');
                if (currentUser?.id) params.append('userId', currentUser.id);
            }

            const res = await fetch(`/api/resources?${params.toString()}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || data.error || `Server responded with ${res.status}`);
                setResources([]);
                setLoading(false);
                return;
            }

            if (Array.isArray(data)) {
                setResources(data);
            } else {
                setResources([]);
                setError(data.message || data.error || 'Received unexpected data format from server.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch resources.');
            setResources([]);
        }
        setLoading(false);
    }, [search, category, selectedCourse, selectedSpecialization, filterFileType, filterDateRange, filterCourse, filterSpec, activeTab, currentUser]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (filterBarRef.current && filterBarRef.current.contains(e.target as Node)) {
                return;
            }
            setOpenDropdown(null);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchResources(), 400);
        return () => clearTimeout(timer);
    }, [fetchResources]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', desc);
        formData.append('category', formCategory);
        formData.append('course', formCourse);
        formData.append('specialization', formSpecialization);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                setIsUploadOpen(false);
                fetchResources();
                setFile(null); setTitle(''); setDesc('');
            }
        } catch (err) { console.error(err); }
    };

    const toggleStar = async (e: React.MouseEvent, resId: string, isStarred: boolean) => {
        e.stopPropagation();
        if (!currentUser) return alert('Please login to star resources');
        
        setResources(prev => prev.map(r => 
            r.id === resId ? { ...r, starredBy: isStarred ? [] : [{id: currentUser.id}] } : r
        ));

        try {
            await fetch('/api/resources/star', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resourceId: resId,
                    userId: currentUser.id,
                    action: isStarred ? 'unstar' : 'star'
                })
            });
            fetchResources();
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
                return (Date.now() - date.getTime()) < 86400000;
            }).length
        };
    }, [resources]);

    if (!isMounted) return <div style={{ minHeight: '100vh' }} />;

    const safeResources = Array.isArray(resources) ? resources : [];

    const activeFilterCount = filterFileType.length + (filterDateRange ? 1 : 0) + (filterCourse ? 1 : 0) + (filterSpec ? 1 : 0);
    const clearAllFilters = () => { setFilterFileType([]); setFilterDateRange(''); setFilterCourse(''); setFilterSpec(''); };

    const toggleFileType = (ft: string) => {
        setFilterFileType(prev => prev.includes(ft) ? prev.filter(x => x !== ft) : [...prev, ft]);
    };

    const DATE_RANGES = [
        { label: 'Today', value: 'today' },
        { label: 'Last 7 days', value: '7days' },
        { label: 'Last 30 days', value: '30days' },
        { label: 'This year', value: 'year' },
    ];

    const FILE_TYPES = [
        { label: 'PDF', value: 'pdf', color: '#ea4335', bg: '#fce8e6' },
        { label: 'Image', value: 'image', color: '#34a853', bg: '#e6f4ea' },
        { label: 'Document', value: 'doc', color: '#4285f4', bg: '#e8f0fe' },
    ];

    const getFileIcon = (fileType: string) => {
        const ft = fileType || '';
        if (ft.includes('pdf')) return { icon: <FileText size={18} />, color: '#ea4335', bg: '#fce8e6' };
        if (ft.includes('image')) return { icon: <ImageIcon size={18} />, color: '#34a853', bg: '#e6f4ea' };
        return { icon: <File size={18} />, color: '#4285f4', bg: '#e8f0fe' };
    };

    const breadcrumb = [
        { label: 'UniLib', icon: <Home size={14} /> },
        selectedCourse !== 'All' ? { label: selectedCourse } : null,
        selectedSpecialization !== 'All' ? { label: selectedSpecialization } : null,
    ].filter(Boolean) as { label: string; icon?: React.ReactNode }[];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@300;400;500&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                body {
                    font-family: 'Roboto', sans-serif;
                    background: #f8f9fa;
                    color: #202124;
                }

                /* ── TOP BAR ── */
                .topbar {
                    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
                    height: 64px;
                    background: #fff;
                    border-bottom: 1px solid #e0e0e0;
                    display: flex; align-items: center; gap: 16px;
                    padding: 0 16px;
                }

                .topbar-logo {
                    display: flex; align-items: center; gap: 8px;
                    text-decoration: none; color: #5f6368;
                    font-family: 'Google Sans', sans-serif;
                    font-size: 22px; font-weight: 400;
                    min-width: 200px;
                    padding-left: 8px;
                }
                .topbar-logo svg { color: #4285f4; }
                .topbar-logo span { color: #202124; }

                .search-wrap {
                    flex: 1;
                    max-width: 720px;
                    position: relative;
                }
                .search-wrap input {
                    width: 100%;
                    height: 46px;
                    background: #f1f3f4;
                    border: 1px solid transparent;
                    border-radius: 24px;
                    padding: 0 16px 0 48px;
                    font-size: 16px;
                    font-family: 'Roboto', sans-serif;
                    color: #202124;
                    outline: none;
                    transition: all 0.2s;
                }
                .search-wrap input:focus {
                    background: #fff;
                    border-color: #4285f4;
                    box-shadow: 0 1px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.24);
                }
                .search-icon {
                    position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
                    color: #5f6368; pointer-events: none;
                }

                .topbar-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }

                /* ── LAYOUT ── */
                .layout {
                    display: flex;
                    padding-top: 64px;
                    min-height: 100vh;
                }

                /* ── SIDEBAR ── */
                .sidebar {
                    width: 256px;
                    min-width: 256px;
                    padding: 8px 0;
                    position: fixed; top: 64px; left: 0; bottom: 0;
                    overflow-y: auto;
                    background: #fff;
                    border-right: 1px solid #e0e0e0;
                    transition: width 0.2s;
                }
                .sidebar.collapsed { width: 72px; min-width: 72px; }

                .new-btn {
                    display: flex; align-items: center; gap: 12px;
                    margin: 8px 16px 16px;
                    padding: 16px 24px;
                    background: #fff;
                    border: 1px solid #dadce0;
                    border-radius: 16px;
                    cursor: pointer;
                    font-family: 'Google Sans', sans-serif;
                    font-size: 14px; font-weight: 500;
                    color: #202124;
                    box-shadow: 0 1px 2px rgba(0,0,0,.1);
                    transition: box-shadow 0.2s, background 0.2s;
                }
                .new-btn:hover { box-shadow: 0 2px 6px rgba(0,0,0,.16); background: #fafafa; }
                .new-btn svg { color: #4285f4; }

                .sidebar-section { margin-bottom: 8px; }
                .sidebar-label {
                    font-size: 11px; font-weight: 500; color: #80868b;
                    padding: 8px 16px 4px; letter-spacing: .4px;
                    text-transform: uppercase;
                }

                .sidebar-item {
                    display: flex; align-items: center; gap: 16px;
                    padding: 8px 16px;
                    border-radius: 0 24px 24px 0;
                    margin-right: 16px;
                    cursor: pointer;
                    font-size: 14px; color: #202124;
                    transition: background 0.15s;
                    position: relative;
                    white-space: nowrap; overflow: hidden;
                }
                .sidebar-item:hover { background: #f1f3f4; }
                .sidebar-item.active { background: #e8f0fe; font-weight: 500; color: #1a73e8; }
                .sidebar-item.active svg { color: #1a73e8; }
                .sidebar-item svg { color: #5f6368; flex-shrink: 0; }

                .sidebar-item .chevron {
                    margin-left: auto; transition: transform 0.2s;
                    flex-shrink: 0;
                }
                .sidebar-item .chevron.open { transform: rotate(180deg); }

                .sidebar-sub {
                    padding-left: 16px;
                    overflow: hidden;
                    max-height: 0; transition: max-height 0.3s ease;
                }
                .sidebar-sub.open { max-height: 400px; }

                .sidebar-sub-item {
                    display: flex; align-items: center; gap: 12px;
                    padding: 6px 16px 6px 16px;
                    border-radius: 0 24px 24px 0;
                    margin-right: 16px;
                    cursor: pointer;
                    font-size: 13px; color: #5f6368;
                    transition: background 0.15s;
                }
                .sidebar-sub-item:hover { background: #f1f3f4; color: #202124; }
                .sidebar-sub-item.active { background: #e8f0fe; color: #1a73e8; font-weight: 500; }

                .divider { height: 1px; background: #e0e0e0; margin: 8px 0; }

                /* ── MAIN ── */
                .main {
                    margin-left: 256px;
                    flex: 1;
                    padding: 20px 24px;
                    min-height: calc(100vh - 64px);
                    transition: margin-left 0.2s;
                }

                /* ── BREADCRUMB ── */
                .breadcrumb {
                    display: flex; align-items: center; gap: 4px;
                    font-size: 13px; color: #5f6368;
                    margin-bottom: 16px;
                }
                .breadcrumb-sep { color: #bdc1c6; }
                .breadcrumb span:last-child { color: #202124; font-weight: 500; }

                /* ── TOOLBAR ── */
                .toolbar {
                    display: flex; align-items: center; gap: 8px;
                    margin-bottom: 16px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #e0e0e0;
                }
                .toolbar-left { display: flex; align-items: center; gap: 8px; flex: 1; }

                .chip {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 6px 14px;
                    border-radius: 20px;
                    border: 1px solid #dadce0;
                    font-size: 13px; font-weight: 500;
                    color: #202124; background: #fff;
                    cursor: pointer; transition: all 0.15s;
                    white-space: nowrap;
                }
                .chip:hover { background: #f8f9fa; border-color: #c6c9cd; }
                .chip.active { background: #e8f0fe; border-color: #d2e3fc; color: #1a73e8; }
                .chip svg { color: inherit; }

                .icon-btn {
                    width: 40px; height: 40px;
                    border-radius: 50%;
                    border: none; background: transparent;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; color: #5f6368;
                    transition: background 0.15s;
                }
                .icon-btn:hover { background: #f1f3f4; }
                .icon-btn.active { color: #1a73e8; background: #e8f0fe; }

                /* ── TABLE (list view) ── */
                .file-table { width: 100%; border-collapse: collapse; }
                .file-table thead th {
                    text-align: left; padding: 8px 12px;
                    font-size: 12px; font-weight: 500; color: #80868b;
                    border-bottom: 1px solid #e0e0e0;
                    user-select: none; cursor: pointer;
                    white-space: nowrap;
                }
                .file-table thead th:hover { color: #202124; }
                .file-table thead th:first-child { padding-left: 16px; }

                .file-row {
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.1s;
                }
                .file-row:hover { background: #f8f9fa; }
                .file-row td {
                    padding: 10px 12px;
                    font-size: 13px; color: #202124;
                    border-bottom: 1px solid #f1f3f4;
                    white-space: nowrap;
                }
                .file-row td:first-child { padding-left: 16px; }

                .file-name-cell {
                    display: flex; align-items: center; gap: 12px;
                    min-width: 0;
                }
                .file-icon-wrap {
                    width: 32px; height: 32px; border-radius: 4px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }
                .file-title {
                    font-size: 13px; font-weight: 400; color: #202124;
                    overflow: hidden; text-overflow: ellipsis;
                    max-width: 400px;
                }
                .file-desc {
                    font-size: 12px; color: #80868b;
                    overflow: hidden; text-overflow: ellipsis;
                }

                .badge-pill {
                    display: inline-flex; align-items: center;
                    padding: 3px 10px; border-radius: 12px;
                    font-size: 11px; font-weight: 500;
                    background: #e8f0fe; color: #1a73e8;
                }

                .row-actions {
                    display: flex; align-items: center; gap: 4px;
                    opacity: 0; transition: opacity 0.15s;
                }
                .file-row:hover .row-actions { opacity: 1; }

                .action-btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 5px 12px; border-radius: 4px;
                    border: 1px solid #dadce0;
                    font-size: 12px; font-weight: 500;
                    color: #1a73e8; background: #fff;
                    cursor: pointer; text-decoration: none;
                    transition: background 0.15s;
                }
                .action-btn:hover { background: #e8f0fe; border-color: #d2e3fc; }
                .action-btn.primary { background: #1a73e8; color: #fff; border-color: #1a73e8; }
                .action-btn.primary:hover { background: #1765cc; }

                /* ── GRID VIEW ── */
                .file-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 8px;
                }

                .grid-card {
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    overflow: hidden;
                    cursor: pointer;
                    background: #fff;
                    transition: box-shadow 0.2s, border-color 0.2s;
                }
                .grid-card:hover {
                    box-shadow: 0 1px 4px rgba(0,0,0,.16);
                    border-color: #bdc1c6;
                }
                .grid-card-thumb {
                    height: 120px;
                    display: flex; align-items: center; justify-content: center;
                    border-bottom: 1px solid #e0e0e0;
                }
                .grid-card-body { padding: 10px 12px; }
                .grid-card-title {
                    font-size: 13px; font-weight: 400; color: #202124;
                    overflow: hidden; text-overflow: ellipsis;
                    white-space: nowrap; margin-bottom: 4px;
                }
                .grid-card-meta { font-size: 11px; color: #80868b; }

                /* ── STATS BAR ── */
                .stats-bar {
                    display: flex; gap: 12px;
                    margin-bottom: 20px;
                }
                .stat-pill {
                    display: flex; align-items: center; gap: 8px;
                    padding: 8px 16px; border-radius: 8px;
                    background: #fff; border: 1px solid #e0e0e0;
                    font-size: 13px; color: #5f6368;
                }
                .stat-pill strong { color: #202124; font-weight: 500; }

                /* ── EMPTY STATE ── */
                .empty-state {
                    text-align: center; padding: 80px 24px;
                    color: #80868b;
                }
                .empty-state svg { color: #bdc1c6; margin-bottom: 16px; }
                .empty-state h3 { font-size: 16px; color: #202124; margin-bottom: 8px; font-family: 'Google Sans', sans-serif; }
                .empty-state p { font-size: 14px; }

                /* ── MODAL ── */
                .overlay {
                    position: fixed; inset: 0; z-index: 200;
                    background: rgba(0,0,0,.5);
                    display: flex; align-items: center; justify-content: center;
                    padding: 24px;
                }
                .modal {
                    background: #fff;
                    border-radius: 8px;
                    box-shadow: 0 24px 38px rgba(0,0,0,.14);
                    width: 100%; max-width: 520px;
                    max-height: 90vh; overflow-y: auto;
                    animation: modalIn .2s ease;
                }
                @keyframes modalIn {
                    from { transform: scale(.96); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .modal-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 20px 24px 16px;
                    border-bottom: 1px solid #e0e0e0;
                }
                .modal-title {
                    font-family: 'Google Sans', sans-serif;
                    font-size: 18px; font-weight: 400; color: #202124;
                }
                .modal-body { padding: 20px 24px; }
                .modal-footer {
                    display: flex; justify-content: flex-end; gap: 8px;
                    padding: 16px 24px;
                    border-top: 1px solid #e0e0e0;
                }

                .form-group { margin-bottom: 16px; }
                .form-label {
                    display: block; font-size: 12px; font-weight: 500;
                    color: #5f6368; margin-bottom: 6px; letter-spacing: .3px;
                }
                .form-input, .form-select, .form-textarea {
                    width: 100%;
                    padding: 9px 12px;
                    border: 1px solid #dadce0;
                    border-radius: 4px;
                    font-size: 14px; font-family: 'Roboto', sans-serif;
                    color: #202124; background: #fff;
                    outline: none; transition: border-color 0.15s;
                }
                .form-input:focus, .form-select:focus, .form-textarea:focus {
                    border-color: #1a73e8;
                    box-shadow: 0 0 0 2px rgba(26,115,232,.15);
                }
                .form-textarea { resize: vertical; min-height: 80px; }

                .file-drop {
                    border: 2px dashed #dadce0;
                    border-radius: 8px;
                    padding: 32px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s; color: #80868b;
                    font-size: 14px;
                }
                .file-drop:hover { border-color: #1a73e8; background: #e8f0fe; color: #1a73e8; }

                /* ── LOADING ── */
                .loading-row td {
                    padding: 48px; text-align: center; color: #80868b;
                }
                .spinner {
                    width: 32px; height: 32px;
                    border: 3px solid #e0e0e0;
                    border-top-color: #1a73e8;
                    border-radius: 50%;
                    animation: spin .8s linear infinite;
                    margin: 0 auto 12px;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* ── PREVIEW ── */
                .preview-modal {
                    background: #fff;
                    border-radius: 8px;
                    width: 100%; max-width: 900px;
                    height: 85vh;
                    display: flex; flex-direction: column;
                    box-shadow: 0 24px 38px rgba(0,0,0,.2);
                    animation: modalIn .2s ease;
                }
                .preview-content { flex: 1; overflow: hidden; }
                .preview-iframe { width: 100%; height: 100%; border: none; }
                .preview-img { width: 100%; height: 100%; object-fit: contain; }

                /* ── FILTER DROPDOWNS ── */
                .filter-bar {
                    display: flex; align-items: center; gap: 8px;
                    flex-wrap: wrap;
                }

                .filter-dropdown-wrap {
                    position: relative;
                }

                .filter-btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 7px 14px;
                    border-radius: 20px;
                    border: 1px solid #dadce0;
                    background: #fff;
                    font-size: 13px; font-weight: 500; color: #202124;
                    cursor: pointer; transition: all .15s;
                    white-space: nowrap; user-select: none;
                }
                .filter-btn:hover { background: #f8f9fa; border-color: #bdc1c6; }
                .filter-btn.active {
                    background: #e8f0fe; border-color: #d2e3fc; color: #1a73e8;
                }
                .filter-btn .badge {
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 18px; height: 18px; border-radius: 50%;
                    background: #1a73e8; color: #fff;
                    font-size: 10px; font-weight: 700;
                    margin-left: 2px;
                }
                .filter-btn svg { color: inherit; }

                .dropdown-panel {
                    position: absolute; top: calc(100% + 6px); left: 0;
                    background: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    box-shadow: 0 4px 16px rgba(0,0,0,.14);
                    min-width: 220px;
                    z-index: 300;
                    overflow: hidden;
                    animation: dropIn .15s ease;
                }
                @keyframes dropIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .dropdown-header {
                    padding: 12px 16px 8px;
                    font-size: 11px; font-weight: 600; color: #80868b;
                    letter-spacing: .5px; text-transform: uppercase;
                    border-bottom: 1px solid #f1f3f4;
                }

                .dropdown-option {
                    display: flex; align-items: center; gap: 10px;
                    padding: 10px 16px;
                    cursor: pointer; font-size: 13px; color: #202124;
                    transition: background .1s;
                }
                .dropdown-option:hover { background: #f8f9fa; }
                .dropdown-option.selected { background: #e8f0fe; color: #1a73e8; font-weight: 500; }

                .dropdown-check {
                    width: 16px; height: 16px; border-radius: 3px;
                    border: 2px solid #dadce0;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0; transition: all .1s;
                }
                .dropdown-option.selected .dropdown-check {
                    background: #1a73e8; border-color: #1a73e8; color: #fff;
                }

                .dropdown-radio {
                    width: 16px; height: 16px; border-radius: 50%;
                    border: 2px solid #dadce0;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0; transition: all .1s;
                }
                .dropdown-option.selected .dropdown-radio {
                    border-color: #1a73e8;
                }
                .dropdown-option.selected .dropdown-radio::after {
                    content: ''; width: 8px; height: 8px;
                    border-radius: 50%; background: #1a73e8;
                }

                .dropdown-footer {
                    display: flex; justify-content: flex-end; gap: 8px;
                    padding: 8px 12px;
                    border-top: 1px solid #f1f3f4;
                }
                .dropdown-clear {
                    font-size: 12px; font-weight: 500; color: #1a73e8;
                    background: none; border: none; cursor: pointer; padding: 4px 8px;
                    border-radius: 4px;
                }
                .dropdown-clear:hover { background: #e8f0fe; }

                .ft-dot {
                    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
                }

                /* active filter chips row */
                .active-chips {
                    display: flex; align-items: center; gap: 6px;
                    flex-wrap: wrap; margin-bottom: 12px;
                }
                .active-chip {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 4px 10px 4px 12px;
                    background: #e8f0fe; border-radius: 16px;
                    font-size: 12px; font-weight: 500; color: #1a73e8;
                    border: 1px solid #d2e3fc;
                }
                .active-chip button {
                    background: none; border: none; cursor: pointer;
                    display: flex; align-items: center; color: #1a73e8;
                    padding: 0; margin-left: 2px;
                }
                .clear-all-btn {
                    font-size: 12px; font-weight: 500; color: #5f6368;
                    background: none; border: none; cursor: pointer;
                    padding: 4px 8px; border-radius: 4px;
                    transition: background .15s;
                }
                .clear-all-btn:hover { background: #f1f3f4; color: #202124; }
                .btn-upload {
                    display: flex; align-items: center; gap: 8px;
                    padding: 8px 20px; border-radius: 4px;
                    background: #1a73e8; color: #fff; border: none;
                    font-family: 'Google Sans', sans-serif;
                    font-size: 14px; font-weight: 500;
                    cursor: pointer; transition: background .15s;
                }
                .btn-upload:hover { background: #1765cc; }

                .btn-ghost {
                    display: flex; align-items: center; gap: 6px;
                    padding: 8px 20px; border-radius: 4px;
                    background: transparent; color: #5f6368;
                    border: 1px solid #dadce0;
                    font-size: 14px; font-weight: 500;
                    cursor: pointer; transition: background .15s;
                }
                .btn-ghost:hover { background: #f1f3f4; }
            `}</style>

            {/* ── TOP BAR ── */}
            <header className="topbar">
                <Link href="/" className="topbar-logo">
                    <BookOpen size={28} />
                    <span>UniLib</span>
                </Link>

                <div className="search-wrap">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search in UniLib"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="topbar-actions">
                    <button className="btn-upload" onClick={() => setIsUploadOpen(true)}>
                        <Upload size={16} /> Upload
                    </button>
                </div>
            </header>

            <div className="layout">
                {/* ── SIDEBAR ── */}
                <aside className="sidebar">
                    <button className="new-btn" onClick={() => setIsUploadOpen(true)}>
                        <Plus size={20} /> New
                    </button>

                    <div className="sidebar-section">
                        <div
                            className={`sidebar-item ${activeTab === 'library' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('library'); setSelectedCourse('All'); setSelectedSpecialization('All'); setExpandedCourse(null); }}
                        >
                            <Home size={18} /> My Library
                        </div>
                        <div 
                            className={`sidebar-item ${activeTab === 'recent' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('recent'); setSelectedCourse('All'); setSelectedSpecialization('All'); }}
                        >
                            <Clock size={18} /> Recent
                        </div>
                        <div 
                            className={`sidebar-item ${activeTab === 'starred' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('starred'); setSelectedCourse('All'); setSelectedSpecialization('All'); }}
                        >
                            <Star size={18} /> Starred
                        </div>
                    </div>

                    <div className="divider" />

                    <div className="sidebar-section">
                        <div className="sidebar-label">Courses</div>

                        <div
                            className={`sidebar-item ${selectedCourse === 'All' && selectedSpecialization !== 'All' ? '' : ''}`}
                            onClick={() => setIsManageOpen(true)}
                        >
                            <Plus size={16} /> Manage Courses
                        </div>

                        {dbCourses.map((c) => (
                            <div key={c.id}>
                                <div
                                    className={`sidebar-item ${selectedCourse === c.name ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedCourse(c.name);
                                        setSelectedSpecialization('All');
                                        setExpandedCourse(expandedCourse === c.id ? null : c.id);
                                    }}
                                >
                                    <Folder size={18} />
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                                    {c.specializations.length > 0 && (
                                        <ChevronDown
                                            size={14}
                                            className={`chevron ${expandedCourse === c.id ? 'open' : ''}`}
                                        />
                                    )}
                                </div>
                                <div className={`sidebar-sub ${expandedCourse === c.id ? 'open' : ''}`}>
                                    {c.specializations.map((s) => (
                                        <div
                                            key={s.id}
                                            className={`sidebar-sub-item ${selectedSpecialization === s.name ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedCourse(c.name);
                                                setSelectedSpecialization(s.name);
                                            }}
                                        >
                                            <FolderOpen size={14} /> {s.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* ── MAIN CONTENT ── */}
                <main className="main">

                    {/* Breadcrumb */}
                    <div className="breadcrumb">
                        {breadcrumb.map((b, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                {b.icon}{b.label}
                                {i < breadcrumb.length - 1 && <ChevronRight size={14} className="breadcrumb-sep" />}
                            </span>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="stats-bar">
                        <div className="stat-pill"><strong>{stats.total}</strong> items</div>
                        <div className="stat-pill"><strong>{stats.categories}</strong> categories</div>
                        {stats.recent > 0 && <div className="stat-pill"><Clock size={14} /><strong>{stats.recent}</strong> added today</div>}
                    </div>

                    {/* Filter Toolbar */}
                    <div style={{ marginBottom: 16 }}>
                        <div className="filter-bar" ref={filterBarRef}>

                            {/* ── File Type ── */}
                            <div className="filter-dropdown-wrap">
                                <button
                                    className={`filter-btn ${filterFileType.length > 0 ? 'active' : ''}`}
                                    onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                                >
                                    <FileText size={14} />
                                    File type
                                    {filterFileType.length > 0 && <span className="badge">{filterFileType.length}</span>}
                                    <ChevronDown size={13} style={{ transition: 'transform .2s', transform: openDropdown === 'type' ? 'rotate(180deg)' : 'none' }} />
                                </button>
                                {openDropdown === 'type' && (
                                    <div className="dropdown-panel">
                                        <div className="dropdown-header">File type</div>
                                        {FILE_TYPES.map(ft => (
                                            <div
                                                key={ft.value}
                                                className={`dropdown-option ${filterFileType.includes(ft.value) ? 'selected' : ''}`}
                                                onClick={() => toggleFileType(ft.value)}
                                            >
                                                <div className="dropdown-check">
                                                    {filterFileType.includes(ft.value) && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                                </div>
                                                <div className="ft-dot" style={{ background: ft.color }} />
                                                {ft.label}
                                            </div>
                                        ))}
                                        {filterFileType.length > 0 && (
                                            <div className="dropdown-footer">
                                                <button className="dropdown-clear" onClick={() => setFilterFileType([])}>Clear</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ── Date Modified ── */}
                            <div className="filter-dropdown-wrap">
                                <button
                                    className={`filter-btn ${filterDateRange ? 'active' : ''}`}
                                    onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
                                >
                                    <Clock size={14} />
                                    {filterDateRange ? DATE_RANGES.find(d => d.value === filterDateRange)?.label : 'Date modified'}
                                    <ChevronDown size={13} style={{ transition: 'transform .2s', transform: openDropdown === 'date' ? 'rotate(180deg)' : 'none' }} />
                                </button>
                                {openDropdown === 'date' && (
                                    <div className="dropdown-panel">
                                        <div className="dropdown-header">Date modified</div>
                                        {DATE_RANGES.map(dr => (
                                            <div
                                                key={dr.value}
                                                className={`dropdown-option ${filterDateRange === dr.value ? 'selected' : ''}`}
                                                onClick={() => { setFilterDateRange(filterDateRange === dr.value ? '' : dr.value); setOpenDropdown(null); }}
                                            >
                                                <div className="dropdown-radio" />
                                                {dr.label}
                                            </div>
                                        ))}
                                        {filterDateRange && (
                                            <div className="dropdown-footer">
                                                <button className="dropdown-clear" onClick={() => setFilterDateRange('')}>Clear</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ── Course / Specialization ── */}
                            <div className="filter-dropdown-wrap">
                                <button
                                    className={`filter-btn ${filterCourse || filterSpec ? 'active' : ''}`}
                                    onClick={() => setOpenDropdown(openDropdown === 'course' ? null : 'course')}
                                >
                                    <GraduationCap size={14} />
                                    {filterCourse ? `${filterCourse}${filterSpec ? ' › ' + filterSpec : ''}` : 'Course'}
                                    <ChevronDown size={13} style={{ transition: 'transform .2s', transform: openDropdown === 'course' ? 'rotate(180deg)' : 'none' }} />
                                </button>
                                {openDropdown === 'course' && (
                                    <div className="dropdown-panel" style={{ minWidth: 260 }}>
                                        <div className="dropdown-header">Course</div>
                                        {dbCourses.map(c => (
                                            <div key={c.id}>
                                                <div
                                                    className={`dropdown-option ${filterCourse === c.name ? 'selected' : ''}`}
                                                    onClick={() => { setFilterCourse(filterCourse === c.name ? '' : c.name); setFilterSpec(''); }}
                                                >
                                                    <div className="dropdown-radio" />
                                                    <Folder size={14} style={{ flexShrink: 0 }} />
                                                    {c.name}
                                                </div>
                                                {filterCourse === c.name && c.specializations.length > 0 && (
                                                    <>
                                                        <div style={{ padding: '4px 16px 2px 36px', fontSize: 11, color: '#80868b', fontWeight: 600, letterSpacing: '.4px', textTransform: 'uppercase' }}>Specialization</div>
                                                        {c.specializations.map(s => (
                                                            <div
                                                                key={s.id}
                                                                className={`dropdown-option ${filterSpec === s.name ? 'selected' : ''}`}
                                                                style={{ paddingLeft: 36 }}
                                                                onClick={(e) => { e.stopPropagation(); setFilterSpec(filterSpec === s.name ? '' : s.name); }}
                                                            >
                                                                <div className="dropdown-radio" />
                                                                {s.name}
                                                            </div>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                        {(filterCourse || filterSpec) && (
                                            <div className="dropdown-footer">
                                                <button className="dropdown-clear" onClick={() => { setFilterCourse(''); setFilterSpec(''); }}>Clear</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Category chips */}
                            <div style={{ width: 1, height: 24, background: '#e0e0e0', margin: '0 4px' }} />
                            {derivedCategories.map(cat => (
                                <div key={cat} className={`chip ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
                                    {cat}
                                </div>
                            ))}

                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                                <button className={`icon-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><List size={18} /></button>
                                <button className={`icon-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><Grid size={18} /></button>
                            </div>
                        </div>

                        {/* Active filter chips */}
                        {activeFilterCount > 0 && (
                            <div className="active-chips" style={{ marginTop: 10 }}>
                                {filterFileType.map(ft => (
                                    <div key={ft} className="active-chip">
                                        {FILE_TYPES.find(f => f.value === ft)?.label}
                                        <button onClick={() => toggleFileType(ft)}><X size={12} /></button>
                                    </div>
                                ))}
                                {filterDateRange && (
                                    <div className="active-chip">
                                        {DATE_RANGES.find(d => d.value === filterDateRange)?.label}
                                        <button onClick={() => setFilterDateRange('')}><X size={12} /></button>
                                    </div>
                                )}
                                {filterCourse && (
                                    <div className="active-chip">
                                        {filterCourse}{filterSpec ? ` › ${filterSpec}` : ''}
                                        <button onClick={() => { setFilterCourse(''); setFilterSpec(''); }}><X size={12} /></button>
                                    </div>
                                )}
                                <button className="clear-all-btn" onClick={clearAllFilters}>Clear all</button>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    {loading ? (
                        <table className="file-table">
                            <tbody>
                                <tr className="loading-row"><td colSpan={5}>
                                    <div className="spinner" />
                                    <p>Loading resources…</p>
                                </td></tr>
                            </tbody>
                        </table>
                    ) : error ? (
                        <div className="empty-state">
                            <X size={48} color="#ea4335" />
                            <h3>Something went wrong</h3>
                            <p>{error}</p>
                            <button className="btn-upload" style={{ margin: '16px auto 0', display: 'flex' }} onClick={fetchResources}>
                                Retry
                            </button>
                        </div>
                    ) : safeResources.length === 0 ? (
                        <div className="empty-state">
                            <Folder size={64} />
                            <h3>No resources found</h3>
                            <p>Upload a file or adjust your filters.</p>
                        </div>
                    ) : viewMode === 'list' ? (
                        <table className="file-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Course</th>
                                    <th>Category</th>
                                    <th>Date added</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {safeResources.map((res) => {
                                    const { icon, color, bg } = getFileIcon(res.fileType);
                                    return (
                                        <tr key={res.id} className="file-row" onClick={() => setPreviewResource(res)}>
                                            <td>
                                                <div className="file-name-cell">
                                                    <div className="file-icon-wrap" style={{ background: bg }}>
                                                        <span style={{ color }}>{icon}</span>
                                                    </div>
                                                    <div>
                                                        <div className="file-title">{res.title}</div>
                                                        {res.description && (
                                                            <div className="file-desc">{res.description.slice(0, 60)}{res.description.length > 60 ? '…' : ''}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: 13, color: '#5f6368' }}>
                                                    {res.course}{res.specialization ? ` › ${res.specialization}` : ''}
                                                </span>
                                            </td>
                                            <td><span className="badge-pill">{res.category}</span></td>
                                            <td style={{ color: '#5f6368', fontSize: 13 }}>
                                                {isMounted && res.createdAt ? new Date(res.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                            </td>
                                            <td onClick={(e) => e.stopPropagation()}>
                                                <div className="row-actions">
                                                    <button className="action-btn" onClick={(e) => toggleStar(e, res.id, !!(res.starredBy?.some(u => u.id === currentUser?.id)))}>
                                                        <Star size={14} fill={res.starredBy?.some(u => u.id === currentUser?.id) ? '#fbbc04' : 'none'} color={res.starredBy?.some(u => u.id === currentUser?.id) ? '#fbbc04' : '#1a73e8'} />
                                                    </button>
                                                    <button className="action-btn" onClick={() => setPreviewResource(res)}>
                                                        <Eye size={14} /> Preview
                                                    </button>
                                                    <a href={res.fileUrl} download className="action-btn primary" onClick={(e) => e.stopPropagation()}>
                                                        <Download size={14} /> Download
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="file-grid">
                            {safeResources.map((res) => {
                                const { icon, color, bg } = getFileIcon(res.fileType);
                                return (
                                    <div key={res.id} className="grid-card" onClick={() => setPreviewResource(res)}>
                                        <div className="grid-card-thumb" style={{ background: bg }}>
                                            <span style={{ color, transform: 'scale(2.5)', display: 'flex' }}>{icon}</span>
                                        </div>
                                        <div className="grid-card-body">
                                            <div className="grid-card-title">{res.title}</div>
                                            <div className="grid-card-meta">{res.category} · {res.course}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* ── UPLOAD MODAL ── */}
            {isUploadOpen && (
                <div className="overlay" onClick={() => setIsUploadOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">Upload resource</span>
                            <button className="icon-btn" onClick={() => setIsUploadOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleUpload}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Title</label>
                                    <input className="form-input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Intro to Algorithms" required />
                                </div>
                                <div className="form-group">
    <label className="form-label">Course</label>
    <select className="form-select" value={formCourse} onChange={(e) => { setFormCourse(e.target.value); setFormSpecialization(''); }} required>
        <option value="">Select course</option>
        {dbCourses.length > 0
            ? dbCourses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
            : ['MCA', 'BCA', 'MBA', 'BBA', 'BCom', 'MCom'].map(name => (
                <option key={name} value={name}>{name}</option>
            ))
        }
    </select>
</div>
                               {formCourse && (
    <div className="form-group">
        <label className="form-label">Specialization</label>
        <select className="form-select" value={formSpecialization} onChange={(e) => setFormSpecialization(e.target.value)} required>
            <option value="">Select specialization</option>
            {(dbCourses.find(c => c.name === formCourse)?.specializations?.length
                ? dbCourses.find(c => c.name === formCourse)!.specializations.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                ))
                : (COURSE_SPECIALIZATIONS[formCourse] || []).map(name => (
                    <option key={name} value={name}>{name}</option>
                ))
            )}
        </select>
    </div>
)}
                                <div className="form-group">
                                    <label className="form-label">Material type</label>
                                    <select className="form-select" value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                                        <option>Notes</option>
                                        <option>Books</option>
                                        <option>Question Papers</option>
                                        <option>Project Reports</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-textarea" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Briefly describe the content…" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">File</label>
                                    <div className="file-drop" onClick={() => document.getElementById('fu')?.click()}>
                                        <Upload size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: .5 }} />
                                        {file ? file.name : 'Click to select or drag and drop'}
                                        <input type="file" id="fu" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-ghost" onClick={() => setIsUploadOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-upload">Upload</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── PREVIEW MODAL ── */}
            {previewResource && (
                <div className="overlay" onClick={() => setPreviewResource(null)}>
                    <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">{previewResource.title}</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <a href={previewResource.fileUrl} download className="action-btn primary">
                                    <Download size={14} /> Download
                                </a>
                                <button className="icon-btn" onClick={() => setPreviewResource(null)}><X size={20} /></button>
                            </div>
                        </div>
                        <div className="preview-content">
                            {(previewResource.fileType || '').includes('pdf') ? (
                                <iframe src={previewResource.fileUrl} className="preview-iframe" />
                            ) : (previewResource.fileType || '').includes('image') ? (
                                <img src={previewResource.fileUrl} alt={previewResource.title} className="preview-img" />
                            ) : (
                                <div className="empty-state">
                                    <FileText size={48} />
                                    <p>Preview not available for this file type.</p>
                                    <a href={previewResource.fileUrl} download className="btn-upload" style={{ display: 'inline-flex', marginTop: 16 }}>
                                        <Download size={16} /> Download to view
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── MANAGE MODAL ── */}
            {isManageOpen && (
                <div className="overlay" onClick={() => setIsManageOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">Manage academic sections</span>
                            <button className="icon-btn" onClick={() => setIsManageOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: 24 }}>
                                <div className="form-label" style={{ marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Add new course</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input className="form-input" style={{ flex: 1 }} type="text" placeholder="e.g. B.A. LLB" value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} />
                                    <button className="btn-upload" onClick={async () => {
                                        if (!newCourseName) return;
                                        await fetch('/api/courses', { method: 'POST', body: JSON.stringify({ type: 'course', name: newCourseName }) });
                                        setNewCourseName(''); fetchCourses();
                                    }}>Add</button>
                                </div>
                            </div>
                            <div className="divider" style={{ marginBottom: 24 }} />
                            <div>
                                <div className="form-label" style={{ marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Add specialization</div>
                                <div className="form-group">
                                    <select className="form-select" value={targetCourseId} onChange={(e) => setTargetCourseId(e.target.value)}>
                                        <option value="">Select course</option>
                                        {dbCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input className="form-input" style={{ flex: 1 }} type="text" placeholder="e.g. Criminal Law" value={newSpecName} onChange={(e) => setNewSpecName(e.target.value)} />
                                    <button className="btn-upload" onClick={async () => {
                                        if (!newSpecName || !targetCourseId) return;
                                        await fetch('/api/courses', { method: 'POST', body: JSON.stringify({ type: 'specialization', name: newSpecName, courseId: targetCourseId }) });
                                        setNewSpecName(''); fetchCourses();
                                    }}>Add</button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-ghost" onClick={() => setIsManageOpen(false)}>Done</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}