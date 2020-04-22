import React, { Component } from "react";
import { connect } from "react-redux";

//React Bootstrap components
import Tab from "react-bootstrap/Tab";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Tabs from "react-bootstrap/Tabs";
import TabPane from "react-bootstrap/TabPane";
import TabContent from "react-bootstrap/TabContent";
import TabContainer from "react-bootstrap/TabContainer";

// Import relevant components
import styles from "./browser.module.css";
import ClipBrowser from "./clipBrowser";
import FileBrowser from "./fileBrowser";
import InspectorBrowser from "./inspectorBrowser";

/* -- Browser -- */
class Browser extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={styles.main}>
        <Tab.Container id="browser" defaultActiveKey="clipBrowser">
          <Col className={styles.browserCol}>
            <Row>
              <Nav justify variant="pills">
                <Nav.Item className={styles.browserNav}>
                  <Nav.Link eventKey="clipBrowser">Clips</Nav.Link>
                </Nav.Item>
                <Nav.Item className={styles.browserNav}>
                  <Nav.Link eventKey="fileBrowser">Filesystem</Nav.Link>
                </Nav.Item>
                <Nav.Item className={styles.browserNav}>
                  <Nav.Link eventKey="inspectorBrowser">Inspect</Nav.Link>
                </Nav.Item>
              </Nav>
            </Row>
            <Row className={styles.browserTab}>
              <Tab.Content>
                <Tab.Pane eventKey="fileBrowser" className={styles.browserItem}>
                  <FileBrowser />
                </Tab.Pane>
                <Tab.Pane eventKey="clipBrowser" className={styles.browserItem}>
                  <ClipBrowser />
                </Tab.Pane>
                <Tab.Pane
                  eventKey="inspectorBrowser"
                  className={styles.browserItem}
                >
                  <InspectorBrowser />
                </Tab.Pane>
              </Tab.Content>
            </Row>
          </Col>
        </Tab.Container>
      </div>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {};
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {};
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(Browser);
