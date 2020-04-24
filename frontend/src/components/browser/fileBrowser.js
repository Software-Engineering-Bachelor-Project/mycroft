import React, { Component } from "react";
import { connect } from "react-redux";
import styles from "./browser.module.css";

import Tree from "react-animated-tree";

/* -- FileBrowser -- */
class FileBrowser extends Component {
  constructor(props) {
    super(props);
    this.expandFolder = this.expandFolder.bind(this);
  }

  /**
   * This method recursively generates HTML for
   * the specified folder, and all subfolders.
   *
   * @param
   */
  expandFolder(folder) {
    return (
      <Tree content={folder.name} key={"f" + folder.id}>
        {Object.values(folder.children).map(this.expandFolder)}
        {Object.values(folder.clips).map((clip) => {
          return <Tree content={clip.name} key={"c" + clip.id} />;
        })}
      </Tree>
    );
  }

  render() {
    return (
      <div className={styles.browserFile}>
        {Object.values(this.props.folders).map(this.expandFolder)}
      </div>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    folders: state.browser.folders,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {};
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(FileBrowser);
