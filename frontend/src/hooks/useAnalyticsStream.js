import { useEffect, useRef } from 'react';

const ANALYTICS_SSE_URL =
    (process.env.REACT_APP_ANALYTICS_URL || 'http://localhost:4000') + '/api/analytics/stream';

/**
 * Subscribe to real-time analytics events from the Express SSE stream.
 *
 * @param {Object} eventHandlers - Map of event type → handler function.
 *   e.g. { 'analytics:view': (data) => ... }
 */
export function useAnalyticsStream(eventHandlers) {
    const handlersRef = useRef(eventHandlers);
    handlersRef.current = eventHandlers;

    useEffect(() => {
        const source = new EventSource(ANALYTICS_SSE_URL);

        const eventTypes = Object.keys(handlersRef.current);
        eventTypes.forEach((eventType) => {
            source.addEventListener(eventType, (e) => {
                try {
                    const data = JSON.parse(e.data);
                    handlersRef.current[eventType]?.(data);
                } catch (err) {
                    console.warn(`Analytics SSE parse error for "${eventType}":`, err);
                }
            });
        });

        source.onerror = () => {
            console.warn('Analytics SSE connection lost, browser will auto-reconnect…');
        };

        return () => source.close();
    }, []);
}
