"use strict";

// Adapted from ReactART:
// https://github.com/reactjs/react-art
import React from "react";
import ReactMultiChild from "react-dom/lib/ReactMultiChild";
import emptyObject from "fbjs/lib/emptyObject";

const ContainerMixin = Object.assign({}, ReactMultiChild.Mixin, {
  /**
   * Moves a child component to the supplied index.
   *
   * @param {ReactComponent} child Component to move.
   * @param {number} toIndex Destination index of the element.
   * @protected
   */
  moveChild: function(child, afterNode, toIndex, lastIndex) {
    const childNode = child._mountImage;
    const mostRecentlyPlacedChild = this._mostRecentlyPlacedChild;
    if (mostRecentlyPlacedChild == null) {
      // I'm supposed to be first.
      if (childNode.previousSibling) {
        if (this.node.firstChild) {
          childNode.injectBefore(this.node.firstChild);
        } else {
          childNode.inject(this.node);
        }
      }
    } else {
      // I'm supposed to be after the previous one.
      if (mostRecentlyPlacedChild.nextSibling !== childNode) {
        if (mostRecentlyPlacedChild.nextSibling) {
          childNode.injectBefore(mostRecentlyPlacedChild.nextSibling);
        } else {
          childNode.inject(this.node);
        }
      }
    }
    this._mostRecentlyPlacedChild = childNode;
  },

  /**
   * Creates a child component.
   *
   * @param {ReactComponent} child Component to create.
   * @param {object} childNode ART node to insert.
   * @protected
   */
  createChild: function(child, afterNode, childNode) {
    child._mountImage = childNode;
    const mostRecentlyPlacedChild = this._mostRecentlyPlacedChild;
    if (mostRecentlyPlacedChild == null) {
      // I'm supposed to be first.
      if (this.node.firstChild) {
        childNode.injectBefore(this.node.firstChild);
      } else {
        childNode.inject(this.node);
      }
    } else {
      // I'm supposed to be after the previous one.
      if (mostRecentlyPlacedChild.nextSibling) {
        childNode.injectBefore(mostRecentlyPlacedChild.nextSibling);
      } else {
        childNode.inject(this.node);
      }
    }
    this._mostRecentlyPlacedChild = childNode;
  },

  /**
   * Removes a child component.
   *
   * @param {ReactComponent} child Child to remove.
   * @protected
   */
  removeChild: function(child) {
    child._mountImage.remove();
    child._mountImage = null;
    this.node.invalidateLayout();
  },

  updateChildrenAtRoot: function(nextChildren, transaction) {
    this.updateChildren(nextChildren, transaction, emptyObject);
  },

  mountAndInjectChildrenAtRoot: function(children, transaction) {
    this.mountAndInjectChildren(children, transaction, emptyObject);
  },

  /**
   * Override to bypass batch updating because it is not necessary.
   *
   * @param {?object} nextChildren.
   * @param {ReactReconcileTransaction} transaction
   * @internal
   * @override {ReactMultiChild.Mixin.updateChildren}
   */
  updateChildren: function(nextChildren, transaction, context) {
    this._mostRecentlyPlacedChild = null;
    this._updateChildren(nextChildren, transaction, context);
  },

  // Shorthands

  mountAndInjectChildren: function(children, transaction, context) {
    const mountedImages = this.mountChildren(children, transaction, context);

    // Each mount image corresponds to one of the flattened children
    let i = 0;
    for (const key in this._renderedChildren) {
      if (this._renderedChildren.hasOwnProperty(key)) {
        const child = this._renderedChildren[key];
        child._mountImage = mountedImages[i];
        mountedImages[i].inject(this.node);
        i++;
      }
    }
  }
});

export default ContainerMixin;