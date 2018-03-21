import * as arr from '../../utils/arr';

export default class DropEvent {
  constructor (dropStatus, dragEvent, type) {
    const { element, dropzone } = type === 'deactivate'
      ? { element: null, dropzone: null }
      : type === 'dragleave'
        ? dropStatus.prev
        : dropStatus.cur;

    this.type          = type;
    this.target        = element;
    this.currentTarget = element;
    this.dropzone      = dropzone;
    this.dragEvent     = dragEvent;
    this.relatedTarget = dragEvent.target;
    this.interaction   = dragEvent.interaction;
    this.draggable     = dragEvent.interactable;
    this.timeStamp     = dragEvent.timeStamp;

    this.propagationStopped = this.immediatePropagationStopped = false;
  }

  reject () {
    const { dropStatus } = this.interaction;

    if (
      (this.type !== 'dropactivate') && (
        !this.dropzone ||
        dropStatus.cur.dropzone !== this.dropzone ||
        dropStatus.cur.element !== this.target)) {
      return;
    }

    dropStatus.prev.dropzone = this.dropzone;
    dropStatus.prev.element = this.target;

    dropStatus.rejected = true;
    dropStatus.events.enter = null;

    this.stopImmediatePropagation();

    if (this.type === 'dragenter') {
      this.dropzone.fire(new DropEvent(dropStatus, this.dragEvent, 'dragleave'));
    }

    if (this.type === 'dropactivate') {
      const activeDrops = dropStatus.activeDrops;
      const index = arr.findIndex(activeDrops, ({ dropzone, element }) =>
        dropzone === this.dropzone && element === this.target);

      dropStatus.activeDrops = [
        ...activeDrops.slice(0, index),
        ...activeDrops.slice(index + 1),
      ];

      const deactivateEvent = new DropEvent(dropStatus, this.dragEvent, 'dropdeactivate');

      deactivateEvent.dropzone = this.dropzone;
      deactivateEvent.target = this.target;

      this.dropzone.fire(deactivateEvent);
    }
  }

  preventDefault () {}

  stopPropagation () {
    this.propagationStopped = true;
  }

  stopImmediatePropagation () {
    this.immediatePropagationStopped = this.propagationStopped = true;
  }
}
