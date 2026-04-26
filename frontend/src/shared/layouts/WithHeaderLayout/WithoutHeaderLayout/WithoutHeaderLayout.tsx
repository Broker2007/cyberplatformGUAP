import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

export const WithoutHeaderLayout = () => (
    <div className="page-wrapper"><Outlet /></div>
);
