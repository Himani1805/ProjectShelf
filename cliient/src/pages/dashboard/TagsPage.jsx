import { useState, useEffect } from 'react';
import api from '../../services/api';

const TagsPage = () => {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTag, setNewTag] = useState({ name: '', color: '#3B82F6' });
    const [editingTag, setEditingTag] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchQuery, setSearchQuery] = useState('');

    const colors = [
        '#3B82F6', // blue
        '#10B981', // green
        '#F59E0B', // yellow
        '#EF4444', // red
        '#8B5CF6', // purple
        '#EC4899', // pink
        '#6366F1', // indigo
        '#14B8A6', // teal
        '#F97316', // orange
        '#6B7280', // gray
    ];

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/tags');
            setTags(response.data);
        } catch (error) {
            console.error('Error fetching tags:', error);
            setMessage({
                type: 'error',
                text: 'Failed to load tags. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            if (editingTag) {
                // Update existing tag
                await api.put(`/api/tags/${editingTag.id}`, {
                    name: newTag.name,
                    color: newTag.color
                });
                setMessage({
                    type: 'success',
                    text: 'Tag updated successfully!'
                });
            } else {
                // Create new tag
                await api.post('/api/tags', {
                    name: newTag.name,
                    color: newTag.color
                });
                setMessage({
                    type: 'success',
                    text: 'Tag created successfully!'
                });
            }

            // Reset form and refresh tags
            setNewTag({ name: '', color: '#3B82F6' });
            setEditingTag(null);
            fetchTags();
        } catch (error) {
            console.error('Error saving tag:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to save tag. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (tag) => {
        setEditingTag(tag);
        setNewTag({
            name: tag.name,
            color: tag.color
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this tag? This may affect projects using this tag.')) {
            return;
        }

        try {
            await api.delete(`/api/tags/${id}`);
            setTags(tags.filter(tag => tag.id !== id));
            setMessage({
                type: 'success',
                text: 'Tag deleted successfully!'
            });
        } catch (error) {
            console.error('Error deleting tag:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to delete tag. Please try again.'
            });
        }
    };

    const handleCancel = () => {
        setEditingTag(null);
        setNewTag({ name: '', color: '#3B82F6' });
    };

    const filteredTags = searchQuery
        ? tags.filter(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : tags;

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">Manage Tags</h1>

            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
                    <span>{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Tag Form */}
                <div className="md:col-span-1">
                    <div className="card bg-base-200 shadow-sm">
                        <div className="card-body">
                            <h2 className="card-title text-lg mb-4">
                                {editingTag ? 'Edit Tag' : 'Create New Tag'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text">Tag Name</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newTag.name}
                                        onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                                        className="input input-bordered"
                                        placeholder="e.g. React, UI Design"
                                        required
                                    />
                                </div>

                                <div className="form-control mb-6">
                                    <label className="label">
                                        <span className="label-text">Tag Color</span>
                                    </label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {colors.map(color => (
                                            <div
                                                key={color}
                                                onClick={() => setNewTag({ ...newTag, color })}
                                                className={`w-8 h-8 rounded-full cursor-pointer ${newTag.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            ></div>
                                        ))}
                                    </div>
                                </div>

                                <div className="card-actions justify-end">
                                    {editingTag && (
                                        <button
                                            type="button"
                                            className="btn btn-ghost"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSubmitting || !newTag.name}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm"></span>
                                                {editingTag ? 'Updating...' : 'Creating...'}
                                            </>
                                        ) : (
                                            editingTag ? 'Update Tag' : 'Create Tag'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Tags List */}
                <div className="md:col-span-2">
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="card-title text-lg">Your Tags</h2>
                                <div className="form-control">
                                    <input
                                        type="text"
                                        placeholder="Search tags..."
                                        className="input input-bordered input-sm w-full max-w-xs"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <span className="loading loading-spinner loading-lg"></span>
                                </div>
                            ) : filteredTags.length === 0 ? (
                                <div className="text-center py-8">
                                    <h3 className="text-lg font-semibold mb-2">
                                        {searchQuery ? 'No tags match your search' : 'No tags created yet'}
                                    </h3>
                                    <p className="text-base-content/70">
                                        {searchQuery
                                            ? 'Try a different search term'
                                            : 'Create your first tag to organize your projects'}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr>
                                                <th>Tag</th>
                                                <th>Projects</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTags.map(tag => (
                                                <tr key={tag.id}>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-4 h-4 rounded-full"
                                                                style={{ backgroundColor: tag.color }}
                                                            ></div>
                                                            <span>{tag.name}</span>
                                                        </div>
                                                    </td>
                                                    <td>{tag.projectCount || 0}</td>
                                                    <td>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEdit(tag)}
                                                                className="btn btn-sm btn-ghost"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(tag.id)}
                                                                className="btn btn-sm btn-error"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TagsPage;