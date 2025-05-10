import { useState, useEffect } from 'react';

const BASE_URL = "https://localhost:7115";

interface FetchOptions {
    method?: string;
    body?: unknown;
    headers?: HeadersInit;
}

export default function useFetch<T>(
    url: string,
    options: FetchOptions = { method: 'GET', headers: {} }
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // Memoize parts of options to avoid infinite loops
    const { method = 'GET', body, headers = {} } = options;
    const headersString = JSON.stringify(headers);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const accessToken = localStorage.getItem('accessToken');
                const requestOptions: RequestInit = {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                        ...headers,
                    },
                    body: body ? JSON.stringify(body) : undefined,
                    signal: controller.signal,
                };

                let response = await fetch(`${BASE_URL}/${url}`, requestOptions);

                // Handle token expiration
                if (response.status === 401) {
                    const refreshToken = localStorage.getItem('refreshToken');
                    const refreshResponse = await fetch(
                        `${BASE_URL}/Auth/refresh`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ refreshToken }),
                        }
                    );

                    if (!refreshResponse.ok) {
                        throw new Error('Refresh token failed');
                    }

                    const {
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken,
                    } = await refreshResponse.json();

                    localStorage.setItem('accessToken', newAccessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    // Retry original request with new token
                    requestOptions.headers = {
                        ...requestOptions.headers,
                        Authorization: `Bearer ${newAccessToken}`,
                    };

                    response = await fetch(`${BASE_URL}/${url}`, requestOptions);
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const json = await response.json();
                if (isMounted) setData(json);
            } catch (err) {
                if (isMounted) {
                    const errorObj = err instanceof Error ? err : new Error('An unknown error occurred');
                    setError(errorObj);
                    if (errorObj.message === 'Refresh token failed') {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        // TODO: redirect to login or notify parent
                    }
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [url, method, body, headersString]);

    return { data, loading, error };
}