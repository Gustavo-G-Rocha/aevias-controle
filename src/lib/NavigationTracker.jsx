import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';
import { pagesConfig } from '@/pages.config';
import { getPageTitle } from './pageTitles';

const APP_NAME = 'Afirmaevias';

export default function NavigationTracker() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { Pages, mainPage } = pagesConfig;
    const mainPageKey = mainPage ?? Object.keys(Pages)[0];

    // Log user activity when navigating to a page
    useEffect(() => {
        // Extract page name from pathname
        const pathname = location.pathname;
        let pageName;

        if (pathname === '/' || pathname === '') {
            pageName = mainPageKey;
        } else {
            // Remove leading slash and get the first segment
            const pathSegment = pathname.replace(/^\//, '').split('/')[0];

            // Try case-insensitive lookup in Pages config
            const pageKeys = Object.keys(Pages);
            const matchedKey = pageKeys.find(
                key => key.toLowerCase() === pathSegment.toLowerCase()
            );

            pageName = matchedKey || null;
        }

        if (isAuthenticated && pageName) {
            base44.appLogs.logUserInApp(pageName).catch(() => {
                // Silently fail - logging shouldn't break the app
            });
        }

        // Atualiza o título da aba do navegador com o nome da página atual.
        // Páginas mapeadas em pageTitles.js ganham "Título — Afirmaevias";
        // as demais (login, auth, etc.) usam apenas o nome do sistema.
        // "/" usa o título da página principal; demais rotas usam getPageTitle.
        const pageTitle = (pathname === '/' || pathname === '')
            ? getPageTitle(`/${mainPageKey}`)
            : getPageTitle(pathname);
        document.title = pageTitle ? `${pageTitle} — ${APP_NAME}` : APP_NAME;
    }, [location, isAuthenticated, mainPageKey]); // eslint-disable-line react-hooks/exhaustive-deps

    return null;
}