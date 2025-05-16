import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

const CLOUDINARY_UPLOAD_PRESET = 'misogi_presets';
const CLOUDINARY_CLOUD_NAME = 'dgbymqjtk';

const CreateProjectPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        tags: [],
        published: false,
        thumbnailUrl: '', // Added for Cloudinary URL
        imageUrls: [], // Added for Cloudinary URLs
    });
    const [tagInput, setTagInput] = useState('');
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [images, setImages] = useState([]);
    const [imagesPreviews, setImagesPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload image to Cloudinary');
            }

            const data = await response.json();
            return data.secure_url;
        } catch (err) {
            console.error('Cloudinary upload error:', err);
            throw new Error('Failed to upload image');
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnail(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files]);

        // Generate previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagesPreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagesPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setUploadProgress(0);

        try {
            // Upload thumbnail to Cloudinary if exists
            let thumbnailUrl = '';
            if (thumbnail) {
                thumbnailUrl = await uploadToCloudinary(thumbnail);
                setUploadProgress(25);
            }

            // Upload all project images to Cloudinary
            const imageUrls = [];
            if (images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const url = await uploadToCloudinary(images[i]);
                    imageUrls.push(url);
                    setUploadProgress(25 + ((i + 1) / images.length) * 50);
                }
            }

            // Prepare project data with Cloudinary URLs
            const projectData = {
                ...formData,
                published: Boolean(formData.published),
                thumbnailUrl,
                imageUrls,
            };

            // Create the project with image URLs
            const projectResponse = await api.post('/api/projects', projectData);
            setUploadProgress(100);

            if (!projectResponse.data || !projectResponse.data.data) {
                throw new Error('Invalid project data received from API');
            }

            navigate('/dashboard/projects');
        } catch (err) {
            console.error('Error creating project:', err);
            setError(err.message || 'Failed to create project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-2xl font-bold">Create New Project</h1>
                    <p className="text-base-content/70">Add a new project to your portfolio</p>
                </div>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            {loading && uploadProgress > 0 && (
                <div className="w-full bg-base-200 rounded-full h-2.5 mb-4">
                    <div 
                        className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                </div>
            )}

            <div className="bg-base-100 shadow-xl rounded-box p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="label">
                                <span className="label-text">Project Title</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                placeholder="Enter project title"
                                className="input input-bordered w-full"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="label">
                                <span className="label-text">Short Description</span>
                            </label>
                            <textarea
                                name="description"
                                placeholder="Brief description of your project"
                                className="textarea textarea-bordered w-full"
                                rows="3"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        <div className="md:col-span-2">
                            <label className="label">
                                <span className="label-text">Project Content</span>
                            </label>
                            <textarea
                                name="content"
                                placeholder="Detailed description of your project"
                                className="textarea textarea-bordered w-full"
                                rows="10"
                                value={formData.content}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text">Thumbnail</span>
                            </label>
                            <input
                                type="file"
                                className="file-input file-input-bordered w-full"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                            />
                            {thumbnailPreview && (
                                <div className="mt-2">
                                    <img
                                        src={thumbnailPreview}
                                        alt="Thumbnail preview"
                                        className="w-32 h-32 object-cover rounded-lg"
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text">Project Images</span>
                            </label>
                            <input
                                type="file"
                                className="file-input file-input-bordered w-full"
                                accept="image/*"
                                multiple
                                onChange={handleImagesChange}
                            />
                            {imagesPreviews.length > 0 && (
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    {imagesPreviews.map((preview, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index}`}
                                                className="w-full h-24 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                className="absolute top-1 right-1 btn btn-circle btn-xs btn-error"
                                                onClick={() => removeImage(index)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="label">
                                <span className="label-text">Tags</span>
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    placeholder="Add tags"
                                    className="input input-bordered flex-1"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                />
                                <button
                                    type="button"
                                    className="btn btn-primary ml-2"
                                    onClick={handleAddTag}
                                >
                                    Add
                                </button>
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.tags.map((tag) => (
                                        <div key={tag} className="badge badge-primary gap-1">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <div className="form-control">
                                <label className="label cursor-pointer justify-start">
                                    <input
                                        type="checkbox"
                                        name="published"
                                        className="checkbox checkbox-primary"
                                        checked={formData.published}
                                        onChange={handleChange}
                                    />
                                    <span className="label-text ml-2">Publish this project (it will be visible on your portfolio)</span>
                                </label>
                            </div>
                        </div>

                        <div className="md:col-span-2 flex justify-end space-x-2">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => navigate('/dashboard/projects')}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? <LoadingSpinner size="sm" /> : 'Create Project'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectPage;