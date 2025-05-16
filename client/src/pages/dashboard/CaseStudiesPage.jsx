import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import { useAuth } from '../../contexts/AuthContext';

const CaseStudiesPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const [caseStudies, setCaseStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteInProgress, setDeleteInProgress] = useState(false);

    useEffect(() => {
        fetchCaseStudies();
        
        // Show success message if it exists in location state
        if (location.state?.message) {
            setSuccess(location.state.message);
            // Clear the message from location state
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleSessionExpired = async () => {
        // Try to refresh the token
        const isAuthenticated = await api.checkAuthStatus();
        if (!isAuthenticated) {
            // If refresh failed, show error and redirect to login
            setError('Your session has expired. Please log in again.');
            await logout();
            navigate('/auth/login', { 
                state: { 
                    from: location.pathname,
                    message: 'Your session has expired. Please log in again.' 
                } 
            });
            return false;
        }
        return true;
    };

    const fetchCaseStudies = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/case-studies');
            console.log("Case studies response:", response.data);
            
            // The API returns { success: true, data: [...] }
            const caseStudiesData = response.data.data || [];
            setCaseStudies(caseStudiesData);
        } catch (err) {
            console.error('Error fetching case studies:', err);
            if (err.response?.status === 401) {
                await handleSessionExpired();
            } else {
                setError(err.response?.data?.message || 'Failed to load case studies');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCaseStudy = async (id) => {
        if (deleteInProgress) return; // Prevent multiple delete requests
        
        if (window.confirm('Are you sure you want to delete this case study?')) {
            setDeleteInProgress(true);
            setError(''); // Clear any previous errors
            setSuccess(''); // Clear any previous success messages
            
            try {
                // Check session status first
                const isAuthenticated = await api.checkAuthStatus();
                if (!isAuthenticated) {
                    throw { response: { status: 401 } };
                }
                
                const response = await api.delete(`/api/case-studies/${id}`);
                if (response.data.success) {
                    setSuccess('Case study deleted successfully');
                    // Wait a bit before refreshing the list to show the success message
                    setTimeout(() => {
                        fetchCaseStudies();
                    }, 500);
                } else {
                    throw new Error(response.data.message || 'Failed to delete case study');
                }
            } catch (err) {
                console.error('Error deleting case study:', err);
                if (err.response?.status === 401) {
                    await handleSessionExpired();
                } else if (err.response?.status === 403) {
                    setError('You do not have permission to delete this case study.');
                } else {
                    setError(err.response?.data?.message || 'Failed to delete case study. Please try again.');
                }
            } finally {
                setDeleteInProgress(false);
            }
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredCaseStudies = () => {
        // Ensure caseStudies is an array before filtering
        if (!Array.isArray(caseStudies)) {
            console.error('caseStudies is not an array:', caseStudies);
            return [];
        }

        return caseStudies.filter(study => {
            // First check if the study exists and has the published property
            if (!study) return false;

            const matchesFilter =
                filter === 'all' ||
                (filter === 'published' && study.published === true) ||
                (filter === 'drafts' && study.published === false);

            const matchesSearch =
                (study.title && study.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (study.description && study.description.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesFilter && matchesSearch;
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-2xl font-bold">Case Studies</h1>
                    <p className="text-base-content/70">Manage your project case studies</p>
                </div>
                <Link to="/dashboard/case-studies/create" className="btn btn-primary mt-2 md:mt-0">
                    Create New Case Study
                </Link>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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

                <div className="form-control w-full md:w-auto">
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Search case studies..."
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
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <>
                    {filteredCaseStudies().length === 0 ? (
                        <div className="bg-base-100 shadow-xl rounded-box p-8 text-center">
                            <h2 className="text-xl font-semibold mb-2">No case studies yet</h2>
                            <p className="mb-4">Create your first case study to showcase your project details</p>
                            <Link to="/dashboard/case-studies/create" className="btn btn-primary">
                                Create New Case Study
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCaseStudies().map(study => (
                                <div key={study._id} className="card bg-base-100 shadow-xl">
                                    <div className="card-body">
                                        <h2 className="card-title">
                                            {study.title}
                                            {study.published ? (
                                                <div className="badge badge-success">Published</div>
                                            ) : (
                                                <div className="badge badge-ghost">Draft</div>
                                            )}
                                        </h2>
                                        <p className="line-clamp-2">{study.description}</p>

                                        {study.project && (
                                            <div className="text-sm text-base-content/70">
                                                Project: {study.project.title || 'Unknown Project'}
                                            </div>
                                        )}

                                        <div className="card-actions justify-end mt-4">
                                            <Link to={`/dashboard/case-studies/${study._id}`} className="btn btn-sm btn-ghost">
                                                View
                                            </Link>
                                            <Link to={`/dashboard/case-studies/edit/${study._id}`} className="btn btn-sm btn-primary">
                                                Edit
                                            </Link>
                                            <button
                                                className="btn btn-sm btn-error"
                                                onClick={() => handleDeleteCaseStudy(study._id)}
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

export default CaseStudiesPage;