import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ViewProjectPage = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const [project, setProject] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeImage, setActiveImage] = useState(null);
    const location = useLocation();

    // These features are optional and might not be implemented in the backend yet
    const [hasRelatedProjects, setHasRelatedProjects] = useState(false);
    const [relatedProjects, setRelatedProjects] = useState([]);
    const [hasComments, setHasComments] = useState(false);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);

            // Main project data
            const projectResponse = await api.get(`/api/projects/${id}`);
            
            if (!projectResponse.data || !projectResponse.data.data) {
                throw new Error('Invalid project data received');
            }

            const projectData = projectResponse.data.data;
            console.log('Project Data:', projectData); // Debug log

            // Set project data with Cloudinary URLs
            const processedProject = {
                ...projectData,
                thumbnail: projectData.thumbnailUrl || projectData.thumbnail,
                images: []
            };

            // Process image URLs
            if (projectData.imageUrls && Array.isArray(projectData.imageUrls)) {
                processedProject.images = projectData.imageUrls.map((url, index) => ({
                    id: `img-${index}`,
                    url: url
                }));
            }

            setProject(processedProject);
            
            // Set active image to thumbnail
            setActiveImage(processedProject.thumbnail);

            // Set user data
            if (projectData.user) {
                setUser({
                    id: projectData.user._id,
                    name: projectData.user.name,
                    email: projectData.user.email,
                    avatar: projectData.user.profileImage,
                    role: projectData.user.role || "Developer"
                });
            }

            // OPTIONAL: Try to fetch related projects
            try {
                const relatedResponse = await api.get(`/api/projects/related/${id}`);
                if (relatedResponse.data && Array.isArray(relatedResponse.data) && relatedResponse.data.length > 0) {
                    setRelatedProjects(relatedResponse.data);
                    setHasRelatedProjects(true);
                }
            } catch (relatedError) {
                console.warn('Related projects feature not available:', relatedError);
            }

            // OPTIONAL: Try to fetch comments
            try {
                const commentsResponse = await api.get(`/api/projects/${id}/comments`);
                if (commentsResponse.data && Array.isArray(commentsResponse.data)) {
                    setComments(commentsResponse.data);
                    setHasComments(true);
                }
            } catch (commentsError) {
                console.warn('Comments feature not available:', commentsError);
            }
        } catch (err) {
            console.error('Error fetching project details:', err);
            setError('Failed to load project. It may not exist or there was a server error.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 flex justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="container mx-auto py-8">
                <div className="alert alert-error">
                    <p>{error || 'Project not found'}</p>
                    <div className="mt-4">
                        <Link to="/dashboard/projects" className="btn btn-primary">
                            Back to Projects
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const isOwner = currentUser && currentUser.id === project.userId;

    // Check if we're in the dashboard context
    const isDashboardContext = location.pathname.includes('/dashboard');

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold">{project?.title}</h1>
                <div className="flex gap-2">
                    <Link to={isDashboardContext ? "/dashboard/projects" : "/"} className="btn btn-ghost">
                        {isDashboardContext ? "Back to List" : "Back to Home"}
                    </Link>
                    {isOwner && (
                        <Link to={`/dashboard/projects/edit/${project._id}`} className="btn btn-primary">
                            Edit Project
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    {/* Main Image Display */}
                    <div className="card bg-base-100 shadow-lg mb-6">
                        <figure className="px-4 pt-4">
                            <img
                                src={activeImage || project?.thumbnail || "https://placehold.co/800x600?text=No+Image"}
                                alt={project?.title}
                                className="rounded-xl h-96 w-full object-contain bg-base-200"
                            />
                        </figure>
                        {project?.images && project.images.length > 0 && (
                            <div className="card-body pt-4">
                                <div className="flex overflow-x-auto space-x-2 pb-2">
                                    {/* Thumbnail preview */}
                                    {project.thumbnail && (
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
                                    )}
                                    {/* Project images */}
                                    {project.images.map((image) => (
                                        <div
                                            key={image.id}
                                            className={`cursor-pointer rounded-lg overflow-hidden flex-shrink-0 w-24 h-24 border-2 ${activeImage === image.url ? 'border-primary' : 'border-transparent'}`}
                                            onClick={() => setActiveImage(image.url)}
                                        >
                                            <img
                                                src={image.url}
                                                alt={`Project image`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Project Description */}
                    <section className="card bg-base-100 shadow-lg mb-6">
                        <div className="card-body">
                            <h2 className="card-title">About This Project</h2>
                            <p className="mb-4">{project?.description}</p>
                            {project?.content && 
                                <div className="prose max-w-none">{project.content}</div>
                            }
                            
                            {project?.tags && project.tags.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-semibold mb-2">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map((tag, index) => (
                                            <div key={index} className="badge badge-outline">{tag}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Comments Section */}
                    {hasComments && (
                        <section className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <h2 className="card-title">Comments ({comments.length})</h2>
                                {comments.length > 0 ? (
                                    <div className="space-y-4 mt-4">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className="bg-base-200 p-4 rounded-lg">
                                                <div className="flex items-start space-x-3">
                                                    <div className="avatar">
                                                        <div className="w-10 h-10 rounded-full">
                                                            <img src={comment.user?.avatar || "https://placehold.co/100x100?text=User"} alt={comment.user?.name || "User"} />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="font-medium">{comment.user?.name || "Anonymous"}</h4>
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
                                        <p>No comments yet.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar */}
                <div>
                    {/* Creator Card */}
                    <div className="card bg-base-100 shadow-lg mb-6">
                        <div className="card-body">
                            <h2 className="card-title">Creator</h2>
                            <div className="flex items-center space-x-4 mt-2">
                                <div className="avatar">
                                    <div className="w-16 h-16 rounded-full">
                                        <img src={user?.avatar || "https://placehold.co/100x100?text=User"} alt={user?.name} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{user?.name || "Unknown User"}</h3>
                                    <p className="text-sm">{user?.role || "Developer"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project Stats */}
                    <div className="card bg-base-100 shadow-lg mb-6">
                        <div className="card-body">
                            <h2 className="card-title">Project Stats</h2>
                            <div className="stats stats-vertical shadow mt-2">
                                {project?.views !== undefined && (
                                    <div className="stat">
                                        <div className="stat-title">Views</div>
                                        <div className="stat-value">{project.views || 0}</div>
                                    </div>
                                )}
                                {hasComments && (
                                    <div className="stat">
                                        <div className="stat-title">Comments</div>
                                        <div className="stat-value">{comments.length}</div>
                                    </div>
                                )}
                                <div className="stat">
                                    <div className="stat-title">Published</div>
                                    <div className="stat-value text-sm">
                                        {project?.createdAt 
                                            ? new Date(project.createdAt).toLocaleDateString() 
                                            : "Not published yet"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Projects */}
                    {hasRelatedProjects && relatedProjects.length > 0 && (
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <h2 className="card-title">Related Projects</h2>
                                <div className="space-y-4 mt-2">
                                    {relatedProjects.map((relatedProject) => (
                                        <Link
                                            key={relatedProject._id}
                                            to={isDashboardContext ? 
                                                `/dashboard/projects/${relatedProject._id}` : 
                                                `/projects/${relatedProject._id}`}
                                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-base-200"
                                        >
                                            <div className="w-16 h-16 rounded-md overflow-hidden">
                                                <img
                                                    src={relatedProject.thumbnailUrl || relatedProject.thumbnail || "https://placehold.co/100x100?text=No+Image"}
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
    );
};

export default ViewProjectPage;