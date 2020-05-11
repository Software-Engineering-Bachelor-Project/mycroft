import React, { Component } from "react";
import { connect } from "react-redux";

// Import relevant types
import { Camera, Clip } from "../../types";
import { doActionsInOrder } from "../../util";

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

// Import actions
import {
  createArea,
  deleteArea,
  getClipsMatchingFilter,
  getFilter,
} from "../../state/stateCommunication";
import { getDistance } from "../../util";
import {
  changeMode,
  INSPECTOR_MODE_AREA,
  INSPECTOR_MODE_CAMERA,
  changeBrowserTab,
} from "../../state/stateBrowser";
import { setLocation } from "../../state/stateMap";

import { Button, ListGroup } from "react-bootstrap";

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
    this.getCameraIcon = this.getCameraIcon.bind(this);
    this.renderMultipleCamerasPopup = this.renderMultipleCamerasPopup.bind(
      this
    );
  }

  getCameraIcon(id, camera) {
    var selected =
      this.props.browserTab === "inspectorBrowser" &&
      this.props.inspectorMode === INSPECTOR_MODE_CAMERA &&
      (this.props.selectedCamera === id ||
        this.props.selectedCamera === parseInt(id));
    var empty = camera.countCommonClips(this.props.filter.clips) === 0;

    if (selected) {
      if (empty) {
        return this.iconES;
      } else {
        return this.iconS;
      }
    } else {
      if (empty) {
        return this.iconE;
      } else {
        return this.icon;
      }
    }
  }

  // -------------------- OnClick Actions ----------------------------

  /**
   * When a camera marker is right clicked, add it to the filter by creating an area with radius 0
   */
  onCameraMarkerContextClick(cam, e) {
    for (const [id, area] of Object.entries(this.props.filter.areas)) {
      const maxError = 0.00000001; // Account for float rounding error
      if (
        area.radius === 0 &&
        Math.abs(cam.pos.latitude - area.latitude) < maxError &&
        Math.abs(cam.pos.longitude - area.longitude) < maxError
      ) {
        doActionsInOrder([
          () => this.props.deleteArea(id),
          () => {
            this.props.getClipsMatchingFilter();
            this.props.getFilter();
          },
        ]);
        return;
      }
    }
    doActionsInOrder([
      () => this.props.createArea(cam.pos.latitude, cam.pos.longitude, 0),
      () => {
        this.props.getClipsMatchingFilter();
        this.props.getFilter();
      },
    ]);
  }

  /**
   * When a camera marker is left clicked, open it in the inspector
   */
  onCameraMarkerClick(camID, cam, e) {
    if (
      Object.entries(this.props.cameras).filter(([id, camera]) => {
        return (
          camID !== id &&
          cam.pos.latitude === camera.pos.latitude &&
          cam.pos.longitude === camera.pos.longitude
        );
      }).length > 0
    ) {
      return;
    }

    this.props.changeMode(INSPECTOR_MODE_CAMERA, camID);
    this.props.changeBrowserTab("inspectorBrowser");
  }

  /**
   * When a area marker is left clicked, delete it
   */
  onAreaMarkerContextClick(areaID, e) {
    doActionsInOrder([
      () => this.props.deleteArea(areaID),
      () => {
        this.props.getClipsMatchingFilter();
        this.props.getFilter();
      },
    ]);
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
        //create copies
        var lat = this.state.lat.valueOf();
        var lon = this.state.lon.valueOf();
        var rad = this.state.rad.valueOf();

        doActionsInOrder([
          () => this.props.createArea(lat, lon, rad),
          () => {
            this.props.getClipsMatchingFilter();
            this.props.getFilter();
          },
        ]);
        this.setState(this.baseState);
      }
    }
  }

  // ---------------- Render functions -------------------------------

  /**
   * Render a popup if multiple cameras has the same location
   */
  renderMultipleCamerasPopup(props) {
    // Get all cameras that have the same location as the given one
    var camerasAtSamePos = Object.entries(this.props.cameras).filter(
      ([id2, camera]) => {
        return (
          props.camera.pos.latitude === camera.pos.latitude &&
          props.camera.pos.longitude === camera.pos.longitude
        );
      }
    );

    //Check that there are other cameras at this location
    if (camerasAtSamePos.length <= 1) {
      return "";
    }

    return (
      <Popup>
        <label>
          <p>There are multiple cameras in this location:</p>
          <ListGroup>
            {/*Create Button for every camera at the location*/}
            {camerasAtSamePos.map(([id, cam]) => (
              <ListGroup.Item key={id}>
                <Button
                  size="sm"
                  onClick={() => {
                    this.props.changeMode(INSPECTOR_MODE_CAMERA, id);
                    this.props.changeBrowserTab("inspectorBrowser");
                  }}
                >
                  {cam.name}
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </label>
      </Popup>
    );
  }

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
        onClick={(e) => this.onCameraMarkerClick(id, cam, e)}
        onContextmenu={(e) => this.onCameraMarkerContextClick(cam, e)}
        clickable={true}
        icon={this.getCameraIcon(id, cam)}
      >
        <this.renderMultipleCamerasPopup camera={cam} id={id} />
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
          center={[this.props.lat, this.props.long]}
          zoom={this.props.zoom}
          onViewportChanged={(viewport) => {
            this.props.setLocation(
              viewport.center[0],
              viewport.center[1],
              viewport.zoom
            );
          }}
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
    selectedCamera: state.browser.inspector.id,
    browserTab: state.browser.currentTab,
    inspectorMode: state.browser.inspector.mode,
    lat: state.map.lat,
    long: state.map.long,
    zoom: state.map.zoom,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    setLocation: (lat, long, zoom) => dispatch(setLocation(lat, long, zoom)),
    createArea: (lat, lon, rad) => dispatch(createArea(lat, lon, rad)),
    deleteArea: (id) => dispatch(deleteArea(id)),
    changeMode: (mode, id) => dispatch(changeMode(mode, id)),
    changeBrowserTab: (tab) => dispatch(changeBrowserTab(tab)),
    getClipsMatchingFilter: () => dispatch(getClipsMatchingFilter()),
    getFilter: () => dispatch(getFilter()),
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(Map);
