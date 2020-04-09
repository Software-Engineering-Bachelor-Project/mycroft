import React, { Component } from 'react';
import { connect } from 'react-redux';

/* -- Browser -- */
class Browser extends Component {
    render() {
        return (
            <p>Browser</p>        
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
