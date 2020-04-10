import React, { Component } from 'react';
import { connect } from 'react-redux';

// Leaflet
import { Map as LMap, TileLayer, Marker, Popup } from 'react-leaflet';
import './map.css';
import L from 'leaflet';

// Icon image imports
import iconUrl from '../images/marker-icon.png';
import iconSelectedUrl from '../images/marker-icon-selected.png';
import iconEmptyUrl from '../images/marker-icon-empty.png';
import iconEmptySelectedUrl from '../images/marker-icon-empty-selected.png';
import shadowUrl from '../images/marker-shadow.png';

// Import relevant types
import { Camera, Clip } from '../types';

// Import actions
import { addCamera, removeCamera } from '../stateMap';

/* -- Map -- */
class Map extends Component {

    constructor(props) {
        super(props);

        /* -- CREATE MARKER ICONS -- */

        // Regular marker
        this.icon = L.icon({
            iconUrl:       iconUrl,
            shadowUrl:     shadowUrl,
            iconSize:      [25, 41],
		    iconAnchor:    [12, 41],
		    popupAnchor:   [1, -34],
		    tooltipAnchor: [16, -28],
		    shadowSize:    [41, 41]
        });

        // Selected marker
        this.iconS = L.icon({
            iconUrl:       iconSelectedUrl,
            shadowUrl:     shadowUrl,
            iconSize:      [25, 41],
		    iconAnchor:    [12, 41],
		    popupAnchor:   [1, -34],
		    tooltipAnchor: [16, -28],
		    shadowSize:    [41, 41]
        });

        // Empty marker
        this.iconE = L.icon({
            iconUrl:       iconEmptyUrl,
            shadowUrl:     shadowUrl,
            iconSize:      [25, 41],
		    iconAnchor:    [12, 41],
		    popupAnchor:   [1, -34],
		    tooltipAnchor: [16, -28],
		    shadowSize:    [41, 41]
        });

        // Empty selected marker
        this.iconES = L.icon({
            iconUrl:       iconEmptySelectedUrl,
            shadowUrl:     shadowUrl,
            iconSize:      [25, 41],
		    iconAnchor:    [12, 41],
		    popupAnchor:   [1, -34],
		    tooltipAnchor: [16, -28],
		    shadowSize:    [41, 41]
        });
    }
    
    render() {
        return (
            <React.Fragment>
              <LMap center={[58.411, 15.621]} zoom={14}>
                <TileLayer
                  attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {Object.entries(this.props.cameras).map(([id, cam]) => (
                    <Marker key={id} position={cam.pos} icon={
                        cam.isEmpty() ?
                            (cam.selected ? this.iconES : this.iconE) :
                            (cam.selected ? this.iconS : this.icon)
                    }>
                      <Popup>
                        <label>{cam.name} (id: {id})</label>
                        <p>Position: [{cam.pos[0]}, {cam.pos[1]}]</p>
                      </Popup>
                    </Marker>
                ))}
                
              </LMap>
              <div style={{backgroundColor: 'red', width: '40em'}}>
                <p>Temporary Camera Manager (the containing div may be removed)</p>
                <label>Name: </label><input type='text' ref={(c) => this.ct = c} defaultValue='Test Name' />
                <br/>
                <input type='number' step='.001' ref={(c) => this.cx = c} defaultValue='58.411' />
                <input type='number' step='.001' ref={(c) => this.cy = c} defaultValue='15.621' />
                <button onClick={() => this.props.addCamera(
                    Object.entries(this.props.cameras).length,
                    this.ct.value,
                    [parseFloat(this.cx.value), parseFloat(this.cy.value)],
                    this.cCheckE.checked ? {} :
                    {1: new Clip(1, 'test', '/folder/', 'wav', '0', '0')},
                    this.cCheckS.checked)
                                }>add</button>
                <label>Empty: </label>
                <input type='checkbox' ref={(c) => this.cCheckE = c} value='Empty' />
                <label>Selected: </label>
                <input type='checkbox' ref={(c) => this.cCheckS = c} value='Selected' />
                <br/>
                <input type='number' step='1' ref={(c) => this.cid = c} defaultValue='0' />
                <button onClick={() => this.props.removeCamera(parseInt(this.cid.value))}>remove</button>
              </div>
            </React.Fragment>
        );
    }

    componentDidMount() {
        
    }
}

// Map Redux states to React props
const mapStateToProps = state => {
    return {
        cameras: state.map.cameras
    };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = dispatch => {
    return {
        // TODO: these may not be required here in the future
        addCamera: (i, n, p, e, s) => dispatch(addCamera(new Camera(i, n, p, e, s))),
        removeCamera: (i) => dispatch(removeCamera(i))
    };
};

// Connect Redux with React
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Map);
