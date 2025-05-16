import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AnalyticsPage = () => {
    const [timeframe, setTimeframe] = useState('week');
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState({
        overview: {
            totalProjects: 0,
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0
        },
        viewsData: [],
        projectPerformance: [],
        trafficSources: [],
        engagementRate: 0
    });

    useEffect(() => {
        fetchAnalytics();
    }, [timeframe]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/analytics/dashboard?timeframe=${timeframe}`);
            setAnalytics(response.data.data || {
                overview: {
                    totalProjects: 0,
                    totalViews: 0,
                    totalLikes: 0,
                    totalComments: 0
                },
                viewsData: [],
                projectPerformance: [],
                trafficSources: [],
                engagementRate: 0
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data
    const viewsChartData = {
        labels: (analytics.viewsData || []).map(item => item.date),
        datasets: [
            {
                label: 'Views',
                data: (analytics.viewsData || []).map(item => item.views),
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const projectPerformanceData = {
        labels: (analytics.projectPerformance || []).map(item => item.title),
        datasets: [
            {
                label: 'Views',
                data: (analytics.projectPerformance || []).map(item => item.views),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
            }
        ]
    };

    const trafficSourcesData = {
        labels: (analytics.trafficSources || []).map(item => item.source),
        datasets: [
            {
                data: (analytics.trafficSources || []).map(item => item.percentage),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Chart options
    const lineChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Views Over Time',
            },
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Project Performance',
            },
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    const pieChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Traffic Sources',
            },
        }
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

            {/* Timeframe Selector */}
            <div className="flex justify-end mb-6">
                <div className="btn-group">
                    <button
                        className={`btn ${timeframe === 'week' ? 'btn-active' : ''}`}
                        onClick={() => setTimeframe('week')}
                    >
                        Week
                    </button>
                    <button
                        className={`btn ${timeframe === 'month' ? 'btn-active' : ''}`}
                        onClick={() => setTimeframe('month')}
                    >
                        Month
                    </button>
                    <button
                        className={`btn ${timeframe === 'year' ? 'btn-active' : ''}`}
                        onClick={() => setTimeframe('year')}
                    >
                        Year
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : (
                <>
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="card bg-base-100 shadow-md">
                            <div className="card-body">
                                <h2 className="card-title text-lg">Total Projects</h2>
                                <p className="text-3xl font-bold">{analytics.overview.totalProjects}</p>
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow-md">
                            <div className="card-body">
                                <h2 className="card-title text-lg">Total Views</h2>
                                <p className="text-3xl font-bold">{analytics.overview.totalViews}</p>
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow-md">
                            <div className="card-body">
                                <h2 className="card-title text-lg">Total Likes</h2>
                                <p className="text-3xl font-bold">{analytics.overview.totalLikes}</p>
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow-md">
                            <div className="card-body">
                                <h2 className="card-title text-lg">Engagement Rate</h2>
                                <p className="text-3xl font-bold">{analytics.engagementRate}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="card bg-base-100 shadow-md">
                            <div className="card-body">
                                <Line data={viewsChartData} options={lineChartOptions} />
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow-md">
                            <div className="card-body">
                                <Bar data={projectPerformanceData} options={barChartOptions} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card bg-base-100 shadow-md">
                            <div className="card-body">
                                <Pie data={trafficSourcesData} options={pieChartOptions} />
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow-md">
                            <div className="card-body">
                                <h2 className="card-title text-lg mb-4">Top Performing Projects</h2>
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr>
                                                <th>Project</th>
                                                <th>Views</th>
                                                <th>Likes</th>
                                                <th>Comments</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analytics.projectPerformance.slice(0, 5).map((project, index) => (
                                                <tr key={index}>
                                                    <td>{project.title}</td>
                                                    <td>{project.views}</td>
                                                    <td>{project.likes}</td>
                                                    <td>{project.comments}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AnalyticsPage;