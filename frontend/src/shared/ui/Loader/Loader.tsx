import './Loader.scss';
import React from 'react';

interface LoaderProps {
    className?: string;
}

export const Loader = ({ className }: LoaderProps) => (
    <div className="Loader" />
);
