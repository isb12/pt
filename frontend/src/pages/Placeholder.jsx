import React from 'react';

const PlaceholderPage = ({ title }) => {
    return (
        <div className="container" style={{ maxWidth: '100%' }}>
            <h2>{title}</h2>
            <p style={{ color: '#888' }}>Страница в разработке...</p>
        </div>
    );
};

export default PlaceholderPage;
