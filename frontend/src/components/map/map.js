import React, { Component } from "react";
import { connect } from "react-redux";

// Leaflet
import {
  Map as LMap,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Tooltip,
} from "react-leaflet";
import "./map.css";
import L from "leaflet";

// Icon image imports
import iconUrl from "../../images/marker-icon.png";
import iconSelectedUrl from "../../images/marker-icon-selected.png";
import iconEmptyUrl from "../../images/marker-icon-empty.png";
import iconEmptySelectedUrl from "../../images/marker-icon-empty-selected.png";
import shadowUrl from "../../images/marker-shadow.png";
import iconAreaUrl from "../../images/area-icon.png";

// Import relevant types
import { Camera, Clip } from "../../types";

// Import actions
import { createArea, deleteArea } from "../../state/stateCommunication";
import { getDistance } from "../../util";
import {
  changeMode,
  INSPECTOR_MODE_AREA,
  INSPECTOR_MODE_CAMERA,
  changeBrowserTab,
} from "../../state/stateBrowser";

/* -- Map -- */
class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      creatingArea: false,
      lat: 0,
      lon: 0,
      rad: 0,
      areaToolTip: "Right click again to set radius of area",
    };
    this.baseState = this.state;
    /* -- CREATE MARKER ICONS -- */

    // Regular marker
    this.icon = L.icon({
      iconUrl: iconUrl,
      shadowUrl: shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });

    // Selected marker
    this.iconS = L.icon({
      iconUrl: iconSelectedUrl,
      shadowUrl: shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });

    // Empty marker
    this.iconE = L.icon({
      iconUrl: iconEmptyUrl,
      shadowUrl: shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });

    // Empty selected marker
    this.iconES = L.icon({
      iconUrl: iconEmptySelectedUrl,
      shadowUrl: shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });

    // Area marker
    this.iconA = L.icon({
      iconUrl: iconAreaUrl,
      shadowUrl: shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });

    this.onMapContextClick = this.onMapContextClick.bind(this);
    this.onCameraMarkerContextClick = this.onCameraMarkerContextClick.bind(
      this
    );
    this.onAreaMarkerContextClick = this.onAreaMarkerContextClick.bind(this);
    this.onAreaMarkerClick = this.onAreaMarkerClick.bind(this);
    this.onCameraMarkerClick = this.onCameraMarkerClick.bind(this);
    this.renderAreas = this.renderAreas.bind(this);
    this.renderAreaCreation = this.renderAreaCreation.bind(this);
    this.renderCameras = this.renderCameras.bind(this);
  }

  // -------------------- OnClick Actions ----------------------------

  /**
   * When a camera marker is right clicked, add it to the filter by creating an area with radius 0
   */
  onCameraMarkerContextClick(cam, e) {
    this.props.createArea(cam.pos.latitude, cam.pos.longitude, 0);
  }

  /**
   * When a camera marker is left clicked, open it in the inspector
   */
  onCameraMarkerClick(camID, e) {
    this.props.changeMode(INSPECTOR_MODE_CAMERA, camID);
    this.props.changeBrowserTab("inspectorBrowser");
  }

  /**
   * When a area marker is left clicked, delete it
   */
  onAreaMarkerContextClick(areaID, e) {
    this.props.deleteArea(areaID);
  }

  /**
   * When a area marker is left clicked,open it in the inspector
   */
  onAreaMarkerClick(areaID, e) {
    this.props.changeMode(INSPECTOR_MODE_AREA, areaID);
    this.props.changeBrowserTab("inspectorBrowser");
  }

  /**
   * When the map is rightclicked, begin area creation
   */
  onMapContextClick(e) {
    // First click starts the area creation
    if (!this.state.creatingArea) {
      this.setState({
        creatingArea: true,
        lat: e.latlng.lat,
        lon: e.latlng.lng,
        rad: 0,
      });

      // Second click finish the area creation
    } else if (this.state.creatingArea) {
      this.setState({
        rad: getDistance(
          [e.latlng.lat, e.latlng.lng],
          [this.state.lat, this.state.lon]
        ),
      });

      if (this.state.rad === 0) {
        this.setState({ areaToolTip: "The radius of the area can not be 0, " });
      } else {
        this.props.createArea(this.state.lat, this.state.lon, this.state.rad);
        this.setState(this.baseState);
      }
    }
  }

  // ---------------- Render functions -------------------------------

  /**
   * Render the area currently being created
   */
  renderAreaCreation(props) {
    if (props.creatingArea) {
      return (
        <Circle
          center={{ lat: props.lat, lng: props.lon }}
          fillColor="blue"
          radius={props.rad}
        >
          <Tooltip permanent>{this.state.areaToolTip}</Tooltip>
        </Circle>
      );
    } else {
      return "";
    }
  }
  /**
   * Render all cameras
   */
  renderCameras(props) {
    return Object.entries(props.cameras).map(([id, cam]) => (
      <Marker
        key={id}
        position={[cam.pos.latitude, cam.pos.longitude]}
        onClick={(e) => this.onCameraMarkerClick(id, e)}
        onContextmenu={(e) => this.onCameraMarkerContextClick(cam, e)}
        clickable={true}
        icon={
          cam.isEmpty()
            ? cam.selected
              ? this.iconES
              : this.iconE
            : cam.selected
            ? this.iconS
            : this.icon
        }
      >
        <Popup>
          <label>
            {cam.name} (id: {id})
          </label>
          <p>
            Position: [{cam.pos.latitude}, {cam.pos.longitude}]
          </p>
        </Popup>
      </Marker>
    ));
  }

  /**
   * Render all areas
   */
  renderAreas(props) {
    return Object.entries(props.areas).map(([id, area]) => (
      <Circle
        key={id}
        center={{ lat: area.latitude, lng: area.longitude }}
        fillColor="blue"
        radius={area.radius}
      >
        {area.radius === 0 ? (
          ""
        ) : (
          <Marker
            key={id}
            position={[area.latitude, area.longitude]}
            onContextmenu={(e) => {
              this.onAreaMarkerContextClick(id, e);
            }}
            onClick={(e) => {
              this.onAreaMarkerClick(id, e);
            }}
            clickable={true}
            icon={this.iconA}
          >
            <Popup>
              <label>Area ID: {id}</label>
              <p>
                Position(lat, long, rad): {area.latitude}, {area.longitude} ,{" "}
                {area.radius}]
              </p>
            </Popup>
          </Marker>
        )}
      </Circle>
    ));
  }

  render() {
    return (
      <React.Fragment>
        <LMap
          onContextmenu={this.onMapContextClick}
          center={[58.411, 15.621]}
          zoom={14}
          on
        >
          <TileLayer
            attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <this.renderAreaCreation
            rad={this.state.rad}
            lat={this.state.lat}
            lon={this.state.lon}
            creatingArea={this.state.creatingArea}
          />
          <this.renderCameras cameras={this.props.cameras} />
          <this.renderAreas areas={this.props.filter.areas} />
        </LMap>
      </React.Fragment>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    cameras: state.com.cameras,
    filter: state.com.filter,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    createArea: (lat, lon, rad) => dispatch(createArea(lat, lon, rad)),
    deleteArea: (id) => dispatch(deleteArea(id)),
    changeMode: (mode, id) => dispatch(changeMode(mode, id)),
    changeBrowserTab: (tab) => dispatch(changeBrowserTab(tab)),
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(Map);
