# 1.0.4
Commit: 4e0566c9303b584d3a3db0ad83084be0d275026f
Tag: v1.0.4

## Fixed bug on Promise.all and Promise.parallel
If the futures array is empty the returned future will never succeed

# 1.0.3
Commit: 3d7fb13865a63cc83a8ad95bf43be870b7793ef2

## Fixed bug on Promise.parallel
Futures changes it's state after the callback invocation is done, so inside a callback the promise was not completed.

## Added .transform(Array|Object adapter(Object var_args...)) method to future
This returns a new binded future who will fail if this future fails and will success when this future success, but the value passed is processed by the "adapter" passed to .transform() before complete the future.

# 1.0.2
Commit: 16651c82921739e186f863fed72c972967113e38

## Fixed bug on extend() 
If second argument has a empty property "constructor" it treats it like a function.

## Modified .extend() and .inject() statics methods behaviour
Now they are not binded functions, can be inherited and if a Type overwrites them the subtypes will get the parent's implementation

## ctor moved from named to anonymous function
Removed the name from the constructor function, so if you create a .toString() method for your Type it will be used to display it on the debug console and not "ctor"


# 1.0.1
Commit: 438acb81975237edfd7f553236edde2bff6eeda2

## Lang.is() => is()
In case is.js is loaded from AMD the result object will be the is() function

## Fixed bug on extend()
Reproducible when calling this.base() from a constructor. this.base() was not the parent constructor but window.


