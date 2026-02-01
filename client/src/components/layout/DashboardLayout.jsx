import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 p-6 md:p-8 bg-[var(--color-background)] overflow-y-auto">
                <div className="max-w-6xl mx-auto animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
