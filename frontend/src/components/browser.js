import React, { Component } from 'react';
import { connect } from 'react-redux';

import ClipBrowser from './clipBrowser';
import FileBrowser from './fileBrowser';

/* -- Browser -- */
class Browser extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <React.Fragment>
              <p>Browser</p>
              <ClipBrowser />
              <FileBrowser />
            </React.Fragment>
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
