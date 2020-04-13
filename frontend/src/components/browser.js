import React, { Component } from 'react';
import { connect } from 'react-redux';
import ClipBrowser from './clipBrowser'

/* -- Browser -- */
class Browser extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <p>Browser</p>
                <ClipBrowser/>
            </div>
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
)(Browser);