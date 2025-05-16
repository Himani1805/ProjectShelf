import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ViewCaseStudyPage = () => {
    const { id } = useParams();
    const [caseStudy, setCaseStudy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCaseStudy();
    }, [id]);

    const fetchCaseStudy = async () => {
        try {
            const response = await api.get(`/api/case-studies/${id}`);
            if (response.data.success) {
                setCaseStudy(response.data.data);
            } else {
                setError('Failed to load case study');
            }
        } catch (err) {
            console.error('Error fetching case study:', err);
            setError(err.response?.data?.message || 'Failed to load case study');
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

    if (error || !caseStudy) {
        return (
            <div className="container mx-auto py-8">
                <div className="alert alert-error">
                    <p>{error || 'Case study not found'}</p>
                    <Link to="/dashboard/case-studies" className="btn btn-primary mt-4">
                        Back to Case Studies
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold">{caseStudy.title}</h1>
                <div className="flex gap-2">
                    <Link to="/dashboard/case-studies" className="btn btn-ghost">
                        Back to List
                    </Link>
                    <Link to={`/dashboard/case-studies/edit/${caseStudy._id}`} className="btn btn-primary">
                        Edit Case Study
                    </Link>
                </div>
            </div>

            {caseStudy.project && (
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Related Project</h2>
                    <div className="card bg-base-200 p-4">
                        <h3 className="font-medium">{caseStudy.project.title}</h3>
                        <p className="text-base-content/70">{caseStudy.project.description}</p>
                    </div>
                </div>
            )}

            <div className="grid gap-6">
                <section className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title">Description</h2>
                        <p className="whitespace-pre-wrap">{caseStudy.description}</p>
                    </div>
                </section>

                <section className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title">Project Overview</h2>
                        <p className="whitespace-pre-wrap">{caseStudy.projectOverview}</p>
                    </div>
                </section>

                <section className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title">Challenge</h2>
                        <p className="whitespace-pre-wrap">{caseStudy.challenge}</p>
                    </div>
                </section>

                <section className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title">Solution</h2>
                        <p className="whitespace-pre-wrap">{caseStudy.solution}</p>
                    </div>
                </section>

                <section className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title">Outcome</h2>
                        <p className="whitespace-pre-wrap">{caseStudy.outcome}</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ViewCaseStudyPage;