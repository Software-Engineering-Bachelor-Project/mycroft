import React, { Component } from 'react';
import { connect } from 'react-redux';

/* -- Menu -- */
class Menu extends Component {
    render() {
        return (
            <p> Menu Component </p>
        );
    }
}

// Menu Redux states to React props
const menuStateToProps = state => {
    return {
        //TODO::add states
    }
}

// Forward Redux's dispatch function to React props
const menuDispatchToProps = dispatch => {
    return {}
}

// Connect Redux with React
export default connect(
    menuStateToProps,
    menuDispatchToProps
)(Menu);
