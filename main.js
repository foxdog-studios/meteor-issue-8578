class BaseClass {
  foo(): number {
    return 0;
  }
}

class DerivedClass extends BaseClass {
  foo(): number {
    return super.foo();
  }
}
