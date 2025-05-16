import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ExplorePage = () => {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('projects');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        tags: [],
        sortBy: 'newest'
    });
    const [categories, setCategories] = useState([]);
    const [popularTags, setPopularTags] = useState([]);

    useEffect(() => {
        fetchData();
        fetchCategories();
        fetchPopularTags();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() || filters.category || filters.tags.length > 0 || filters.sortBy !== 'newest') {
            fetchFilteredData();
        }
    }, [searchQuery, filters]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [projectsRes, usersRes] = await Promise.all([
                api.get('/api/projects/explore'),
                api.get('/api/users/explore')
            ]);
            setProjects(projectsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error('Error fetching explore data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchPopularTags = async () => {
        try {
            const response = await api.get('/api/tags/popular');
            setPopularTags(response.data);
        } catch (error) {
            console.error('Error fetching popular tags:', error);
        }
    };

    const fetchFilteredData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'projects' ? '/api/projects/search' : '/api/users/search';
            const response = await api.get(endpoint, {
                params: {
                    query: searchQuery,
                    category: filters.category,
                    tags: filters.tags.join(','),
                    sortBy: filters.sortBy
                }
            });

            if (activeTab === 'projects') {
                setProjects(response.data);
            } else {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Error fetching filtered data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Reset filters when changing tabs
        setFilters({
            category: '',
            tags: [],
            sortBy: 'newest'
        });
        setSearchQuery('');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchFilteredData();
    };

    const handleCategoryChange = (e) => {
        setFilters({
            ...filters,
            category: e.target.value
        });
    };

    const handleSortChange = (e) => {
        setFilters({
            ...filters,
            sortBy: e.target.value
        });
    };

    const toggleTag = (tag) => {
        if (filters.tags.includes(tag)) {
            setFilters({
                ...filters,
                tags: filters.tags.filter(t => t !== tag)
            });
        } else {
            setFilters({
                ...filters,
                tags: [...filters.tags, tag]
            });
        }
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            tags: [],
            sortBy: 'newest'
        });
        setSearchQuery('');
        fetchData();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Explore Projects & Developers</h1>

            {/* Tabs */}
            <div className="tabs tabs-boxed justify-center mb-8">
                <button
                    className={`tab ${activeTab === 'projects' ? 'tab-active' : ''}`}
                    onClick={() => handleTabChange('projects')}
                >
                    Projects
                </button>
                <button
                    className={`tab ${activeTab === 'users' ? 'tab-active' : ''}`}
                    onClick={() => handleTabChange('users')}
                >
                    Developers
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="input-group w-full">
                        <input
                            type="text"
                            placeholder={`Search ${activeTab === 'projects' ? 'projects' : 'developers'}...`}
                            className="input input-bordered w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="btn btn-square" type="submit">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </form>

                <div className="flex gap-2">
                    {activeTab === 'projects' && (
                        <select
                            className="select select-bordered"
                            value={filters.category}
                            onChange={handleCategoryChange}
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    )}

                    <select
                        className="select select-bordered"
                        value={filters.sortBy}
                        onChange={handleSortChange}
                    >
                        <option value="newest">Newest</option>
                        <option value="popular">Most Popular</option>
                        {activeTab === 'projects' && (
                            <>
                                <option value="most-liked">Most Liked</option>
                                <option value="most-viewed">Most Viewed</option>
                            </>
                        )}
                    </select>

                    {(searchQuery || filters.category || filters.tags.length > 0 || filters.sortBy !== 'newest') && (
                        <button
                            className="btn btn-outline btn-error"
                            onClick={clearFilters}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Popular Tags */}
            {activeTab === 'projects' && popularTags.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-medium mb-2">Popular Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                        {popularTags.map(tag => (
                            <button
                                key={tag.id}
                                className={`badge ${filters.tags.includes(tag.name) ? 'badge-primary' : 'badge-outline'} p-3 cursor-pointer`}
                                onClick={() => toggleTag(tag.name)}
                            >
                                {tag.name} ({tag.count})
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <>
                    {/* Projects Tab */}
                    {activeTab === 'projects' && (
                        <>
                            {projects.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {projects.map(project => (
                                        <div key={project.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
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
                            ) : (
                                <div className="text-center py-12 bg-base-200 rounded-lg">
                                    <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                                    <p className="text-base-content/70">
                                        Try adjusting your search or filters to find what you're looking for.
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <>
                            {users.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {users.map(user => (
                                        <div key={user.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                                            <div className="card-body">
                                                <div className="flex items-center gap-4">
                                                    <div className="avatar">
                                                        <div className="w-16 h-16 rounded-full">
                                                            <img src={user.avatar || "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} alt={user.name} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h2 className="card-title">{user.name}</h2>
                                                        <p className="text-sm text-base-content/70">@{user.username}</p>
                                                    </div>
                                                </div>

                                                <p className="mt-4 line-clamp-2">{user.bio || `${user.name} is a ${user.role || 'developer'}`}</p>

                                                {user.skills && user.skills.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-3">
                                                        {user.skills.slice(0, 5).map((skill, index) => (
                                                            <span key={index} className="badge badge-sm">{skill}</span>
                                                        ))}
                                                        {user.skills.length > 5 && (
                                                            <span className="badge badge-sm">+{user.skills.length - 5} more</span>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="card-actions justify-end mt-4">
                                                    <div className="stats shadow stats-sm">
                                                        <div className="stat">
                                                            <div className="stat-title">Projects</div>
                                                            <div className="stat-value text-lg">{user.projectCount || 0}</div>
                                                        </div>
                                                    </div>
                                                    <Link to={`/${user.username}`} className="btn btn-primary btn-sm">
                                                        View Profile
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-base-200 rounded-lg">
                                    <h3 className="text-xl font-semibold mb-2">No developers found</h3>
                                    <p className="text-base-content/70">
                                        Try adjusting your search or filters to find what you're looking for.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default ExplorePage;