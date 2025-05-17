import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ProjectDetailPage = () => {
    // Handle both URL patterns: "/:username/project/:projectId" and "/projects/:id"
    const { username, projectId, id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [project, setProject] = useState(null);
    const [user, setUser] = useState(null);
    const [relatedProjects, setRelatedProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeImage, setActiveImage] = useState(null);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [submittingComment, setSubmittingComment] = useState(false);

    // Determine which project ID to use based on the URL pattern
    const projectIdToUse = id || projectId;

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                setLoading(true);

                // Track the view with proper analytics data
                await api.post('/api/analytics/view', {
                    refType: 'Project',
                    refId: projectIdToUse,
                    visitorId: localStorage.getItem('visitorId') || Date.now().toString()
                });

                // Store visitor ID if not exists
                if (!localStorage.getItem('visitorId')) {
                    localStorage.setItem('visitorId', Date.now().toString());
                }

                // Fetch project details
                const projectResponse = await api.get(`/api/projects/${projectIdToUse}`);
                setProject(projectResponse.data);
                setActiveImage(projectResponse.data.thumbnail);

                // If username is not provided in URL params (for /projects/:id route)
                // get the username from the project data
                const userToFetch = username || projectResponse.data.user.username;

                // Fetch user profile
                const userResponse = await api.get(`/api/users/profile/${userToFetch}`);
                setUser(userResponse.data);

                // Fetch related projects
                const relatedResponse = await api.get(`/api/projects/related/${projectIdToUse}`);
                setRelatedProjects(relatedResponse.data);

                // Fetch comments
                const commentsResponse = await api.get(`/api/projects/${projectIdToUse}/comments`);
                setComments(commentsResponse.data);
            } catch (err) {
                console.error('Error fetching project details:', err);
                setError('Failed to load project. It may not exist or there was a server error.');
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [projectIdToUse, username]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            setSubmittingComment(true);
            const response = await api.post(`/api/projects/${projectIdToUse}/comments`, { content: comment });
            setComments([response.data, ...comments]);
            setComment('');
        } catch (err) {
            console.error('Error submitting comment:', err);
            alert('Failed to submit comment. Please try again.');
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !project || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
                    <p className="text-lg mb-6">{error || "We couldn't find the project you're looking for."}</p>
                    {username && (
                    <Link to={`/${username}`} className="btn btn-primary">
                        View Portfolio
                    </Link>
                    )}
                </div>
            </div>
        );
    }

    const isOwner = currentUser && currentUser.id === project.userId;
    const userUsername = user.username || username || (project.user && project.user.username);

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <div className="text-sm breadcrumbs mb-6">
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to={`/${userUsername}`}>{user.name}'s Portfolio</Link></li>
                        <li>{project.title}</li>
                    </ul>
                </div>

                {/* Project Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold">{project.title}</h1>
                        <p className="text-base-content/70 mt-2">
                            Published {new Date(project.createdAt).toLocaleDateString()} by{' '}
                            <Link to={`/${userUsername}`} className="link link-hover font-medium">
                                {user.name}
                            </Link>
                        </p>
                    </div>
                    {isOwner && (
                        <div className="mt-4 md:mt-0">
                            <Link to={`/dashboard/projects/edit/${projectIdToUse}`} className="btn btn-outline btn-sm">
                                Edit Project
                            </Link>
                        </div>
                    )}
                </div>

                {/* Project Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Image Gallery */}
                        <div className="card bg-base-100 shadow-xl mb-8">
                            <figure className="px-4 pt-4">
                                <img
                                    src={activeImage || project.thumbnail || "https://placehold.co/800x600?text=No+Image"}
                                    alt={project.title}
                                    className="rounded-xl h-96 w-full object-contain bg-base-200"
                                />
                            </figure>
                            {project.images && project.images.length > 0 && (
                                <div className="card-body pt-4">
                                    <div className="flex overflow-x-auto space-x-2 pb-2">
                                        <div
                                            className={`cursor-pointer rounded-lg overflow-hidden flex-shrink-0 w-24 h-24 border-2 ${activeImage === project.thumbnail ? 'border-primary' : 'border-transparent'}`}
                                            onClick={() => setActiveImage(project.thumbnail)}
                                        >
                                            <img
                                                src={project.thumbnail}
                                                alt="Thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {project.images.map((image, index) => (
                                            <div
                                                key={index}
                                                className={`cursor-pointer rounded-lg overflow-hidden flex-shrink-0 w-24 h-24 border-2 ${activeImage === image.url ? 'border-primary' : 'border-transparent'}`}
                                                onClick={() => setActiveImage(image.url)}
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={`Project image ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Project Description */}
                        <div className="card bg-base-100 shadow-xl mb-8">
                            <div className="card-body">
                                <h2 className="card-title text-2xl mb-4">About this project</h2>
                                <div className="prose max-w-none">
                                    <p className="text-lg mb-6">{project.description}</p>
                                    <div dangerouslySetInnerHTML={{ __html: project.content }} />
                                </div>

                                {project.tags && project.tags.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="font-semibold mb-2">Tags</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {project.tags.map((tag, index) => (
                                                <div key={index} className="badge badge-outline">{tag}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title text-2xl mb-4">Comments ({comments.length})</h2>

                                {currentUser ? (
                                    <form onSubmit={handleCommentSubmit} className="mb-6">
                                        <textarea
                                            className="textarea textarea-bordered w-full"
                                            placeholder="Leave a comment..."
                                            rows="3"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                        ></textarea>
                                        <div className="flex justify-end mt-2">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={submittingComment}
                                            >
                                                {submittingComment ? <LoadingSpinner size="sm" /> : 'Post Comment'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="alert mb-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        <div>
                                            <h3 className="font-bold">Please log in to comment</h3>
                                            <div className="text-xs">
                                                <Link to="/login" className="link link-primary">Login</Link> or{' '}
                                                <Link to="/register" className="link link-primary">Register</Link> to join the conversation
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {comments.length > 0 ? (
                                    <div className="space-y-4">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className="bg-base-200 p-4 rounded-lg">
                                                <div className="flex items-start space-x-3">
                                                    <div className="avatar">
                                                        <div className="w-10 h-10 rounded-full">
                                                            <img src={comment.user.avatar || "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} alt={comment.user.name} />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="font-medium">{comment.user.name}</h4>
                                                            <span className="text-xs text-base-content/70">
                                                                {new Date(comment.createdAt).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1">{comment.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-base-content/70">
                                        <p>No comments yet. Be the first to share your thoughts!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Creator Card */}
                        <div className="card bg-base-100 shadow-xl mb-6">
                            <div className="card-body">
                                <h2 className="card-title">Creator</h2>
                                <div className="flex items-center space-x-4 mt-2">
                                    <div className="avatar">
                                        <div className="w-16 h-16 rounded-full">
                                            <img src={user.avatar || "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} alt={user.name} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{user.name}</h3>
                                        <p className="text-sm">{user.role}</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Link to={`/${userUsername}`} className="btn btn-outline btn-block">
                                        View Portfolio
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Project Stats */}
                        <div className="card bg-base-100 shadow-xl mb-6">
                            <div className="card-body">
                                <h2 className="card-title">Project Stats</h2>
                                <div className="stats stats-vertical shadow">
                                    <div className="stat">
                                        <div className="stat-title">Views</div>
                                        <div className="stat-value">{project.views}</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-title">Comments</div>
                                        <div className="stat-value">{comments.length}</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-title">Published</div>
                                        <div className="stat-value text-sm">
                                            {new Date(project.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Related Projects */}
                        {relatedProjects.length > 0 && (
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title">Related Projects</h2>
                                    <div className="space-y-4 mt-2">
                                        {relatedProjects.map((relatedProject) => (
                                            <Link
                                                key={relatedProject.id}
                                                to={`/${userUsername}/project/${relatedProject.id}`}
                                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-base-200"
                                            >
                                                <div className="w-16 h-16 rounded-md overflow-hidden">
                                                    <img
                                                        src={relatedProject.thumbnail || "https://placehold.co/100x100?text=No+Image"}
                                                        alt={relatedProject.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium line-clamp-1">{relatedProject.title}</h4>
                                                    <p className="text-xs text-base-content/70 line-clamp-2">{relatedProject.description}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailPage;