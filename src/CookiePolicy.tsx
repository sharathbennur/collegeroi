
import { useState, useEffect } from 'react';
import './CookiePolicy.css';

const CookiePolicy = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const accepted = localStorage.getItem('cookiePolicyAccepted');
        if (!accepted) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookiePolicyAccepted', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-policy-container" role="dialog" aria-label="Cookie Policy">
            <div className="cookie-policy-content">
                <div className="cookie-text">
                    <p><strong>🍪 Privacy Notice:</strong> We value your privacy.</p>
                    <ul>
                        <li>CollegeROI.app uses HTTP-only cookies to manage user sessions in the browser.</li>
                        <li>These cookies are essential for the functionality of our application, and we do not use these cookies to track you across websites..</li>
                        <li>By continuing to use our website, you agree to our Cookie Policy</li>
                    </ul>
                </div>
                <button onClick={handleAccept} className="cookie-btn">
                    Got it
                </button>
            </div>
        </div>
    );
};

export default CookiePolicy;
