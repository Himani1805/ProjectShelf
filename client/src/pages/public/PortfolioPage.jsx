import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PortfolioPage = () => {
    const { username } = useParams();
    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [caseStudies, setCaseStudies] = useState([]);
    const [activeTab, setActiveTab] = useState('projects');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                setLoading(true);

                // Track the view
                await api.post(`/api/analytics/portfolio/${username}/view`);

                // Fetch user profile
                const userResponse = await api.get(`/api/users/profile/${username}`);
                setUser(userResponse.data);

                // Fetch projects
                const projectsResponse = await api.get(`/api/projects/user/${username}`);
                setProjects(projectsResponse.data);

                // Fetch case studies
                const caseStudiesResponse = await api.get(`/api/case-studies/user/${username}`);
                setCaseStudies(caseStudiesResponse.data);
            } catch (err) {
                console.error('Error fetching portfolio:', err);
                setError('Failed to load portfolio. The user may not exist or there was a server error.');
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolio();
    }, [username]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Portfolio Not Found</h1>
                    <p className="text-lg mb-6">{error || `We couldn't find a portfolio for @${username}`}</p>
                    <Link to="/" className="btn btn-primary">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="bg-base-200 py-16">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="avatar">
                            <div className="w-32 h-32 rounded-full">
                                <img src={user.avatar || "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} alt={user.name} />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">{user.name}</h1>
                            <p className="text-xl mt-2">{user.bio || `${user.name} is a ${user.role}`}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {user.skills && user.skills.map((skill, index) => (
                                    <span key={index} className="badge badge-primary">{skill}</span>
                                ))}
                            </div>
                            <div className="mt-6 flex gap-3">
                                {user.website && (
                                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                                        Website
                                    </a>
                                )}
                                {user.linkedin && (
                                    <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                                        LinkedIn
                                    </a>
                                )}
                                {user.github && (
                                    <a href={user.github} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                                        GitHub
                                    </a>
                                )}
                                {user.twitter && (
                                    <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                                        Twitter
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Portfolio Content */}
            <div className="container mx-auto px-4 py-12">
                {/* Tabs */}
                <div className="tabs tabs-boxed mb-8 justify-center">
                    <button
                        className={`tab ${activeTab === 'projects' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('projects')}
                    >
                        Projects ({projects.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'case-studies' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('case-studies')}
                    >
                        Case Studies ({caseStudies.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'about' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('about')}
                    >
                        About
                    </button>
                </div>

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                    <div>
                        {projects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map((project) => (
                                    <Link
                                        key={project.id}
                                        to={`/${username}/project/${project.id}`}
                                        className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
                                    >
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
                                            <div className="card-actions justify-end mt-2">
                                                {project.tags && project.tags.slice(0, 3).map((tag, index) => (
                                                    <div key={index} className="badge badge-outline">{tag}</div>
                                                ))}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <h3 className="text-xl font-medium">No projects yet</h3>
                                <p className="mt-2 text-base-content/70">
                                    {username === user.username
                                        ? "You haven't added any projects to your portfolio yet."
                                        : `${user.name} hasn't added any projects yet.`}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Case Studies Tab */}
                {activeTab === 'case-studies' && (
                    <div>
                        {caseStudies.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {caseStudies.map((caseStudy) => (
                                    <Link
                                        key={caseStudy.id}
                                        to={`/${username}/case-study/${caseStudy.id}`}
                                        className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
                                    >
                                        <figure>
                                            <img
                                                src={caseStudy.coverImage || "https://placehold.co/800x400?text=No+Image"}
                                                alt={caseStudy.title}
                                                className="h-56 w-full object-cover"
                                            />
                                        </figure>
                                        <div className="card-body">
                                            <h2 className="card-title text-xl">{caseStudy.title}</h2>
                                            <p className="line-clamp-3">{caseStudy.summary}</p>
                                            <div className="flex justify-between items-center mt-4">
                                                <div className="flex gap-2">
                                                    {caseStudy.tags && caseStudy.tags.slice(0, 2).map((tag, index) => (
                                                        <div key={index} className="badge badge-outline">{tag}</div>
                                                    ))}
                                                </div>
                                                <span className="text-sm text-base-content/70">
                                                    {new Date(caseStudy.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <h3 className="text-xl font-medium">No case studies yet</h3>
                                <p className="mt-2 text-base-content/70">
                                    {username === user.username
                                        ? "You haven't added any case studies to your portfolio yet."
                                        : `${user.name} hasn't added any case studies yet.`}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* About Tab */}
                {activeTab === 'about' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title text-2xl mb-4">About {user.name}</h2>

                                {user.about ? (
                                    <div className="prose max-w-none">
                                        <p>{user.about}</p>
                                    </div>
                                ) : (
                                    <p className="text-base-content/70">No detailed information provided yet.</p>
                                )}

                                {user.experience && user.experience.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-xl font-semibold mb-4">Experience</h3>
                                        <ul className="timeline timeline-vertical">
                                            {user.experience.map((exp, index) => (
                                                <li key={index}>
                                                    <div className="timeline-start">{exp.startDate} - {exp.endDate || 'Present'}</div>
                                                    <div className="timeline-middle">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="timeline-end timeline-box">
                                                        <h4 className="font-bold">{exp.title}</h4>
                                                        <p className="text-sm">{exp.company}</p>
                                                        <p className="mt-2">{exp.description}</p>
                                                    </div>
                                                    {index < user.experience.length - 1 && <hr />}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {user.education && user.education.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-xl font-semibold mb-4">Education</h3>
                                        <ul className="space-y-4">
                                            {user.education.map((edu, index) => (
                                                <li key={index} className="card bg-base-200">
                                                    <div className="card-body p-4">
                                                        <h4 className="font-bold">{edu.degree}</h4>
                                                        <p>{edu.institution}</p>
                                                        <p className="text-sm text-base-content/70">{edu.startYear} - {edu.endYear || 'Present'}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {user.skills && user.skills.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-xl font-semibold mb-4">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {user.skills.map((skill, index) => (
                                                <div key={index} className="badge badge-lg">{skill}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {user.certifications && user.certifications.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-xl font-semibold mb-4">Certifications</h3>
                                        <ul className="space-y-2">
                                            {user.certifications.map((cert, index) => (
                                                <li key={index} className="flex items-start">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                    <div>
                                                        <p className="font-medium">{cert.name}</p>
                                                        <p className="text-sm text-base-content/70">{cert.issuer} • {cert.year}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortfolioPage;