import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

const SettingsPage = () => {
    const { currentUser, updateUserProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [profileData, setProfileData] = useState({
        name: '',
        username: '',
        email: '',
        bio: '',
        role: '',
        skills: [],
        website: '',
        github: '',
        twitter: '',
        linkedin: '',
        about: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [skillInput, setSkillInput] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');

    useEffect(() => {
        if (currentUser) {
            setProfileData({
                name: currentUser.name || '',
                username: currentUser.username || '',
                email: currentUser.email || '',
                bio: currentUser.bio || '',
                role: currentUser.role || '',
                skills: currentUser.skills || [],
                website: currentUser.website || '',
                github: currentUser.github || '',
                twitter: currentUser.twitter || '',
                linkedin: currentUser.linkedin || '',
                about: currentUser.about || '',
            });

            if (currentUser.avatar) {
                setAvatarPreview(currentUser.avatar);
            }
        }
    }, [currentUser]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddSkill = () => {
        if (skillInput.trim() && !profileData.skills.includes(skillInput.trim())) {
            setProfileData(prev => ({
                ...prev,
                skills: [...prev.skills, skillInput.trim()]
            }));
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skill) => {
        setProfileData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skill)
        }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Update profile data
            const response = await api.put('/api/users/profile', profileData);

            // Upload avatar if changed
            if (avatar) {
                const formData = new FormData();
                formData.append('avatar', avatar);

                await api.post('/api/users/avatar', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            // Update local user data
            updateUserProfile(response.data);
            setSuccess('Profile updated successfully');
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validate passwords
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            setLoading(false);
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setError('New password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        try {
            await api.put('/api/users/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setSuccess('Password updated successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (err) {
            console.error('Error updating password:', err);
            setError(err.response?.data?.message || 'Failed to update password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-base-content/70">Manage your account settings and preferences</p>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            <div className="flex flex-col md:flex-row gap-6">
                {/* Tabs */}
                <div className="md:w-64 flex-shrink-0">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body p-2">
                            <ul className="menu bg-base-100 w-full rounded-box">
                                <li>
                                    <button
                                        className={activeTab === 'profile' ? 'active' : ''}
                                        onClick={() => setActiveTab('profile')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className={activeTab === 'password' ? 'active' : ''}
                                        onClick={() => setActiveTab('password')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Password
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className={activeTab === 'appearance' ? 'active' : ''}
                                        onClick={() => setActiveTab('appearance')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                        </svg>
                                        Appearance
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className={activeTab === 'notifications' ? 'active' : ''}
                                        onClick={() => setActiveTab('notifications')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        Notifications
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            {/* Profile Settings */}
                            {activeTab === 'profile' && (
                                <form onSubmit={handleProfileSubmit}>
                                    <h2 className="card-title text-xl mb-6">Profile Settings</h2>

                                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                                        <div className="form-control md:w-1/2">
                                            <label className="label">
                                                <span className="label-text">Full Name</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Your full name"
                                                className="input input-bordered w-full"
                                                value={profileData.name}
                                                onChange={handleProfileChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-control md:w-1/2">
                                            <label className="label">
                                                <span className="label-text">Username</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="username"
                                                placeholder="Your username"
                                                className="input input-bordered w-full"
                                                value={profileData.username}
                                                onChange={handleProfileChange}
                                                required
                                            />
                                            <label className="label">
                                                <span className="label-text-alt">This will be your portfolio URL: projectshelf.com/{profileData.username}</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-control mb-6">
                                        <label className="label">
                                            <span className="label-text">Email</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Your email"
                                            className="input input-bordered w-full"
                                            value={profileData.email}
                                            onChange={handleProfileChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-control mb-6">
                                        <label className="label">
                                            <span className="label-text">Bio</span>
                                        </label>
                                        <textarea
                                            name="bio"
                                            placeholder="A short bio about yourself"
                                            className="textarea textarea-bordered w-full"
                                            rows="2"
                                            value={profileData.bio}
                                            onChange={handleProfileChange}
                                        ></textarea>
                                        <label className="label">
                                            <span className="label-text-alt">Brief description for your profile (max 160 characters)</span>
                                        </label>
                                    </div>

                                    <div className="form-control mb-6">
                                        <label className="label">
                                            <span className="label-text">About</span>
                                        </label>
                                        <textarea
                                            name="about"
                                            placeholder="Tell more about yourself, your experience, and your work"
                                            className="textarea textarea-bordered w-full"
                                            rows="6"
                                            value={profileData.about}
                                            onChange={handleProfileChange}
                                        ></textarea>
                                    </div>

                                    <div className="form-control mb-6">
                                        <label className="label">
                                            <span className="label-text">Role</span>
                                        </label>
                                        <select
                                            name="role"
                                            className="select select-bordered w-full"
                                            value={profileData.role}
                                            onChange={handleProfileChange}
                                        >
                                            <option value="designer">Designer</option>
                                            <option value="developer">Developer</option>
                                            <option value="writer">Writer</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="form-control mb-6">
                                        <label className="label">
                                            <span className="label-text">Skills</span>
                                        </label>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                placeholder="Add skills"
                                                className="input input-bordered flex-1"
                                                value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-primary ml-2"
                                                onClick={handleAddSkill}
                                            >
                                                Add
                                            </button>
                                        </div>
                                        {profileData.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {profileData.skills.map((skill) => (
                                                    <div key={skill} className="badge badge-primary gap-1">
                                                        {skill}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSkill(skill)}
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

                                    <div className="form-control mb-6">
                                        <label className="label">
                                            <span className="label-text">Profile Picture</span>
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div className="avatar">
                                                <div className="w-24 h-24 rounded-full">
                                                    <img src={avatarPreview || "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} alt="Avatar" />
                                                </div>
                                            </div>
                                            <input
                                                type="file"
                                                className="file-input file-input-bordered w-full max-w-xs"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                            />
                                        </div>
                                    </div>

                                    <h3 className="font-semibold text-lg mt-8 mb-4">Social Links</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">Website</span>
                                            </label>
                                            <input
                                                type="url"
                                                name="website"
                                                placeholder="https://yourwebsite.com"
                                                className="input input-bordered w-full"
                                                value={profileData.website}
                                                onChange={handleProfileChange}
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">GitHub</span>
                                            </label>
                                            <input
                                                type="url"
                                                name="github"
                                                placeholder="https://github.com/yourusername"
                                                className="input input-bordered w-full"
                                                value={profileData.github}
                                                onChange={handleProfileChange}
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">Twitter</span>
                                            </label>
                                            <input
                                                type="url"
                                                name="twitter"
                                                placeholder="https://twitter.com/yourusername"
                                                className="input input-bordered w-full"
                                                value={profileData.twitter}
                                                onChange={handleProfileChange}
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">LinkedIn</span>
                                            </label>
                                            <input
                                                type="url"
                                                name="linkedin"
                                                placeholder="https://linkedin.com/in/yourusername"
                                                className="input input-bordered w-full"
                                                value={profileData.linkedin}
                                                onChange={handleProfileChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-control mt-8">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Password Settings */}
                            {activeTab === 'password' && (
                                <form onSubmit={handlePasswordSubmit}>
                                    <h2 className="card-title text-xl mb-6">Change Password</h2>

                                    <div className="form-control mb-6">
                                        <label className="label">
                                            <span className="label-text">Current Password</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            placeholder="Enter your current password"
                                            className="input input-bordered w-full"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-control mb-6">
                                        <label className="label">
                                            <span className="label-text">New Password</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            placeholder="Enter your new password"
                                            className="input input-bordered w-full"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                        <label className="label">
                                            <span className="label-text-alt">Must be at least 8 characters</span>
                                        </label>
                                    </div>

                                    <div className="form-control mb-6">
                                        <label className="label">
                                            <span className="label-text">Confirm New Password</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="Confirm your new password"
                                            className="input input-bordered w-full"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-control mt-8">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? <LoadingSpinner size="sm" /> : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Appearance Settings */}
                            {activeTab === 'appearance' && (
                                <div>
                                    <h2 className="card-title text-xl mb-6">Appearance Settings</h2>

                                    <div className="form-control mb-6">
                                        <label className="label">
                                            <span className="label-text">Theme</span>
                                        </label>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="form-control">
                                                <label className="label cursor-pointer">
                                                    <input type="radio" name="theme" className="radio radio-primary" checked />
                                                    <span className="label-text ml-2">Light</span>
                                                </label>
                                            </div>
                                            <div className="form-control">
                                                <label className="label cursor-pointer">
                                                    <input type="radio" name="theme" className="radio radio-primary" />
                                                    <span className="label-text ml-2">Dark</span>
                                                </label>
                                            </div>
                                            <div className="form-control">
                                                <label className="label cursor-pointer">
                                                    <input type="radio" name="theme" className="radio radio-primary" />
                                                    <span className="label-text ml-2">System</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-control mb-6">
                                        <label className="label">
                                            <span className="label-text">Portfolio Layout</span>
                                        </label>
                                        <select className="select select-bordered w-full max-w-xs">
                                            <option>Grid</option>
                                            <option>List</option>
                                            <option>Masonry</option>
                                        </select>
                                    </div>

                                    <div className="form-control mt-8">
                                        <button className="btn btn-primary">Save Appearance</button>
                                    </div>
                                </div>
                            )}

                            {/* Notification Settings */}
                            {activeTab === 'notifications' && (
                                <div>
                                    <h2 className="card-title text-xl mb-6">Notification Settings</h2>

                                    <div className="space-y-4">
                                        <div className="form-control">
                                            <label className="label cursor-pointer justify-start">
                                                <input type="checkbox" className="toggle toggle-primary" checked />
                                                <span className="label-text ml-2">Email notifications for comments</span>
                                            </label>
                                        </div>

                                        <div className="form-control">
                                            <label className="label cursor-pointer justify-start">
                                                <input type="checkbox" className="toggle toggle-primary" checked />
                                                <span className="label-text ml-2">Email notifications for likes</span>
                                            </label>
                                        </div>

                                        <div className="form-control">
                                            <label className="label cursor-pointer justify-start">
                                                <input type="checkbox" className="toggle toggle-primary" checked />
                                                <span className="label-text ml-2">Email notifications for new followers</span>
                                            </label>
                                        </div>

                                        <div className="form-control">
                                            <label className="label cursor-pointer justify-start">
                                                <input type="checkbox" className="toggle toggle-primary" />
                                                <span className="label-text ml-2">Marketing emails and updates</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-control mt-8">
                                        <button className="btn btn-primary">Save Notification Settings</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;