const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
    const sizeClasses = {
        sm: 'loading-sm',
        md: 'loading-md',
        lg: 'loading-lg',
        xl: 'loading-xl',
    };

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-50">
                <span className={`loading loading-spinner text-primary ${sizeClasses[size]}`}></span>
            </div>
        );
    }

    return <span className={`loading loading-spinner text-primary ${sizeClasses[size]}`}></span>;
};

export default LoadingSpinner;