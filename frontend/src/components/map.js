import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Map as LMap, TileLayer } from 'react-leaflet';
import './map.css';

/* -- Map -- */
class Map extends Component {
    render() {
        return (
            <LMap center={[58.411, 15.621]} zoom={14}>
                <TileLayer
                attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
            </LMap>
        );
    }
}

// Map Redux states to React props
const mapStateToProps = state => {
    return {}
}

// Forward Redux's dispatch function to React props
const mapDispatchToProps = dispatch => {
    return {}
}

// Connect Redux with React
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Map);
