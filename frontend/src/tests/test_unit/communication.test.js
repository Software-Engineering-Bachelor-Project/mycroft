/* -- THIS FILE TESTS THE COMMUNICATION STATE FILE .. */

// Misc
import { Project } from '../../types';

// Reducer and initial state
import reducer, { initialState } from '../../state/stateCommunication';

// Import actions
import { REQUEST_RESPONSE, requestResponse } from '../../state/stateCommunication';
import { GET_PROJECTS, getProjects } from '../../state/stateCommunication';
import { NEW_PROJECT, newProject } from '../../state/stateCommunication';
import { DELETE_PROJECT, deleteProject } from '../../state/stateCommunication';
import { RENAME_PROJECT, renameProject } from '../../state/stateCommunication';

describe('Communication reducer', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual(initialState);
    });

    it('should handle REQUEST_RESPONSE', () => {

        // Action constant
        expect(REQUEST_RESPONSE).toEqual('REQUEST_RESPONSE');

        // Action creator
        expect(requestResponse('test_type', 404, {
            test: 4
        })).toEqual({
            type: REQUEST_RESPONSE,
            reqType: 'test_type',
            status: 404,
            data: {
                test: 4
            }
        });

        // Receival of specific request types will be
        // handled in their respective request action.
    });

    it('should handle GET_PROJECTS', () => {

        // Set up variables
        var data1 = {
            projects: [
                {
                    id: 4,
                    name: 'test proj 1',
                    created: 'datetime1',
                    last_updated: 'datetime2',
                    folders: [5, 7, 8]
                },
                {
                    id: 69,
                    name: 'test proj 2',
                    created: 'datetime3',
                    last_updated: 'datetime4',
                    folders: []
                }
            ]
        };

        var data2 = {
            projects: [
                {
                    id: 1337,
                    name: 'test proj 3',
                    created: 'datetime5',
                    last_updated: 'datetime6',
                    folders: [500, 725, 1016]
                }
            ]
        };

        var dict1 = {
            4: new Project(4, 'test proj 1', 'datetime1',
                           'datetime2', [5, 7, 8]),
            69: new Project(69, 'test proj 2', 'datetime3',
                           'datetime4', [])
        };

        var dict2 = {
            1337: new Project(1337, 'test proj 3', 'datetime5',
                              'datetime6', [500, 725, 1016])
        };
        
        // Action constant
        expect(GET_PROJECTS).toEqual('GET_PROJECTS');

        // Action creator
        expect(getProjects()).toEqual({
            type: GET_PROJECTS
        });

        // Fetch project list
        expect(reducer(initialState, requestResponse(
            GET_PROJECTS, 200, data1
        ))).toEqual({
            ...initialState,
            projects: dict1
        });

        // Update list
        expect(reducer({
            ...initialState,
            projects: dict1
        }, requestResponse(
            GET_PROJECTS, 200, data2
        ))).toEqual({
            ...initialState,
            projects: dict2
        });

        // 404
        expect(reducer(initialState, requestResponse(
            GET_PROJECTS, 404, data1
        ))).toEqual(initialState);
    });

    it('should handle NEW_PROJECT', () => {

        // Action constant
        expect(NEW_PROJECT).toEqual('NEW_PROJECT');

        // Action creator
        expect(newProject('test name')).toEqual({
            type: NEW_PROJECT,
            name: 'test name'
        });

        // Create new project
        expect(reducer(initialState, requestResponse(
            NEW_PROJECT, 200, {
                project_id: 7
            }
        ))).toEqual({
            ...initialState,
            projectID: 7
        });

        // 400
        expect(reducer(initialState, requestResponse(
            NEW_PROJECT, 400, undefined
        ))).toEqual(initialState);

        // 404
        expect(reducer(initialState, requestResponse(
            NEW_PROJECT, 404, undefined
        ))).toEqual(initialState);
    });

    it('should handle DELETE_PROJECT', () => {

        // Action constant
        expect(DELETE_PROJECT).toEqual('DELETE_PROJECT');

        // Action creator
        expect(deleteProject(1337)).toEqual({
            type: DELETE_PROJECT,
            id: 1337
        });

        // Delete project
        expect(reducer(initialState, requestResponse(
            DELETE_PROJECT, 200, {}
        ))).toEqual(initialState);

        // 400
        expect(reducer(initialState, requestResponse(
            DELETE_PROJECT, 400, undefined
        ))).toEqual(initialState);

        // 404
        expect(reducer(initialState, requestResponse(
            DELETE_PROJECT, 404, undefined
        ))).toEqual(initialState);
    });
    
    it('should handle RENAME_PROJECT', () => {

        // Action constant
        expect(RENAME_PROJECT).toEqual('RENAME_PROJECT');

        // Action creator
        expect(renameProject(1337)).toEqual({
            type: RENAME_PROJECT,
            id: 1337
        });

        // Rename project
        expect(reducer(initialState, requestResponse(
            RENAME_PROJECT, 200, {}
        ))).toEqual(initialState);

        // 204
        expect(reducer(initialState, requestResponse(
            RENAME_PROJECT, 400, undefined
        ))).toEqual(initialState);
        
        // 400
        expect(reducer(initialState, requestResponse(
            RENAME_PROJECT, 400, undefined
        ))).toEqual(initialState);

        // 404
        expect(reducer(initialState, requestResponse(
            RENAME_PROJECT, 404, undefined
        ))).toEqual(initialState);
    });
});
