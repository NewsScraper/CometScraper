import React, { useState, useEffect , useRef, useContext } from 'react';
import { render } from "react-dom";
import "./Location.css";
import sunIcon from '../components/icons8-sun-50.png';
import partlyCloudyIcon from '../components/icons8-partly-cloudy-day-50.png';
import hailIcon from '../components/icons8-hail-50.png';
import snowIcon from '../components/icons8-snow-50.png';
import stormIcon from '../components/icons8-storm-50.png';
import sleetIcon from '../components/icons8-sleet-50.png';
import heavyRainIcon from '../components/icons8-heavy-rain-50.png';
import drizzleIcon from '../components/icons8-light-rain-50.png';
import fogIcon from '../components/icons8-cloud-50.png';

// if you want to use core connector components
import { SConnector, LineConnector, NarrowSConnector } from 'react-svg-connector';

function LocationPage() {
    const [draw, redraw] = useState(0);

    return (
        <div>
            <p>HELPOO</p>
            
        </div>
    );
}

export default LocationPage;
