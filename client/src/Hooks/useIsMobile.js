import { useState, useEffect } from 'react';

export const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const userAgent = navigator.userAgent;
        const isAndroid = /Android/i.test(userAgent);
        const isiOS = /iPhone|iPad|iPod/i.test(userAgent);
        setIsMobile(isAndroid || isiOS);
    }, []);

    return isMobile;
}