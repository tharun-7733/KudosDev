import { useEffect, useRef } from 'react';

const BACKEND_SSE_URL =
    (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000') + '/api/stream/events';

/**
 * Subscribe to real-time events from the FastAPI SSE stream.
 *
 * @param {Object} eventHandlers - Map of event type → handler function.
 *   e.g. { 'project:new': (data) => ..., 'blog:updated': (data) => ... }
 */
export function useEventStream(eventHandlers) {
    const handlersRef = useRef(eventHandlers);
    handlersRef.current = eventHandlers;

    useEffect(() => {
        const source = new EventSource(BACKEND_SSE_URL);

        // Register a listener for each event type
        const eventTypes = Object.keys(handlersRef.current);
        eventTypes.forEach((eventType) => {
            source.addEventListener(eventType, (e) => {
                try {
                    const data = JSON.parse(e.data);
                    handlersRef.current[eventType]?.(data);
                } catch (err) {
                    console.warn(`SSE parse error for "${eventType}":`, err);
                }
            });
        });

        source.onerror = () => {
            console.warn('SSE connection lost, browser will auto-reconnect…');
        };

        return () => source.close();
    }, []); // Mount once — EventSource auto-reconnects on disconnect
}
