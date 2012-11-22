# jsBase [![Build Status](https://travis-ci.org/amatiasq/jsbase.png)](https://travis-ci.org/amatiasq/jsbase)
Version 1.0

A list of independent modules to add to any project, in order of complexity:

 * **Lang.is(value, type);** - Check if a object if from a specific type. Extensible.
 * **extend(Function parent, Object config);** - Extends a constructor.
 * **Emmiter type** - Adds listeners to ad emits specific signals.
 * **Promise type** - Asyncronous operations helper.

## Lang.is

Uses generic algorithms to detect if the is of the type.
  * If type is null it checks if value is null or undefined
  * If value is null returns false.
  * If type has .isTypeOf() method it invokes it passing the value the result is returned.
  * If the type is Object it returns true, every non-null object extends Object.
  * If type is a function uses instanceof operator to know if value prototypes it.
  * If object is native it checks if .constructor property is the type.

## extend()

It extends constructor with it's methods.
Also provides to every method who overwrites another one with a this.base() method to invoke overwrote method.

Created constructor has a .extend() method to create subtypes and .inject() to apply mixins to the current type:
  * Type.extend(Object config)
  * Type.inject(Object config)

## Emitter

    interface Emitter {
      void on(String signal, Function handler, [Object scope]);
      void off(String signal, Function handler, [Object scope]);
      void emit(String signal, Object var_args...);
    }

TODO: Add .once() method to listen a signal only once.

## Promise

    interface Promise {
      Future getFuture();
      void done(Object var_args...);
      void fail(Object var_args...);
      static Promise done(Object var_args...);
      static Promise failed(Object var_args...);
      static Promise parallel(Future var_args...);
      static Promise all(Array<Future> futures);
      static Promise serial(Array<Function> callbacks, Object scope);
      static Constructor Future;
      static Constructor PromiseError;
    }

    interface Future {
      bool isCompleted();
      bool hasFailed();
      bool hasSucceed();
      void onDone(Function callback, Object scope);
      void onError(Function callback, Object scope);
      void onFinally(Function callback, Object scope);
      void then(Function success, Function error, Function fin);
      Future transform(Function adapter);
    }

Usage:

    function loadConfig() {
      var promise = new Promise();
      ajax('/config.file', function(err, response) {
        if (err)
          promise.fail(err);
        else
          promise.done(response.content, response.mimetype);
      });
      return promise.getFuture();
    }

    loadConfig().then(function(content, mime) {
      console.log("Success");
    }, function(error) {
      console.log("Failed: " + error)
    })
