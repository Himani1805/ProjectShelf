import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const HomePage = () => {
    const [featuredProjects, setFeaturedProjects] = useState([]);
    const [trendingProjects, setTrendingProjects] = useState([]);
    const [featuredDevelopers, setFeaturedDevelopers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/projects/featured');

                // Ensure we have an array
                const projects = Array.isArray(response.data) ? response.data : [];
                setFeaturedProjects(projects);

            } catch (err) {
                console.error('Error fetching home data:', err);
                setFeaturedProjects([]); // Fallback to empty array
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    const fetchHomeData = async () => {
        setLoading(true);
        try {
            const [featuredRes, trendingRes, developersRes] = await Promise.all([
                api.get('/api/projects/featured'),
                api.get('/api/projects/trending'),
                api.get('/api/users/featured')
            ]);

            setFeaturedProjects(featuredRes.data);
            setTrendingProjects(trendingRes.data);
            setFeaturedDevelopers(developersRes.data);
        } catch (error) {
            console.error('Error fetching home data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div>
            {/* Hero Section */}
            <div className="hero min-h-[70vh] bg-base-200">
                <div className="hero-content text-center">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl font-bold">Showcase Your Projects</h1>
                        <p className="py-6 text-xl">
                            ProjectShelf is the platform for developers to showcase their work,
                            build a professional portfolio, and connect with other creators.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link to="/explore" className="btn btn-primary">
                                Explore Projects
                            </Link>
                            <Link to="/register" className="btn btn-outline">
                                Create Your Portfolio
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Projects Section */}
            <div className="py-16 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold">Featured Projects</h2>
                        <Link to="/explore" className="btn btn-sm btn-ghost">
                            View All →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredProjects.map(project => (
                            <div key={project.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow border border-base-300">
                                <figure>
                                    <img
                                        src={project.thumbnail || "https://placehold.co/600x400?text=No+Image"}
                                        alt={project.title}
                                        className="h-48 w-full object-cover"
                                    />
                                </figure>
                                <div className="card-body">
                                    <h2 className="card-title">{project.title}</h2>
                                    <p className="line-clamp-2">{project.description}</p>

                                    <div className="flex items-center mt-2">
                                        <div className="avatar">
                                            <div className="w-8 h-8 rounded-full">
                                                <img src={project.user.avatar || "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} alt={project.user.name} />
                                            </div>
                                        </div>
                                        <Link to={`/${project.user.username}`} className="ml-2 text-sm hover:underline">
                                            {project.user.name}
                                        </Link>
                                    </div>

                                    <div className="card-actions justify-between items-center mt-4">
                                        <div className="flex gap-2">
                                            {project.tags && project.tags.slice(0, 3).map((tag, index) => (
                                                <div key={index} className="badge badge-outline">{tag}</div>
                                            ))}
                                        </div>
                                        <Link to={`/projects/${project.id}`} className="btn btn-primary btn-sm">
                                            View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trending Projects Section */}
            <div className="py-16 bg-base-200">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold">Trending Now</h2>
                        <Link to="/explore" className="btn btn-sm btn-ghost">
                            View All →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {trendingProjects.map(project => (
                            <div key={project.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                                <div className="card-body">
                                    <h2 className="card-title">{project.title}</h2>
                                    <p className="line-clamp-2">{project.description}</p>

                                    <div className="flex items-center mt-2">
                                        <div className="avatar">
                                            <div className="w-8 h-8 rounded-full">
                                                <img src={project.user.avatar || "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} alt={project.user.name} />
                                            </div>
                                        </div>
                                        <Link to={`/${project.user.username}`} className="ml-2 text-sm hover:underline">
                                            {project.user.name}
                                        </Link>
                                    </div>

                                    <div className="stats shadow stats-sm mt-4">
                                        <div className="stat">
                                            <div className="stat-figure text-primary">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                                </svg>
                                            </div>
                                            <div className="stat-title">Likes</div>
                                            <div className="stat-value text-lg">{project.likes}</div>
                                        </div>

                                        <div className="stat">
                                            <div className="stat-figure text-secondary">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                </svg>
                                            </div>
                                            <div className="stat-title">Views</div>
                                            <div className="stat-value text-lg">{project.views}</div>
                                        </div>
                                    </div>

                                    <div className="card-actions justify-end mt-2">
                                        <Link to={`/projects/${project.id}`} className="btn btn-primary btn-sm">
                                            View Project
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Featured Developers Section */}
            <div className="py-16 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold">Featured Developers</h2>
                        <Link to="/explore" className="btn btn-sm btn-ghost">
                            View All →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredDevelopers.map(user => (
                            <div key={user.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow border border-base-300">
                                <div className="card-body items-center text-center">
                                    <div className="avatar">
                                        <div className="w-24 h-24 rounded-full">
                                            <img src={user.avatar || "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} alt={user.name} />
                                        </div>
                                    </div>
                                    <h2 className="card-title mt-4">{user.name}</h2>
                                    <p className="text-sm text-base-content/70">@{user.username}</p>
                                    <p className="mt-2 line-clamp-2">{user.bio || `${user.name} is a ${user.role || 'developer'}`}</p>

                                    {user.skills && user.skills.length > 0 && (
                                        <div className="flex flex-wrap justify-center gap-1 mt-3">
                                            {user.skills.slice(0, 3).map((skill, index) => (
                                                <span key={index} className="badge badge-sm">{skill}</span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="card-actions mt-4">
                                        <Link to={`/${user.username}`} className="btn btn-primary btn-sm">
                                            View Profile
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="py-16 bg-primary text-primary-content">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to showcase your work?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Join thousands of developers who use ProjectShelf to build their professional portfolio and connect with the community.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/register" className="btn btn-secondary">
                            Create Your Portfolio
                        </Link>
                        <Link to="/explore" className="btn btn-outline btn-secondary">
                            Explore Projects
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 bg-base-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12 text-center">Why Choose ProjectShelf</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card bg-base-200">
                            <div className="card-body items-center text-center">
                                <div className="text-4xl mb-4">🚀</div>
                                <h3 className="text-xl font-bold mb-2">Showcase Your Work</h3>
                                <p>
                                    Create beautiful project portfolios with detailed case studies to highlight your skills and experience.
                                </p>
                            </div>
                        </div>

                        <div className="card bg-base-200">
                            <div className="card-body items-center text-center">
                                <div className="text-4xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold mb-2">Get Discovered</h3>
                                <p>
                                    Increase your visibility to potential employers, clients, and collaborators.
                                </p>
                            </div>
                        </div>

                        <div className="card bg-base-200">
                            <div className="card-body items-center text-center">
                                <div className="text-4xl mb-4">🌐</div>
                                <h3 className="text-xl font-bold mb-2">Connect & Collaborate</h3>
                                <p>
                                    Join a community of developers, share feedback, and find collaborators for your next project.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;