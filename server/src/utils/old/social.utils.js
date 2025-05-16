const generateShareLink = (type, id, title) => {
    // Create a URL-friendly title
    const slug = title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
    const generateShareLink = (type, id, title) => {
        // Create a URL-friendly title
        const slug = title
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');

        // Base URL (should be configured in environment variables)
        const baseUrl = process.env.FRONTEND_URL || 'https://projectshelf.example.com';

        // Generate the share link
        return `${baseUrl}/${type}/${id}/${slug}`;
    };

    const generateSocialShareLinks = (type, id, title, description) => {
        const url = generateShareLink(type, id, title);
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);
        const encodedDescription = encodeURIComponent(description || '');

        return {
            url,
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
            email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
        };
    };

    module.exports = {
        generateShareLink,
        generateSocialShareLinks
    };
    // Base URL (should be configured in environment variables)
    const baseUrl = process.env.FRONTEND_URL || 'https://projectshelf.example.com';

    // Generate the share link
    return `${baseUrl}/${type}/${id}/${slug}`;
};

const generateSocialShareLinks = (type, id, title, description) => {
    const url = generateShareLink(type, id, title);
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description || '');

    return {
        url,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
        email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
    };
};

module.exports = {
    generateShareLink,
    generateSocialShareLinks
};