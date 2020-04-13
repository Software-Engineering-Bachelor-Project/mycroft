import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './browser.module.css';


// React Bootstrap
import ListGroup from 'react-bootstrap/ListGroup';

/* -- Browser -- */
class ClipBrowser extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
                <ListGroup className={styles.browserClip}> 
                    {Object.values(this.props.cameras).map((camera) => (
                        <ListGroup.Item key={camera.id}>
                            <p>{camera.name}</p>
                            {Object.values(camera.clips).map((clip) => (
                                <ListGroup.Item key={clip.id}>
                                    {clip.name}
                                </ListGroup.Item>
                            )
                            )}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
        );
    }
}

// Map Redux states to React props
const mapStateToProps = state => {
    return { cameras: state.browser.cameras }
}


// Forward Redux's dispatch function to React props
const mapDispatchToProps = dispatch => {
    return {}
}


// Connect Redux with React
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ClipBrowser);

