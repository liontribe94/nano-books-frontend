import React from 'react';

export default function PlaceholderPage({ title }) {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted-foreground">This page is under construction.</p>
        </div>
    );
}
