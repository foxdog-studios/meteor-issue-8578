[Meteor Issue 8578](https://github.com/meteor/meteor/issues/8578)

Setup
=====

```shell
$ cd /path/to/meteor-issue-8578
$ meteor npm install
$ meteor
```

The Meteor application will not start, printing the error message:

```
=> Errors prevented startup:

   While building for web.browser:
   main.js:56:15: 'super' outside of function or class (56:15)

   While building for os.linux.x86_64:
   main.js:56:15: 'super' outside of function or class (56:15)

=> Your application has errors. Waiting for file change.
```

The bug is dependant on the version of the `ecmascript` Meteor package. I have
strip all other packages from the application and pinned the packaged version
using `@=`. At the latest version, `0.7.2`, Meteor generates the follow code:

**.meteor/local/build/programs/server/app/app.js**
```javascript
/* ... */

var DerivedClass = function (_BaseClass) {                                                        //
  (0, _inherits3.default)(DerivedClass, _BaseClass);                                              //
                                                                                                  //
  function DerivedClass() {                                                                       //
    (0, _classCallCheck3.default)(this, DerivedClass);                                            //
    return (0, _possibleConstructorReturn3.default)(this, _BaseClass.apply(this, arguments));     //
  }                                                                                               //
                                                                                                  //
  DerivedClass.prototype.foo = function () {                                                      //
    function foo() {                                                                              //
      var ret = function () {                                                                     //
        return super.foo();                                                                       //
      }.call(this);                                                                               // 1
                                                                                                  //
      _assert(ret, _t.Number, "return value");                                                    //
                                                                                                  //
      return ret;                                                                                 //
    }                                                                                             //
                                                                                                  //
    return foo;                                                                                   //
  }();                                                                                            //
                                                                                                  //
  return DerivedClass;                                                                            //
}(BaseClass);                                                                                     //

/* ... */
```

The `tcomb` plugin is wrapping `DerivedClass#foo()` to assert the return value.
But the wrapped method is not getting transpiled. Changing line 8 of `mains.js`
from `foo(): number {` to `foo() {` (i.e., remove the Flow return type
annotation) allows the application to start.

Downgrading the `ecmascript` package to `0.6.3` generates;

```javascript
/* ... */

var DerivedClass = function (_BaseClass) {                                                        //
  (0, _inherits3.default)(DerivedClass, _BaseClass);                                              //
                                                                                                  //
  function DerivedClass() {                                                                       //
    (0, _classCallCheck3.default)(this, DerivedClass);                                            //
    return (0, _possibleConstructorReturn3.default)(this, _BaseClass.apply(this, arguments));     //
  }                                                                                               //
                                                                                                  //
  DerivedClass.prototype.foo = function () {                                                      //
    function foo() {                                                                              //
      var ret = function () {                                                                     //
        return _BaseClass.prototype.foo.call(this);                                               // 9
      }.call(this);                                                                               // 10
                                                                                                  //
      _assert(ret, _t.Number, "return value");                                                    //
                                                                                                  //
      return ret;                                                                                 //
    }                                                                                             //
                                                                                                  //
    return foo;                                                                                   //
  }();                                                                                            //
                                                                                                  //
  return DerivedClass;                                                                            //
}(BaseClass);                                                                                     //

/* ... */
```

The wrapped method is correctly transpiled. The application still wont run
because of another (now fixed) issue (see issue
[8422](https://github.com/meteor/meteor/issues/8422)).
