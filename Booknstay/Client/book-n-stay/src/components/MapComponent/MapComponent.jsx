import React, { useEffect } from 'react';
import PropTypes from 'prop-types'; 

import { ReactBingmaps } from 'react-bingmaps';

const MapComponent = ({ locationLinks }) => {
    const bingMapsKey = 'Augni0gkqO4oF6NlymPWrdLTZnLgl-e5dMfouwRBa3TRKg9gaBCfBrP6rg0IgjVU';
    const pushpins = [];

    useEffect(() => {
        locationLinks.forEach(link => {
            const coordinates = extractLatandLngFromUrl(link);
            if (coordinates) {
                pushpins.push({ location: coordinates });
            }
        });
    }, [locationLinks]);

    const extractLatandLngFromUrl = (url) => {
        if (url) { 
            const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
            const match = url.match(regex);
    
            if (match) {
                const latitude = parseFloat(match[1]);
                const longitude = parseFloat(match[2]);
                return [latitude, longitude];
            }
        }
        return null; 
    }
    

    return (
        <ReactBingmaps
            bingmapKey={bingMapsKey}
            center={[9.9816, 76.2999]}
            zoom={10}
            pushPins={pushpins}
        />
    );
};


MapComponent.propTypes = {
    locationLinks: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default MapComponent;
