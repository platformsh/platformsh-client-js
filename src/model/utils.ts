import Ressource from "./Ressource";

export class BaseClass extends Ressource{
}
/**
 * Emulate a derived class that extend it Base type  and implement a weak interface 
 * without the need to redeclare the properties of the interface in the derived class
 * @param base the base class to implement
 * @returns An Emulated Base class type which implements the properties of the weak interface generic
 */
export function autoImplementWithCustomClass<BaseImpl extends new (...args: any[]) => any>(base: BaseImpl) {
    return function <T>(defaults?: Partial<T>): Pick<BaseImpl, keyof BaseImpl> & {
      new(...a: (BaseImpl extends new (...o: infer A) => unknown ? A : [])): InstanceType<BaseImpl> & T
    } {
      return class A extends base {
        constructor(...a: any[]) {
          super(...a);
           Object.assign(this, defaults || {});
        }
      } as any
    }
  }

export function autoImplementWithResources() {
  return autoImplementWithCustomClass(BaseClass);
}

/**
 * Emulates a Base class that implements the type of T without need to
 * redeclare T in the derived class
 */
export function autoImplement<T>(defaults?: Partial<T>) {
    return class {
      constructor() {
        Object.assign(this, defaults || {});
      }
    } as new () => T
  }


export type UnionToIntersection<U> = 
  (U extends any ? (k: U)=>void : never) extends ((k: infer I)=>void) ? I : never;
