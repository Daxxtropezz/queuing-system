import React from 'react';
import { Link, LinkProps } from '@inertiajs/react';

// A drop-in replacement for Inertia Link that enables fast navigation.
// - prefetch: preloads the response on hover
// - preserveScroll/State: avoids unnecessary re-renders/layout shifts
export default function PrefetchLink(props: LinkProps) {
    return (
        <Link
            prefetch
            preserveScroll
            preserveState
            {...props}
        />
    );
}
