import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
                setResults(response.data);
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    const filteredResults = activeTab === 'all'
        ? results
        : results.filter(item => item.type === activeTab);

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">Search Results for "{query}"</h1>

            {/* Tabs */}
            <div className="tabs tabs-boxed mb-6">
                <button
                    className={`tab ${activeTab === 'all' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Results
                </button>
                <button
                    className={`tab ${activeTab === 'project' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('project')}
                >
                    Projects
                </button>
                <button
                    className={`tab ${activeTab === 'case-study' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('case-study')}
                >
                    Case Studies
                </button>
                <button
                    className={`tab ${activeTab === 'user' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('user')}
                >
                    Users
                </button>
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : filteredResults.length === 0 ? (
                <div className="text-center py-12">
                    <h3 className="text-xl font-semibold mb-2">No results found</h3>
                    <p className="text-gray-500">
                        Try different keywords or check your spelling
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResults.map(item => (
                        <div key={item.id} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                            <div className="card-body">
                                {item.type === 'user' ? (
                                    <>
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="avatar">
                                                <div className="w-12 rounded-full">
                                                    <img src={item.avatar || "https://via.placeholder.com/100"} alt={item.name} />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="card-title">{item.name}</h3>
                                                <p className="text-sm opacity-70">@{item.username}</p>
                                            </div>
                                        </div>
                                        <p>{item.bio}</p>
                                    </>
                                ) : (
                                    <>
                                        {item.thumbnail && (
                                            <figure>
                                                <img src={item.thumbnail} alt={item.title} className="w-full h-48 object-cover" />
                                            </figure>
                                        )}
                                        <h3 className="card-title">{item.title}</h3>
                                        <p className="text-sm opacity-70">
                                            {item.type === 'project' ? 'Project' : 'Case Study'} by @{item.author.username}
                                        </p>
                                        <p className="line-clamp-3">{item.description}</p>
                                    </>
                                )}
                                <div className="card-actions justify-end mt-4">
                                    <a
                                        href={
                                            item.type === 'user'
                                                ? `/${item.username}`
                                                : `/${item.author.username}/${item.type === 'project' ? 'project' : 'case-study'}/${item.id}`
                                        }
                                        className="btn btn-primary btn-sm"
                                    >
                                        View {item.type === 'user' ? 'Profile' : item.type === 'project' ? 'Project' : 'Case Study'}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchResultsPage;