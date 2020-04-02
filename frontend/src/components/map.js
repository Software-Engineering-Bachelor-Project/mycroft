import React, { Component } from 'react';
import { connect } from 'react-redux';


/* -- Map -- */
class Map extends Component {
    render() {
        return (
            <p>Map object :)</p>
        );
    }
}

// Map Redux states to React props
const mapStateToProps = state => {
    return {}
        //TODO::add states
    //}
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
