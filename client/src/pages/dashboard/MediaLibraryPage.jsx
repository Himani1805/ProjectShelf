import { useState, useEffect } from 'react';
import api from '../../services/api';

const MediaLibraryPage = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/media');
            setMedia(response.data);
        } catch (error) {
            console.error('Error fetching media:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            await api.post('/api/media/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSelectedFiles([]);
            fetchMedia();
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        try {
            await api.delete(`/api/media/${id}`);
            setMedia(media.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const filteredMedia = searchQuery
        ? media.filter(item =>
            item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.type.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : media;

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">Media Library</h1>

            {/* Upload Section */}
            <div className="bg-base-200 p-6 rounded-lg mb-8">
                <h2 className="text-lg font-semibold mb-4">Upload New Files</h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="file-input file-input-bordered w-full md:w-auto"
                    />
                    <button
                        onClick={handleUpload}
                        disabled={selectedFiles.length === 0 || uploading}
                        className="btn btn-primary"
                    >
                        {uploading ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Uploading...
                            </>
                        ) : (
                            'Upload Files'
                        )}
                    </button>
                </div>
                {selectedFiles.length > 0 && (
                    <div className="mt-4">
                        <p className="text-sm font-medium">Selected files:</p>
                        <ul className="list-disc list-inside text-sm mt-1">
                            {selectedFiles.map((file, index) => (
                                <li key={index}>{file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Search and Filter */}
            <div className="mb-6">
                <div className="form-control">
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Search files..."
                            className="input input-bordered w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="btn btn-square">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Media Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : filteredMedia.length === 0 ? (
                <div className="text-center py-12 bg-base-200 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">No media files found</h3>
                    <p className="text-base-content/70">
                        {searchQuery ? 'Try a different search term' : 'Upload some files to get started'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredMedia.map(item => (
                        <div key={item.id} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                            <figure className="h-48 bg-base-200">
                                {item.type.startsWith('image/') ? (
                                    <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />
                                ) : item.type.startsWith('video/') ? (
                                    <video src={item.url} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full w-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                )}
                            </figure>
                            <div className="card-body p-4">
                                <h3 className="card-title text-sm truncate">{item.filename}</h3>
                                <p className="text-xs opacity-70">{item.type} • {(item.size / 1024).toFixed(2)} KB</p>
                                <div className="card-actions justify-end mt-2">
                                    <button
                                        className="btn btn-sm btn-ghost"
                                        onClick={() => navigator.clipboard.writeText(item.url)}
                                    >
                                        Copy URL
                                    </button>
                                    <button
                                        className="btn btn-sm btn-error"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MediaLibraryPage;