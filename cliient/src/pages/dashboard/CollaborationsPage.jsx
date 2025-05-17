import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CollaborationsPage = () => {
    const { currentUser } = useAuth();
    const [collaborations, setCollaborations] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [inviteEmail, setInviteEmail] = useState('');
    const [projectId, setProjectId] = useState('');
    const [projects, setProjects] = useState([]);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchCollaborations();
        fetchProjects();
    }, []);

    const fetchCollaborations = async () => {
        setLoading(true);
        try {
            const [collaborationsRes, invitationsRes] = await Promise.all([
                api.get('/api/collaborations'),
                api.get('/api/collaborations/invitations')
            ]);
            setCollaborations(collaborationsRes.data);
            setInvitations(invitationsRes.data);
        } catch (error) {
            console.error('Error fetching collaborations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await api.get('/api/projects/owned');
            setProjects(response.data);
            if (response.data.length > 0) {
                setProjectId(response.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail || !projectId) return;

        setInviteLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/api/collaborations/invite', {
                email: inviteEmail,
                projectId
            });
            setMessage({
                type: 'success',
                text: 'Invitation sent successfully!'
            });
            setInviteEmail('');
            fetchCollaborations();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to send invitation'
            });
        } finally {
            setInviteLoading(false);
        }
    };

    const handleAcceptInvitation = async (invitationId) => {
        try {
            await api.post(`/api/collaborations/invitations/${invitationId}/accept`);
            fetchCollaborations();
        } catch (error) {
            console.error('Error accepting invitation:', error);
        }
    };

    const handleDeclineInvitation = async (invitationId) => {
        try {
            await api.post(`/api/collaborations/invitations/${invitationId}/decline`);
            fetchCollaborations();
        } catch (error) {
            console.error('Error declining invitation:', error);
        }
    };

    const handleRemoveCollaborator = async (collaborationId) => {
        if (!window.confirm('Are you sure you want to remove this collaborator?')) return;

        try {
            await api.delete(`/api/collaborations/${collaborationId}`);
            fetchCollaborations();
        } catch (error) {
            console.error('Error removing collaborator:', error);
        }
    };

    const filteredCollaborations = activeTab === 'active'
        ? collaborations
        : invitations;

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">Collaborations</h1>

            <div className="tabs tabs-boxed mb-6">
                <button
                    className={`tab ${activeTab === 'active' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active Collaborations
                </button>
                <button
                    className={`tab ${activeTab === 'invitations' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('invitations')}
                >
                    Invitations {invitations.length > 0 && `(${invitations.length})`}
                </button>
            </div>

            {/* Invite Form */}
            {activeTab === 'active' && (
                <div className="card bg-base-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Invite Collaborator</h2>
                    {message.text && (
                        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
                            <span>{message.text}</span>
                        </div>
                    )}
                    <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4">
                        <div className="form-control flex-1">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="input input-bordered"
                                placeholder="collaborator@example.com"
                                required
                            />
                        </div>
                        <div className="form-control flex-1">
                            <label className="label">
                                <span className="label-text">Project</span>
                            </label>
                            <select
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                                className="select select-bordered"
                                required
                            >
                                {projects.length === 0 ? (
                                    <option value="" disabled>No projects available</option>
                                ) : (
                                    projects.map(project => (
                                        <option key={project.id} value={project.id}>
                                            {project.title}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div className="form-control md:self-end">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={inviteLoading || !inviteEmail || !projectId || projects.length === 0}
                            >
                                {inviteLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Sending...
                                    </>
                                ) : 'Send Invitation'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Collaborations/Invitations List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : activeTab === 'active' && collaborations.length === 0 ? (
                <div className="text-center py-12 bg-base-200 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">No active collaborations</h3>
                    <p className="text-base-content/70 mb-4">
                        Invite team members to collaborate on your projects
                    </p>
                    {projects.length === 0 && (
                        <Link to="/dashboard/projects/create" className="btn btn-primary">
                            Create Your First Project
                        </Link>
                    )}
                </div>
            ) : activeTab === 'invitations' && invitations.length === 0 ? (
                <div className="text-center py-12 bg-base-200 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">No pending invitations</h3>
                    <p className="text-base-content/70">
                        You don't have any collaboration invitations at the moment
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Project</th>
                                {activeTab === 'active' ? (
                                    <>
                                        <th>Collaborator</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                    </>
                                ) : (
                                    <>
                                        <th>From</th>
                                        <th>Sent</th>
                                    </>
                                )}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCollaborations.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="flex items-center space-x-3">
                                            {item.project.thumbnail ? (
                                                <div className="avatar">
                                                    <div className="mask mask-squircle w-12 h-12">
                                                        <img src={item.project.thumbnail} alt={item.project.title} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="avatar placeholder">
                                                    <div className="bg-neutral-focus text-neutral-content mask mask-squircle w-12 h-12">
                                                        <span>{item.project.title.charAt(0)}</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold">{item.project.title}</div>
                                                <div className="text-sm opacity-50">
                                                    {item.project.description?.substring(0, 30)}...
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    {activeTab === 'active' ? (
                                        <>
                                            <td>
                                                <div className="flex items-center space-x-3">
                                                    <div className="avatar">
                                                        <div className="mask mask-circle w-8 h-8">
                                                            <img
                                                                src={item.user.id === currentUser.id ? item.owner.avatar : item.user.avatar}
                                                                alt="Avatar"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {item.user.id === currentUser.id ? item.owner.name : item.user.name}
                                                        <div className="text-sm opacity-50">
                                                            @{item.user.id === currentUser.id ? item.owner.username : item.user.username}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{item.role || 'Collaborator'}</td>
                                            <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td>
                                                <div className="flex items-center space-x-3">
                                                    <div className="avatar">
                                                        <div className="mask mask-circle w-8 h-8">
                                                            <img src={item.sender.avatar} alt="Avatar" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {item.sender.name}
                                                        <div className="text-sm opacity-50">@{item.sender.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                        </>
                                    )}
                                    <td>
                                        {activeTab === 'active' ? (
                                            <div className="flex space-x-2">
                                                <Link
                                                    to={`/dashboard/projects/edit/${item.project.id}`}
                                                    className="btn btn-sm btn-ghost"
                                                >
                                                    View Project
                                                </Link>
                                                {item.owner.id === currentUser.id && (
                                                    <button
                                                        className="btn btn-sm btn-error"
                                                        onClick={() => handleRemoveCollaborator(item.id)}
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex space-x-2">
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => handleAcceptInvitation(item.id)}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-error"
                                                    onClick={() => handleDeclineInvitation(item.id)}
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CollaborationsPage;