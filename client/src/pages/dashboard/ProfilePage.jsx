import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ProfilePage = () => {
    const { currentUser, updateUserProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        bio: '',
        location: '',
        website: '',
        github: '',
        twitter: '',
        linkedin: '',
        skills: '',
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                username: currentUser.username || '',
                email: currentUser.email || '',
                bio: currentUser.bio || '',
                location: currentUser.location || '',
                website: currentUser.website || '',
                github: currentUser.github || '',
                twitter: currentUser.twitter || '',
                linkedin: currentUser.linkedin || '',
                skills: currentUser.skills?.join(', ') || '',
            });
            setAvatarPreview(currentUser.avatar || '');
        }
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Create form data for multipart/form-data
            const profileData = new FormData();

            // Add all text fields
            Object.keys(formData).forEach(key => {
                if (key === 'skills') {
                    // Convert skills string to array
                    const skillsArray = formData.skills
                        .split(',')
                        .map(skill => skill.trim())
                        .filter(skill => skill);
                    profileData.append('skills', JSON.stringify(skillsArray));
                } else {
                    profileData.append(key, formData[key]);
                }
            });

            // Add avatar if changed
            if (avatar) {
                profileData.append('avatar', avatar);
            }

            const response = await api.put('/api/users/profile', profileData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            updateUserProfile(response.data);
            setMessage({
                type: 'success',
                text: 'Profile updated successfully!'
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
                    <span>{message.text}</span>
                </div>
            )}

            <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center space-y-4">
                                <div className="avatar">
                                    <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                        <img
                                            src={avatarPreview || "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"}
                                            alt="Profile avatar"
                                        />
                                    </div>
                                </div>
                                <div className="form-control w-full max-w-xs">
                                    <label className="label">
                                        <span className="label-text">Change Avatar</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="file-input file-input-bordered w-full max-w-xs"
                                    />
                                </div>
                            </div>

                            {/* Profile Info Section */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Full Name</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input input-bordered"
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Username</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="input input-bordered"
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Email</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input input-bordered"
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Location</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="input input-bordered"
                                    />
                                </div>

                                <div className="form-control md:col-span-2">
                                    <label className="label">
                                        <span className="label-text">Bio</span>
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="textarea textarea-bordered h-24"
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Website</span>
                                    </label>
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="input input-bordered"
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">GitHub</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="github"
                                        value={formData.github}
                                        onChange={handleChange}
                                        className="input input-bordered"
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Twitter</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="twitter"
                                        value={formData.twitter}
                                        onChange={handleChange}
                                        className="input input-bordered"
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">LinkedIn</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="linkedin"
                                        value={formData.linkedin}
                                        onChange={handleChange}
                                        className="input input-bordered"
                                    />
                                </div>

                                <div className="form-control md:col-span-2">
                                    <label className="label">
                                        <span className="label-text">Skills (comma separated)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        className="input input-bordered"
                                        placeholder="React, Node.js, UI/UX Design"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="card-actions justify-end mt-6">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Saving...
                                    </>
                                ) : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;