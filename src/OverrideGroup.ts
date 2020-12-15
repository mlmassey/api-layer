import { isApiLayerFunction } from './ApiLayerCommon';
import { ApiFunction } from './types/ApiFunction';
import { overrideApi } from './overrideApi';
import { ApiLayer } from '.';

export class OverrideGroup {
  overrides: { (): void }[];
  apiLayer?: ApiLayer;
  /**
   * Creates an Override group that manages a group of overrides
   * @param {ApiLayer} apiLayer: (optional)  Uses this ApiLayer instead of the global layer.  Typically used for testing purposes only.
   */
  constructor(apiLayer?: ApiLayer) {
    this.overrides = [];
    this.apiLayer = apiLayer;
    this.add = this.add.bind(this);
    this.removeAll = this.removeAll.bind(this);
  }
  /**
   * Adds a new override to the group, or adds another group to this group
   * @param {OverrideGroup|ApiFunction} apiOrHandle: If another group, appends it to this group. If ApiFunction, it overrides the specified API and
   *  adds to this group
   * @param {function} overrideFunc: The override function you want to use as an override
   * @returns {OverrideGroup} Returns this object so it can be changed with later calls
   */
  add(apiOrHandle: any, overrideFunc?: (...args: any) => Promise<any>): OverrideGroup {
    if (!apiOrHandle) {
      throw new Error('Invalid empty argument');
    }
    if (apiOrHandle instanceof OverrideGroup) {
      this.overrides = this.overrides.concat((apiOrHandle as OverrideGroup).overrides);
      return this;
    }
    if (!isApiLayerFunction(apiOrHandle)) {
      throw new Error('Invalid ApiFunction');
    }
    if (!overrideFunc) {
      throw new Error('Invalid empty overrideFunc');
    }
    // We assume this is an ApiFunction and we are adding it
    const remove = overrideApi(apiOrHandle as ApiFunction<any, any>, overrideFunc, this.apiLayer);
    this.overrides.push(remove);
    return this;
  }
  /**
   * Removes all the overrides that are part of this group
   */
  removeAll() {
    (this.overrides || []).forEach((removeOverride) => {
      removeOverride();
    });
  }
}
