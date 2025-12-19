import { classNames } from 'shared/lib/classNames/classNames';
import './PageLoader.scss';
import React from 'react';

interface PageLoaderProps {
    className?: string;
}

export const PageLoader = ({ className }: PageLoaderProps) => (
    <div className={classNames('page-loader', {}, [className])}>
        <div className="waviy">
            <span style={{ '--i': 1 } as React.CSSProperties}>L</span>
            <span style={{ '--i': 2 } as React.CSSProperties}>o</span>
            <span style={{ '--i': 3 } as React.CSSProperties}>a</span>
            <span style={{ '--i': 4 } as React.CSSProperties}>d</span>
            <span style={{ '--i': 5 } as React.CSSProperties}>i</span>
            <span style={{ '--i': 6 } as React.CSSProperties}>n</span>
            <span style={{ '--i': 7 } as React.CSSProperties}>g</span>
            <span style={{ '--i': 8 } as React.CSSProperties}>.</span>
            <span style={{ '--i': 9 } as React.CSSProperties}>.</span>
            <span style={{ '--i': 10 } as React.CSSProperties}>.</span>
        </div>
    </div>
);
