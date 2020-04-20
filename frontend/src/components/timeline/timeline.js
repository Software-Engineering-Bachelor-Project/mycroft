import React, { Component } from 'react';
import {connect} from 'react-redux';

import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { zoom } from '../../state/stateTimeline';

import styles from './timeline.module.css';


/**
 * This function returns a list of line placements in percents.
 * Example: ["20%", "40%", "60%", "80%"]
 * 
 * @param {int} timeSpan This is the state parameter timeSpan. (Located in stateTimeline.js)
 * @return {Array} List of line placements.
 */
export function getLinePlacements(timeSpan) {
    var hrs = timeSpan / (60 * 60 * 1000);
    var step = 100 / hrs;
    if (hrs <= 1) {
        return [];
    }
    var list_ = new Array();
    for (var j = 1; j < hrs; j++) {
        list_.push(step * j + "%");
    }   
    return list_;
};

// Scaling options for the dropdown menu
const SCALE_LIST = [12, 24, 36, 48];

/**
 * This class respresents the timeline react-component.
 */
class Timeline extends Component {

    render() {
        return (
            <div className={styles.main}> 

                {/* This is the div for the topbar which contains the dropdown menu(s) */}
                <div className={styles.topbar}>

                    {/* Dropdown menu for scaling the timeline */}
                    <DropdownButton
                        className={styles.dropdown}
                        title={this.props.scale + " Hours"}
                    >

                        {/* Create dropdown items for every scaling option */}
                        {SCALE_LIST.map((hrs) => {
                            return (
                                <Dropdown.Item onClick={(a) => this.props.zoom(hrs)} key={hrs}>
                                    {hrs + " Hours"}
                                </Dropdown.Item>
                            );
                        })}
                    </DropdownButton>
                </div>
                
                {/* This is the box containing all the timestamps, which is affected by scaling */}
                <div className={styles.sliderbox}>
                    <div 
                        className={styles.slider} 
                        style={{width: ((this.props.timeSpan / (60 * 60 * 1000)) / this.props.scale) * 100 + "%"}}
                    >

                        {/* Creates a line for each timestamp */}
                        {getLinePlacements(this.props.timeSpan).map((i) => {
                            return ( <div style={{left: i}} className={styles.line} key={i}> </div> );
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

//Map Redux states to React props
const mapStateToProps = state => {
    return {
        scale: state.timeline.scale,
        timeSpan: state.timeline.timeSpan
    };
};

//Forward Redux's dispatch function to React props
const mapDispatchToProps = dispatch => {
    return {
        zoom: (hrs) => dispatch(zoom(hrs))
    };
};

//Connect Redux with React
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Timeline);
