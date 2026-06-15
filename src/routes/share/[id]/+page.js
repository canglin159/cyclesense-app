export const load = async ({ params, fetch }) => {
    const response = await fetch(`/api/share?id=${params.id}`);
    
    if (response.status === 404) {
        return {
            error: 'expired'
        };
    }

    if (!response.ok) {
        return {
            error: 'server'
        };
    }

    const data = await response.json();
    return {
        share: data
    };
};
