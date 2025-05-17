import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeSelector from '../ui/ThemeSelector';

const DashboardHeader = ({ toggleSidebar, user, unreadNotifications }) => {
    const { theme } = useTheme();

    return (
        <header className="bg-base-100 shadow-md py-2 px-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        onClick={toggleSidebar}
                        className="btn btn-ghost btn-circle mr-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold hidden md:block">Dashboard</h1>
                </div>

                <div className="flex items-center space-x-2">
                    <Link to={`/${user?.username}`} className="btn btn-ghost btn-sm" target="_blank">
                        View Portfolio
                    </Link>

                    <ThemeSelector />

                    <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-ghost btn-circle">
                            <div className="indicator">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadNotifications > 0 && (
                                    <span className="badge badge-sm badge-primary indicator-item">{unreadNotifications}</span>
                                )}
                            </div>
                        </label>
                        <div tabIndex={0} className="mt-3 z-[1] card card-compact dropdown-content w-80 bg-base-100 shadow">
                            <div className="card-body">
                                <h3 className="font-bold text-lg">Notifications</h3>
                                <div className="divider my-0"></div>
                                <Link to="/dashboard/notifications" className="btn btn-primary btn-sm btn-block">View all notifications</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;