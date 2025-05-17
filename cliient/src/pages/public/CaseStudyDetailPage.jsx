import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

const CaseStudyDetailPage = () => {
    const { id } = useParams();
    const [caseStudy, setCaseStudy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCaseStudy = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/api/case-studies/${id}/public`);
                setCaseStudy(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching case study:', err);
                setError('This case study does not exist or is not published.');
            } finally {
                setLoading(false);
            }
        };

        fetchCaseStudy();
    }, [id]);

    if (loading) {
        return (
            <div className="container mx-auto py-12 flex justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-12">
                <div className="card bg-base-100 shadow-md">
                    <div className="card-body text-center">
                        <h2 className="text-2xl font-bold mb-4">Case Study Not Found</h2>
                        <p className="mb-6">{error}</p>
                        <Link to="/case-studies" className="btn btn-primary">
                            View All Case Studies
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <Link to="/case-studies" className="btn btn-ghost btn-sm">
                    ← Back to Case Studies
                </Link>
            </div>

            <div className="card bg-base-100 shadow-lg mb-8">
                <div className="card-body">
                    <h1 className="text-3xl font-bold mb-2">{caseStudy.title}</h1>

                    {caseStudy.project && (
                        <div className="mb-4">
                            <span className="text-base-content/70">Project: </span>
                            <Link
                                to={`/projects/${caseStudy.project.id}`}
                                className="link link-primary"
                            >
                                {caseStudy.project.title}
                            </Link>
                        </div>
                    )}

                    <p className="text-lg mb-8">{caseStudy.description}</p>

                    <div className="divider"></div>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">The Challenge</h2>
                        <div className="prose max-w-none">
                            {caseStudy.challenge.split('\n').map((paragraph, index) => (
                                paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
                            ))}
                        </div>
                    </section>

                    <div className="divider"></div>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">The Solution</h2>
                        <div className="prose max-w-none">
                            {caseStudy.solution.split('\n').map((paragraph, index) => (
                                paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
                            ))}
                        </div>
                    </section>

                    <div className="divider"></div>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">The Outcome</h2>
                        <div className="prose max-w-none">
                            {caseStudy.outcome.split('\n').map((paragraph, index) => (
                                paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {caseStudy.project && (
                <div className="card bg-base-200 shadow-md">
                    <div className="card-body">
                        <h2 className="card-title">View the Project</h2>
                        <p>Explore the full project details including technologies used, screenshots, and more.</p>
                        <div className="card-actions justify-end mt-4">
                            <Link
                                to={`/projects/${caseStudy.project.id}`}
                                className="btn btn-primary"
                            >
                                View Project
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaseStudyDetailPage;