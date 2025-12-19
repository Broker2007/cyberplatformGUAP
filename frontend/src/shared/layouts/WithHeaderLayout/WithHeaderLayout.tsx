import { ReactNode } from 'react';
import { Header } from 'widgets/Header';
import 'app/styles/index.scss';
import { Outlet } from 'react-router-dom';

export const WithHeaderLayout = () => (
    <>
        <Header />
        <div className="page-wrapper2"><Outlet /></div>
    </>
);
