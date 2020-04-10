/* -- Tests for the types.js file -- */

import { Camera, Clip } from '../../types';

describe('Camera class', () => {
    
    it('should have all members set correctly', () => {
        var cam = new Camera(2, 'Test Name', [4, 3], {}, true);
        expect(cam.id).toEqual(2);
        expect(cam.name).toEqual('Test Name');
        expect(cam.pos).toEqual([4, 3]);
        expect(cam.isEmpty()).toEqual(true);
        expect(cam.selected).toEqual(true);
    });
    

    it('should not be empty nor selected', () => {
        var cam = new Camera(2, 'Test Name', [4, 3], {1: undefined});
        expect(cam.isEmpty()).toEqual(false);
        expect(cam.selected).toEqual(false);
    });
});

describe('Clip class', () => {

    // Create clip
    var clip = new Clip(7, 'test_name', 'fake/folder/',
                        'wav', '69', '420');
    
    it('should have all members set correctly', () => {
        expect(clip.id).toEqual(7);
        expect(clip.name).toEqual('test_name');
        expect(clip.folder).toEqual('fake/folder/');
        expect(clip.format).toEqual('wav');
        expect(clip.startTime).toEqual('69');
        expect(clip.endTime).toEqual('420');
    });

    it('should produce correct full path', () => {
        expect(clip.getPath()).toEqual('fake/folder/test_name.wav');
    });
});
