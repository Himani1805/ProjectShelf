import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeSelector from '../ui/ThemeSelector';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { currentUser, logout } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    return (
        <div className="navbar bg-base-100 shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex-1">
                    <Link to="/" className="btn btn-ghost normal-case text-xl">
                        ProjectShelf
                    </Link>
                </div>

                <div className="flex-none gap-2">
                    <form onSubmit={handleSearch} className="hidden md:flex">
                        <div className="form-control">
                            <input
                                type="text"
                                placeholder="Search projects..."
                                className="input input-bordered w-24 md:w-auto"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-ghost btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </form>

                    <ThemeSelector />

                    <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full">
                                {currentUser ? (
                                    <img src={currentUser.avatar || "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} alt="User avatar" />
                                ) : (
                                    <div className="bg-primary text-primary-content flex items-center justify-center h-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </label>
                        <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                            {currentUser ? (
                                <>
                                    <li>
                                        <Link to={`/${currentUser.username}`} className="justify-between">
                                            My Portfolio
                                        </Link>
                                    </li>
                                    <li><Link to="/dashboard">Dashboard</Link></li>
                                    <li><Link to="/dashboard/settings">Settings</Link></li>
                                    <li><button onClick={logout}>Logout</button></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/login">Login</Link></li>
                                    <li><Link to="/register">Register</Link></li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;