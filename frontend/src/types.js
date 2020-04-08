/* -- This files contains non-React classes -- */

/* CAMERA CLASS */
export class Camera {
    constructor(id, name, pos, empty = false, selected = false) {
        this.id = id;
        this.name = name;
        this.pos = pos;
        this.empty = empty;
        this.selected = selected;
    }
}
