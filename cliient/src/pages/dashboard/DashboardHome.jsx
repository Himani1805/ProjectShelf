import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

const DashboardHome = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        projects: 0,
        caseStudies: 0,
        views: 0,
        comments: 0,
    });
    const [recentProjects, setRecentProjects] = useState([]);
    const [recentNotifications, setRecentNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Use Promise.allSettled to handle each request independently
                const [statsResponse, projectsResponse, notificationsResponse] =
                    await Promise.allSettled([
                        api.get('/api/analytics/dashboard'),
                        api.get('/api/projects/recent'),
                        api.get('/api/notifications/recent')
                    ]);

                // Handle stats response
                if (statsResponse.status === 'fulfilled') {
                    setStats(statsResponse.value.data || {
                        projects: 0,
                        caseStudies: 0,
                        views: 0,
                        comments: 0,
                    });
                }

                // Handle projects response
                if (projectsResponse.status === 'fulfilled') {
                    setRecentProjects(projectsResponse.value.data || []);
                }

                // Handle notifications response
                if (notificationsResponse.status === 'fulfilled') {
                    setRecentNotifications(notificationsResponse.value.data || []);
                }

                // Only show error if all requests failed
                if (statsResponse.status === 'rejected' &&
                    projectsResponse.status === 'rejected' &&
                    notificationsResponse.status === 'rejected') {
                    setError('Failed to load dashboard data. Please try again later.');
                }

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                // Don't set error here, we're handling it above
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-2xl font-bold">Welcome back, {currentUser?.name}!</h1>
                    <p className="text-base-content/70">Here's what's happening with your portfolio</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-2">
                    <Link to="/dashboard/projects/create" className="btn btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        New Project
                    </Link>
                    <Link to="/dashboard/case-studies/create" className="btn btn-outline">
                        New Case Study
                    </Link>
                </div>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat bg-base-100 shadow rounded-box">
                    <div className="stat-figure text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="stat-title">Projects</div>
                    <div className="stat-value text-primary">{stats.projects}</div>
                    <div className="stat-desc">
                        <Link to="/dashboard/projects" className="link link-hover">View all</Link>
                    </div>
                </div>

                <div className="stat bg-base-100 shadow rounded-box">
                    <div className="stat-figure text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div className="stat-title">Case Studies</div>
                    <div className="stat-value text-secondary">{stats.caseStudies}</div>
                    <div className="stat-desc">
                        <Link to="/dashboard/case-studies" className="link link-hover">View all</Link>
                    </div>
                </div>

                <div className="stat bg-base-100 shadow rounded-box">
                    <div className="stat-figure text-accent">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </div>
                    <div className="stat-title">Portfolio Views</div>
                    <div className="stat-value text-accent">{stats.views}</div>
                    <div className="stat-desc">
                        <Link to="/dashboard/analytics" className="link link-hover">View analytics</Link>
                    </div>
                </div>

                <div className="stat bg-base-100 shadow rounded-box">
                    <div className="stat-figure text-info">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                    <div className="stat-title">Comments</div>
                    <div className="stat-value text-info">{stats.comments}</div>
                    <div className="stat-desc">Across all projects
                        <Link to="/dashboard/comments" className="link link-hover">View all</Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Recent Projects</h2>
                        {recentProjects.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Created</th>
                                            <th>Views</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentProjects.map((project) => (
                                            <tr key={project.id}>
                                                <td>{project.title}</td>
                                                <td>{new Date(project.createdAt).toLocaleDateString()}</td>
                                                <td>{project.views}</td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <Link to={`/dashboard/projects/${project.id}`} className="btn btn-ghost btn-xs">
                                                            View
                                                        </Link>
                                                        <Link to={`/dashboard/projects/edit/${project.id}`} className="btn btn-ghost btn-xs">
                                                            Edit
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-6 text-center">
                                <p className="text-base-content/70">No projects yet</p>
                                <Link to="/dashboard/projects/create" className="btn btn-primary btn-sm mt-2">
                                    Create your first project
                                </Link>
                            </div>
                        )}
                        <div className="card-actions justify-end">
                            <Link to="/dashboard/projects" className="btn btn-ghost btn-sm">
                                View all projects
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Recent Notifications</h2>
                        {recentNotifications.length > 0 ? (
                            <div className="space-y-4">
                                {recentNotifications.map((notification) => (
                                    <div key={notification.id} className={`p-3 rounded-lg ${notification.read ? 'bg-base-200' : 'bg-base-200 border-l-4 border-primary'}`}>
                                        <p className="font-medium">{notification.message}</p>
                                        <p className="text-sm text-base-content/70">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-6 text-center">
                                <p className="text-base-content/70">No notifications yet</p>
                            </div>
                        )}
                        <div className="card-actions justify-end">
                            <Link to="/dashboard/notifications" className="btn btn-ghost btn-sm">
                                View all notifications
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;