import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeSelector = () => {
    const { theme, changeTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themes = [
        "light", "dark", "cupcake", "bumblebee", "emerald", "corporate",
        "synthwave", "retro", "cyberpunk", "valentine", "halloween",
        "garden", "forest", "aqua", "lofi", "pastel", "fantasy",
        "wireframe", "black", "luxury", "dracula", "cmyk", "autumn",
        "business", "acid", "lemonade", "night", "coffee", "winter"
    ];

    return (
        <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            </label>
            <div tabIndex={0} className="dropdown-content bg-base-200 text-base-content rounded-box w-52 max-h-96 overflow-y-auto p-2">
                <div className="grid grid-cols-1 gap-2">
                    {themes.map((t) => (
                        <button
                            key={t}
                            className={`btn btn-sm ${theme === t ? 'btn-primary' : 'btn-ghost'} capitalize`}
                            onClick={() => changeTheme(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ThemeSelector;