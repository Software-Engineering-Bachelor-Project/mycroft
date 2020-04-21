import React, { Component } from 'react';
import { connect } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

// Actions
import { getProjects, newProject, deleteProject, renameProject } from '../state/stateCommunication';

/* -- Evoker -- */
class Evoker extends Component {
    render() {
        return (
            <div style={{
                position: 'absolute',
                top: '5px',
                left: '100px',
                zIndex: 1
            }}>

              {/* Drop down menu containing all actions to evoke */}
              <DropdownButton alignRight
                              title='Evoke'
                              id='dropdown-menu-align-right'
              >
                
                <Dropdown.Item onClick={
                    () => this.props.getProjects()
                }> getProjects </Dropdown.Item>
                
                <Dropdown.Item onClick={
                    () => {
                        var name = window.prompt('Name: ');
                        this.props.newProject(name);
                    }
                }> newProject </Dropdown.Item>
                
                <Dropdown.Item onClick={
                    () => {
                        var id = parseInt(window.prompt('ID: '));
                        return this.props.deleteProject(id);
                    }
                }> deleteProject </Dropdown.Item>
                
                <Dropdown.Item onClick={
                    () => {
                        var id = parseInt(window.prompt('ID: '));
                        var name = window.prompt('New name: ');
                        return this.props.renameProject(id, name);
                    }
                }> renameProject </Dropdown.Item>
              </DropdownButton>
              
              <button onClick={
                  () => this.props.logState()
              }> Log State </button>
            </div>
        );
    }
}

// Map Redux states to React props
const menuStateToProps = state => {
    return {
        logState: () => console.log(state)
    };
};

// Forward Redux's dispatch function to React props
const menuDispatchToProps = dispatch => {
    return {
        getProjects: () => dispatch(getProjects()),
        newProject: (n) => dispatch(newProject(n)),
        deleteProject: (i) => dispatch(deleteProject(i)),
        renameProject: (i, n) => dispatch(renameProject(i, n))
    };
};

// Connect Redux with React
export default connect(
    menuStateToProps,
    menuDispatchToProps
)(Evoker);
