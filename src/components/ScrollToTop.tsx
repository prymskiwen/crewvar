import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top when pathname changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pathname]);

    // Also scroll to top on component mount (handles page refresh)
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' }); // Use 'auto' for immediate scroll on refresh
    }, []);

    return null;
};

export default ScrollToTop;
