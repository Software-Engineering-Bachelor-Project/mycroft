/* -- Tests for the types.js file -- */

import { Camera } from '../../types';

describe('Camera class', () => {
    
    it('should have all members set correctly', () => {
        var cam = new Camera(2, "Test Name", [4, 3], true, true);
        expect(cam.id).toEqual(2);
        expect(cam.name).toEqual("Test Name");
        expect(cam.pos).toEqual([4, 3]);
        expect(cam.empty).toEqual(true);
        expect(cam.selected).toEqual(true);
    });
    

    it('should not be empty nor selected', () => {
        var cam = new Camera(2, "Test Name", [4, 3]);
        expect(cam.empty).toEqual(false);
        expect(cam.selected).toEqual(false);
    });
});
