// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import CookiePolicy from '../CookiePolicy';

expect.extend(matchers);

describe('CookiePolicy', () => {
    afterEach(() => {
        cleanup();
    });
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders when cookie policy has not been accepted', () => {
        render(<CookiePolicy />);
        expect(screen.getByText(/We value your privacy/i)).toBeInTheDocument();
    });

    it('does not render when cookie policy has been accepted', () => {
        localStorage.setItem('cookiePolicyAccepted', 'true');
        render(<CookiePolicy />);
        expect(screen.queryByText(/We value your privacy/i)).not.toBeInTheDocument();
    });

    it('sets localStorage and hides when "Got it" is clicked', () => {
        render(<CookiePolicy />);
        const button = screen.getByText(/Got it/i);
        fireEvent.click(button);
        expect(localStorage.getItem('cookiePolicyAccepted')).toBe('true');
        expect(screen.queryByText(/We value your privacy/i)).not.toBeInTheDocument();
    });
});
