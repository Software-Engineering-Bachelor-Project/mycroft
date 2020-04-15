import React, { Component } from 'react';
import { connect } from 'react-redux';

//React Bootstrap components
import Tab from 'react-bootstrap/Tab';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Tabs from 'react-bootstrap/Tabs';
import TabPane from 'react-bootstrap/TabPane';
import TabContent from 'react-bootstrap/TabContent';
import TabContainer from 'react-bootstrap/TabContainer';

// Import relevant components
import styles from './browser.module.css';
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
                    <Tab.Container id="browser" defaultActiveKey="fileBrowser" className={styles.browserTab}>
                        <Col>
                            <Row className={styles.browserTab}>
                                <Nav justify variant="pills" className={styles.browserTab}>
                                    <Nav.Item className={styles.browserItem}>
                                        <Nav.Link eventKey="fileBrowser">Tree</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item className={styles.browserItem}>
                                        <Nav.Link eventKey="clipBrowser">List</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Row>
                            <Row className={styles.browserTab}>
                                <Tab.Content>
                                    <Tab.Pane eventKey="fileBrowser">
                                        <FileBrowser />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="clipBrowser">
                                        <ClipBrowser />
                                    </Tab.Pane>
                                </Tab.Content>
                            </Row>
                        </Col>
                    </Tab.Container>
            </React.Fragment>
        );
    }
}


// Map Redux states to React props
const mapStateToProps = state => {
    return {};
};


// Forward Redux's dispatch function to React props
const mapDispatchToProps = dispatch => {
    return {};
};


// Connect Redux with React
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Browser);