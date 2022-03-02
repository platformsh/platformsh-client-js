import { assert } from "chai";
import { autoImplement, autoImplementWithBaseClass } from "../src/model/utils";

class Parent {
  constructor(arg) {
    this.name = "Base";
    this.derivedName = arg.derivedName;
  }

  static staticOverridable() {
    return "parent static overridable";
  }

  instanceOverridable() {
    return "parent instance overridable";
  }

  getDerivedName() {
    return this.derivedName;
  }

  baseName() {
    return this.name;
  }

  static parentstaticName() {
    return "parent name";
  }
}

class Child extends autoImplementWithBaseClass(Parent)() {
  constructor(s) {
    super(s);
  }
  static childStaticName() {
    return "child name";
  }

  static staticOverridable() {
    return "child static overridable";
  }

  instanceOverridable() {
    return "child instance overridable";
  }
}

describe("Auto implement weak interface", () => {
  it("should initize Base class instance members by calling super in derived Class constructor", () => {
    assert.equal(
      new Child({ derivedName: "Derived name" }).getDerivedName(),
      "Derived name"
    );
  });

  it("should access Base and Derived class static members from child", () => {
    assert.equal(Child.childStaticName(), "child name");
    assert.equal(Child.parentstaticName(), "parent name");
  });

  it("should allow Derived class override Base class instance and static members", () => {
    assert.equal(Child.staticOverridable(), "child static overridable");
    assert.equal(
      new Child({}).instanceOverridable(),
      "child instance overridable"
    );
  });

  it("should optionally allow initializing a class with default value", () => {
    class Child extends autoImplementWithBaseClass(Parent)({
      defaultValue: "default_value"
    }) {}
    assert.equal(new Child({}).defaultValue, "default_value");
  });
});
