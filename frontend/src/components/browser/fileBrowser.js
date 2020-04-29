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
   * @param {Folder} folder The folder to generate the Tree node for.
   */
  expandFolder(folder) {
    if (folder == undefined) return "";
    return (
      <Tree content={folder.name} key={"f" + folder.id}>
        {folder.children.map((folderID) =>
          this.expandFolder(this.props.folders[folderID])
        )}
        {folder.clips.map((clipID) => {
          if (this.props.clips[clipID] == undefined) return "";
          return (
            <Tree content={this.props.clips[clipID].name} key={"c" + clipID} />
          );
        })}
      </Tree>
    );
  }

  render() {
    return (
      <div className={styles.browserFile}>
        {Object.values(this.props.folders).map((folder) => {
          if (folder.isSource(this.props.folders))
            return this.expandFolder(folder);
          return "";
        })}
      </div>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    folders: state.com.folders,
    clips: state.com.clips,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {};
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(FileBrowser);
