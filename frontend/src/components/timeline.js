import React, { Component } from 'react';
import {connect} from 'react-redux';

/* -- Timeline -- */
class Timeline extends Component {
    render() { 
        return (  
            <p> Timeline Component </p>
        );
    }
}

//Map Redux states to React props
const mapStateToProps = state => {
    return {

    }
}

//Forward Redux's dispatch function to React props
const mapDispatchToProps = dispatch => {
    return {}
}

//Connect Redux with React
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Timeline);