import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-primary">404</h1>
                <h2 className="text-4xl font-bold mt-4">Page Not Found</h2>
                <p className="text-lg mt-4 mb-8">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/" className="btn btn-primary">
                        Go Home
                    </Link>
                    <Link to="/explore" className="btn btn-outline">
                        Explore Projects
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;