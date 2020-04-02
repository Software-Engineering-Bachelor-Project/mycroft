import React, { Component } from 'react';
import { connect } from 'react-redux';

/* -- Player -- */
class Player extends Component {
    render() {
        return (
            <p>Player Component | Number of clips: {this.props.clips.length}</p>
        );
    }
}

// Map Redux states to React props
const mapStateToProps = state => {
    return {
	    clips: state.player.clips
    }
}

// Forward Redux's dispatch function to React props
const mapDispatchToProps = dispatch => {
    return {}
}

// Connect Redux with React
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Player);
