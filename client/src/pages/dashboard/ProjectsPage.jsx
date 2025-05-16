import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/projects');
            if (response.data && response.data.data) {
                setProjects(response.data.data);
            } else {
                console.error('Unexpected API response format:', response.data);
                setProjects([]);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProject = async (id) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await api.delete(`/api/projects/${id}`);
                // Refresh projects after deletion
                fetchProjects();
            } catch (error) {
                console.error('Error deleting project:', error);
            }
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredProjects = () => {
        // Ensure projects is an array before filtering
        if (!Array.isArray(projects)) {
            console.error('Projects is not an array:', projects);
            return [];
        }

        return projects.filter(project => {
            const matchesFilter =
                filter === 'all' ||
                (filter === 'published' && project.published === true) ||
                (filter === 'drafts' && (project.published === false || project.published === undefined));

            const matchesSearch =
                project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesFilter && matchesSearch;
        });
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Projects</h1>
                <Link to="/dashboard/projects/create" className="btn btn-primary">
                    Create New Project
                </Link>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="tabs tabs-boxed">
                    <button
                        className={`tab ${filter === 'all' ? 'tab-active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`tab ${filter === 'published' ? 'tab-active' : ''}`}
                        onClick={() => setFilter('published')}
                    >
                        Published
                    </button>
                    <button
                        className={`tab ${filter === 'drafts' ? 'tab-active' : ''}`}
                        onClick={() => setFilter('drafts')}
                    >
                        Drafts
                    </button>
                </div>

                <div className="form-control">
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="input input-bordered"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        <button className="btn btn-square">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : (
                <>
                    {filteredProjects().length === 0 ? (
                        <div className="card bg-base-100 shadow-md">
                            <div className="card-body text-center">
                                <h2 className="card-title justify-center">No projects found</h2>
                                <p>{filter !== 'all' ? `No ${filter} projects found.` : 'Create your first project to get started!'}</p>
                                <div className="card-actions justify-center mt-4">
                                    <Link to="/dashboard/projects/create" className="btn btn-primary">
                                        Create New Project
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects().map(project => (
                                <div key={project._id} className="card bg-base-100 shadow-xl">
                                    <figure>
                                        <img
                                            src={project.thumbnail || "https://placehold.co/600x400?text=No+Image"}
                                            alt={project.title}
                                            className="h-48 w-full object-cover"
                                        />
                                    </figure>
                                    <div className="card-body">
                                        <h2 className="card-title">
                                            {project.title}
                                            {project.published ? (
                                                <div className="badge badge-success">Published</div>
                                            ) : (
                                                <div className="badge badge-ghost">Draft</div>
                                            )}
                                        </h2>
                                        <p className="line-clamp-2">{project.description}</p>

                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {project.tags && project.tags.map((tag, index) => (
                                                <div key={index} className="badge badge-outline">{tag}</div>
                                            ))}
                                        </div>

                                        <div className="card-actions justify-end mt-4">
                                            <Link to={`/dashboard/projects/${project._id}`} className="btn btn-sm btn-ghost">
                                                View
                                            </Link>
                                            <Link to={`/dashboard/projects/edit/${project._id}`} className="btn btn-sm btn-primary">
                                                Edit
                                            </Link>
                                            <button
                                                className="btn btn-sm btn-error"
                                                onClick={() => handleDeleteProject(project._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProjectsPage;