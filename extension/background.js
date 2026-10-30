var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/dexie/dist/dexie.js
var require_dexie = __commonJS({
  "node_modules/dexie/dist/dexie.js"(exports, module) {
    (function(global2, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, global2.Dexie = factory());
    })(exports, (function() {
      "use strict";
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      }
      var __assign = function() {
        __assign = Object.assign || function __assign2(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }
          return t;
        };
        return __assign.apply(this, arguments);
      };
      function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar2; i < l; i++) {
          if (ar2 || !(i in from)) {
            if (!ar2) ar2 = Array.prototype.slice.call(from, 0, i);
            ar2[i] = from[i];
          }
        }
        return to.concat(ar2 || Array.prototype.slice.call(from));
      }
      typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
      };
      var _global = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
      var keys = Object.keys;
      var isArray = Array.isArray;
      if (typeof Promise !== "undefined" && !_global.Promise) {
        _global.Promise = Promise;
      }
      function extend(obj, extension) {
        if (typeof extension !== "object")
          return obj;
        keys(extension).forEach(function(key) {
          obj[key] = extension[key];
        });
        return obj;
      }
      var getProto = Object.getPrototypeOf;
      var _hasOwn = {}.hasOwnProperty;
      function hasOwn(obj, prop) {
        return _hasOwn.call(obj, prop);
      }
      function props(proto, extension) {
        if (typeof extension === "function")
          extension = extension(getProto(proto));
        (typeof Reflect === "undefined" ? keys : Reflect.ownKeys)(extension).forEach(function(key) {
          setProp(proto, key, extension[key]);
        });
      }
      var defineProperty = Object.defineProperty;
      function setProp(obj, prop, functionOrGetSet, options) {
        defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === "function" ? {
          get: functionOrGetSet.get,
          set: functionOrGetSet.set,
          configurable: true
        } : { value: functionOrGetSet, configurable: true, writable: true }, options));
      }
      function derive(Child) {
        return {
          from: function(Parent) {
            Child.prototype = Object.create(Parent.prototype);
            setProp(Child.prototype, "constructor", Child);
            return {
              extend: props.bind(null, Child.prototype)
            };
          }
        };
      }
      var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
      function getPropertyDescriptor(obj, prop) {
        var pd = getOwnPropertyDescriptor(obj, prop);
        var proto;
        return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
      }
      var _slice = [].slice;
      function slice(args, start, end) {
        return _slice.call(args, start, end);
      }
      function override(origFunc, overridedFactory) {
        return overridedFactory(origFunc);
      }
      function assert(b) {
        if (!b)
          throw new Error("Assertion Failed");
      }
      function asap$1(fn) {
        if (_global.setImmediate)
          setImmediate(fn);
        else
          setTimeout(fn, 0);
      }
      function arrayToObject(array, extractor) {
        return array.reduce(function(result, item, i) {
          var nameAndValue = extractor(item, i);
          if (nameAndValue)
            result[nameAndValue[0]] = nameAndValue[1];
          return result;
        }, {});
      }
      function getByKeyPath(obj, keyPath) {
        if (typeof keyPath === "string" && hasOwn(obj, keyPath))
          return obj[keyPath];
        if (!keyPath)
          return obj;
        if (typeof keyPath !== "string") {
          var rv = [];
          for (var i = 0, l = keyPath.length; i < l; ++i) {
            var val = getByKeyPath(obj, keyPath[i]);
            rv.push(val);
          }
          return rv;
        }
        var period = keyPath.indexOf(".");
        if (period !== -1) {
          var innerObj = obj[keyPath.substr(0, period)];
          return innerObj == null ? void 0 : getByKeyPath(innerObj, keyPath.substr(period + 1));
        }
        return void 0;
      }
      function setByKeyPath(obj, keyPath, value) {
        if (!obj || keyPath === void 0)
          return;
        if ("isFrozen" in Object && Object.isFrozen(obj))
          return;
        if (typeof keyPath !== "string" && "length" in keyPath) {
          assert(typeof value !== "string" && "length" in value);
          for (var i = 0, l = keyPath.length; i < l; ++i) {
            setByKeyPath(obj, keyPath[i], value[i]);
          }
        } else {
          var period = keyPath.indexOf(".");
          if (period !== -1) {
            var currentKeyPath = keyPath.substr(0, period);
            var remainingKeyPath = keyPath.substr(period + 1);
            if (remainingKeyPath === "")
              if (value === void 0) {
                if (isArray(obj) && !isNaN(parseInt(currentKeyPath)))
                  obj.splice(currentKeyPath, 1);
                else
                  delete obj[currentKeyPath];
              } else
                obj[currentKeyPath] = value;
            else {
              var innerObj = obj[currentKeyPath];
              if (!innerObj || !hasOwn(obj, currentKeyPath)) {
                if (value === void 0)
                  return;
                innerObj = obj[currentKeyPath] = {};
              }
              setByKeyPath(innerObj, remainingKeyPath, value);
            }
          } else {
            if (value === void 0) {
              if (isArray(obj) && !isNaN(parseInt(keyPath)))
                obj.splice(keyPath, 1);
              else
                delete obj[keyPath];
            } else
              obj[keyPath] = value;
          }
        }
      }
      function delByKeyPath(obj, keyPath) {
        if (typeof keyPath === "string")
          setByKeyPath(obj, keyPath, void 0);
        else if ("length" in keyPath)
          [].map.call(keyPath, function(kp) {
            setByKeyPath(obj, kp, void 0);
          });
      }
      function shallowClone(obj) {
        var rv = {};
        for (var m in obj) {
          if (hasOwn(obj, m))
            rv[m] = obj[m];
        }
        return rv;
      }
      var concat = [].concat;
      function flatten(a) {
        return concat.apply([], a);
      }
      var intrinsicTypeNames = "BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(flatten([8, 16, 32, 64].map(function(num) {
        return ["Int", "Uint", "Float"].map(function(t) {
          return t + num + "Array";
        });
      }))).filter(function(t) {
        return _global[t];
      });
      var intrinsicTypes = new Set(intrinsicTypeNames.map(function(t) {
        return _global[t];
      }));
      function cloneSimpleObjectTree(o) {
        var rv = {};
        for (var k in o)
          if (hasOwn(o, k)) {
            var v = o[k];
            rv[k] = !v || typeof v !== "object" || intrinsicTypes.has(v.constructor) ? v : cloneSimpleObjectTree(v);
          }
        return rv;
      }
      var circularRefs = null;
      function deepClone(any) {
        circularRefs = /* @__PURE__ */ new WeakMap();
        var rv = innerDeepClone(any);
        circularRefs = null;
        return rv;
      }
      function innerDeepClone(x) {
        if (!x || typeof x !== "object")
          return x;
        var rv = circularRefs.get(x);
        if (rv)
          return rv;
        if (isArray(x)) {
          rv = [];
          circularRefs.set(x, rv);
          for (var i = 0, l = x.length; i < l; ++i) {
            rv.push(innerDeepClone(x[i]));
          }
        } else if (intrinsicTypes.has(x.constructor)) {
          rv = x;
        } else {
          var proto = getProto(x);
          rv = proto === Object.prototype ? {} : Object.create(proto);
          circularRefs.set(x, rv);
          for (var prop in x) {
            if (hasOwn(x, prop)) {
              rv[prop] = innerDeepClone(x[prop]);
            }
          }
        }
        return rv;
      }
      var toString = {}.toString;
      function toStringTag(o) {
        return toString.call(o).slice(8, -1);
      }
      var iteratorSymbol = typeof Symbol !== "undefined" ? Symbol.iterator : "@@iterator";
      var getIteratorOf = typeof iteratorSymbol === "symbol" ? function(x) {
        var i;
        return x != null && (i = x[iteratorSymbol]) && i.apply(x);
      } : function() {
        return null;
      };
      function delArrayItem(a, x) {
        var i = a.indexOf(x);
        if (i >= 0)
          a.splice(i, 1);
        return i >= 0;
      }
      var NO_CHAR_ARRAY = {};
      function getArrayOf(arrayLike) {
        var i, a, x, it2;
        if (arguments.length === 1) {
          if (isArray(arrayLike))
            return arrayLike.slice();
          if (this === NO_CHAR_ARRAY && typeof arrayLike === "string")
            return [arrayLike];
          if (it2 = getIteratorOf(arrayLike)) {
            a = [];
            while (x = it2.next(), !x.done)
              a.push(x.value);
            return a;
          }
          if (arrayLike == null)
            return [arrayLike];
          i = arrayLike.length;
          if (typeof i === "number") {
            a = new Array(i);
            while (i--)
              a[i] = arrayLike[i];
            return a;
          }
          return [arrayLike];
        }
        i = arguments.length;
        a = new Array(i);
        while (i--)
          a[i] = arguments[i];
        return a;
      }
      var isAsyncFunction = typeof Symbol !== "undefined" ? function(fn) {
        return fn[Symbol.toStringTag] === "AsyncFunction";
      } : function() {
        return false;
      };
      var dexieErrorNames = [
        "Modify",
        "Bulk",
        "OpenFailed",
        "VersionChange",
        "Schema",
        "Upgrade",
        "InvalidTable",
        "MissingAPI",
        "NoSuchDatabase",
        "InvalidArgument",
        "SubTransaction",
        "Unsupported",
        "Internal",
        "DatabaseClosed",
        "PrematureCommit",
        "ForeignAwait"
      ];
      var idbDomErrorNames = [
        "Unknown",
        "Constraint",
        "Data",
        "TransactionInactive",
        "ReadOnly",
        "Version",
        "NotFound",
        "InvalidState",
        "InvalidAccess",
        "Abort",
        "Timeout",
        "QuotaExceeded",
        "Syntax",
        "DataClone"
      ];
      var errorList = dexieErrorNames.concat(idbDomErrorNames);
      var defaultTexts = {
        VersionChanged: "Database version changed by other database connection",
        DatabaseClosed: "Database has been closed",
        Abort: "Transaction aborted",
        TransactionInactive: "Transaction has already completed or failed",
        MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
      };
      function DexieError(name, msg) {
        this.name = name;
        this.message = msg;
      }
      derive(DexieError).from(Error).extend({
        toString: function() {
          return this.name + ": " + this.message;
        }
      });
      function getMultiErrorMessage(msg, failures) {
        return msg + ". Errors: " + Object.keys(failures).map(function(key) {
          return failures[key].toString();
        }).filter(function(v, i, s) {
          return s.indexOf(v) === i;
        }).join("\n");
      }
      function ModifyError(msg, failures, successCount, failedKeys) {
        this.failures = failures;
        this.failedKeys = failedKeys;
        this.successCount = successCount;
        this.message = getMultiErrorMessage(msg, failures);
      }
      derive(ModifyError).from(DexieError);
      function BulkError(msg, failures) {
        this.name = "BulkError";
        this.failures = Object.keys(failures).map(function(pos) {
          return failures[pos];
        });
        this.failuresByPos = failures;
        this.message = getMultiErrorMessage(msg, this.failures);
      }
      derive(BulkError).from(DexieError);
      var errnames = errorList.reduce(function(obj, name) {
        return obj[name] = name + "Error", obj;
      }, {});
      var BaseException = DexieError;
      var exceptions = errorList.reduce(function(obj, name) {
        var fullName = name + "Error";
        function DexieError2(msgOrInner, inner) {
          this.name = fullName;
          if (!msgOrInner) {
            this.message = defaultTexts[name] || fullName;
            this.inner = null;
          } else if (typeof msgOrInner === "string") {
            this.message = "".concat(msgOrInner).concat(!inner ? "" : "\n " + inner);
            this.inner = inner || null;
          } else if (typeof msgOrInner === "object") {
            this.message = "".concat(msgOrInner.name, " ").concat(msgOrInner.message);
            this.inner = msgOrInner;
          }
        }
        derive(DexieError2).from(BaseException);
        obj[name] = DexieError2;
        return obj;
      }, {});
      exceptions.Syntax = SyntaxError;
      exceptions.Type = TypeError;
      exceptions.Range = RangeError;
      var exceptionMap = idbDomErrorNames.reduce(function(obj, name) {
        obj[name + "Error"] = exceptions[name];
        return obj;
      }, {});
      function mapError(domError, message) {
        if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name])
          return domError;
        var rv = new exceptionMap[domError.name](message || domError.message, domError);
        if ("stack" in domError) {
          setProp(rv, "stack", {
            get: function() {
              return this.inner.stack;
            }
          });
        }
        return rv;
      }
      var fullNameExceptions = errorList.reduce(function(obj, name) {
        if (["Syntax", "Type", "Range"].indexOf(name) === -1)
          obj[name + "Error"] = exceptions[name];
        return obj;
      }, {});
      fullNameExceptions.ModifyError = ModifyError;
      fullNameExceptions.DexieError = DexieError;
      fullNameExceptions.BulkError = BulkError;
      function nop() {
      }
      function mirror(val) {
        return val;
      }
      function pureFunctionChain(f1, f2) {
        if (f1 == null || f1 === mirror)
          return f2;
        return function(val) {
          return f2(f1(val));
        };
      }
      function callBoth(on1, on2) {
        return function() {
          on1.apply(this, arguments);
          on2.apply(this, arguments);
        };
      }
      function hookCreatingChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function() {
          var res = f1.apply(this, arguments);
          if (res !== void 0)
            arguments[0] = res;
          var onsuccess = this.onsuccess, onerror = this.onerror;
          this.onsuccess = null;
          this.onerror = null;
          var res2 = f2.apply(this, arguments);
          if (onsuccess)
            this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
          if (onerror)
            this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
          return res2 !== void 0 ? res2 : res;
        };
      }
      function hookDeletingChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function() {
          f1.apply(this, arguments);
          var onsuccess = this.onsuccess, onerror = this.onerror;
          this.onsuccess = this.onerror = null;
          f2.apply(this, arguments);
          if (onsuccess)
            this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
          if (onerror)
            this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        };
      }
      function hookUpdatingChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function() {
          var res = f1.apply(this, arguments);
          var modifications = arguments[0];
          extend(modifications, res);
          var onsuccess = this.onsuccess, onerror = this.onerror;
          this.onsuccess = null;
          this.onerror = null;
          var res2 = f2.apply(this, arguments);
          if (onsuccess)
            this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
          if (onerror)
            this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
          return res === void 0 ? res2 === void 0 ? void 0 : res2 : extend(res, res2);
        };
      }
      function reverseStoppableEventChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function() {
          if (f2.apply(this, arguments) === false)
            return false;
          return f1.apply(this, arguments);
        };
      }
      function promisableChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function() {
          var res = f1.apply(this, arguments);
          if (res && typeof res.then === "function") {
            var thiz = this, i = arguments.length, args = new Array(i);
            while (i--)
              args[i] = arguments[i];
            return res.then(function() {
              return f2.apply(thiz, args);
            });
          }
          return f2.apply(this, arguments);
        };
      }
      var debug = typeof location !== "undefined" && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
      function setDebug(value, filter) {
        debug = value;
      }
      var INTERNAL = {};
      var ZONE_ECHO_LIMIT = 100, _a$1 = typeof Promise === "undefined" ? [] : (function() {
        var globalP = Promise.resolve();
        if (typeof crypto === "undefined" || !crypto.subtle)
          return [globalP, getProto(globalP), globalP];
        var nativeP = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
        return [nativeP, getProto(nativeP), globalP];
      })(), resolvedNativePromise = _a$1[0], nativePromiseProto = _a$1[1], resolvedGlobalPromise = _a$1[2], nativePromiseThen = nativePromiseProto && nativePromiseProto.then;
      var NativePromise = resolvedNativePromise && resolvedNativePromise.constructor;
      var patchGlobalPromise = !!resolvedGlobalPromise;
      function schedulePhysicalTick() {
        queueMicrotask(physicalTick);
      }
      var asap = function(callback, args) {
        microtickQueue.push([callback, args]);
        if (needsNewPhysicalTick) {
          schedulePhysicalTick();
          needsNewPhysicalTick = false;
        }
      };
      var isOutsideMicroTick = true, needsNewPhysicalTick = true, unhandledErrors = [], rejectingErrors = [], rejectionMapper = mirror;
      var globalPSD = {
        id: "global",
        global: true,
        ref: 0,
        unhandleds: [],
        onunhandled: nop,
        pgp: false,
        env: {},
        finalize: nop
      };
      var PSD = globalPSD;
      var microtickQueue = [];
      var numScheduledCalls = 0;
      var tickFinalizers = [];
      function DexiePromise(fn) {
        if (typeof this !== "object")
          throw new TypeError("Promises must be constructed via new");
        this._listeners = [];
        this._lib = false;
        var psd = this._PSD = PSD;
        if (typeof fn !== "function") {
          if (fn !== INTERNAL)
            throw new TypeError("Not a function");
          this._state = arguments[1];
          this._value = arguments[2];
          if (this._state === false)
            handleRejection(this, this._value);
          return;
        }
        this._state = null;
        this._value = null;
        ++psd.ref;
        executePromiseTask(this, fn);
      }
      var thenProp = {
        get: function() {
          var psd = PSD, microTaskId = totalEchoes;
          function then(onFulfilled, onRejected) {
            var _this = this;
            var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
            var cleanup = possibleAwait && !decrementExpectedAwaits();
            var rv = new DexiePromise(function(resolve, reject) {
              propagateToListener(_this, new Listener(nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait, cleanup), nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait, cleanup), resolve, reject, psd));
            });
            if (this._consoleTask)
              rv._consoleTask = this._consoleTask;
            return rv;
          }
          then.prototype = INTERNAL;
          return then;
        },
        set: function(value) {
          setProp(this, "then", value && value.prototype === INTERNAL ? thenProp : {
            get: function() {
              return value;
            },
            set: thenProp.set
          });
        }
      };
      props(DexiePromise.prototype, {
        then: thenProp,
        _then: function(onFulfilled, onRejected) {
          propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));
        },
        catch: function(onRejected) {
          if (arguments.length === 1)
            return this.then(null, onRejected);
          var type2 = arguments[0], handler = arguments[1];
          return typeof type2 === "function" ? this.then(null, function(err) {
            return err instanceof type2 ? handler(err) : PromiseReject(err);
          }) : this.then(null, function(err) {
            return err && err.name === type2 ? handler(err) : PromiseReject(err);
          });
        },
        finally: function(onFinally) {
          return this.then(function(value) {
            return DexiePromise.resolve(onFinally()).then(function() {
              return value;
            });
          }, function(err) {
            return DexiePromise.resolve(onFinally()).then(function() {
              return PromiseReject(err);
            });
          });
        },
        timeout: function(ms2, msg) {
          var _this = this;
          return ms2 < Infinity ? new DexiePromise(function(resolve, reject) {
            var handle = setTimeout(function() {
              return reject(new exceptions.Timeout(msg));
            }, ms2);
            _this.then(resolve, reject).finally(clearTimeout.bind(null, handle));
          }) : this;
        }
      });
      if (typeof Symbol !== "undefined" && Symbol.toStringTag)
        setProp(DexiePromise.prototype, Symbol.toStringTag, "Dexie.Promise");
      globalPSD.env = snapShot();
      function Listener(onFulfilled, onRejected, resolve, reject, zone) {
        this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
        this.onRejected = typeof onRejected === "function" ? onRejected : null;
        this.resolve = resolve;
        this.reject = reject;
        this.psd = zone;
      }
      props(DexiePromise, {
        all: function() {
          var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
          return new DexiePromise(function(resolve, reject) {
            if (values.length === 0)
              resolve([]);
            var remaining = values.length;
            values.forEach(function(a, i) {
              return DexiePromise.resolve(a).then(function(x) {
                values[i] = x;
                if (!--remaining)
                  resolve(values);
              }, reject);
            });
          });
        },
        resolve: function(value) {
          if (value instanceof DexiePromise)
            return value;
          if (value && typeof value.then === "function")
            return new DexiePromise(function(resolve, reject) {
              value.then(resolve, reject);
            });
          var rv = new DexiePromise(INTERNAL, true, value);
          return rv;
        },
        reject: PromiseReject,
        race: function() {
          var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
          return new DexiePromise(function(resolve, reject) {
            values.map(function(value) {
              return DexiePromise.resolve(value).then(resolve, reject);
            });
          });
        },
        PSD: {
          get: function() {
            return PSD;
          },
          set: function(value) {
            return PSD = value;
          }
        },
        totalEchoes: { get: function() {
          return totalEchoes;
        } },
        newPSD: newScope,
        usePSD,
        scheduler: {
          get: function() {
            return asap;
          },
          set: function(value) {
            asap = value;
          }
        },
        rejectionMapper: {
          get: function() {
            return rejectionMapper;
          },
          set: function(value) {
            rejectionMapper = value;
          }
        },
        follow: function(fn, zoneProps) {
          return new DexiePromise(function(resolve, reject) {
            return newScope(function(resolve2, reject2) {
              var psd = PSD;
              psd.unhandleds = [];
              psd.onunhandled = reject2;
              psd.finalize = callBoth(function() {
                var _this = this;
                run_at_end_of_this_or_next_physical_tick(function() {
                  _this.unhandleds.length === 0 ? resolve2() : reject2(_this.unhandleds[0]);
                });
              }, psd.finalize);
              fn();
            }, zoneProps, resolve, reject);
          });
        }
      });
      if (NativePromise) {
        if (NativePromise.allSettled)
          setProp(DexiePromise, "allSettled", function() {
            var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(function(resolve) {
              if (possiblePromises.length === 0)
                resolve([]);
              var remaining = possiblePromises.length;
              var results = new Array(remaining);
              possiblePromises.forEach(function(p, i) {
                return DexiePromise.resolve(p).then(function(value) {
                  return results[i] = { status: "fulfilled", value };
                }, function(reason) {
                  return results[i] = { status: "rejected", reason };
                }).then(function() {
                  return --remaining || resolve(results);
                });
              });
            });
          });
        if (NativePromise.any && typeof AggregateError !== "undefined")
          setProp(DexiePromise, "any", function() {
            var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(function(resolve, reject) {
              if (possiblePromises.length === 0)
                reject(new AggregateError([]));
              var remaining = possiblePromises.length;
              var failures = new Array(remaining);
              possiblePromises.forEach(function(p, i) {
                return DexiePromise.resolve(p).then(function(value) {
                  return resolve(value);
                }, function(failure) {
                  failures[i] = failure;
                  if (!--remaining)
                    reject(new AggregateError(failures));
                });
              });
            });
          });
        if (NativePromise.withResolvers)
          DexiePromise.withResolvers = NativePromise.withResolvers;
      }
      function executePromiseTask(promise, fn) {
        try {
          fn(function(value) {
            if (promise._state !== null)
              return;
            if (value === promise)
              throw new TypeError("A promise cannot be resolved with itself.");
            var shouldExecuteTick = promise._lib && beginMicroTickScope();
            if (value && typeof value.then === "function") {
              executePromiseTask(promise, function(resolve, reject) {
                value instanceof DexiePromise ? value._then(resolve, reject) : value.then(resolve, reject);
              });
            } else {
              promise._state = true;
              promise._value = value;
              propagateAllListeners(promise);
            }
            if (shouldExecuteTick)
              endMicroTickScope();
          }, handleRejection.bind(null, promise));
        } catch (ex) {
          handleRejection(promise, ex);
        }
      }
      function handleRejection(promise, reason) {
        rejectingErrors.push(reason);
        if (promise._state !== null)
          return;
        var shouldExecuteTick = promise._lib && beginMicroTickScope();
        reason = rejectionMapper(reason);
        promise._state = false;
        promise._value = reason;
        addPossiblyUnhandledError(promise);
        propagateAllListeners(promise);
        if (shouldExecuteTick)
          endMicroTickScope();
      }
      function propagateAllListeners(promise) {
        var listeners = promise._listeners;
        promise._listeners = [];
        for (var i = 0, len = listeners.length; i < len; ++i) {
          propagateToListener(promise, listeners[i]);
        }
        var psd = promise._PSD;
        --psd.ref || psd.finalize();
        if (numScheduledCalls === 0) {
          ++numScheduledCalls;
          asap(function() {
            if (--numScheduledCalls === 0)
              finalizePhysicalTick();
          }, []);
        }
      }
      function propagateToListener(promise, listener) {
        if (promise._state === null) {
          promise._listeners.push(listener);
          return;
        }
        var cb = promise._state ? listener.onFulfilled : listener.onRejected;
        if (cb === null) {
          return (promise._state ? listener.resolve : listener.reject)(promise._value);
        }
        ++listener.psd.ref;
        ++numScheduledCalls;
        asap(callListener, [cb, promise, listener]);
      }
      function callListener(cb, promise, listener) {
        try {
          var ret, value = promise._value;
          if (!promise._state && rejectingErrors.length)
            rejectingErrors = [];
          ret = debug && promise._consoleTask ? promise._consoleTask.run(function() {
            return cb(value);
          }) : cb(value);
          if (!promise._state && rejectingErrors.indexOf(value) === -1) {
            markErrorAsHandled(promise);
          }
          listener.resolve(ret);
        } catch (e) {
          listener.reject(e);
        } finally {
          if (--numScheduledCalls === 0)
            finalizePhysicalTick();
          --listener.psd.ref || listener.psd.finalize();
        }
      }
      function physicalTick() {
        usePSD(globalPSD, function() {
          beginMicroTickScope() && endMicroTickScope();
        });
      }
      function beginMicroTickScope() {
        var wasRootExec = isOutsideMicroTick;
        isOutsideMicroTick = false;
        needsNewPhysicalTick = false;
        return wasRootExec;
      }
      function endMicroTickScope() {
        var callbacks, i, l;
        do {
          while (microtickQueue.length > 0) {
            callbacks = microtickQueue;
            microtickQueue = [];
            l = callbacks.length;
            for (i = 0; i < l; ++i) {
              var item = callbacks[i];
              item[0].apply(null, item[1]);
            }
          }
        } while (microtickQueue.length > 0);
        isOutsideMicroTick = true;
        needsNewPhysicalTick = true;
      }
      function finalizePhysicalTick() {
        var unhandledErrs = unhandledErrors;
        unhandledErrors = [];
        unhandledErrs.forEach(function(p) {
          p._PSD.onunhandled.call(null, p._value, p);
        });
        var finalizers = tickFinalizers.slice(0);
        var i = finalizers.length;
        while (i)
          finalizers[--i]();
      }
      function run_at_end_of_this_or_next_physical_tick(fn) {
        function finalizer() {
          fn();
          tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
        }
        tickFinalizers.push(finalizer);
        ++numScheduledCalls;
        asap(function() {
          if (--numScheduledCalls === 0)
            finalizePhysicalTick();
        }, []);
      }
      function addPossiblyUnhandledError(promise) {
        if (!unhandledErrors.some(function(p) {
          return p._value === promise._value;
        }))
          unhandledErrors.push(promise);
      }
      function markErrorAsHandled(promise) {
        var i = unhandledErrors.length;
        while (i)
          if (unhandledErrors[--i]._value === promise._value) {
            unhandledErrors.splice(i, 1);
            return;
          }
      }
      function PromiseReject(reason) {
        return new DexiePromise(INTERNAL, false, reason);
      }
      function wrap(fn, errorCatcher) {
        var psd = PSD;
        return function() {
          var wasRootExec = beginMicroTickScope(), outerScope = PSD;
          try {
            switchToZone(psd, true);
            return fn.apply(this, arguments);
          } catch (e) {
            errorCatcher && errorCatcher(e);
          } finally {
            switchToZone(outerScope, false);
            if (wasRootExec)
              endMicroTickScope();
          }
        };
      }
      var task = { awaits: 0, echoes: 0, id: 0 };
      var taskCounter = 0;
      var zoneStack = [];
      var zoneEchoes = 0;
      var totalEchoes = 0;
      var zone_id_counter = 0;
      function newScope(fn, props2, a1, a2) {
        var parent = PSD, psd = Object.create(parent);
        psd.parent = parent;
        psd.ref = 0;
        psd.global = false;
        psd.id = ++zone_id_counter;
        globalPSD.env;
        psd.env = patchGlobalPromise ? {
          Promise: DexiePromise,
          PromiseProp: {
            value: DexiePromise,
            configurable: true,
            writable: true
          },
          all: DexiePromise.all,
          race: DexiePromise.race,
          allSettled: DexiePromise.allSettled,
          any: DexiePromise.any,
          resolve: DexiePromise.resolve,
          reject: DexiePromise.reject
        } : {};
        if (props2)
          extend(psd, props2);
        ++parent.ref;
        psd.finalize = function() {
          --this.parent.ref || this.parent.finalize();
        };
        var rv = usePSD(psd, fn, a1, a2);
        if (psd.ref === 0)
          psd.finalize();
        return rv;
      }
      function incrementExpectedAwaits() {
        if (!task.id)
          task.id = ++taskCounter;
        ++task.awaits;
        task.echoes += ZONE_ECHO_LIMIT;
        return task.id;
      }
      function decrementExpectedAwaits() {
        if (!task.awaits)
          return false;
        if (--task.awaits === 0)
          task.id = 0;
        task.echoes = task.awaits * ZONE_ECHO_LIMIT;
        return true;
      }
      if (("" + nativePromiseThen).indexOf("[native code]") === -1) {
        incrementExpectedAwaits = decrementExpectedAwaits = nop;
      }
      function onPossibleParallellAsync(possiblePromise) {
        if (task.echoes && possiblePromise && possiblePromise.constructor === NativePromise) {
          incrementExpectedAwaits();
          return possiblePromise.then(function(x) {
            decrementExpectedAwaits();
            return x;
          }, function(e) {
            decrementExpectedAwaits();
            return rejection(e);
          });
        }
        return possiblePromise;
      }
      function zoneEnterEcho(targetZone) {
        ++totalEchoes;
        if (!task.echoes || --task.echoes === 0) {
          task.echoes = task.awaits = task.id = 0;
        }
        zoneStack.push(PSD);
        switchToZone(targetZone, true);
      }
      function zoneLeaveEcho() {
        var zone = zoneStack[zoneStack.length - 1];
        zoneStack.pop();
        switchToZone(zone, false);
      }
      function switchToZone(targetZone, bEnteringZone) {
        var currentZone = PSD;
        if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (!--zoneEchoes || targetZone !== PSD)) {
          queueMicrotask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
        }
        if (targetZone === PSD)
          return;
        PSD = targetZone;
        if (currentZone === globalPSD)
          globalPSD.env = snapShot();
        if (patchGlobalPromise) {
          var GlobalPromise = globalPSD.env.Promise;
          var targetEnv = targetZone.env;
          if (currentZone.global || targetZone.global) {
            Object.defineProperty(_global, "Promise", targetEnv.PromiseProp);
            GlobalPromise.all = targetEnv.all;
            GlobalPromise.race = targetEnv.race;
            GlobalPromise.resolve = targetEnv.resolve;
            GlobalPromise.reject = targetEnv.reject;
            if (targetEnv.allSettled)
              GlobalPromise.allSettled = targetEnv.allSettled;
            if (targetEnv.any)
              GlobalPromise.any = targetEnv.any;
          }
        }
      }
      function snapShot() {
        var GlobalPromise = _global.Promise;
        return patchGlobalPromise ? {
          Promise: GlobalPromise,
          PromiseProp: Object.getOwnPropertyDescriptor(_global, "Promise"),
          all: GlobalPromise.all,
          race: GlobalPromise.race,
          allSettled: GlobalPromise.allSettled,
          any: GlobalPromise.any,
          resolve: GlobalPromise.resolve,
          reject: GlobalPromise.reject
        } : {};
      }
      function usePSD(psd, fn, a1, a2, a3) {
        var outerScope = PSD;
        try {
          switchToZone(psd, true);
          return fn(a1, a2, a3);
        } finally {
          switchToZone(outerScope, false);
        }
      }
      function nativeAwaitCompatibleWrap(fn, zone, possibleAwait, cleanup) {
        return typeof fn !== "function" ? fn : function() {
          var outerZone = PSD;
          if (possibleAwait)
            incrementExpectedAwaits();
          switchToZone(zone, true);
          try {
            return fn.apply(this, arguments);
          } finally {
            switchToZone(outerZone, false);
            if (cleanup)
              queueMicrotask(decrementExpectedAwaits);
          }
        };
      }
      function execInGlobalContext(cb) {
        if (Promise === NativePromise && task.echoes === 0) {
          if (zoneEchoes === 0) {
            cb();
          } else {
            enqueueNativeMicroTask(cb);
          }
        } else {
          setTimeout(cb, 0);
        }
      }
      var rejection = DexiePromise.reject;
      function tempTransaction(db2, mode, storeNames, fn) {
        if (!db2.idbdb || !db2._state.openComplete && !PSD.letThrough && !db2._vip) {
          if (db2._state.openComplete) {
            return rejection(new exceptions.DatabaseClosed(db2._state.dbOpenError));
          }
          if (!db2._state.isBeingOpened) {
            if (!db2._state.autoOpen)
              return rejection(new exceptions.DatabaseClosed());
            db2.open().catch(nop);
          }
          return db2._state.dbReadyPromise.then(function() {
            return tempTransaction(db2, mode, storeNames, fn);
          });
        } else {
          var trans = db2._createTransaction(mode, storeNames, db2._dbSchema);
          try {
            trans.create();
            db2._state.PR1398_maxLoop = 3;
          } catch (ex) {
            if (ex.name === errnames.InvalidState && db2.isOpen() && --db2._state.PR1398_maxLoop > 0) {
              console.warn("Dexie: Need to reopen db");
              db2.close({ disableAutoOpen: false });
              return db2.open().then(function() {
                return tempTransaction(db2, mode, storeNames, fn);
              });
            }
            return rejection(ex);
          }
          return trans._promise(mode, function(resolve, reject) {
            return newScope(function() {
              PSD.trans = trans;
              return fn(resolve, reject, trans);
            });
          }).then(function(result) {
            if (mode === "readwrite")
              try {
                trans.idbtrans.commit();
              } catch (_a2) {
              }
            return mode === "readonly" ? result : trans._completion.then(function() {
              return result;
            });
          });
        }
      }
      var DEXIE_VERSION = "4.4.6";
      var maxString = String.fromCharCode(65535);
      var minKey = -Infinity;
      var INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
      var STRING_EXPECTED = "String expected.";
      var DEFAULT_MAX_CONNECTIONS = 1e3;
      var DBNAMES_DB = "__dbnames";
      var READONLY = "readonly";
      var READWRITE = "readwrite";
      function combine(filter1, filter2) {
        return filter1 ? filter2 ? function() {
          return filter1.apply(this, arguments) && filter2.apply(this, arguments);
        } : filter1 : filter2;
      }
      var AnyRange = {
        type: 3,
        lower: -Infinity,
        lowerOpen: false,
        upper: [[]],
        upperOpen: false
      };
      function workaroundForUndefinedPrimKey(keyPath) {
        return typeof keyPath === "string" && !/\./.test(keyPath) ? function(obj) {
          if (obj[keyPath] === void 0 && keyPath in obj) {
            obj = deepClone(obj);
            delete obj[keyPath];
          }
          return obj;
        } : function(obj) {
          return obj;
        };
      }
      function Entity2() {
        throw exceptions.Type("Entity instances must never be new:ed. Instances are generated by the framework bypassing the constructor.");
      }
      function cmp2(a, b) {
        try {
          var ta2 = type(a);
          var tb = type(b);
          if (ta2 !== tb) {
            if (ta2 === "Array")
              return 1;
            if (tb === "Array")
              return -1;
            if (ta2 === "binary")
              return 1;
            if (tb === "binary")
              return -1;
            if (ta2 === "string")
              return 1;
            if (tb === "string")
              return -1;
            if (ta2 === "Date")
              return 1;
            if (tb !== "Date")
              return NaN;
            return -1;
          }
          switch (ta2) {
            case "number":
            case "Date":
            case "string":
              return a > b ? 1 : a < b ? -1 : 0;
            case "binary": {
              return compareUint8Arrays(getUint8Array(a), getUint8Array(b));
            }
            case "Array":
              return compareArrays(a, b);
          }
        } catch (_a2) {
        }
        return NaN;
      }
      function compareArrays(a, b) {
        var al = a.length;
        var bl = b.length;
        var l = al < bl ? al : bl;
        for (var i = 0; i < l; ++i) {
          var res = cmp2(a[i], b[i]);
          if (res !== 0)
            return res;
        }
        return al === bl ? 0 : al < bl ? -1 : 1;
      }
      function compareUint8Arrays(a, b) {
        var al = a.length;
        var bl = b.length;
        var l = al < bl ? al : bl;
        for (var i = 0; i < l; ++i) {
          if (a[i] !== b[i])
            return a[i] < b[i] ? -1 : 1;
        }
        return al === bl ? 0 : al < bl ? -1 : 1;
      }
      function type(x) {
        var t = typeof x;
        if (t !== "object")
          return t;
        if (ArrayBuffer.isView(x))
          return "binary";
        var tsTag = toStringTag(x);
        return tsTag === "ArrayBuffer" ? "binary" : tsTag;
      }
      function getUint8Array(a) {
        if (a instanceof Uint8Array)
          return a;
        if (ArrayBuffer.isView(a))
          return new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
        return new Uint8Array(a);
      }
      function builtInDeletionTrigger(table, keys2, res) {
        var yProps = table.schema.yProps;
        if (!yProps)
          return res;
        if (keys2 && res.numFailures > 0)
          keys2 = keys2.filter(function(_, i) {
            return !res.failures[i];
          });
        return Promise.all(yProps.map(function(_a2) {
          var updatesTable = _a2.updatesTable;
          return keys2 ? table.db.table(updatesTable).where("k").anyOf(keys2).delete() : table.db.table(updatesTable).clear();
        })).then(function() {
          return res;
        });
      }
      var PropModification2 = (function() {
        function PropModification3(spec) {
          this["@@propmod"] = spec;
        }
        PropModification3.prototype.execute = function(value) {
          var _a2;
          var spec = this["@@propmod"];
          if (spec.add !== void 0) {
            var term = spec.add;
            if (isArray(term)) {
              return __spreadArray(__spreadArray([], isArray(value) ? value : [], true), term, true).sort();
            }
            if (typeof term === "number")
              return (Number(value) || 0) + term;
            if (typeof term === "bigint") {
              try {
                return BigInt(value) + term;
              } catch (_b) {
                return BigInt(0) + term;
              }
            }
            throw new TypeError("Invalid term ".concat(term));
          }
          if (spec.remove !== void 0) {
            var subtrahend_1 = spec.remove;
            if (isArray(subtrahend_1)) {
              return isArray(value) ? value.filter(function(item) {
                return !subtrahend_1.includes(item);
              }).sort() : [];
            }
            if (typeof subtrahend_1 === "number")
              return Number(value) - subtrahend_1;
            if (typeof subtrahend_1 === "bigint") {
              try {
                return BigInt(value) - subtrahend_1;
              } catch (_c) {
                return BigInt(0) - subtrahend_1;
              }
            }
            throw new TypeError("Invalid subtrahend ".concat(subtrahend_1));
          }
          var prefixToReplace = (_a2 = spec.replacePrefix) === null || _a2 === void 0 ? void 0 : _a2[0];
          if (prefixToReplace && typeof value === "string" && value.startsWith(prefixToReplace)) {
            return spec.replacePrefix[1] + value.substring(prefixToReplace.length);
          }
          return value;
        };
        return PropModification3;
      })();
      function applyUpdateSpec(obj, changes) {
        var keyPaths = keys(changes);
        var numKeys = keyPaths.length;
        var anythingModified = false;
        for (var i = 0; i < numKeys; ++i) {
          var keyPath = keyPaths[i];
          var value = changes[keyPath];
          var origValue = getByKeyPath(obj, keyPath);
          if (value instanceof PropModification2) {
            setByKeyPath(obj, keyPath, value.execute(origValue));
            anythingModified = true;
          } else if (origValue !== value) {
            setByKeyPath(obj, keyPath, value);
            anythingModified = true;
          }
        }
        return anythingModified;
      }
      var Table = (function() {
        function Table2() {
        }
        Table2.prototype._trans = function(mode, fn, writeLocked) {
          var trans = this._tx || PSD.trans;
          var tableName = this.name;
          var task2 = debug && typeof console !== "undefined" && console.createTask && console.createTask("Dexie: ".concat(mode === "readonly" ? "read" : "write", " ").concat(this.name));
          function checkTableInTransaction(resolve, reject, trans2) {
            if (!trans2.schema[tableName])
              throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
            return fn(trans2.idbtrans, trans2);
          }
          var wasRootExec = beginMicroTickScope();
          try {
            var p = trans && trans.db._novip === this.db._novip ? trans === PSD.trans ? trans._promise(mode, checkTableInTransaction, writeLocked) : newScope(function() {
              return trans._promise(mode, checkTableInTransaction, writeLocked);
            }, { trans, transless: PSD.transless || PSD }) : tempTransaction(this.db, mode, [this.name], checkTableInTransaction);
            if (task2) {
              p._consoleTask = task2;
              p = p.catch(function(err) {
                console.trace(err);
                return rejection(err);
              });
            }
            return p;
          } finally {
            if (wasRootExec)
              endMicroTickScope();
          }
        };
        Table2.prototype.get = function(keyOrCrit, cb) {
          var _this = this;
          if (keyOrCrit && keyOrCrit.constructor === Object)
            return this.where(keyOrCrit).first(cb);
          if (keyOrCrit == null)
            return rejection(new exceptions.Type("Invalid argument to Table.get()"));
          return this._trans("readonly", function(trans) {
            return _this.core.get({ trans, key: keyOrCrit }).then(function(res) {
              return _this.hook.reading.fire(res);
            });
          }).then(cb);
        };
        Table2.prototype.where = function(indexOrCrit) {
          if (typeof indexOrCrit === "string")
            return new this.db.WhereClause(this, indexOrCrit);
          if (isArray(indexOrCrit))
            return new this.db.WhereClause(this, "[".concat(indexOrCrit.join("+"), "]"));
          var keyPaths = keys(indexOrCrit);
          if (keyPaths.length === 1)
            return this.where(keyPaths[0]).equals(indexOrCrit[keyPaths[0]]);
          var compoundIndex = this.schema.indexes.concat(this.schema.primKey).filter(function(ix) {
            if (ix.compound && keyPaths.every(function(keyPath) {
              return ix.keyPath.indexOf(keyPath) >= 0;
            })) {
              for (var i = 0; i < keyPaths.length; ++i) {
                if (keyPaths.indexOf(ix.keyPath[i]) === -1)
                  return false;
              }
              return true;
            }
            return false;
          }).sort(function(a, b) {
            return a.keyPath.length - b.keyPath.length;
          })[0];
          if (compoundIndex && this.db._maxKey !== maxString) {
            var keyPathsInValidOrder = compoundIndex.keyPath.slice(0, keyPaths.length);
            return this.where(keyPathsInValidOrder).equals(keyPathsInValidOrder.map(function(kp) {
              return indexOrCrit[kp];
            }));
          }
          if (!compoundIndex && debug)
            console.warn("The query ".concat(JSON.stringify(indexOrCrit), " on ").concat(this.name, " would benefit from a ") + "compound index [".concat(keyPaths.join("+"), "]"));
          var idxByName = this.schema.idxByName;
          function equals(a, b) {
            return cmp2(a, b) === 0;
          }
          var _a2 = keyPaths.reduce(function(_a3, keyPath) {
            var prevIndex = _a3[0], prevFilterFn = _a3[1];
            var index = idxByName[keyPath];
            var value = indexOrCrit[keyPath];
            return [
              prevIndex || index,
              prevIndex || !index ? combine(prevFilterFn, index && index.multi ? function(x) {
                var prop = getByKeyPath(x, keyPath);
                return isArray(prop) && prop.some(function(item) {
                  return equals(value, item);
                });
              } : function(x) {
                return equals(value, getByKeyPath(x, keyPath));
              }) : prevFilterFn
            ];
          }, [null, null]), idx = _a2[0], filterFunction = _a2[1];
          return idx ? this.where(idx.name).equals(indexOrCrit[idx.keyPath]).filter(filterFunction) : compoundIndex ? this.filter(filterFunction) : this.where(keyPaths).equals("");
        };
        Table2.prototype.filter = function(filterFunction) {
          return this.toCollection().and(filterFunction);
        };
        Table2.prototype.count = function(thenShortcut) {
          return this.toCollection().count(thenShortcut);
        };
        Table2.prototype.offset = function(offset) {
          return this.toCollection().offset(offset);
        };
        Table2.prototype.limit = function(numRows) {
          return this.toCollection().limit(numRows);
        };
        Table2.prototype.each = function(callback) {
          return this.toCollection().each(callback);
        };
        Table2.prototype.toArray = function(thenShortcut) {
          return this.toCollection().toArray(thenShortcut);
        };
        Table2.prototype.toCollection = function() {
          return new this.db.Collection(new this.db.WhereClause(this));
        };
        Table2.prototype.orderBy = function(index) {
          return new this.db.Collection(new this.db.WhereClause(this, isArray(index) ? "[".concat(index.join("+"), "]") : index));
        };
        Table2.prototype.reverse = function() {
          return this.toCollection().reverse();
        };
        Table2.prototype.mapToClass = function(constructor) {
          var _a2 = this, db2 = _a2.db, tableName = _a2.name;
          this.schema.mappedClass = constructor;
          if (constructor.prototype instanceof Entity2) {
            constructor = (function(_super) {
              __extends(class_1, _super);
              function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
              }
              Object.defineProperty(class_1.prototype, "db", {
                get: function() {
                  return db2;
                },
                enumerable: false,
                configurable: true
              });
              class_1.prototype.table = function() {
                return tableName;
              };
              return class_1;
            })(constructor);
          }
          var inheritedProps = /* @__PURE__ */ new Set();
          for (var proto = constructor.prototype; proto; proto = getProto(proto)) {
            Object.getOwnPropertyNames(proto).forEach(function(propName) {
              return inheritedProps.add(propName);
            });
          }
          var readHook = function(obj) {
            if (!obj)
              return obj;
            var res = Object.create(constructor.prototype);
            for (var m in obj)
              if (!inheritedProps.has(m))
                try {
                  res[m] = obj[m];
                } catch (_) {
                }
            return res;
          };
          if (this.schema.readHook) {
            this.hook.reading.unsubscribe(this.schema.readHook);
          }
          this.schema.readHook = readHook;
          this.hook("reading", readHook);
          return constructor;
        };
        Table2.prototype.defineClass = function() {
          function Class(content) {
            extend(this, content);
          }
          return this.mapToClass(Class);
        };
        Table2.prototype.add = function(obj, key) {
          var _this = this;
          var _a2 = this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
          var objToAdd = obj;
          if (keyPath && auto) {
            objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
          }
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({
              trans,
              type: "add",
              keys: key != null ? [key] : null,
              values: [objToAdd]
            });
          }).then(function(res) {
            return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult;
          }).then(function(lastResult) {
            if (keyPath) {
              try {
                setByKeyPath(obj, keyPath, lastResult);
              } catch (_) {
              }
            }
            return lastResult;
          });
        };
        Table2.prototype.upsert = function(key, modifications) {
          var _this = this;
          var keyPath = this.schema.primKey.keyPath;
          return this._trans("readwrite", function(trans) {
            return _this.core.get({ trans, key }).then(function(existing) {
              var obj = existing !== null && existing !== void 0 ? existing : {};
              applyUpdateSpec(obj, modifications);
              if (keyPath)
                setByKeyPath(obj, keyPath, key);
              return _this.core.mutate({
                trans,
                type: "put",
                values: [obj],
                keys: [key],
                upsert: true,
                updates: { keys: [key], changeSpecs: [modifications] }
              }).then(function(res) {
                return res.numFailures ? DexiePromise.reject(res.failures[0]) : !!existing;
              });
            });
          });
        };
        Table2.prototype.update = function(keyOrObject, modifications) {
          if (typeof keyOrObject === "object" && !isArray(keyOrObject)) {
            var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
            if (key === void 0)
              return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"));
            return this.where(":id").equals(key).modify(modifications);
          } else {
            return this.where(":id").equals(keyOrObject).modify(modifications);
          }
        };
        Table2.prototype.put = function(obj, key) {
          var _this = this;
          var _a2 = this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
          var objToAdd = obj;
          if (keyPath && auto) {
            objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
          }
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({
              trans,
              type: "put",
              values: [objToAdd],
              keys: key != null ? [key] : null
            });
          }).then(function(res) {
            return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult;
          }).then(function(lastResult) {
            if (keyPath) {
              try {
                setByKeyPath(obj, keyPath, lastResult);
              } catch (_) {
              }
            }
            return lastResult;
          });
        };
        Table2.prototype.delete = function(key) {
          var _this = this;
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({ trans, type: "delete", keys: [key] }).then(function(res) {
              return builtInDeletionTrigger(_this, [key], res);
            }).then(function(res) {
              return res.numFailures ? DexiePromise.reject(res.failures[0]) : void 0;
            });
          });
        };
        Table2.prototype.clear = function() {
          var _this = this;
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({ trans, type: "deleteRange", range: AnyRange }).then(function(res) {
              return builtInDeletionTrigger(_this, null, res);
            });
          }).then(function(res) {
            return res.numFailures ? DexiePromise.reject(res.failures[0]) : void 0;
          });
        };
        Table2.prototype.bulkGet = function(keys2) {
          var _this = this;
          return this._trans("readonly", function(trans) {
            return _this.core.getMany({
              keys: keys2,
              trans
            }).then(function(result) {
              return result.map(function(res) {
                return _this.hook.reading.fire(res);
              });
            });
          });
        };
        Table2.prototype.bulkAdd = function(objects, keysOrOptions, options) {
          var _this = this;
          var keys2 = Array.isArray(keysOrOptions) ? keysOrOptions : void 0;
          options = options || (keys2 ? void 0 : keysOrOptions);
          var wantResults = options ? options.allKeys : void 0;
          return this._trans("readwrite", function(trans) {
            var _a2 = _this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
            if (keyPath && keys2)
              throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
            if (keys2 && keys2.length !== objects.length)
              throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
            var numObjects = objects.length;
            var objectsToAdd = keyPath && auto ? objects.map(workaroundForUndefinedPrimKey(keyPath)) : objects;
            return _this.core.mutate({
              trans,
              type: "add",
              keys: keys2,
              values: objectsToAdd,
              wantResults
            }).then(function(_a3) {
              var numFailures = _a3.numFailures, results = _a3.results, lastResult = _a3.lastResult, failures = _a3.failures;
              var result = wantResults ? results : lastResult;
              if (numFailures === 0)
                return result;
              throw new BulkError("".concat(_this.name, ".bulkAdd(): ").concat(numFailures, " of ").concat(numObjects, " operations failed"), failures);
            });
          });
        };
        Table2.prototype.bulkPut = function(objects, keysOrOptions, options) {
          var _this = this;
          var keys2 = Array.isArray(keysOrOptions) ? keysOrOptions : void 0;
          options = options || (keys2 ? void 0 : keysOrOptions);
          var wantResults = options ? options.allKeys : void 0;
          return this._trans("readwrite", function(trans) {
            var _a2 = _this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
            if (keyPath && keys2)
              throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
            if (keys2 && keys2.length !== objects.length)
              throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
            var numObjects = objects.length;
            var objectsToPut = keyPath && auto ? objects.map(workaroundForUndefinedPrimKey(keyPath)) : objects;
            return _this.core.mutate({
              trans,
              type: "put",
              keys: keys2,
              values: objectsToPut,
              wantResults
            }).then(function(_a3) {
              var numFailures = _a3.numFailures, results = _a3.results, lastResult = _a3.lastResult, failures = _a3.failures;
              var result = wantResults ? results : lastResult;
              if (numFailures === 0)
                return result;
              throw new BulkError("".concat(_this.name, ".bulkPut(): ").concat(numFailures, " of ").concat(numObjects, " operations failed"), failures);
            });
          });
        };
        Table2.prototype.bulkUpdate = function(keysAndChanges) {
          var _this = this;
          var coreTable = this.core;
          var keys2 = keysAndChanges.map(function(entry) {
            return entry.key;
          });
          var changeSpecs = keysAndChanges.map(function(entry) {
            return entry.changes;
          });
          var offsetMap = [];
          return this._trans("readwrite", function(trans) {
            return coreTable.getMany({ trans, keys: keys2, cache: "clone" }).then(function(objs) {
              var resultKeys = [];
              var resultObjs = [];
              keysAndChanges.forEach(function(_a2, idx) {
                var key = _a2.key, changes = _a2.changes;
                var obj = objs[idx];
                if (obj) {
                  for (var _i = 0, _b = Object.keys(changes); _i < _b.length; _i++) {
                    var keyPath = _b[_i];
                    var value = changes[keyPath];
                    if (keyPath === _this.schema.primKey.keyPath) {
                      if (cmp2(value, key) !== 0) {
                        throw new exceptions.Constraint("Cannot update primary key in bulkUpdate()");
                      }
                    } else {
                      setByKeyPath(obj, keyPath, value);
                    }
                  }
                  offsetMap.push(idx);
                  resultKeys.push(key);
                  resultObjs.push(obj);
                }
              });
              var numEntries = resultKeys.length;
              return coreTable.mutate({
                trans,
                type: "put",
                keys: resultKeys,
                values: resultObjs,
                updates: {
                  keys: keys2,
                  changeSpecs
                }
              }).then(function(_a2) {
                var numFailures = _a2.numFailures, failures = _a2.failures;
                if (numFailures === 0)
                  return numEntries;
                for (var _i = 0, _b = Object.keys(failures); _i < _b.length; _i++) {
                  var offset = _b[_i];
                  var mappedOffset = offsetMap[Number(offset)];
                  if (mappedOffset != null) {
                    var failure = failures[offset];
                    delete failures[offset];
                    failures[mappedOffset] = failure;
                  }
                }
                throw new BulkError("".concat(_this.name, ".bulkUpdate(): ").concat(numFailures, " of ").concat(numEntries, " operations failed"), failures);
              });
            });
          });
        };
        Table2.prototype.bulkDelete = function(keys2) {
          var _this = this;
          var numKeys = keys2.length;
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({ trans, type: "delete", keys: keys2 }).then(function(res) {
              return builtInDeletionTrigger(_this, keys2, res);
            });
          }).then(function(_a2) {
            var numFailures = _a2.numFailures, lastResult = _a2.lastResult, failures = _a2.failures;
            if (numFailures === 0)
              return lastResult;
            throw new BulkError("".concat(_this.name, ".bulkDelete(): ").concat(numFailures, " of ").concat(numKeys, " operations failed"), failures);
          });
        };
        return Table2;
      })();
      function Events(ctx) {
        var evs = {};
        var rv = function(eventName, subscriber) {
          if (subscriber) {
            var i2 = arguments.length, args = new Array(i2 - 1);
            while (--i2)
              args[i2 - 1] = arguments[i2];
            evs[eventName].subscribe.apply(null, args);
            return ctx;
          } else if (typeof eventName === "string") {
            return evs[eventName];
          }
        };
        rv.addEventType = add3;
        for (var i = 1, l = arguments.length; i < l; ++i) {
          add3(arguments[i]);
        }
        return rv;
        function add3(eventName, chainFunction, defaultFunction) {
          if (typeof eventName === "object")
            return addConfiguredEvents(eventName);
          if (!chainFunction)
            chainFunction = reverseStoppableEventChain;
          if (!defaultFunction)
            defaultFunction = nop;
          var context = {
            subscribers: [],
            fire: defaultFunction,
            subscribe: function(cb) {
              if (context.subscribers.indexOf(cb) === -1) {
                context.subscribers.push(cb);
                context.fire = chainFunction(context.fire, cb);
              }
            },
            unsubscribe: function(cb) {
              context.subscribers = context.subscribers.filter(function(fn) {
                return fn !== cb;
              });
              context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
            }
          };
          evs[eventName] = rv[eventName] = context;
          return context;
        }
        function addConfiguredEvents(cfg) {
          keys(cfg).forEach(function(eventName) {
            var args = cfg[eventName];
            if (isArray(args)) {
              add3(eventName, cfg[eventName][0], cfg[eventName][1]);
            } else if (args === "asap") {
              var context = add3(eventName, mirror, function fire() {
                var i2 = arguments.length, args2 = new Array(i2);
                while (i2--)
                  args2[i2] = arguments[i2];
                context.subscribers.forEach(function(fn) {
                  asap$1(function fireEvent() {
                    fn.apply(null, args2);
                  });
                });
              });
            } else
              throw new exceptions.InvalidArgument("Invalid event config");
          });
        }
      }
      function makeClassConstructor(prototype, constructor) {
        derive(constructor).from({ prototype });
        return constructor;
      }
      function createTableConstructor(db2) {
        return makeClassConstructor(Table.prototype, function Table2(name, tableSchema, trans) {
          this.db = db2;
          this._tx = trans;
          this.name = name;
          this.schema = tableSchema;
          this.hook = db2._allTables[name] ? db2._allTables[name].hook : Events(null, {
            creating: [hookCreatingChain, nop],
            reading: [pureFunctionChain, mirror],
            updating: [hookUpdatingChain, nop],
            deleting: [hookDeletingChain, nop]
          });
        });
      }
      function isPlainKeyRange(ctx, ignoreLimitFilter) {
        return !(ctx.filter || ctx.algorithm || ctx.or) && (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
      }
      function addFilter(ctx, fn) {
        ctx.filter = combine(ctx.filter, fn);
      }
      function addReplayFilter(ctx, factory, isLimitFilter) {
        var curr = ctx.replayFilter;
        ctx.replayFilter = curr ? function() {
          return combine(curr(), factory());
        } : factory;
        ctx.justLimit = isLimitFilter && !curr;
      }
      function addMatchFilter(ctx, fn) {
        ctx.isMatch = combine(ctx.isMatch, fn);
      }
      function getIndexOrStore(ctx, coreSchema) {
        if (ctx.isPrimKey)
          return coreSchema.primaryKey;
        var index = coreSchema.getIndexByKeyPath(ctx.index);
        if (!index)
          throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + coreSchema.name + " is not indexed");
        return index;
      }
      function openCursor(ctx, coreTable, trans) {
        var index = getIndexOrStore(ctx, coreTable.schema);
        return coreTable.openCursor({
          trans,
          values: !ctx.keysOnly,
          reverse: ctx.dir === "prev",
          unique: !!ctx.unique,
          query: {
            index,
            range: ctx.range
          }
        });
      }
      function iter(ctx, fn, coreTrans, coreTable) {
        var filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
        if (!ctx.or) {
          return iterate(openCursor(ctx, coreTable, coreTrans), combine(ctx.algorithm, filter), fn, !ctx.keysOnly && ctx.valueMapper);
        } else {
          var set_1 = {};
          var union = function(item, cursor, advance) {
            if (!filter || filter(cursor, advance, function(result) {
              return cursor.stop(result);
            }, function(err) {
              return cursor.fail(err);
            })) {
              var primaryKey = cursor.primaryKey;
              var key = "" + primaryKey;
              if (key === "[object ArrayBuffer]")
                key = "" + new Uint8Array(primaryKey);
              if (!hasOwn(set_1, key)) {
                set_1[key] = true;
                fn(item, cursor, advance);
              }
            }
          };
          return Promise.all([
            ctx.or._iterate(union, coreTrans),
            iterate(openCursor(ctx, coreTable, coreTrans), ctx.algorithm, union, !ctx.keysOnly && ctx.valueMapper)
          ]);
        }
      }
      function iterate(cursorPromise, filter, fn, valueMapper) {
        var mappedFn = valueMapper ? function(x, c, a) {
          return fn(valueMapper(x), c, a);
        } : fn;
        var wrappedFn = wrap(mappedFn);
        return cursorPromise.then(function(cursor) {
          if (cursor) {
            return cursor.start(function() {
              var c = function() {
                return cursor.continue();
              };
              if (!filter || filter(cursor, function(advancer) {
                return c = advancer;
              }, function(val) {
                cursor.stop(val);
                c = nop;
              }, function(e) {
                cursor.fail(e);
                c = nop;
              }))
                wrappedFn(cursor.value, cursor, function(advancer) {
                  return c = advancer;
                });
              c();
            });
          }
        });
      }
      var Collection = (function() {
        function Collection2() {
        }
        Collection2.prototype._read = function(fn, cb) {
          var ctx = this._ctx;
          return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._trans("readonly", fn).then(cb);
        };
        Collection2.prototype._write = function(fn) {
          var ctx = this._ctx;
          return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._trans("readwrite", fn, "locked");
        };
        Collection2.prototype._addAlgorithm = function(fn) {
          var ctx = this._ctx;
          ctx.algorithm = combine(ctx.algorithm, fn);
        };
        Collection2.prototype._iterate = function(fn, coreTrans) {
          return iter(this._ctx, fn, coreTrans, this._ctx.table.core);
        };
        Collection2.prototype.clone = function(props2) {
          var rv = Object.create(this.constructor.prototype), ctx = Object.create(this._ctx);
          if (props2)
            extend(ctx, props2);
          rv._ctx = ctx;
          return rv;
        };
        Collection2.prototype.raw = function() {
          this._ctx.valueMapper = null;
          return this;
        };
        Collection2.prototype.each = function(fn) {
          var ctx = this._ctx;
          return this._read(function(trans) {
            return iter(ctx, fn, trans, ctx.table.core);
          });
        };
        Collection2.prototype.count = function(cb) {
          var _this = this;
          return this._read(function(trans) {
            var ctx = _this._ctx;
            var coreTable = ctx.table.core;
            if (isPlainKeyRange(ctx, true)) {
              return coreTable.count({
                trans,
                query: {
                  index: getIndexOrStore(ctx, coreTable.schema),
                  range: ctx.range
                }
              }).then(function(count2) {
                return Math.min(count2, ctx.limit);
              });
            } else {
              var count = 0;
              return iter(ctx, function() {
                ++count;
                return false;
              }, trans, coreTable).then(function() {
                return count;
              });
            }
          }).then(cb);
        };
        Collection2.prototype.sortBy = function(keyPath, cb) {
          var parts = keyPath.split(".").reverse(), lastPart = parts[0], lastIndex = parts.length - 1;
          function getval(obj, i) {
            if (i)
              return getval(obj[parts[i]], i - 1);
            return obj[lastPart];
          }
          var order = this._ctx.dir === "next" ? 1 : -1;
          function sorter(a, b) {
            var aVal = getval(a, lastIndex), bVal = getval(b, lastIndex);
            return cmp2(aVal, bVal) * order;
          }
          return this.toArray(function(a) {
            return a.slice().sort(sorter);
          }).then(cb);
        };
        Collection2.prototype.toArray = function(cb) {
          var _this = this;
          return this._read(function(trans) {
            var ctx = _this._ctx;
            if (isPlainKeyRange(ctx, true) && ctx.limit > 0) {
              var valueMapper_1 = ctx.valueMapper;
              var index = getIndexOrStore(ctx, ctx.table.core.schema);
              return ctx.table.core.query({
                trans,
                limit: ctx.limit,
                values: true,
                direction: ctx.dir === "prev" ? "prev" : void 0,
                query: {
                  index,
                  range: ctx.range
                }
              }).then(function(_a2) {
                var result = _a2.result;
                return valueMapper_1 ? result.map(valueMapper_1) : result;
              });
            } else {
              var a_1 = [];
              return iter(ctx, function(item) {
                return a_1.push(item);
              }, trans, ctx.table.core).then(function() {
                return a_1;
              });
            }
          }, cb);
        };
        Collection2.prototype.offset = function(offset) {
          var ctx = this._ctx;
          if (offset <= 0)
            return this;
          ctx.offset += offset;
          if (isPlainKeyRange(ctx)) {
            addReplayFilter(ctx, function() {
              var offsetLeft = offset;
              return function(cursor, advance) {
                if (offsetLeft === 0)
                  return true;
                if (offsetLeft === 1) {
                  --offsetLeft;
                  return false;
                }
                advance(function() {
                  cursor.advance(offsetLeft);
                  offsetLeft = 0;
                });
                return false;
              };
            });
          } else {
            addReplayFilter(ctx, function() {
              var offsetLeft = offset;
              return function() {
                return --offsetLeft < 0;
              };
            });
          }
          return this;
        };
        Collection2.prototype.limit = function(numRows) {
          this._ctx.limit = Math.min(this._ctx.limit, numRows);
          addReplayFilter(this._ctx, function() {
            var rowsLeft = numRows;
            return function(cursor, advance, resolve) {
              if (--rowsLeft <= 0)
                advance(resolve);
              return rowsLeft >= 0;
            };
          }, true);
          return this;
        };
        Collection2.prototype.until = function(filterFunction, bIncludeStopEntry) {
          addFilter(this._ctx, function(cursor, advance, resolve) {
            if (filterFunction(cursor.value)) {
              advance(resolve);
              return bIncludeStopEntry;
            } else {
              return true;
            }
          });
          return this;
        };
        Collection2.prototype.first = function(cb) {
          return this.limit(1).toArray(function(a) {
            return a[0];
          }).then(cb);
        };
        Collection2.prototype.last = function(cb) {
          return this.reverse().first(cb);
        };
        Collection2.prototype.filter = function(filterFunction) {
          addFilter(this._ctx, function(cursor) {
            return filterFunction(cursor.value);
          });
          addMatchFilter(this._ctx, filterFunction);
          return this;
        };
        Collection2.prototype.and = function(filter) {
          return this.filter(filter);
        };
        Collection2.prototype.or = function(indexName) {
          return new this.db.WhereClause(this._ctx.table, indexName, this);
        };
        Collection2.prototype.reverse = function() {
          this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev";
          if (this._ondirectionchange)
            this._ondirectionchange(this._ctx.dir);
          return this;
        };
        Collection2.prototype.desc = function() {
          return this.reverse();
        };
        Collection2.prototype.eachKey = function(cb) {
          var ctx = this._ctx;
          ctx.keysOnly = !ctx.isMatch;
          return this.each(function(val, cursor) {
            cb(cursor.key, cursor);
          });
        };
        Collection2.prototype.eachUniqueKey = function(cb) {
          this._ctx.unique = "unique";
          return this.eachKey(cb);
        };
        Collection2.prototype.eachPrimaryKey = function(cb) {
          var ctx = this._ctx;
          ctx.keysOnly = !ctx.isMatch;
          return this.each(function(val, cursor) {
            cb(cursor.primaryKey, cursor);
          });
        };
        Collection2.prototype.keys = function(cb) {
          var ctx = this._ctx;
          ctx.keysOnly = !ctx.isMatch;
          var a = [];
          return this.each(function(item, cursor) {
            a.push(cursor.key);
          }).then(function() {
            return a;
          }).then(cb);
        };
        Collection2.prototype.primaryKeys = function(cb) {
          var ctx = this._ctx;
          if (isPlainKeyRange(ctx, true) && ctx.limit > 0) {
            return this._read(function(trans) {
              var index = getIndexOrStore(ctx, ctx.table.core.schema);
              return ctx.table.core.query({
                trans,
                values: false,
                limit: ctx.limit,
                direction: ctx.dir === "prev" ? "prev" : void 0,
                query: {
                  index,
                  range: ctx.range
                }
              });
            }).then(function(_a2) {
              var result = _a2.result;
              return result;
            }).then(cb);
          }
          ctx.keysOnly = !ctx.isMatch;
          var a = [];
          return this.each(function(item, cursor) {
            a.push(cursor.primaryKey);
          }).then(function() {
            return a;
          }).then(cb);
        };
        Collection2.prototype.uniqueKeys = function(cb) {
          this._ctx.unique = "unique";
          return this.keys(cb);
        };
        Collection2.prototype.firstKey = function(cb) {
          return this.limit(1).keys(function(a) {
            return a[0];
          }).then(cb);
        };
        Collection2.prototype.lastKey = function(cb) {
          return this.reverse().firstKey(cb);
        };
        Collection2.prototype.distinct = function() {
          var ctx = this._ctx, idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
          if (!idx || !idx.multi)
            return this;
          var set = {};
          addFilter(this._ctx, function(cursor) {
            var strKey = cursor.primaryKey.toString();
            var found = hasOwn(set, strKey);
            set[strKey] = true;
            return !found;
          });
          return this;
        };
        Collection2.prototype.modify = function(changes) {
          var _this = this;
          var ctx = this._ctx;
          return this._write(function(trans) {
            var modifyer;
            if (typeof changes === "function") {
              modifyer = changes;
            } else {
              modifyer = function(item) {
                return applyUpdateSpec(item, changes);
              };
            }
            var coreTable = ctx.table.core;
            var _a2 = coreTable.schema.primaryKey, outbound = _a2.outbound, extractKey = _a2.extractKey;
            var limit = 200;
            var modifyChunkSize = _this.db._options.modifyChunkSize;
            if (modifyChunkSize) {
              if (typeof modifyChunkSize == "object") {
                limit = modifyChunkSize[coreTable.name] || modifyChunkSize["*"] || 200;
              } else {
                limit = modifyChunkSize;
              }
            }
            var totalFailures = [];
            var successCount = 0;
            var failedKeys = [];
            var applyMutateResult = function(expectedCount, res) {
              var failures = res.failures, numFailures = res.numFailures;
              successCount += expectedCount - numFailures;
              for (var _i = 0, _a3 = keys(failures); _i < _a3.length; _i++) {
                var pos = _a3[_i];
                totalFailures.push(failures[pos]);
              }
            };
            var isUnconditionalDelete = changes === deleteCallback;
            return _this.clone().primaryKeys().then(function(keys2) {
              var criteria = isPlainKeyRange(ctx) && ctx.limit === Infinity && (typeof changes !== "function" || isUnconditionalDelete) && {
                index: ctx.index,
                range: ctx.range
              };
              var nextChunk = function(offset) {
                var count = Math.min(limit, keys2.length - offset);
                var keysInChunk = keys2.slice(offset, offset + count);
                return (isUnconditionalDelete ? Promise.resolve([]) : coreTable.getMany({
                  trans,
                  keys: keysInChunk,
                  cache: "immutable"
                })).then(function(values) {
                  var addValues = [];
                  var putValues = [];
                  var putKeys = outbound ? [] : null;
                  var deleteKeys = isUnconditionalDelete ? keysInChunk : [];
                  if (!isUnconditionalDelete)
                    for (var i = 0; i < count; ++i) {
                      var origValue = values[i];
                      var ctx_1 = {
                        value: deepClone(origValue),
                        primKey: keys2[offset + i]
                      };
                      if (modifyer.call(ctx_1, ctx_1.value, ctx_1) !== false) {
                        if (ctx_1.value == null) {
                          deleteKeys.push(keys2[offset + i]);
                        } else if (!outbound && cmp2(extractKey(origValue), extractKey(ctx_1.value)) !== 0) {
                          deleteKeys.push(keys2[offset + i]);
                          addValues.push(ctx_1.value);
                        } else {
                          putValues.push(ctx_1.value);
                          if (outbound)
                            putKeys.push(keys2[offset + i]);
                        }
                      }
                    }
                  return Promise.resolve(addValues.length > 0 && coreTable.mutate({ trans, type: "add", values: addValues }).then(function(res) {
                    for (var pos in res.failures) {
                      deleteKeys.splice(parseInt(pos), 1);
                    }
                    applyMutateResult(addValues.length, res);
                  })).then(function() {
                    return (putValues.length > 0 || criteria && typeof changes === "object") && coreTable.mutate({
                      trans,
                      type: "put",
                      keys: putKeys,
                      values: putValues,
                      criteria,
                      changeSpec: typeof changes !== "function" && changes,
                      isAdditionalChunk: offset > 0
                    }).then(function(res) {
                      return applyMutateResult(putValues.length, res);
                    });
                  }).then(function() {
                    return (deleteKeys.length > 0 || criteria && isUnconditionalDelete) && coreTable.mutate({
                      trans,
                      type: "delete",
                      keys: deleteKeys,
                      criteria,
                      isAdditionalChunk: offset > 0
                    }).then(function(res) {
                      return builtInDeletionTrigger(ctx.table, deleteKeys, res);
                    }).then(function(res) {
                      return applyMutateResult(deleteKeys.length, res);
                    });
                  }).then(function() {
                    return keys2.length > offset + count && nextChunk(offset + limit);
                  });
                });
              };
              return nextChunk(0).then(function() {
                if (totalFailures.length > 0)
                  throw new ModifyError("Error modifying one or more objects", totalFailures, successCount, failedKeys);
                return keys2.length;
              });
            });
          });
        };
        Collection2.prototype.delete = function() {
          var ctx = this._ctx, range = ctx.range;
          if (isPlainKeyRange(ctx) && !ctx.table.schema.yProps && (ctx.isPrimKey || range.type === 3)) {
            return this._write(function(trans) {
              var primaryKey = ctx.table.core.schema.primaryKey;
              var coreRange = range;
              return ctx.table.core.count({ trans, query: { index: primaryKey, range: coreRange } }).then(function(count) {
                return ctx.table.core.mutate({ trans, type: "deleteRange", range: coreRange }).then(function(_a2) {
                  var failures = _a2.failures, numFailures = _a2.numFailures;
                  if (numFailures)
                    throw new ModifyError("Could not delete some values", Object.keys(failures).map(function(pos) {
                      return failures[pos];
                    }), count - numFailures);
                  return count - numFailures;
                });
              });
            });
          }
          return this.modify(deleteCallback);
        };
        return Collection2;
      })();
      var deleteCallback = function(value, ctx) {
        return ctx.value = null;
      };
      function createCollectionConstructor(db2) {
        return makeClassConstructor(Collection.prototype, function Collection2(whereClause, keyRangeGenerator) {
          this.db = db2;
          var keyRange = AnyRange, error = null;
          if (keyRangeGenerator)
            try {
              keyRange = keyRangeGenerator();
            } catch (ex) {
              error = ex;
            }
          var whereCtx = whereClause._ctx;
          var table = whereCtx.table;
          var readingHook = table.hook.reading.fire;
          this._ctx = {
            table,
            index: whereCtx.index,
            isPrimKey: !whereCtx.index || table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name,
            range: keyRange,
            keysOnly: false,
            dir: "next",
            unique: "",
            algorithm: null,
            filter: null,
            replayFilter: null,
            justLimit: true,
            isMatch: null,
            offset: 0,
            limit: Infinity,
            error,
            or: whereCtx.or,
            valueMapper: readingHook !== mirror ? readingHook : null
          };
        });
      }
      function simpleCompare(a, b) {
        return a < b ? -1 : a === b ? 0 : 1;
      }
      function simpleCompareReverse(a, b) {
        return a > b ? -1 : a === b ? 0 : 1;
      }
      function fail(collectionOrWhereClause, err, T) {
        var collection = collectionOrWhereClause instanceof WhereClause ? new collectionOrWhereClause.Collection(collectionOrWhereClause) : collectionOrWhereClause;
        collection._ctx.error = T ? new T(err) : new TypeError(err);
        return collection;
      }
      function emptyCollection(whereClause) {
        return new whereClause.Collection(whereClause, function() {
          return rangeEqual("");
        }).limit(0);
      }
      function upperFactory(dir) {
        return dir === "next" ? function(s) {
          return s.toUpperCase();
        } : function(s) {
          return s.toLowerCase();
        };
      }
      function lowerFactory(dir) {
        return dir === "next" ? function(s) {
          return s.toLowerCase();
        } : function(s) {
          return s.toUpperCase();
        };
      }
      function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp3, dir) {
        var length = Math.min(key.length, lowerNeedle.length);
        var llp = -1;
        for (var i = 0; i < length; ++i) {
          var lwrKeyChar = lowerKey[i];
          if (lwrKeyChar !== lowerNeedle[i]) {
            if (cmp3(key[i], upperNeedle[i]) < 0)
              return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
            if (cmp3(key[i], lowerNeedle[i]) < 0)
              return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
            if (llp >= 0)
              return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
            return null;
          }
          if (cmp3(key[i], lwrKeyChar) < 0)
            llp = i;
        }
        if (length < lowerNeedle.length && dir === "next")
          return key + upperNeedle.substr(key.length);
        if (length < key.length && dir === "prev")
          return key.substr(0, upperNeedle.length);
        return llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1);
      }
      function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
        var upper, lower, compare, upperNeedles, lowerNeedles, direction, nextKeySuffix, needlesLen = needles.length;
        if (!needles.every(function(s) {
          return typeof s === "string";
        })) {
          return fail(whereClause, STRING_EXPECTED);
        }
        function initDirection(dir) {
          upper = upperFactory(dir);
          lower = lowerFactory(dir);
          compare = dir === "next" ? simpleCompare : simpleCompareReverse;
          var needleBounds = needles.map(function(needle) {
            return { lower: lower(needle), upper: upper(needle) };
          }).sort(function(a, b) {
            return compare(a.lower, b.lower);
          });
          upperNeedles = needleBounds.map(function(nb) {
            return nb.upper;
          });
          lowerNeedles = needleBounds.map(function(nb) {
            return nb.lower;
          });
          direction = dir;
          nextKeySuffix = dir === "next" ? "" : suffix;
        }
        initDirection("next");
        var c = new whereClause.Collection(whereClause, function() {
          return createRange(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix);
        });
        c._ondirectionchange = function(direction2) {
          initDirection(direction2);
        };
        var firstPossibleNeedle = 0;
        c._addAlgorithm(function(cursor, advance, resolve) {
          var key = cursor.key;
          if (typeof key !== "string")
            return false;
          var lowerKey = lower(key);
          if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
            return true;
          } else {
            var lowestPossibleCasing = null;
            for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
              var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
              if (casing === null && lowestPossibleCasing === null)
                firstPossibleNeedle = i + 1;
              else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
                lowestPossibleCasing = casing;
              }
            }
            if (lowestPossibleCasing !== null) {
              advance(function() {
                cursor.continue(lowestPossibleCasing + nextKeySuffix);
              });
            } else {
              advance(resolve);
            }
            return false;
          }
        });
        return c;
      }
      function createRange(lower, upper, lowerOpen, upperOpen) {
        return {
          type: 2,
          lower,
          upper,
          lowerOpen,
          upperOpen
        };
      }
      function rangeEqual(value) {
        return {
          type: 1,
          lower: value,
          upper: value
        };
      }
      var WhereClause = (function() {
        function WhereClause2() {
        }
        Object.defineProperty(WhereClause2.prototype, "Collection", {
          get: function() {
            return this._ctx.table.db.Collection;
          },
          enumerable: false,
          configurable: true
        });
        WhereClause2.prototype.between = function(lower, upper, includeLower, includeUpper) {
          includeLower = includeLower !== false;
          includeUpper = includeUpper === true;
          try {
            if (this._cmp(lower, upper) > 0 || this._cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper))
              return emptyCollection(this);
            return new this.Collection(this, function() {
              return createRange(lower, upper, !includeLower, !includeUpper);
            });
          } catch (e) {
            return fail(this, INVALID_KEY_ARGUMENT);
          }
        };
        WhereClause2.prototype.equals = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return rangeEqual(value);
          });
        };
        WhereClause2.prototype.above = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return createRange(value, void 0, true);
          });
        };
        WhereClause2.prototype.aboveOrEqual = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return createRange(value, void 0, false);
          });
        };
        WhereClause2.prototype.below = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return createRange(void 0, value, false, true);
          });
        };
        WhereClause2.prototype.belowOrEqual = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return createRange(void 0, value);
          });
        };
        WhereClause2.prototype.startsWith = function(str) {
          if (typeof str !== "string")
            return fail(this, STRING_EXPECTED);
          return this.between(str, str + maxString, true, true);
        };
        WhereClause2.prototype.startsWithIgnoreCase = function(str) {
          if (str === "")
            return this.startsWith(str);
          return addIgnoreCaseAlgorithm(this, function(x, a) {
            return x.indexOf(a[0]) === 0;
          }, [str], maxString);
        };
        WhereClause2.prototype.equalsIgnoreCase = function(str) {
          return addIgnoreCaseAlgorithm(this, function(x, a) {
            return x === a[0];
          }, [str], "");
        };
        WhereClause2.prototype.anyOfIgnoreCase = function() {
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          if (set.length === 0)
            return emptyCollection(this);
          return addIgnoreCaseAlgorithm(this, function(x, a) {
            return a.indexOf(x) !== -1;
          }, set, "");
        };
        WhereClause2.prototype.startsWithAnyOfIgnoreCase = function() {
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          if (set.length === 0)
            return emptyCollection(this);
          return addIgnoreCaseAlgorithm(this, function(x, a) {
            return a.some(function(n) {
              return x.indexOf(n) === 0;
            });
          }, set, maxString);
        };
        WhereClause2.prototype.anyOf = function() {
          var _this = this;
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          var compare = this._cmp;
          try {
            set.sort(compare);
          } catch (e) {
            return fail(this, INVALID_KEY_ARGUMENT);
          }
          if (set.length === 0)
            return emptyCollection(this);
          var c = new this.Collection(this, function() {
            return createRange(set[0], set[set.length - 1]);
          });
          c._ondirectionchange = function(direction) {
            compare = direction === "next" ? _this._ascending : _this._descending;
            set.sort(compare);
          };
          var i = 0;
          c._addAlgorithm(function(cursor, advance, resolve) {
            var key = cursor.key;
            while (compare(key, set[i]) > 0) {
              ++i;
              if (i === set.length) {
                advance(resolve);
                return false;
              }
            }
            if (compare(key, set[i]) === 0) {
              return true;
            } else {
              advance(function() {
                cursor.continue(set[i]);
              });
              return false;
            }
          });
          return c;
        };
        WhereClause2.prototype.notEqual = function(value) {
          return this.inAnyRange([
            [minKey, value],
            [value, this.db._maxKey]
          ], { includeLowers: false, includeUppers: false });
        };
        WhereClause2.prototype.noneOf = function() {
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          if (set.length === 0)
            return new this.Collection(this);
          try {
            set.sort(this._ascending);
          } catch (e) {
            return fail(this, INVALID_KEY_ARGUMENT);
          }
          var ranges = set.reduce(function(res, val) {
            return res ? res.concat([[res[res.length - 1][1], val]]) : [[minKey, val]];
          }, null);
          ranges.push([set[set.length - 1], this.db._maxKey]);
          return this.inAnyRange(ranges, {
            includeLowers: false,
            includeUppers: false
          });
        };
        WhereClause2.prototype.inAnyRange = function(ranges, options) {
          var _this = this;
          var cmp3 = this._cmp, ascending = this._ascending, descending = this._descending, min2 = this._min, max = this._max;
          if (ranges.length === 0)
            return emptyCollection(this);
          if (!ranges.every(function(range) {
            return range[0] !== void 0 && range[1] !== void 0 && ascending(range[0], range[1]) <= 0;
          })) {
            return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
          }
          var includeLowers = !options || options.includeLowers !== false;
          var includeUppers = options && options.includeUppers === true;
          function addRange2(ranges2, newRange) {
            var i = 0, l = ranges2.length;
            for (; i < l; ++i) {
              var range = ranges2[i];
              if (cmp3(newRange[0], range[1]) < 0 && cmp3(newRange[1], range[0]) > 0) {
                range[0] = min2(range[0], newRange[0]);
                range[1] = max(range[1], newRange[1]);
                break;
              }
            }
            if (i === l)
              ranges2.push(newRange);
            return ranges2;
          }
          var sortDirection = ascending;
          function rangeSorter(a, b) {
            return sortDirection(a[0], b[0]);
          }
          var set;
          try {
            set = ranges.reduce(addRange2, []);
            set.sort(rangeSorter);
          } catch (ex) {
            return fail(this, INVALID_KEY_ARGUMENT);
          }
          var rangePos = 0;
          var keyIsBeyondCurrentEntry = includeUppers ? function(key) {
            return ascending(key, set[rangePos][1]) > 0;
          } : function(key) {
            return ascending(key, set[rangePos][1]) >= 0;
          };
          var keyIsBeforeCurrentEntry = includeLowers ? function(key) {
            return descending(key, set[rangePos][0]) > 0;
          } : function(key) {
            return descending(key, set[rangePos][0]) >= 0;
          };
          function keyWithinCurrentRange(key) {
            return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
          }
          var checkKey = keyIsBeyondCurrentEntry;
          var c = new this.Collection(this, function() {
            return createRange(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers);
          });
          c._ondirectionchange = function(direction) {
            if (direction === "next") {
              checkKey = keyIsBeyondCurrentEntry;
              sortDirection = ascending;
            } else {
              checkKey = keyIsBeforeCurrentEntry;
              sortDirection = descending;
            }
            set.sort(rangeSorter);
          };
          c._addAlgorithm(function(cursor, advance, resolve) {
            var key = cursor.key;
            while (checkKey(key)) {
              ++rangePos;
              if (rangePos === set.length) {
                advance(resolve);
                return false;
              }
            }
            if (keyWithinCurrentRange(key)) {
              return true;
            } else if (_this._cmp(key, set[rangePos][1]) === 0 || _this._cmp(key, set[rangePos][0]) === 0) {
              return false;
            } else {
              advance(function() {
                if (sortDirection === ascending)
                  cursor.continue(set[rangePos][0]);
                else
                  cursor.continue(set[rangePos][1]);
              });
              return false;
            }
          });
          return c;
        };
        WhereClause2.prototype.startsWithAnyOf = function() {
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          if (!set.every(function(s) {
            return typeof s === "string";
          })) {
            return fail(this, "startsWithAnyOf() only works with strings");
          }
          if (set.length === 0)
            return emptyCollection(this);
          return this.inAnyRange(set.map(function(str) {
            return [str, str + maxString];
          }));
        };
        return WhereClause2;
      })();
      function createWhereClauseConstructor(db2) {
        return makeClassConstructor(WhereClause.prototype, function WhereClause2(table, index, orCollection) {
          this.db = db2;
          this._ctx = {
            table,
            index: index === ":id" ? null : index,
            or: orCollection
          };
          this._cmp = this._ascending = cmp2;
          this._descending = function(a, b) {
            return cmp2(b, a);
          };
          this._max = function(a, b) {
            return cmp2(a, b) > 0 ? a : b;
          };
          this._min = function(a, b) {
            return cmp2(a, b) < 0 ? a : b;
          };
          this._IDBKeyRange = db2._deps.IDBKeyRange;
          if (!this._IDBKeyRange)
            throw new exceptions.MissingAPI();
        });
      }
      function eventRejectHandler(reject) {
        return wrap(function(event) {
          preventDefault(event);
          reject(event.target.error);
          return false;
        });
      }
      function preventDefault(event) {
        if (event.stopPropagation)
          event.stopPropagation();
        if (event.preventDefault)
          event.preventDefault();
      }
      var DEXIE_STORAGE_MUTATED_EVENT_NAME = "storagemutated";
      var STORAGE_MUTATED_DOM_EVENT_NAME = "x-storagemutated-1";
      var globalEvents = Events(null, DEXIE_STORAGE_MUTATED_EVENT_NAME);
      var Transaction = (function() {
        function Transaction2() {
        }
        Transaction2.prototype._lock = function() {
          assert(!PSD.global);
          ++this._reculock;
          if (this._reculock === 1 && !PSD.global)
            PSD.lockOwnerFor = this;
          return this;
        };
        Transaction2.prototype._unlock = function() {
          assert(!PSD.global);
          if (--this._reculock === 0) {
            if (!PSD.global)
              PSD.lockOwnerFor = null;
            while (this._blockedFuncs.length > 0 && !this._locked()) {
              var fnAndPSD = this._blockedFuncs.shift();
              try {
                usePSD(fnAndPSD[1], fnAndPSD[0]);
              } catch (e) {
              }
            }
          }
          return this;
        };
        Transaction2.prototype._locked = function() {
          return this._reculock && PSD.lockOwnerFor !== this;
        };
        Transaction2.prototype.create = function(idbtrans) {
          var _this = this;
          if (!this.mode)
            return this;
          var idbdb = this.db.idbdb;
          var dbOpenError = this.db._state.dbOpenError;
          assert(!this.idbtrans);
          if (!idbtrans && !idbdb) {
            switch (dbOpenError && dbOpenError.name) {
              case "DatabaseClosedError":
                throw new exceptions.DatabaseClosed(dbOpenError);
              case "MissingAPIError":
                throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
              default:
                throw new exceptions.OpenFailed(dbOpenError);
            }
          }
          if (!this.active)
            throw new exceptions.TransactionInactive();
          assert(this._completion._state === null);
          idbtrans = this.idbtrans = idbtrans || (this.db.core ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }) : idbdb.transaction(this.storeNames, this.mode, {
            durability: this.chromeTransactionDurability
          }));
          idbtrans.onerror = wrap(function(ev) {
            preventDefault(ev);
            _this._reject(idbtrans.error);
          });
          idbtrans.onabort = wrap(function(ev) {
            preventDefault(ev);
            _this.active && _this._reject(new exceptions.Abort(idbtrans.error));
            _this.active = false;
            _this.on("abort").fire(ev);
          });
          idbtrans.oncomplete = wrap(function() {
            _this.active = false;
            _this._resolve();
            if ("mutatedParts" in idbtrans) {
              globalEvents.storagemutated.fire(idbtrans["mutatedParts"]);
            }
          });
          return this;
        };
        Transaction2.prototype._promise = function(mode, fn, bWriteLock) {
          var _this = this;
          if (mode === "readwrite" && this.mode !== "readwrite")
            return rejection(new exceptions.ReadOnly("Transaction is readonly"));
          if (!this.active)
            return rejection(new exceptions.TransactionInactive());
          if (this._locked()) {
            return new DexiePromise(function(resolve, reject) {
              _this._blockedFuncs.push([
                function() {
                  _this._promise(mode, fn, bWriteLock).then(resolve, reject);
                },
                PSD
              ]);
            });
          } else if (bWriteLock) {
            return newScope(function() {
              var p2 = new DexiePromise(function(resolve, reject) {
                _this._lock();
                var rv = fn(resolve, reject, _this);
                if (rv && rv.then)
                  rv.then(resolve, reject);
              });
              p2.finally(function() {
                return _this._unlock();
              });
              p2._lib = true;
              return p2;
            });
          } else {
            var p = new DexiePromise(function(resolve, reject) {
              var rv = fn(resolve, reject, _this);
              if (rv && rv.then)
                rv.then(resolve, reject);
            });
            p._lib = true;
            return p;
          }
        };
        Transaction2.prototype._root = function() {
          return this.parent ? this.parent._root() : this;
        };
        Transaction2.prototype.waitFor = function(promiseLike) {
          var root = this._root();
          var promise = DexiePromise.resolve(promiseLike);
          if (root._waitingFor) {
            root._waitingFor = root._waitingFor.then(function() {
              return promise;
            });
          } else {
            root._waitingFor = promise;
            root._waitingQueue = [];
            var store = root.idbtrans.objectStore(root.storeNames[0]);
            (function spin() {
              ++root._spinCount;
              while (root._waitingQueue.length)
                root._waitingQueue.shift()();
              if (root._waitingFor)
                store.get(-Infinity).onsuccess = spin;
            })();
          }
          var currentWaitPromise = root._waitingFor;
          return new DexiePromise(function(resolve, reject) {
            promise.then(function(res) {
              return root._waitingQueue.push(wrap(resolve.bind(null, res)));
            }, function(err) {
              return root._waitingQueue.push(wrap(reject.bind(null, err)));
            }).finally(function() {
              if (root._waitingFor === currentWaitPromise) {
                root._waitingFor = null;
              }
            });
          });
        };
        Transaction2.prototype.abort = function() {
          if (this.active) {
            this.active = false;
            if (this.idbtrans)
              this.idbtrans.abort();
            this._reject(new exceptions.Abort());
          }
        };
        Transaction2.prototype.table = function(tableName) {
          var memoizedTables = this._memoizedTables || (this._memoizedTables = {});
          if (hasOwn(memoizedTables, tableName))
            return memoizedTables[tableName];
          var tableSchema = this.schema[tableName];
          if (!tableSchema) {
            throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
          }
          var transactionBoundTable = new this.db.Table(tableName, tableSchema, this);
          transactionBoundTable.core = this.db.core.table(tableName);
          memoizedTables[tableName] = transactionBoundTable;
          return transactionBoundTable;
        };
        return Transaction2;
      })();
      function createTransactionConstructor(db2) {
        return makeClassConstructor(Transaction.prototype, function Transaction2(mode, storeNames, dbschema, chromeTransactionDurability, parent) {
          var _this = this;
          if (mode !== "readonly")
            storeNames.forEach(function(storeName) {
              var _a2;
              var yProps = (_a2 = dbschema[storeName]) === null || _a2 === void 0 ? void 0 : _a2.yProps;
              if (yProps)
                storeNames = storeNames.concat(yProps.map(function(p) {
                  return p.updatesTable;
                }));
            });
          this.db = db2;
          this.mode = mode;
          this.storeNames = storeNames;
          this.schema = dbschema;
          this.chromeTransactionDurability = chromeTransactionDurability;
          this.idbtrans = null;
          this.on = Events(this, "complete", "error", "abort");
          this.parent = parent || null;
          this.active = true;
          this._reculock = 0;
          this._blockedFuncs = [];
          this._resolve = null;
          this._reject = null;
          this._waitingFor = null;
          this._waitingQueue = null;
          this._spinCount = 0;
          this._completion = new DexiePromise(function(resolve, reject) {
            _this._resolve = resolve;
            _this._reject = reject;
          });
          this._completion.then(function() {
            _this.active = false;
            _this.on.complete.fire();
          }, function(e) {
            var wasActive = _this.active;
            _this.active = false;
            _this.on.error.fire(e);
            _this.parent ? _this.parent._reject(e) : wasActive && _this.idbtrans && _this.idbtrans.abort();
            return rejection(e);
          });
        });
      }
      function createIndexSpec(name, keyPath, unique, multi, auto, compound, isPrimKey, type2) {
        return {
          name,
          keyPath,
          unique,
          multi,
          auto,
          compound,
          src: (unique && !isPrimKey ? "&" : "") + (multi ? "*" : "") + (auto ? "++" : "") + nameFromKeyPath(keyPath),
          type: type2
        };
      }
      function nameFromKeyPath(keyPath) {
        return typeof keyPath === "string" ? keyPath : keyPath ? "[" + [].join.call(keyPath, "+") + "]" : "";
      }
      function createTableSchema(name, primKey, indexes) {
        return {
          name,
          primKey,
          indexes,
          mappedClass: null,
          idxByName: arrayToObject(indexes, function(index) {
            return [index.name, index];
          })
        };
      }
      function safariMultiStoreFix(storeNames) {
        return storeNames.length === 1 ? storeNames[0] : storeNames;
      }
      var getMaxKey = function(IdbKeyRange) {
        try {
          IdbKeyRange.only([[]]);
          getMaxKey = function() {
            return [[]];
          };
          return [[]];
        } catch (e) {
          getMaxKey = function() {
            return maxString;
          };
          return maxString;
        }
      };
      function getKeyExtractor(keyPath) {
        if (keyPath == null) {
          return function() {
            return void 0;
          };
        } else if (typeof keyPath === "string") {
          return getSinglePathKeyExtractor(keyPath);
        } else {
          return function(obj) {
            return getByKeyPath(obj, keyPath);
          };
        }
      }
      function getSinglePathKeyExtractor(keyPath) {
        var split = keyPath.split(".");
        if (split.length === 1) {
          return function(obj) {
            return obj[keyPath];
          };
        } else {
          return function(obj) {
            return getByKeyPath(obj, keyPath);
          };
        }
      }
      function arrayify(arrayLike) {
        return [].slice.call(arrayLike);
      }
      var _id_counter = 0;
      function getKeyPathAlias(keyPath) {
        return keyPath == null ? ":id" : typeof keyPath === "string" ? keyPath : "[".concat(keyPath.join("+"), "]");
      }
      function createDBCore(db2, IdbKeyRange, tmpTrans) {
        function extractSchema(db3, trans) {
          var tables2 = arrayify(db3.objectStoreNames);
          var tempStore = tables2.length > 0 ? trans.objectStore(tables2[0]) : {};
          return {
            schema: {
              name: db3.name,
              tables: tables2.map(function(table) {
                return trans.objectStore(table);
              }).map(function(store) {
                var keyPath = store.keyPath, autoIncrement = store.autoIncrement;
                var compound = isArray(keyPath);
                var outbound = keyPath == null;
                var indexByKeyPath = {};
                var result = {
                  name: store.name,
                  primaryKey: {
                    name: null,
                    isPrimaryKey: true,
                    outbound,
                    compound,
                    keyPath,
                    autoIncrement,
                    unique: true,
                    extractKey: getKeyExtractor(keyPath)
                  },
                  indexes: arrayify(store.indexNames).map(function(indexName) {
                    return store.index(indexName);
                  }).map(function(index) {
                    var name = index.name, unique = index.unique, multiEntry = index.multiEntry, keyPath2 = index.keyPath;
                    var compound2 = isArray(keyPath2);
                    var result2 = {
                      name,
                      compound: compound2,
                      keyPath: keyPath2,
                      unique,
                      multiEntry,
                      extractKey: getKeyExtractor(keyPath2)
                    };
                    indexByKeyPath[getKeyPathAlias(keyPath2)] = result2;
                    return result2;
                  }),
                  getIndexByKeyPath: function(keyPath2) {
                    return indexByKeyPath[getKeyPathAlias(keyPath2)];
                  }
                };
                indexByKeyPath[":id"] = result.primaryKey;
                if (keyPath != null) {
                  indexByKeyPath[getKeyPathAlias(keyPath)] = result.primaryKey;
                }
                return result;
              })
            },
            hasGetAll: tables2.length > 0 && "getAll" in tempStore && !(typeof navigator !== "undefined" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604),
            hasIdb3Features: "getAllRecords" in tempStore
          };
        }
        function makeIDBKeyRange(range) {
          if (range.type === 3)
            return null;
          if (range.type === 4)
            throw new Error("Cannot convert never type to IDBKeyRange");
          var lower = range.lower, upper = range.upper, lowerOpen = range.lowerOpen, upperOpen = range.upperOpen;
          var idbRange = lower === void 0 ? upper === void 0 ? null : IdbKeyRange.upperBound(upper, !!upperOpen) : upper === void 0 ? IdbKeyRange.lowerBound(lower, !!lowerOpen) : IdbKeyRange.bound(lower, upper, !!lowerOpen, !!upperOpen);
          return idbRange;
        }
        function createDbCoreTable(tableSchema) {
          var tableName = tableSchema.name;
          function mutate(_a3) {
            var trans = _a3.trans, type2 = _a3.type, keys2 = _a3.keys, values = _a3.values, range = _a3.range;
            return new Promise(function(resolve, reject) {
              resolve = wrap(resolve);
              var store = trans.objectStore(tableName);
              var outbound = store.keyPath == null;
              var isAddOrPut = type2 === "put" || type2 === "add";
              if (!isAddOrPut && type2 !== "delete" && type2 !== "deleteRange")
                throw new Error("Invalid operation type: " + type2);
              var length = (keys2 || values || { length: 1 }).length;
              if (keys2 && values && keys2.length !== values.length) {
                throw new Error("Given keys array must have same length as given values array.");
              }
              if (length === 0)
                return resolve({
                  numFailures: 0,
                  failures: {},
                  results: [],
                  lastResult: void 0
                });
              var req;
              var reqs = [];
              var failures = [];
              var numFailures = 0;
              var errorHandler = function(event) {
                ++numFailures;
                preventDefault(event);
              };
              if (type2 === "deleteRange") {
                if (range.type === 4)
                  return resolve({
                    numFailures,
                    failures,
                    results: [],
                    lastResult: void 0
                  });
                if (range.type === 3)
                  reqs.push(req = store.clear());
                else
                  reqs.push(req = store.delete(makeIDBKeyRange(range)));
              } else {
                var _a4 = isAddOrPut ? outbound ? [values, keys2] : [values, null] : [keys2, null], args1 = _a4[0], args2 = _a4[1];
                if (isAddOrPut) {
                  for (var i = 0; i < length; ++i) {
                    reqs.push(req = args2 && args2[i] !== void 0 ? store[type2](args1[i], args2[i]) : store[type2](args1[i]));
                    req.onerror = errorHandler;
                  }
                } else {
                  for (var i = 0; i < length; ++i) {
                    reqs.push(req = store[type2](args1[i]));
                    req.onerror = errorHandler;
                  }
                }
              }
              var done = function(event) {
                var lastResult = event.target.result;
                reqs.forEach(function(req2, i2) {
                  return req2.error != null && (failures[i2] = req2.error);
                });
                resolve({
                  numFailures,
                  failures,
                  results: type2 === "delete" ? keys2 : reqs.map(function(req2) {
                    return req2.result;
                  }),
                  lastResult
                });
              };
              req.onerror = function(event) {
                errorHandler(event);
                done(event);
              };
              req.onsuccess = done;
            });
          }
          function openCursor2(_a3) {
            var trans = _a3.trans, values = _a3.values, query2 = _a3.query, reverse = _a3.reverse, unique = _a3.unique;
            return new Promise(function(resolve, reject) {
              resolve = wrap(resolve);
              var index = query2.index, range = query2.range;
              var store = trans.objectStore(tableName);
              var source = index.isPrimaryKey ? store : store.index(index.name);
              var direction = reverse ? unique ? "prevunique" : "prev" : unique ? "nextunique" : "next";
              var req = values || !("openKeyCursor" in source) ? source.openCursor(makeIDBKeyRange(range), direction) : source.openKeyCursor(makeIDBKeyRange(range), direction);
              req.onerror = eventRejectHandler(reject);
              req.onsuccess = wrap(function(ev) {
                var cursor = req.result;
                if (!cursor) {
                  resolve(null);
                  return;
                }
                cursor.___id = ++_id_counter;
                cursor.done = false;
                var _cursorContinue = cursor.continue.bind(cursor);
                var _cursorContinuePrimaryKey = cursor.continuePrimaryKey;
                if (_cursorContinuePrimaryKey)
                  _cursorContinuePrimaryKey = _cursorContinuePrimaryKey.bind(cursor);
                var _cursorAdvance = cursor.advance.bind(cursor);
                var doThrowCursorIsNotStarted = function() {
                  throw new Error("Cursor not started");
                };
                var doThrowCursorIsStopped = function() {
                  throw new Error("Cursor not stopped");
                };
                cursor.trans = trans;
                cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsNotStarted;
                cursor.fail = wrap(reject);
                cursor.next = function() {
                  var _this = this;
                  var gotOne = 1;
                  return this.start(function() {
                    return gotOne-- ? _this.continue() : _this.stop();
                  }).then(function() {
                    return _this;
                  });
                };
                cursor.start = function(callback) {
                  var iterationPromise = new Promise(function(resolveIteration, rejectIteration) {
                    resolveIteration = wrap(resolveIteration);
                    req.onerror = eventRejectHandler(rejectIteration);
                    cursor.fail = rejectIteration;
                    cursor.stop = function(value) {
                      cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsStopped;
                      resolveIteration(value);
                    };
                  });
                  var guardedCallback = function() {
                    if (req.result) {
                      try {
                        callback();
                      } catch (err) {
                        cursor.fail(err);
                      }
                    } else {
                      cursor.done = true;
                      cursor.start = function() {
                        throw new Error("Cursor behind last entry");
                      };
                      cursor.stop();
                    }
                  };
                  req.onsuccess = wrap(function(ev2) {
                    req.onsuccess = guardedCallback;
                    guardedCallback();
                  });
                  cursor.continue = _cursorContinue;
                  cursor.continuePrimaryKey = _cursorContinuePrimaryKey;
                  cursor.advance = _cursorAdvance;
                  guardedCallback();
                  return iterationPromise;
                };
                resolve(cursor);
              }, reject);
            });
          }
          function query(hasGetAll2, hasIdb3Features2) {
            return function(request2) {
              return new Promise(function(resolve, reject) {
                var _a3;
                resolve = wrap(resolve);
                var trans = request2.trans, values = request2.values, limit = request2.limit, query2 = request2.query;
                var direction = (_a3 = request2.direction) !== null && _a3 !== void 0 ? _a3 : "next";
                var nonInfinitLimit = limit === Infinity ? void 0 : limit;
                var index = query2.index, range = query2.range;
                var store = trans.objectStore(tableName);
                var source = index.isPrimaryKey ? store : store.index(index.name);
                var idbKeyRange = makeIDBKeyRange(range);
                if (limit === 0)
                  return resolve({ result: [] });
                if (hasIdb3Features2) {
                  var options = {
                    query: idbKeyRange,
                    count: nonInfinitLimit,
                    direction
                  };
                  var req = values ? source.getAll(options) : source.getAllKeys(options);
                  req.onsuccess = function(event) {
                    return resolve({ result: event.target.result });
                  };
                  req.onerror = eventRejectHandler(reject);
                } else if (hasGetAll2 && direction === "next") {
                  var req = values ? source.getAll(idbKeyRange, nonInfinitLimit) : source.getAllKeys(idbKeyRange, nonInfinitLimit);
                  req.onsuccess = function(event) {
                    return resolve({ result: event.target.result });
                  };
                  req.onerror = eventRejectHandler(reject);
                } else {
                  var count_1 = 0;
                  var req_1 = values || !("openKeyCursor" in source) ? source.openCursor(idbKeyRange, direction) : source.openKeyCursor(idbKeyRange, direction);
                  var result_1 = [];
                  req_1.onsuccess = function() {
                    var cursor = req_1.result;
                    if (!cursor)
                      return resolve({ result: result_1 });
                    result_1.push(values ? cursor.value : cursor.primaryKey);
                    if (++count_1 === limit)
                      return resolve({ result: result_1 });
                    cursor.continue();
                  };
                  req_1.onerror = eventRejectHandler(reject);
                }
              });
            };
          }
          return {
            name: tableName,
            schema: tableSchema,
            mutate,
            getMany: function(_a3) {
              var trans = _a3.trans, keys2 = _a3.keys;
              return new Promise(function(resolve, reject) {
                resolve = wrap(resolve);
                var store = trans.objectStore(tableName);
                var length = keys2.length;
                var result = new Array(length);
                var keyCount = 0;
                var callbackCount = 0;
                var req;
                var successHandler = function(event) {
                  var req2 = event.target;
                  if ((result[req2._pos] = req2.result) != null)
                    ;
                  if (++callbackCount === keyCount)
                    resolve(result);
                };
                var errorHandler = eventRejectHandler(reject);
                for (var i = 0; i < length; ++i) {
                  var key = keys2[i];
                  if (key != null) {
                    req = store.get(keys2[i]);
                    req._pos = i;
                    req.onsuccess = successHandler;
                    req.onerror = errorHandler;
                    ++keyCount;
                  }
                }
                if (keyCount === 0)
                  resolve(result);
              });
            },
            get: function(_a3) {
              var trans = _a3.trans, key = _a3.key;
              return new Promise(function(resolve, reject) {
                resolve = wrap(resolve);
                var store = trans.objectStore(tableName);
                var req = store.get(key);
                req.onsuccess = function(event) {
                  return resolve(event.target.result);
                };
                req.onerror = eventRejectHandler(reject);
              });
            },
            query: query(hasGetAll, hasIdb3Features),
            openCursor: openCursor2,
            count: function(_a3) {
              var query2 = _a3.query, trans = _a3.trans;
              var index = query2.index, range = query2.range;
              return new Promise(function(resolve, reject) {
                var store = trans.objectStore(tableName);
                var source = index.isPrimaryKey ? store : store.index(index.name);
                var idbKeyRange = makeIDBKeyRange(range);
                var req = idbKeyRange ? source.count(idbKeyRange) : source.count();
                req.onsuccess = wrap(function(ev) {
                  return resolve(ev.target.result);
                });
                req.onerror = eventRejectHandler(reject);
              });
            }
          };
        }
        var _a2 = extractSchema(db2, tmpTrans), schema = _a2.schema, hasGetAll = _a2.hasGetAll, hasIdb3Features = _a2.hasIdb3Features;
        var tables = schema.tables.map(function(tableSchema) {
          return createDbCoreTable(tableSchema);
        });
        var tableMap = {};
        tables.forEach(function(table) {
          return tableMap[table.name] = table;
        });
        return {
          stack: "dbcore",
          transaction: db2.transaction.bind(db2),
          table: function(name) {
            var result = tableMap[name];
            if (!result)
              throw new Error("Table '".concat(name, "' not found"));
            return tableMap[name];
          },
          MIN_KEY: -Infinity,
          MAX_KEY: getMaxKey(IdbKeyRange),
          schema
        };
      }
      function createMiddlewareStack(stackImpl, middlewares) {
        return middlewares.reduce(function(down, _a2) {
          var create = _a2.create;
          return __assign(__assign({}, down), create(down));
        }, stackImpl);
      }
      function createMiddlewareStacks(middlewares, idbdb, _a2, tmpTrans) {
        var IDBKeyRange = _a2.IDBKeyRange;
        _a2.indexedDB;
        var dbcore = createMiddlewareStack(createDBCore(idbdb, IDBKeyRange, tmpTrans), middlewares.dbcore);
        return {
          dbcore
        };
      }
      function generateMiddlewareStacks(db2, tmpTrans) {
        var idbdb = tmpTrans.db;
        var stacks = createMiddlewareStacks(db2._middlewares, idbdb, db2._deps, tmpTrans);
        db2.core = stacks.dbcore;
        db2.tables.forEach(function(table) {
          var tableName = table.name;
          if (db2.core.schema.tables.some(function(tbl) {
            return tbl.name === tableName;
          })) {
            table.core = db2.core.table(tableName);
            if (db2[tableName] instanceof db2.Table) {
              db2[tableName].core = table.core;
            }
          }
        });
      }
      function setApiOnPlace(db2, objs, tableNames, dbschema) {
        tableNames.forEach(function(tableName) {
          var schema = dbschema[tableName];
          objs.forEach(function(obj) {
            var propDesc = getPropertyDescriptor(obj, tableName);
            if (!propDesc || "value" in propDesc && propDesc.value === void 0) {
              if (obj === db2.Transaction.prototype || obj instanceof db2.Transaction) {
                setProp(obj, tableName, {
                  get: function() {
                    return this.table(tableName);
                  },
                  set: function(value) {
                    defineProperty(this, tableName, {
                      value,
                      writable: true,
                      configurable: true,
                      enumerable: true
                    });
                  }
                });
              } else {
                obj[tableName] = new db2.Table(tableName, schema);
              }
            }
          });
        });
      }
      function removeTablesApi(db2, objs) {
        objs.forEach(function(obj) {
          for (var key in obj) {
            if (obj[key] instanceof db2.Table)
              delete obj[key];
          }
        });
      }
      function lowerVersionFirst(a, b) {
        return a._cfg.version - b._cfg.version;
      }
      function runUpgraders(db2, oldVersion, idbUpgradeTrans, reject) {
        var globalSchema = db2._dbSchema;
        if (idbUpgradeTrans.objectStoreNames.contains("$meta") && !globalSchema.$meta) {
          globalSchema.$meta = createTableSchema("$meta", parseIndexSyntax("")[0], []);
          db2._storeNames.push("$meta");
        }
        var trans = db2._createTransaction("readwrite", db2._storeNames, globalSchema);
        trans.create(idbUpgradeTrans);
        trans._completion.catch(reject);
        var rejectTransaction = trans._reject.bind(trans);
        var transless = PSD.transless || PSD;
        newScope(function() {
          PSD.trans = trans;
          PSD.transless = transless;
          if (oldVersion === 0) {
            keys(globalSchema).forEach(function(tableName) {
              createTable(idbUpgradeTrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
            });
            generateMiddlewareStacks(db2, idbUpgradeTrans);
            DexiePromise.follow(function() {
              return db2.on.populate.fire(trans);
            }).catch(rejectTransaction);
          } else {
            generateMiddlewareStacks(db2, idbUpgradeTrans);
            return getExistingVersion(db2, trans, oldVersion).then(function(oldVersion2) {
              return updateTablesAndIndexes(db2, oldVersion2, trans, idbUpgradeTrans);
            }).catch(rejectTransaction);
          }
        });
      }
      function patchCurrentVersion(db2, idbUpgradeTrans) {
        createMissingTables(db2._dbSchema, idbUpgradeTrans);
        if (idbUpgradeTrans.db.version % 10 === 0 && !idbUpgradeTrans.objectStoreNames.contains("$meta")) {
          idbUpgradeTrans.db.createObjectStore("$meta").add(Math.ceil(idbUpgradeTrans.db.version / 10 - 1), "version");
        }
        var globalSchema = buildGlobalSchema(db2, db2.idbdb, idbUpgradeTrans);
        adjustToExistingIndexNames(db2, db2._dbSchema, idbUpgradeTrans);
        var diff = getSchemaDiff(globalSchema, db2._dbSchema);
        var _loop_1 = function(tableChange2) {
          if (tableChange2.change.length || tableChange2.recreate) {
            console.warn("Unable to patch indexes of table ".concat(tableChange2.name, " because it has changes on the type of index or primary key."));
            return { value: void 0 };
          }
          var store = idbUpgradeTrans.objectStore(tableChange2.name);
          tableChange2.add.forEach(function(idx) {
            if (debug)
              console.debug("Dexie upgrade patch: Creating missing index ".concat(tableChange2.name, ".").concat(idx.src));
            addIndex(store, idx);
          });
        };
        for (var _i = 0, _a2 = diff.change; _i < _a2.length; _i++) {
          var tableChange = _a2[_i];
          var state_1 = _loop_1(tableChange);
          if (typeof state_1 === "object")
            return state_1.value;
        }
      }
      function getExistingVersion(db2, trans, oldVersion) {
        if (trans.storeNames.includes("$meta")) {
          return trans.table("$meta").get("version").then(function(metaVersion) {
            return metaVersion != null ? metaVersion : oldVersion;
          });
        } else {
          return DexiePromise.resolve(oldVersion);
        }
      }
      function updateTablesAndIndexes(db2, oldVersion, trans, idbUpgradeTrans) {
        var queue2 = [];
        var versions = db2._versions;
        var globalSchema = db2._dbSchema = buildGlobalSchema(db2, db2.idbdb, idbUpgradeTrans);
        var versToRun = versions.filter(function(v) {
          return v._cfg.version >= oldVersion;
        });
        if (versToRun.length === 0) {
          return DexiePromise.resolve();
        }
        versToRun.forEach(function(version) {
          queue2.push(function() {
            var oldSchema = globalSchema;
            var newSchema = version._cfg.dbschema;
            adjustToExistingIndexNames(db2, oldSchema, idbUpgradeTrans);
            adjustToExistingIndexNames(db2, newSchema, idbUpgradeTrans);
            globalSchema = db2._dbSchema = newSchema;
            var diff = getSchemaDiff(oldSchema, newSchema);
            diff.add.forEach(function(tuple) {
              createTable(idbUpgradeTrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
            });
            diff.change.forEach(function(change) {
              if (change.recreate) {
                throw new exceptions.Upgrade("Not yet support for changing primary key");
              } else {
                var store_1 = idbUpgradeTrans.objectStore(change.name);
                change.add.forEach(function(idx) {
                  return addIndex(store_1, idx);
                });
                change.change.forEach(function(idx) {
                  store_1.deleteIndex(idx.name);
                  addIndex(store_1, idx);
                });
                change.del.forEach(function(idxName) {
                  return store_1.deleteIndex(idxName);
                });
              }
            });
            var contentUpgrade = version._cfg.contentUpgrade;
            if (contentUpgrade && version._cfg.version > oldVersion) {
              generateMiddlewareStacks(db2, idbUpgradeTrans);
              trans._memoizedTables = {};
              var upgradeSchema_1 = shallowClone(newSchema);
              diff.del.forEach(function(table) {
                upgradeSchema_1[table] = oldSchema[table];
              });
              removeTablesApi(db2, [db2.Transaction.prototype]);
              setApiOnPlace(db2, [db2.Transaction.prototype], keys(upgradeSchema_1), upgradeSchema_1);
              trans.schema = upgradeSchema_1;
              var contentUpgradeIsAsync_1 = isAsyncFunction(contentUpgrade);
              if (contentUpgradeIsAsync_1) {
                incrementExpectedAwaits();
              }
              var returnValue_1;
              var promiseFollowed = DexiePromise.follow(function() {
                returnValue_1 = contentUpgrade(trans);
                if (returnValue_1) {
                  if (contentUpgradeIsAsync_1) {
                    var decrementor = decrementExpectedAwaits.bind(null, null);
                    returnValue_1.then(decrementor, decrementor);
                  }
                }
              });
              return returnValue_1 && typeof returnValue_1.then === "function" ? DexiePromise.resolve(returnValue_1) : promiseFollowed.then(function() {
                return returnValue_1;
              });
            }
          });
          queue2.push(function(idbtrans) {
            var newSchema = version._cfg.dbschema;
            deleteRemovedTables(newSchema, idbtrans);
            removeTablesApi(db2, [db2.Transaction.prototype]);
            setApiOnPlace(db2, [db2.Transaction.prototype], db2._storeNames, db2._dbSchema);
            trans.schema = db2._dbSchema;
          });
          queue2.push(function(idbtrans) {
            if (db2.idbdb.objectStoreNames.contains("$meta")) {
              if (Math.ceil(db2.idbdb.version / 10) === version._cfg.version) {
                db2.idbdb.deleteObjectStore("$meta");
                delete db2._dbSchema.$meta;
                db2._storeNames = db2._storeNames.filter(function(name) {
                  return name !== "$meta";
                });
              } else {
                idbtrans.objectStore("$meta").put(version._cfg.version, "version");
              }
            }
          });
        });
        function runQueue() {
          return queue2.length ? DexiePromise.resolve(queue2.shift()(trans.idbtrans)).then(runQueue) : DexiePromise.resolve();
        }
        return runQueue().then(function() {
          createMissingTables(globalSchema, idbUpgradeTrans);
        });
      }
      function getSchemaDiff(oldSchema, newSchema) {
        var diff = {
          del: [],
          add: [],
          change: []
        };
        var table;
        for (table in oldSchema) {
          if (!newSchema[table])
            diff.del.push(table);
        }
        for (table in newSchema) {
          var oldDef = oldSchema[table], newDef = newSchema[table];
          if (!oldDef) {
            diff.add.push([table, newDef]);
          } else {
            var change = {
              name: table,
              def: newDef,
              recreate: false,
              del: [],
              add: [],
              change: []
            };
            if ("" + (oldDef.primKey.keyPath || "") !== "" + (newDef.primKey.keyPath || "") || oldDef.primKey.auto !== newDef.primKey.auto) {
              change.recreate = true;
              diff.change.push(change);
            } else {
              var oldIndexes = oldDef.idxByName;
              var newIndexes = newDef.idxByName;
              var idxName = void 0;
              for (idxName in oldIndexes) {
                if (!newIndexes[idxName])
                  change.del.push(idxName);
              }
              for (idxName in newIndexes) {
                var oldIdx = oldIndexes[idxName], newIdx = newIndexes[idxName];
                if (!oldIdx)
                  change.add.push(newIdx);
                else if (oldIdx.src !== newIdx.src)
                  change.change.push(newIdx);
              }
              if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
                diff.change.push(change);
              }
            }
          }
        }
        return diff;
      }
      function createTable(idbtrans, tableName, primKey, indexes) {
        var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? { keyPath: primKey.keyPath, autoIncrement: primKey.auto } : { autoIncrement: primKey.auto });
        indexes.forEach(function(idx) {
          return addIndex(store, idx);
        });
        return store;
      }
      function createMissingTables(newSchema, idbtrans) {
        keys(newSchema).forEach(function(tableName) {
          if (!idbtrans.db.objectStoreNames.contains(tableName)) {
            if (debug)
              console.debug("Dexie: Creating missing table", tableName);
            createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
          }
        });
      }
      function deleteRemovedTables(newSchema, idbtrans) {
        [].slice.call(idbtrans.db.objectStoreNames).forEach(function(storeName) {
          return newSchema[storeName] == null && idbtrans.db.deleteObjectStore(storeName);
        });
      }
      function addIndex(store, idx) {
        store.createIndex(idx.name, idx.keyPath, {
          unique: idx.unique,
          multiEntry: idx.multi
        });
      }
      function buildGlobalSchema(db2, idbdb, tmpTrans) {
        var globalSchema = {};
        var dbStoreNames = slice(idbdb.objectStoreNames, 0);
        dbStoreNames.forEach(function(storeName) {
          var store = tmpTrans.objectStore(storeName);
          var keyPath = store.keyPath;
          var primKey = createIndexSpec(nameFromKeyPath(keyPath), keyPath || "", true, false, !!store.autoIncrement, keyPath && typeof keyPath !== "string", true);
          var indexes = [];
          for (var j = 0; j < store.indexNames.length; ++j) {
            var idbindex = store.index(store.indexNames[j]);
            keyPath = idbindex.keyPath;
            var index = createIndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== "string", false);
            indexes.push(index);
          }
          globalSchema[storeName] = createTableSchema(storeName, primKey, indexes);
        });
        return globalSchema;
      }
      function readGlobalSchema(db2, idbdb, tmpTrans) {
        db2.verno = idbdb.version / 10;
        var globalSchema = db2._dbSchema = buildGlobalSchema(db2, idbdb, tmpTrans);
        db2._storeNames = slice(idbdb.objectStoreNames, 0);
        setApiOnPlace(db2, [db2._allTables], keys(globalSchema), globalSchema);
      }
      function verifyInstalledSchema(db2, tmpTrans) {
        var installedSchema = buildGlobalSchema(db2, db2.idbdb, tmpTrans);
        var diff = getSchemaDiff(installedSchema, db2._dbSchema);
        return !(diff.add.length || diff.change.some(function(ch) {
          return ch.add.length || ch.change.length;
        }));
      }
      function adjustToExistingIndexNames(db2, schema, idbtrans) {
        var storeNames = idbtrans.db.objectStoreNames;
        for (var i = 0; i < storeNames.length; ++i) {
          var storeName = storeNames[i];
          var store = idbtrans.objectStore(storeName);
          db2._hasGetAll = "getAll" in store;
          for (var j = 0; j < store.indexNames.length; ++j) {
            var indexName = store.indexNames[j];
            var keyPath = store.index(indexName).keyPath;
            var dexieName = typeof keyPath === "string" ? keyPath : "[" + slice(keyPath).join("+") + "]";
            if (schema[storeName]) {
              var indexSpec = schema[storeName].idxByName[dexieName];
              if (indexSpec) {
                indexSpec.name = indexName;
                delete schema[storeName].idxByName[dexieName];
                schema[storeName].idxByName[indexName] = indexSpec;
              }
            }
          }
        }
        if (typeof navigator !== "undefined" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && _global.WorkerGlobalScope && _global instanceof _global.WorkerGlobalScope && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) {
          db2._hasGetAll = false;
        }
      }
      function parseIndexSyntax(primKeyAndIndexes) {
        return primKeyAndIndexes.split(",").map(function(index, indexNum) {
          var _a2;
          var typeSplit = index.split(":");
          var type2 = (_a2 = typeSplit[1]) === null || _a2 === void 0 ? void 0 : _a2.trim();
          index = typeSplit[0].trim();
          var name = index.replace(/([&*]|\+\+)/g, "");
          var keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split("+") : name;
          return createIndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray(keyPath), indexNum === 0, type2);
        });
      }
      var Version = (function() {
        function Version2() {
        }
        Version2.prototype._createTableSchema = function(name, primKey, indexes) {
          return createTableSchema(name, primKey, indexes);
        };
        Version2.prototype._parseIndexSyntax = function(primKeyAndIndexes) {
          return parseIndexSyntax(primKeyAndIndexes);
        };
        Version2.prototype._parseStoresSpec = function(stores, outSchema) {
          var _this = this;
          keys(stores).forEach(function(tableName) {
            if (stores[tableName] !== null) {
              var indexes = _this._parseIndexSyntax(stores[tableName]);
              var primKey = indexes.shift();
              if (!primKey) {
                throw new exceptions.Schema("Invalid schema for table " + tableName + ": " + stores[tableName]);
              }
              primKey.unique = true;
              if (primKey.multi)
                throw new exceptions.Schema("Primary key cannot be multiEntry*");
              indexes.forEach(function(idx) {
                if (idx.auto)
                  throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
                if (!idx.keyPath)
                  throw new exceptions.Schema("Index must have a name and cannot be an empty string");
              });
              var tblSchema = _this._createTableSchema(tableName, primKey, indexes);
              outSchema[tableName] = tblSchema;
            }
          });
        };
        Version2.prototype.stores = function(stores) {
          var db2 = this.db;
          this._cfg.storesSource = this._cfg.storesSource ? extend(this._cfg.storesSource, stores) : stores;
          var versions = db2._versions;
          var storesSpec = {};
          var dbschema = {};
          versions.forEach(function(version) {
            extend(storesSpec, version._cfg.storesSource);
            dbschema = version._cfg.dbschema = {};
            version._parseStoresSpec(storesSpec, dbschema);
          });
          db2._dbSchema = dbschema;
          removeTablesApi(db2, [db2._allTables, db2, db2.Transaction.prototype]);
          setApiOnPlace(db2, [db2._allTables, db2, db2.Transaction.prototype, this._cfg.tables], keys(dbschema), dbschema);
          db2._storeNames = keys(dbschema);
          return this;
        };
        Version2.prototype.upgrade = function(upgradeFunction) {
          this._cfg.contentUpgrade = promisableChain(this._cfg.contentUpgrade || nop, upgradeFunction);
          return this;
        };
        return Version2;
      })();
      function createVersionConstructor(db2) {
        return makeClassConstructor(Version.prototype, function Version2(versionNumber) {
          this.db = db2;
          this._cfg = {
            version: versionNumber,
            storesSource: null,
            dbschema: {},
            tables: {},
            contentUpgrade: null
          };
        });
      }
      var connections = createConnectionsManager();
      function createConnectionsManager() {
        if (typeof FinalizationRegistry !== "undefined" && typeof WeakRef !== "undefined") {
          var _refs_1 = /* @__PURE__ */ new Set();
          var _registry_1 = new FinalizationRegistry(function(ref) {
            _refs_1.delete(ref);
          });
          var toArray = function() {
            return Array.from(_refs_1).map(function(ref) {
              return ref.deref();
            }).filter(function(db2) {
              return db2 !== void 0;
            });
          };
          var add3 = function(db2) {
            var ref = new WeakRef(db2._novip);
            _refs_1.add(ref);
            _registry_1.register(db2._novip, ref, ref);
            if (_refs_1.size > db2._options.maxConnections) {
              var oldestRef = _refs_1.values().next().value;
              _refs_1.delete(oldestRef);
              _registry_1.unregister(oldestRef);
            }
          };
          var remove3 = function(db2) {
            if (!db2)
              return;
            var iterator = _refs_1.values();
            var result = iterator.next();
            while (!result.done) {
              var ref = result.value;
              if (ref.deref() === db2._novip) {
                _refs_1.delete(ref);
                _registry_1.unregister(ref);
                return;
              }
              result = iterator.next();
            }
          };
          return { toArray, add: add3, remove: remove3 };
        } else {
          var connections_1 = [];
          var toArray = function() {
            return connections_1;
          };
          var add3 = function(db2) {
            connections_1.push(db2._novip);
          };
          var remove3 = function(db2) {
            if (!db2)
              return;
            var index = connections_1.indexOf(db2._novip);
            if (index !== -1) {
              connections_1.splice(index, 1);
            }
          };
          return { toArray, add: add3, remove: remove3 };
        }
      }
      function getDbNamesTable(indexedDB2, IDBKeyRange) {
        var dbNamesDB = indexedDB2["_dbNamesDB"];
        if (!dbNamesDB) {
          dbNamesDB = indexedDB2["_dbNamesDB"] = new Dexie$1(DBNAMES_DB, {
            addons: [],
            indexedDB: indexedDB2,
            IDBKeyRange
          });
          dbNamesDB.version(1).stores({ dbnames: "name" });
        }
        return dbNamesDB.table("dbnames");
      }
      function hasDatabasesNative(indexedDB2) {
        return indexedDB2 && typeof indexedDB2.databases === "function";
      }
      function getDatabaseNames(_a2) {
        var indexedDB2 = _a2.indexedDB, IDBKeyRange = _a2.IDBKeyRange;
        return hasDatabasesNative(indexedDB2) ? Promise.resolve(indexedDB2.databases()).then(function(infos) {
          return infos.map(function(info) {
            return info.name;
          }).filter(function(name) {
            return name !== DBNAMES_DB;
          });
        }) : getDbNamesTable(indexedDB2, IDBKeyRange).toCollection().primaryKeys();
      }
      function _onDatabaseCreated(_a2, name) {
        var indexedDB2 = _a2.indexedDB, IDBKeyRange = _a2.IDBKeyRange;
        !hasDatabasesNative(indexedDB2) && name !== DBNAMES_DB && getDbNamesTable(indexedDB2, IDBKeyRange).put({ name }).catch(nop);
      }
      function _onDatabaseDeleted(_a2, name) {
        var indexedDB2 = _a2.indexedDB, IDBKeyRange = _a2.IDBKeyRange;
        !hasDatabasesNative(indexedDB2) && name !== DBNAMES_DB && getDbNamesTable(indexedDB2, IDBKeyRange).delete(name).catch(nop);
      }
      function vip(fn) {
        return newScope(function() {
          PSD.letThrough = true;
          return fn();
        });
      }
      function idbReady() {
        var isSafari = !navigator.userAgentData && /Safari\//.test(navigator.userAgent) && !/Chrom(e|ium)\//.test(navigator.userAgent);
        if (!isSafari || !indexedDB.databases)
          return Promise.resolve();
        var intervalId;
        return new Promise(function(resolve) {
          var tryIdb = function() {
            return indexedDB.databases().finally(resolve);
          };
          intervalId = setInterval(tryIdb, 100);
          tryIdb();
        }).finally(function() {
          return clearInterval(intervalId);
        });
      }
      var _a;
      function isEmptyRange(node) {
        return !("from" in node);
      }
      var RangeSet2 = function(fromOrTree, to) {
        if (this) {
          extend(this, arguments.length ? { d: 1, from: fromOrTree, to: arguments.length > 1 ? to : fromOrTree } : { d: 0 });
        } else {
          var rv = new RangeSet2();
          if (fromOrTree && "d" in fromOrTree) {
            extend(rv, fromOrTree);
          }
          return rv;
        }
      };
      props(RangeSet2.prototype, (_a = {
        add: function(rangeSet) {
          mergeRanges2(this, rangeSet);
          return this;
        },
        addKey: function(key) {
          addRange(this, key, key);
          return this;
        },
        addKeys: function(keys2) {
          var _this = this;
          keys2.forEach(function(key) {
            return addRange(_this, key, key);
          });
          return this;
        },
        hasKey: function(key) {
          var node = getRangeSetIterator(this).next(key).value;
          return node && cmp2(node.from, key) <= 0 && cmp2(node.to, key) >= 0;
        }
      }, _a[iteratorSymbol] = function() {
        return getRangeSetIterator(this);
      }, _a));
      function addRange(target, from, to) {
        var diff = cmp2(from, to);
        if (isNaN(diff))
          return;
        if (diff > 0)
          throw RangeError();
        if (isEmptyRange(target))
          return extend(target, { from, to, d: 1 });
        var left = target.l;
        var right = target.r;
        if (cmp2(to, target.from) < 0) {
          left ? addRange(left, from, to) : target.l = { from, to, d: 1, l: null, r: null };
          return rebalance(target);
        }
        if (cmp2(from, target.to) > 0) {
          right ? addRange(right, from, to) : target.r = { from, to, d: 1, l: null, r: null };
          return rebalance(target);
        }
        if (cmp2(from, target.from) < 0) {
          target.from = from;
          target.l = null;
          target.d = right ? right.d + 1 : 1;
        }
        if (cmp2(to, target.to) > 0) {
          target.to = to;
          target.r = null;
          target.d = target.l ? target.l.d + 1 : 1;
        }
        var rightWasCutOff = !target.r;
        if (left && !target.l) {
          mergeRanges2(target, left);
        }
        if (right && rightWasCutOff) {
          mergeRanges2(target, right);
        }
      }
      function mergeRanges2(target, newSet) {
        function _addRangeSet(target2, _a2) {
          var from = _a2.from, to = _a2.to, l = _a2.l, r = _a2.r;
          addRange(target2, from, to);
          if (l)
            _addRangeSet(target2, l);
          if (r)
            _addRangeSet(target2, r);
        }
        if (!isEmptyRange(newSet))
          _addRangeSet(target, newSet);
      }
      function rangesOverlap2(rangeSet1, rangeSet2) {
        var i1 = getRangeSetIterator(rangeSet2);
        var nextResult1 = i1.next();
        if (nextResult1.done)
          return false;
        var a = nextResult1.value;
        var i2 = getRangeSetIterator(rangeSet1);
        var nextResult2 = i2.next(a.from);
        var b = nextResult2.value;
        while (!nextResult1.done && !nextResult2.done) {
          if (cmp2(b.from, a.to) <= 0 && cmp2(b.to, a.from) >= 0)
            return true;
          cmp2(a.from, b.from) < 0 ? a = (nextResult1 = i1.next(b.from)).value : b = (nextResult2 = i2.next(a.from)).value;
        }
        return false;
      }
      function getRangeSetIterator(node) {
        var state = isEmptyRange(node) ? null : { s: 0, n: node };
        return {
          next: function(key) {
            var keyProvided = arguments.length > 0;
            while (state) {
              switch (state.s) {
                case 0:
                  state.s = 1;
                  if (keyProvided) {
                    while (state.n.l && cmp2(key, state.n.from) < 0)
                      state = { up: state, n: state.n.l, s: 1 };
                  } else {
                    while (state.n.l)
                      state = { up: state, n: state.n.l, s: 1 };
                  }
                case 1:
                  state.s = 2;
                  if (!keyProvided || cmp2(key, state.n.to) <= 0)
                    return { value: state.n, done: false };
                case 2:
                  if (state.n.r) {
                    state.s = 3;
                    state = { up: state, n: state.n.r, s: 0 };
                    continue;
                  }
                case 3:
                  state = state.up;
              }
            }
            return { done: true };
          }
        };
      }
      function rebalance(target) {
        var _a2, _b;
        var diff = (((_a2 = target.r) === null || _a2 === void 0 ? void 0 : _a2.d) || 0) - (((_b = target.l) === null || _b === void 0 ? void 0 : _b.d) || 0);
        var r = diff > 1 ? "r" : diff < -1 ? "l" : "";
        if (r) {
          var l = r === "r" ? "l" : "r";
          var rootClone = __assign({}, target);
          var oldRootRight = target[r];
          target.from = oldRootRight.from;
          target.to = oldRootRight.to;
          target[r] = oldRootRight[r];
          rootClone[r] = oldRootRight[l];
          target[l] = rootClone;
          rootClone.d = computeDepth(rootClone);
        }
        target.d = computeDepth(target);
      }
      function computeDepth(_a2) {
        var r = _a2.r, l = _a2.l;
        return (r ? l ? Math.max(r.d, l.d) : r.d : l ? l.d : 0) + 1;
      }
      function extendObservabilitySet(target, newSet) {
        keys(newSet).forEach(function(part) {
          if (target[part])
            mergeRanges2(target[part], newSet[part]);
          else
            target[part] = cloneSimpleObjectTree(newSet[part]);
        });
        return target;
      }
      function obsSetsOverlap(os1, os2) {
        return os1.all || os2.all || Object.keys(os1).some(function(key) {
          return os2[key] && rangesOverlap2(os2[key], os1[key]);
        });
      }
      var cache = {};
      var unsignaledParts = {};
      var isTaskEnqueued = false;
      function signalSubscribersLazily(part, optimistic) {
        extendObservabilitySet(unsignaledParts, part);
        if (!isTaskEnqueued) {
          isTaskEnqueued = true;
          setTimeout(function() {
            isTaskEnqueued = false;
            var parts = unsignaledParts;
            unsignaledParts = {};
            signalSubscribersNow(parts, false);
          }, 0);
        }
      }
      function signalSubscribersNow(updatedParts, deleteAffectedCacheEntries) {
        if (deleteAffectedCacheEntries === void 0) {
          deleteAffectedCacheEntries = false;
        }
        var queriesToSignal = /* @__PURE__ */ new Set();
        if (updatedParts.all) {
          for (var _i = 0, _a2 = Object.values(cache); _i < _a2.length; _i++) {
            var tblCache = _a2[_i];
            collectTableSubscribers(tblCache, updatedParts, queriesToSignal, deleteAffectedCacheEntries);
          }
        } else {
          for (var key in updatedParts) {
            var parts = /^idb\:\/\/(.*)\/(.*)\//.exec(key);
            if (parts) {
              var dbName = parts[1], tableName = parts[2];
              var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
              if (tblCache)
                collectTableSubscribers(tblCache, updatedParts, queriesToSignal, deleteAffectedCacheEntries);
            }
          }
        }
        queriesToSignal.forEach(function(requery) {
          return requery();
        });
      }
      function collectTableSubscribers(tblCache, updatedParts, outQueriesToSignal, deleteAffectedCacheEntries) {
        var updatedEntryLists = [];
        for (var _i = 0, _a2 = Object.entries(tblCache.queries.query); _i < _a2.length; _i++) {
          var _b = _a2[_i], indexName = _b[0], entries = _b[1];
          var filteredEntries = [];
          for (var _c = 0, entries_1 = entries; _c < entries_1.length; _c++) {
            var entry = entries_1[_c];
            if (obsSetsOverlap(updatedParts, entry.obsSet)) {
              entry.subscribers.forEach(function(requery) {
                return outQueriesToSignal.add(requery);
              });
            } else if (deleteAffectedCacheEntries) {
              filteredEntries.push(entry);
            }
          }
          if (deleteAffectedCacheEntries)
            updatedEntryLists.push([indexName, filteredEntries]);
        }
        if (deleteAffectedCacheEntries) {
          for (var _d = 0, updatedEntryLists_1 = updatedEntryLists; _d < updatedEntryLists_1.length; _d++) {
            var _e = updatedEntryLists_1[_d], indexName = _e[0], filteredEntries = _e[1];
            tblCache.queries.query[indexName] = filteredEntries;
          }
        }
      }
      function dexieOpen(db2) {
        var state = db2._state;
        var indexedDB2 = db2._deps.indexedDB;
        if (state.isBeingOpened || db2.idbdb)
          return state.dbReadyPromise.then(function() {
            return state.dbOpenError ? rejection(state.dbOpenError) : db2;
          });
        state.isBeingOpened = true;
        state.dbOpenError = null;
        state.openComplete = false;
        var openCanceller = state.openCanceller;
        var nativeVerToOpen = Math.round(db2.verno * 10);
        var schemaPatchMode = false;
        function throwIfCancelled() {
          if (state.openCanceller !== openCanceller)
            throw new exceptions.DatabaseClosed("db.open() was cancelled");
        }
        var resolveDbReady = state.dbReadyResolve, upgradeTransaction = null, wasCreated = false;
        var tryOpenDB = function() {
          return new DexiePromise(function(resolve, reject) {
            throwIfCancelled();
            if (!indexedDB2)
              throw new exceptions.MissingAPI();
            var dbName = db2.name;
            var req = state.autoSchema || !nativeVerToOpen ? indexedDB2.open(dbName) : indexedDB2.open(dbName, nativeVerToOpen);
            if (!req)
              throw new exceptions.MissingAPI();
            req.onerror = eventRejectHandler(reject);
            req.onblocked = wrap(db2._fireOnBlocked);
            req.onupgradeneeded = wrap(function(e) {
              upgradeTransaction = req.transaction;
              if (state.autoSchema && !db2._options.allowEmptyDB) {
                req.onerror = preventDefault;
                upgradeTransaction.abort();
                req.result.close();
                var delreq = indexedDB2.deleteDatabase(dbName);
                delreq.onsuccess = delreq.onerror = wrap(function() {
                  reject(new exceptions.NoSuchDatabase("Database ".concat(dbName, " doesnt exist")));
                });
              } else {
                upgradeTransaction.onerror = eventRejectHandler(reject);
                var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion;
                wasCreated = oldVer < 1;
                db2.idbdb = req.result;
                if (schemaPatchMode) {
                  patchCurrentVersion(db2, upgradeTransaction);
                }
                runUpgraders(db2, oldVer / 10, upgradeTransaction, reject);
              }
            }, reject);
            req.onsuccess = wrap(function() {
              upgradeTransaction = null;
              var idbdb = db2.idbdb = req.result;
              var objectStoreNames = slice(idbdb.objectStoreNames);
              if (objectStoreNames.length > 0)
                try {
                  var tmpTrans = idbdb.transaction(safariMultiStoreFix(objectStoreNames), "readonly");
                  if (state.autoSchema)
                    readGlobalSchema(db2, idbdb, tmpTrans);
                  else {
                    adjustToExistingIndexNames(db2, db2._dbSchema, tmpTrans);
                    if (!verifyInstalledSchema(db2, tmpTrans) && !schemaPatchMode) {
                      console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this.");
                      idbdb.close();
                      nativeVerToOpen = idbdb.version + 1;
                      schemaPatchMode = true;
                      return resolve(tryOpenDB());
                    }
                  }
                  generateMiddlewareStacks(db2, tmpTrans);
                } catch (e) {
                }
              connections.add(db2);
              idbdb.onversionchange = wrap(function(ev) {
                state.vcFired = true;
                db2.on("versionchange").fire(ev);
              });
              idbdb.onclose = wrap(function() {
                db2.close({ disableAutoOpen: false });
              });
              if (wasCreated)
                _onDatabaseCreated(db2._deps, dbName);
              resolve();
            }, reject);
          }).catch(function(err) {
            switch (err === null || err === void 0 ? void 0 : err.name) {
              case "UnknownError":
                if (state.PR1398_maxLoop > 0) {
                  state.PR1398_maxLoop--;
                  console.warn("Dexie: Workaround for Chrome UnknownError on open()");
                  return tryOpenDB();
                }
                break;
              case "VersionError":
                if (nativeVerToOpen > 0) {
                  nativeVerToOpen = 0;
                  return tryOpenDB();
                }
                break;
            }
            return DexiePromise.reject(err);
          });
        };
        return DexiePromise.race([
          openCanceller,
          (typeof navigator === "undefined" ? DexiePromise.resolve() : idbReady()).then(tryOpenDB)
        ]).then(function() {
          throwIfCancelled();
          state.onReadyBeingFired = [];
          return DexiePromise.resolve(vip(function() {
            return db2.on.ready.fire(db2.vip);
          })).then(function fireRemainders() {
            if (state.onReadyBeingFired.length > 0) {
              var remainders_1 = state.onReadyBeingFired.reduce(promisableChain, nop);
              state.onReadyBeingFired = [];
              return DexiePromise.resolve(vip(function() {
                return remainders_1(db2.vip);
              })).then(fireRemainders);
            }
          });
        }).finally(function() {
          if (state.openCanceller === openCanceller) {
            state.onReadyBeingFired = null;
            state.isBeingOpened = false;
          }
        }).catch(function(err) {
          state.dbOpenError = err;
          try {
            upgradeTransaction && upgradeTransaction.abort();
          } catch (_a2) {
          }
          if (openCanceller === state.openCanceller) {
            db2._close();
          }
          return rejection(err);
        }).finally(function() {
          state.openComplete = true;
          resolveDbReady();
        }).then(function() {
          if (wasCreated) {
            var everything_1 = {};
            db2.tables.forEach(function(table) {
              table.schema.indexes.forEach(function(idx) {
                if (idx.name)
                  everything_1["idb://".concat(db2.name, "/").concat(table.name, "/").concat(idx.name)] = new RangeSet2(-Infinity, [[[]]]);
              });
              everything_1["idb://".concat(db2.name, "/").concat(table.name, "/")] = everything_1["idb://".concat(db2.name, "/").concat(table.name, "/:dels")] = new RangeSet2(-Infinity, [[[]]]);
            });
            globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME).fire(everything_1);
            signalSubscribersNow(everything_1, true);
          }
          return db2;
        });
      }
      function awaitIterator(iterator) {
        var callNext = function(result) {
          return iterator.next(result);
        }, doThrow = function(error) {
          return iterator.throw(error);
        }, onSuccess = step(callNext), onError = step(doThrow);
        function step(getNext) {
          return function(val) {
            var next = getNext(val), value = next.value;
            return next.done ? value : !value || typeof value.then !== "function" ? isArray(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) : value.then(onSuccess, onError);
          };
        }
        return step(callNext)();
      }
      function extractTransactionArgs(mode, _tableArgs_, scopeFunc) {
        var i = arguments.length;
        if (i < 2)
          throw new exceptions.InvalidArgument("Too few arguments");
        var args = new Array(i - 1);
        while (--i)
          args[i - 1] = arguments[i];
        scopeFunc = args.pop();
        var tables = flatten(args);
        return [mode, tables, scopeFunc];
      }
      function enterTransactionScope(db2, mode, storeNames, parentTransaction, scopeFunc) {
        return DexiePromise.resolve().then(function() {
          var transless = PSD.transless || PSD;
          var trans = db2._createTransaction(mode, storeNames, db2._dbSchema, parentTransaction);
          trans.explicit = true;
          var zoneProps = {
            trans,
            transless
          };
          if (parentTransaction) {
            trans.idbtrans = parentTransaction.idbtrans;
          } else {
            try {
              trans.create();
              trans.idbtrans._explicit = true;
              db2._state.PR1398_maxLoop = 3;
            } catch (ex) {
              if (ex.name === errnames.InvalidState && db2.isOpen() && --db2._state.PR1398_maxLoop > 0) {
                console.warn("Dexie: Need to reopen db");
                db2.close({ disableAutoOpen: false });
                return db2.open().then(function() {
                  return enterTransactionScope(db2, mode, storeNames, null, scopeFunc);
                });
              }
              return rejection(ex);
            }
          }
          var scopeFuncIsAsync = isAsyncFunction(scopeFunc);
          if (scopeFuncIsAsync) {
            incrementExpectedAwaits();
          }
          var returnValue;
          var promiseFollowed = DexiePromise.follow(function() {
            returnValue = scopeFunc.call(trans, trans);
            if (returnValue) {
              if (scopeFuncIsAsync) {
                var decrementor = decrementExpectedAwaits.bind(null, null);
                returnValue.then(decrementor, decrementor);
              } else if (typeof returnValue.next === "function" && typeof returnValue.throw === "function") {
                returnValue = awaitIterator(returnValue);
              }
            }
          }, zoneProps);
          return (returnValue && typeof returnValue.then === "function" ? DexiePromise.resolve(returnValue).then(function(x) {
            return trans.active ? x : rejection(new exceptions.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
          }) : promiseFollowed.then(function() {
            return returnValue;
          })).then(function(x) {
            if (parentTransaction)
              trans._resolve();
            return trans._completion.then(function() {
              return x;
            });
          }).catch(function(e) {
            trans._reject(e);
            return rejection(e);
          });
        });
      }
      function pad(a, value, count) {
        var result = isArray(a) ? a.slice() : [a];
        for (var i = 0; i < count; ++i)
          result.push(value);
        return result;
      }
      function createVirtualIndexMiddleware(down) {
        return __assign(__assign({}, down), { table: function(tableName) {
          var table = down.table(tableName);
          var schema = table.schema;
          var indexLookup = /* @__PURE__ */ Object.create(null);
          var allVirtualIndexes = [];
          function addVirtualIndexes(keyPath, keyTail, lowLevelIndex) {
            var keyPathAlias = getKeyPathAlias(keyPath);
            var indexList = indexLookup[keyPathAlias] = indexLookup[keyPathAlias] || [];
            var keyLength = keyPath == null ? 0 : typeof keyPath === "string" ? 1 : keyPath.length;
            var isVirtual = keyTail > 0;
            var virtualIndex = __assign(__assign({}, lowLevelIndex), { name: isVirtual ? "".concat(keyPathAlias, "(virtual-from:").concat(lowLevelIndex.name, ")") : lowLevelIndex.name, lowLevelIndex, isVirtual, keyTail, keyLength, extractKey: getKeyExtractor(keyPath), unique: !isVirtual && lowLevelIndex.unique });
            indexList.push(virtualIndex);
            if (!virtualIndex.isPrimaryKey) {
              allVirtualIndexes.push(virtualIndex);
            }
            if (keyLength > 1) {
              var virtualKeyPath = keyLength === 2 ? keyPath[0] : keyPath.slice(0, keyLength - 1);
              addVirtualIndexes(virtualKeyPath, keyTail + 1, lowLevelIndex);
            }
            indexList.sort(function(a, b) {
              return a.keyTail - b.keyTail;
            });
            return virtualIndex;
          }
          var primaryKey = addVirtualIndexes(schema.primaryKey.keyPath, 0, schema.primaryKey);
          indexLookup[":id"] = [primaryKey];
          for (var _i = 0, _a2 = schema.indexes; _i < _a2.length; _i++) {
            var index = _a2[_i];
            addVirtualIndexes(index.keyPath, 0, index);
          }
          function findBestIndex(keyPath) {
            var result2 = indexLookup[getKeyPathAlias(keyPath)];
            return result2 && result2[0];
          }
          function translateRange(range, keyTail) {
            return {
              type: range.type === 1 ? 2 : range.type,
              lower: pad(range.lower, range.lowerOpen ? down.MAX_KEY : down.MIN_KEY, keyTail),
              lowerOpen: true,
              upper: pad(range.upper, range.upperOpen ? down.MIN_KEY : down.MAX_KEY, keyTail),
              upperOpen: true
            };
          }
          function translateRequest(req) {
            var index2 = req.query.index;
            return index2.isVirtual ? __assign(__assign({}, req), { query: {
              index: index2.lowLevelIndex,
              range: translateRange(req.query.range, index2.keyTail)
            } }) : req;
          }
          var result = __assign(__assign({}, table), { schema: __assign(__assign({}, schema), { primaryKey, indexes: allVirtualIndexes, getIndexByKeyPath: findBestIndex }), count: function(req) {
            return table.count(translateRequest(req));
          }, query: function(req) {
            return table.query(translateRequest(req));
          }, openCursor: function(req) {
            var _a3 = req.query.index, keyTail = _a3.keyTail, isVirtual = _a3.isVirtual, keyLength = _a3.keyLength;
            if (!isVirtual)
              return table.openCursor(req);
            function createVirtualCursor(cursor) {
              function _continue(key) {
                key != null ? cursor.continue(pad(key, req.reverse ? down.MAX_KEY : down.MIN_KEY, keyTail)) : req.unique ? cursor.continue(cursor.key.slice(0, keyLength).concat(req.reverse ? down.MIN_KEY : down.MAX_KEY, keyTail)) : cursor.continue();
              }
              var virtualCursor = Object.create(cursor, {
                continue: { value: _continue },
                continuePrimaryKey: {
                  value: function(key, primaryKey2) {
                    cursor.continuePrimaryKey(pad(key, down.MAX_KEY, keyTail), primaryKey2);
                  }
                },
                primaryKey: {
                  get: function() {
                    return cursor.primaryKey;
                  }
                },
                key: {
                  get: function() {
                    var key = cursor.key;
                    return keyLength === 1 ? key[0] : key.slice(0, keyLength);
                  }
                },
                value: {
                  get: function() {
                    return cursor.value;
                  }
                }
              });
              return virtualCursor;
            }
            return table.openCursor(translateRequest(req)).then(function(cursor) {
              return cursor && createVirtualCursor(cursor);
            });
          } });
          return result;
        } });
      }
      var virtualIndexMiddleware = {
        stack: "dbcore",
        name: "VirtualIndexMiddleware",
        level: 1,
        create: createVirtualIndexMiddleware
      };
      function getObjectDiff(a, b, rv, prfx) {
        rv = rv || {};
        prfx = prfx || "";
        keys(a).forEach(function(prop) {
          if (!hasOwn(b, prop)) {
            rv[prfx + prop] = void 0;
          } else {
            var ap = a[prop], bp = b[prop];
            if (typeof ap === "object" && typeof bp === "object" && ap && bp) {
              var apTypeName = toStringTag(ap);
              var bpTypeName = toStringTag(bp);
              if (apTypeName !== bpTypeName) {
                rv[prfx + prop] = b[prop];
              } else if (apTypeName === "Object") {
                getObjectDiff(ap, bp, rv, prfx + prop + ".");
              } else if (ap !== bp) {
                rv[prfx + prop] = b[prop];
              }
            } else if (ap !== bp)
              rv[prfx + prop] = b[prop];
          }
        });
        keys(b).forEach(function(prop) {
          if (!hasOwn(a, prop)) {
            rv[prfx + prop] = b[prop];
          }
        });
        return rv;
      }
      function getEffectiveKeys(primaryKey, req) {
        if (req.type === "delete")
          return req.keys;
        return req.keys || req.values.map(primaryKey.extractKey);
      }
      var hooksMiddleware = {
        stack: "dbcore",
        name: "HooksMiddleware",
        level: 2,
        create: function(downCore) {
          return __assign(__assign({}, downCore), { table: function(tableName) {
            var downTable = downCore.table(tableName);
            var primaryKey = downTable.schema.primaryKey;
            var tableMiddleware = __assign(__assign({}, downTable), { mutate: function(req) {
              var dxTrans = PSD.trans;
              var _a2 = dxTrans.table(tableName).hook, deleting = _a2.deleting, creating = _a2.creating, updating = _a2.updating;
              switch (req.type) {
                case "add":
                  if (creating.fire === nop)
                    break;
                  return dxTrans._promise("readwrite", function() {
                    return addPutOrDelete(req);
                  }, true);
                case "put":
                  if (creating.fire === nop && updating.fire === nop)
                    break;
                  return dxTrans._promise("readwrite", function() {
                    return addPutOrDelete(req);
                  }, true);
                case "delete":
                  if (deleting.fire === nop)
                    break;
                  return dxTrans._promise("readwrite", function() {
                    return addPutOrDelete(req);
                  }, true);
                case "deleteRange":
                  if (deleting.fire === nop)
                    break;
                  return dxTrans._promise("readwrite", function() {
                    return deleteRange(req);
                  }, true);
              }
              return downTable.mutate(req);
              function addPutOrDelete(req2) {
                var dxTrans2 = PSD.trans;
                var keys2 = req2.keys || getEffectiveKeys(primaryKey, req2);
                if (!keys2)
                  throw new Error("Keys missing");
                req2 = req2.type === "add" || req2.type === "put" ? __assign(__assign({}, req2), { keys: keys2 }) : __assign({}, req2);
                if (req2.type !== "delete")
                  req2.values = __spreadArray([], req2.values, true);
                if (req2.keys)
                  req2.keys = __spreadArray([], req2.keys, true);
                return getExistingValues(downTable, req2, keys2).then(function(existingValues) {
                  var contexts = keys2.map(function(key, i) {
                    var existingValue = existingValues[i];
                    var ctx = { onerror: null, onsuccess: null };
                    if (req2.type === "delete") {
                      deleting.fire.call(ctx, key, existingValue, dxTrans2);
                    } else if (req2.type === "add" || existingValue === void 0) {
                      var generatedPrimaryKey = creating.fire.call(ctx, key, req2.values[i], dxTrans2);
                      if (key == null && generatedPrimaryKey != null) {
                        key = generatedPrimaryKey;
                        req2.keys[i] = key;
                        if (!primaryKey.outbound) {
                          setByKeyPath(req2.values[i], primaryKey.keyPath, key);
                        }
                      }
                    } else {
                      var objectDiff = getObjectDiff(existingValue, req2.values[i]);
                      var additionalChanges_1 = updating.fire.call(ctx, objectDiff, key, existingValue, dxTrans2);
                      if (additionalChanges_1) {
                        var requestedValue_1 = req2.values[i];
                        Object.keys(additionalChanges_1).forEach(function(keyPath) {
                          if (hasOwn(requestedValue_1, keyPath)) {
                            requestedValue_1[keyPath] = additionalChanges_1[keyPath];
                          } else {
                            setByKeyPath(requestedValue_1, keyPath, additionalChanges_1[keyPath]);
                          }
                        });
                      }
                    }
                    return ctx;
                  });
                  return downTable.mutate(req2).then(function(_a3) {
                    var failures = _a3.failures, results = _a3.results, numFailures = _a3.numFailures, lastResult = _a3.lastResult;
                    for (var i = 0; i < keys2.length; ++i) {
                      var primKey = results ? results[i] : keys2[i];
                      var ctx = contexts[i];
                      if (primKey == null) {
                        ctx.onerror && ctx.onerror(failures[i]);
                      } else {
                        ctx.onsuccess && ctx.onsuccess(
                          req2.type === "put" && existingValues[i] ? req2.values[i] : primKey
                        );
                      }
                    }
                    return { failures, results, numFailures, lastResult };
                  }).catch(function(error) {
                    contexts.forEach(function(ctx) {
                      return ctx.onerror && ctx.onerror(error);
                    });
                    return Promise.reject(error);
                  });
                });
              }
              function deleteRange(req2) {
                return deleteNextChunk(req2.trans, req2.range, 1e4);
              }
              function deleteNextChunk(trans, range, limit) {
                return downTable.query({
                  trans,
                  values: false,
                  query: { index: primaryKey, range },
                  limit
                }).then(function(_a3) {
                  var result = _a3.result;
                  return addPutOrDelete({
                    type: "delete",
                    keys: result,
                    trans
                  }).then(function(res) {
                    if (res.numFailures > 0)
                      return Promise.reject(res.failures[0]);
                    if (result.length < limit) {
                      return {
                        failures: [],
                        numFailures: 0,
                        lastResult: void 0
                      };
                    } else {
                      return deleteNextChunk(trans, __assign(__assign({}, range), { lower: result[result.length - 1], lowerOpen: true }), limit);
                    }
                  });
                });
              }
            } });
            return tableMiddleware;
          } });
        }
      };
      function getExistingValues(table, req, effectiveKeys) {
        return req.type === "add" ? Promise.resolve([]) : table.getMany({
          trans: req.trans,
          keys: effectiveKeys,
          cache: "immutable"
        });
      }
      function getFromTransactionCache(keys2, cache2, clone) {
        try {
          if (!cache2)
            return null;
          if (cache2.keys.length < keys2.length)
            return null;
          var result = [];
          for (var i = 0, j = 0; i < cache2.keys.length && j < keys2.length; ++i) {
            if (cmp2(cache2.keys[i], keys2[j]) !== 0)
              continue;
            result.push(clone ? deepClone(cache2.values[i]) : cache2.values[i]);
            ++j;
          }
          return result.length === keys2.length ? result : null;
        } catch (_a2) {
          return null;
        }
      }
      var cacheExistingValuesMiddleware = {
        stack: "dbcore",
        level: -1,
        create: function(core) {
          return {
            table: function(tableName) {
              var table = core.table(tableName);
              return __assign(__assign({}, table), { getMany: function(req) {
                if (!req.cache) {
                  return table.getMany(req);
                }
                var cachedResult = getFromTransactionCache(req.keys, req.trans["_cache"], req.cache === "clone");
                if (cachedResult) {
                  return DexiePromise.resolve(cachedResult);
                }
                return table.getMany(req).then(function(res) {
                  req.trans["_cache"] = {
                    keys: req.keys,
                    values: req.cache === "clone" ? deepClone(res) : res
                  };
                  return res;
                });
              }, mutate: function(req) {
                if (req.type !== "add")
                  req.trans["_cache"] = null;
                return table.mutate(req);
              } });
            }
          };
        }
      };
      function isCachableContext(ctx, table) {
        return ctx.trans.mode === "readonly" && !!ctx.subscr && !ctx.trans.explicit && ctx.trans.db._options.cache !== "disabled" && !table.schema.primaryKey.outbound;
      }
      function isCachableRequest(type2, req) {
        switch (type2) {
          case "query":
            return req.values && !req.unique;
          case "get":
            return false;
          case "getMany":
            return false;
          case "count":
            return false;
          case "openCursor":
            return false;
        }
      }
      var observabilityMiddleware = {
        stack: "dbcore",
        level: 0,
        name: "Observability",
        create: function(core) {
          var dbName = core.schema.name;
          var FULL_RANGE = new RangeSet2(core.MIN_KEY, core.MAX_KEY);
          return __assign(__assign({}, core), { transaction: function(stores, mode, options) {
            if (PSD.subscr && mode !== "readonly") {
              throw new exceptions.ReadOnly("Readwrite transaction in liveQuery context. Querier source: ".concat(PSD.querier));
            }
            return core.transaction(stores, mode, options);
          }, table: function(tableName) {
            var table = core.table(tableName);
            var schema = table.schema;
            var primaryKey = schema.primaryKey, indexes = schema.indexes;
            var extractKey = primaryKey.extractKey, outbound = primaryKey.outbound;
            var indexesWithAutoIncPK = primaryKey.autoIncrement && indexes.filter(function(index) {
              return index.compound && index.keyPath.includes(primaryKey.keyPath);
            });
            var tableClone = __assign(__assign({}, table), { mutate: function(req) {
              var _a2, _b;
              var trans = req.trans;
              var mutatedParts = req.mutatedParts || (req.mutatedParts = {});
              var getRangeSet = function(indexName) {
                var part = "idb://".concat(dbName, "/").concat(tableName, "/").concat(indexName);
                return mutatedParts[part] || (mutatedParts[part] = new RangeSet2());
              };
              var pkRangeSet = getRangeSet("");
              var delsRangeSet = getRangeSet(":dels");
              var type2 = req.type;
              var _c = req.type === "deleteRange" ? [req.range] : req.type === "delete" ? [req.keys] : req.values.length < 50 ? [
                getEffectiveKeys(primaryKey, req).filter(function(id2) {
                  return id2;
                }),
                req.values
              ] : [], keys2 = _c[0], newObjs = _c[1];
              var oldCache = req.trans["_cache"];
              if (isArray(keys2)) {
                pkRangeSet.addKeys(keys2);
                var oldObjs = type2 === "delete" || keys2.length === newObjs.length ? getFromTransactionCache(keys2, oldCache) : null;
                if (!oldObjs) {
                  delsRangeSet.addKeys(keys2);
                }
                if (oldObjs || newObjs) {
                  trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs);
                }
              } else if (keys2) {
                var range = {
                  from: (_a2 = keys2.lower) !== null && _a2 !== void 0 ? _a2 : core.MIN_KEY,
                  to: (_b = keys2.upper) !== null && _b !== void 0 ? _b : core.MAX_KEY
                };
                delsRangeSet.add(range);
                pkRangeSet.add(range);
              } else {
                pkRangeSet.add(FULL_RANGE);
                delsRangeSet.add(FULL_RANGE);
                schema.indexes.forEach(function(idx) {
                  return getRangeSet(idx.name).add(FULL_RANGE);
                });
              }
              return table.mutate(req).then(function(res) {
                if (keys2 && (req.type === "add" || req.type === "put")) {
                  pkRangeSet.addKeys(res.results);
                  if (indexesWithAutoIncPK) {
                    indexesWithAutoIncPK.forEach(function(idx) {
                      var idxVals = req.values.map(function(v) {
                        return idx.extractKey(v);
                      });
                      var pkPos = idx.keyPath.findIndex(function(prop) {
                        return prop === primaryKey.keyPath;
                      });
                      for (var i = 0, len = res.results.length; i < len; ++i) {
                        idxVals[i][pkPos] = res.results[i];
                      }
                      getRangeSet(idx.name).addKeys(idxVals);
                    });
                  }
                }
                trans.mutatedParts = extendObservabilitySet(trans.mutatedParts || {}, mutatedParts);
                return res;
              });
            } });
            var getRange = function(_a2) {
              var _b, _c;
              var _d = _a2.query, index = _d.index, range = _d.range;
              return [
                index,
                new RangeSet2((_b = range.lower) !== null && _b !== void 0 ? _b : core.MIN_KEY, (_c = range.upper) !== null && _c !== void 0 ? _c : core.MAX_KEY)
              ];
            };
            var readSubscribers = {
              get: function(req) {
                return [primaryKey, new RangeSet2(req.key)];
              },
              getMany: function(req) {
                return [primaryKey, new RangeSet2().addKeys(req.keys)];
              },
              count: getRange,
              query: getRange,
              openCursor: getRange
            };
            keys(readSubscribers).forEach(function(method) {
              tableClone[method] = function(req) {
                var subscr = PSD.subscr;
                var isLiveQuery = !!subscr;
                var cachable = isCachableContext(PSD, table) && isCachableRequest(method, req);
                var obsSet = cachable ? req.obsSet = {} : subscr;
                if (isLiveQuery) {
                  var getRangeSet = function(indexName) {
                    var part = "idb://".concat(dbName, "/").concat(tableName, "/").concat(indexName);
                    return obsSet[part] || (obsSet[part] = new RangeSet2());
                  };
                  var pkRangeSet_1 = getRangeSet("");
                  var delsRangeSet_1 = getRangeSet(":dels");
                  var _a2 = readSubscribers[method](req), queriedIndex = _a2[0], queriedRanges = _a2[1];
                  if (method === "query" && queriedIndex.isPrimaryKey && !req.values) {
                    delsRangeSet_1.add(queriedRanges);
                  } else {
                    getRangeSet(queriedIndex.name || "").add(queriedRanges);
                  }
                  if (!queriedIndex.isPrimaryKey) {
                    if (method === "count") {
                      delsRangeSet_1.add(FULL_RANGE);
                    } else {
                      var keysPromise_1 = method === "query" && outbound && req.values && table.query(__assign(__assign({}, req), { values: false }));
                      return table[method].apply(this, arguments).then(function(res) {
                        if (method === "query") {
                          if (outbound && req.values) {
                            return keysPromise_1.then(function(_a3) {
                              var resultingKeys = _a3.result;
                              pkRangeSet_1.addKeys(resultingKeys);
                              return res;
                            });
                          }
                          var pKeys = req.values ? res.result.map(extractKey) : res.result;
                          if (req.values) {
                            pkRangeSet_1.addKeys(pKeys);
                          } else {
                            delsRangeSet_1.addKeys(pKeys);
                          }
                        } else if (method === "openCursor") {
                          var cursor_1 = res;
                          var wantValues_1 = req.values;
                          return cursor_1 && Object.create(cursor_1, {
                            key: {
                              get: function() {
                                delsRangeSet_1.addKey(cursor_1.primaryKey);
                                return cursor_1.key;
                              }
                            },
                            primaryKey: {
                              get: function() {
                                var pkey = cursor_1.primaryKey;
                                delsRangeSet_1.addKey(pkey);
                                return pkey;
                              }
                            },
                            value: {
                              get: function() {
                                wantValues_1 && pkRangeSet_1.addKey(cursor_1.primaryKey);
                                return cursor_1.value;
                              }
                            }
                          });
                        }
                        return res;
                      });
                    }
                  }
                }
                return table[method].apply(this, arguments);
              };
            });
            return tableClone;
          } });
        }
      };
      function trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs) {
        function addAffectedIndex(ix) {
          var rangeSet = getRangeSet(ix.name || "");
          function extractKey(obj) {
            return obj != null ? ix.extractKey(obj) : null;
          }
          var addKeyOrKeys = function(key) {
            return ix.multiEntry && isArray(key) ? key.forEach(function(key2) {
              return rangeSet.addKey(key2);
            }) : rangeSet.addKey(key);
          };
          (oldObjs || newObjs).forEach(function(_, i) {
            var oldKey = oldObjs && extractKey(oldObjs[i]);
            var newKey = newObjs && extractKey(newObjs[i]);
            if (cmp2(oldKey, newKey) !== 0) {
              if (oldKey != null)
                addKeyOrKeys(oldKey);
              if (newKey != null)
                addKeyOrKeys(newKey);
            }
          });
        }
        schema.indexes.forEach(addAffectedIndex);
      }
      function adjustOptimisticFromFailures(tblCache, req, res) {
        if (res.numFailures === 0)
          return req;
        if (req.type === "deleteRange") {
          return null;
        }
        var numBulkOps = req.keys ? req.keys.length : "values" in req && req.values ? req.values.length : 1;
        if (res.numFailures === numBulkOps) {
          return null;
        }
        var clone = __assign({}, req);
        if (isArray(clone.keys)) {
          clone.keys = clone.keys.filter(function(_, i) {
            return !(i in res.failures);
          });
        }
        if ("values" in clone && isArray(clone.values)) {
          clone.values = clone.values.filter(function(_, i) {
            return !(i in res.failures);
          });
        }
        return clone;
      }
      function isAboveLower(key, range) {
        return range.lower === void 0 ? true : range.lowerOpen ? cmp2(key, range.lower) > 0 : cmp2(key, range.lower) >= 0;
      }
      function isBelowUpper(key, range) {
        return range.upper === void 0 ? true : range.upperOpen ? cmp2(key, range.upper) < 0 : cmp2(key, range.upper) <= 0;
      }
      function isWithinRange(key, range) {
        return isAboveLower(key, range) && isBelowUpper(key, range);
      }
      function applyOptimisticOps(result, req, ops, table, cacheEntry, immutable) {
        if (!ops || ops.length === 0)
          return result;
        var index = req.query.index;
        var multiEntry = index.multiEntry;
        var queryRange = req.query.range;
        var primaryKey = table.schema.primaryKey;
        var extractPrimKey = primaryKey.extractKey;
        var extractIndex = index.extractKey;
        var extractLowLevelIndex = (index.lowLevelIndex || index).extractKey;
        var finalResult = ops.reduce(function(result2, op) {
          var modifedResult = result2;
          var includedValues = [];
          if (op.type === "add" || op.type === "put") {
            var includedPKs = new RangeSet2();
            for (var i = op.values.length - 1; i >= 0; --i) {
              var value = op.values[i];
              var pk = extractPrimKey(value);
              if (includedPKs.hasKey(pk))
                continue;
              var key = extractIndex(value);
              if (multiEntry && isArray(key) ? key.some(function(k) {
                return isWithinRange(k, queryRange);
              }) : isWithinRange(key, queryRange)) {
                includedPKs.addKey(pk);
                includedValues.push(value);
              }
            }
          }
          switch (op.type) {
            case "add": {
              var existingKeys_1 = new RangeSet2().addKeys(req.values ? result2.map(function(v) {
                return extractPrimKey(v);
              }) : result2);
              modifedResult = result2.concat(req.values ? includedValues.filter(function(v) {
                var key2 = extractPrimKey(v);
                if (existingKeys_1.hasKey(key2))
                  return false;
                existingKeys_1.addKey(key2);
                return true;
              }) : includedValues.map(function(v) {
                return extractPrimKey(v);
              }).filter(function(k) {
                if (existingKeys_1.hasKey(k))
                  return false;
                existingKeys_1.addKey(k);
                return true;
              }));
              break;
            }
            case "put": {
              var keySet_1 = new RangeSet2().addKeys(op.values.map(function(v) {
                return extractPrimKey(v);
              }));
              modifedResult = result2.filter(
                function(item) {
                  return !keySet_1.hasKey(req.values ? extractPrimKey(item) : item);
                }
              ).concat(
                req.values ? includedValues : includedValues.map(function(v) {
                  return extractPrimKey(v);
                })
              );
              break;
            }
            case "delete":
              var keysToDelete_1 = new RangeSet2().addKeys(op.keys);
              modifedResult = result2.filter(function(item) {
                return !keysToDelete_1.hasKey(req.values ? extractPrimKey(item) : item);
              });
              break;
            case "deleteRange":
              var range_1 = op.range;
              modifedResult = result2.filter(function(item) {
                return !isWithinRange(extractPrimKey(item), range_1);
              });
              break;
          }
          return modifedResult;
        }, result);
        if (finalResult === result)
          return result;
        var sorter = function(a, b) {
          return cmp2(extractLowLevelIndex(a), extractLowLevelIndex(b)) || cmp2(extractPrimKey(a), extractPrimKey(b));
        };
        finalResult.sort(req.direction === "prev" || req.direction === "prevunique" ? function(a, b) {
          return sorter(b, a);
        } : sorter);
        if (req.limit && req.limit < Infinity) {
          if (finalResult.length > req.limit) {
            finalResult.length = req.limit;
          } else if (result.length === req.limit && finalResult.length < req.limit) {
            cacheEntry.dirty = true;
          }
        }
        return immutable ? Object.freeze(finalResult) : finalResult;
      }
      function areRangesEqual(r1, r2) {
        return cmp2(r1.lower, r2.lower) === 0 && cmp2(r1.upper, r2.upper) === 0 && !!r1.lowerOpen === !!r2.lowerOpen && !!r1.upperOpen === !!r2.upperOpen;
      }
      function compareLowers(lower1, lower2, lowerOpen1, lowerOpen2) {
        if (lower1 === void 0)
          return lower2 !== void 0 ? -1 : 0;
        if (lower2 === void 0)
          return 1;
        var c = cmp2(lower1, lower2);
        if (c === 0) {
          if (lowerOpen1 && lowerOpen2)
            return 0;
          if (lowerOpen1)
            return 1;
          if (lowerOpen2)
            return -1;
        }
        return c;
      }
      function compareUppers(upper1, upper2, upperOpen1, upperOpen2) {
        if (upper1 === void 0)
          return upper2 !== void 0 ? 1 : 0;
        if (upper2 === void 0)
          return -1;
        var c = cmp2(upper1, upper2);
        if (c === 0) {
          if (upperOpen1 && upperOpen2)
            return 0;
          if (upperOpen1)
            return -1;
          if (upperOpen2)
            return 1;
        }
        return c;
      }
      function isSuperRange(r1, r2) {
        return compareLowers(r1.lower, r2.lower, r1.lowerOpen, r2.lowerOpen) <= 0 && compareUppers(r1.upper, r2.upper, r1.upperOpen, r2.upperOpen) >= 0;
      }
      function findCompatibleQuery(dbName, tableName, type2, req) {
        var _a2;
        var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
        if (!tblCache)
          return [];
        var queries = tblCache.queries[type2];
        if (!queries)
          return [null, false, tblCache, null];
        var indexName = req.query ? req.query.index.name : null;
        var entries = queries[indexName || ""];
        if (!entries)
          return [null, false, tblCache, null];
        switch (type2) {
          case "query":
            var reqDirection_1 = (_a2 = req.direction) !== null && _a2 !== void 0 ? _a2 : "next";
            var equalEntry = entries.find(function(entry) {
              var _a3;
              return entry.req.limit === req.limit && entry.req.values === req.values && ((_a3 = entry.req.direction) !== null && _a3 !== void 0 ? _a3 : "next") === reqDirection_1 && areRangesEqual(entry.req.query.range, req.query.range);
            });
            if (equalEntry)
              return [
                equalEntry,
                true,
                tblCache,
                entries
              ];
            var superEntry = entries.find(function(entry) {
              var _a3;
              var limit = "limit" in entry.req ? entry.req.limit : Infinity;
              return limit >= req.limit && ((_a3 = entry.req.direction) !== null && _a3 !== void 0 ? _a3 : "next") === reqDirection_1 && (req.values ? entry.req.values : true) && isSuperRange(entry.req.query.range, req.query.range);
            });
            return [superEntry, false, tblCache, entries];
          case "count":
            var countQuery = entries.find(function(entry) {
              return areRangesEqual(entry.req.query.range, req.query.range);
            });
            return [countQuery, !!countQuery, tblCache, entries];
        }
      }
      function subscribeToCacheEntry(cacheEntry, container, requery, signal) {
        cacheEntry.subscribers.add(requery);
        signal.addEventListener("abort", function() {
          cacheEntry.subscribers.delete(requery);
          if (cacheEntry.subscribers.size === 0) {
            enqueForDeletion(cacheEntry, container);
          }
        });
      }
      function enqueForDeletion(cacheEntry, container) {
        setTimeout(function() {
          if (cacheEntry.subscribers.size === 0) {
            delArrayItem(container, cacheEntry);
          }
        }, 3e3);
      }
      var cacheMiddleware = {
        stack: "dbcore",
        level: 0,
        name: "Cache",
        create: function(core) {
          var dbName = core.schema.name;
          var coreMW = __assign(__assign({}, core), { transaction: function(stores, mode, options) {
            var idbtrans = core.transaction(stores, mode, options);
            if (mode === "readwrite") {
              var ac_1 = new AbortController();
              var signal = ac_1.signal;
              var endTransaction = function(wasCommitted) {
                return function() {
                  ac_1.abort();
                  if (mode === "readwrite") {
                    var affectedSubscribers_1 = /* @__PURE__ */ new Set();
                    for (var _i = 0, stores_1 = stores; _i < stores_1.length; _i++) {
                      var storeName = stores_1[_i];
                      var tblCache = cache["idb://".concat(dbName, "/").concat(storeName)];
                      if (tblCache) {
                        var table = core.table(storeName);
                        var ops = tblCache.optimisticOps.filter(function(op) {
                          return op.trans === idbtrans;
                        });
                        if (idbtrans._explicit && wasCommitted && idbtrans.mutatedParts) {
                          for (var _a2 = 0, _b = Object.values(tblCache.queries.query); _a2 < _b.length; _a2++) {
                            var entries = _b[_a2];
                            for (var _c = 0, _d = entries.slice(); _c < _d.length; _c++) {
                              var entry = _d[_c];
                              if (obsSetsOverlap(entry.obsSet, idbtrans.mutatedParts)) {
                                delArrayItem(entries, entry);
                                entry.subscribers.forEach(function(requery) {
                                  return affectedSubscribers_1.add(requery);
                                });
                              }
                            }
                          }
                        } else if (ops.length > 0) {
                          tblCache.optimisticOps = tblCache.optimisticOps.filter(function(op) {
                            return op.trans !== idbtrans;
                          });
                          for (var _e = 0, _f = Object.values(tblCache.queries.query); _e < _f.length; _e++) {
                            var entries = _f[_e];
                            for (var _g = 0, _h = entries.slice(); _g < _h.length; _g++) {
                              var entry = _h[_g];
                              if (entry.res != null && idbtrans.mutatedParts) {
                                if (wasCommitted && !entry.dirty) {
                                  var freezeResults = Object.isFrozen(entry.res);
                                  var modRes = applyOptimisticOps(entry.res, entry.req, ops, table, entry, freezeResults);
                                  if (entry.dirty) {
                                    delArrayItem(entries, entry);
                                    entry.subscribers.forEach(function(requery) {
                                      return affectedSubscribers_1.add(requery);
                                    });
                                  } else if (modRes !== entry.res) {
                                    entry.res = modRes;
                                    entry.promise = DexiePromise.resolve({
                                      result: modRes
                                    });
                                  }
                                } else {
                                  if (entry.dirty) {
                                    delArrayItem(entries, entry);
                                  }
                                  entry.subscribers.forEach(function(requery) {
                                    return affectedSubscribers_1.add(requery);
                                  });
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                    affectedSubscribers_1.forEach(function(requery) {
                      return requery();
                    });
                  }
                };
              };
              idbtrans.addEventListener("abort", endTransaction(false), {
                signal
              });
              idbtrans.addEventListener("error", endTransaction(false), {
                signal
              });
              idbtrans.addEventListener("complete", endTransaction(true), {
                signal
              });
            }
            return idbtrans;
          }, table: function(tableName) {
            var downTable = core.table(tableName);
            var primKey = downTable.schema.primaryKey;
            var tableMW = __assign(__assign({}, downTable), { mutate: function(req) {
              var trans = PSD.trans;
              if (primKey.outbound || trans.db._options.cache === "disabled" || trans.explicit || trans.idbtrans.mode !== "readwrite") {
                return downTable.mutate(req);
              }
              var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
              if (!tblCache)
                return downTable.mutate(req);
              var promise = downTable.mutate(req);
              if ((req.type === "add" || req.type === "put") && (req.values.length >= 50 || getEffectiveKeys(primKey, req).some(function(key) {
                return key == null;
              }))) {
                promise.then(function(res) {
                  var reqWithResolvedKeys = __assign(__assign({}, req), { values: req.values.map(function(value, i) {
                    var _a2;
                    if (res.failures[i])
                      return value;
                    var valueWithKey = ((_a2 = primKey.keyPath) === null || _a2 === void 0 ? void 0 : _a2.includes(".")) ? deepClone(value) : __assign({}, value);
                    setByKeyPath(valueWithKey, primKey.keyPath, res.results[i]);
                    return valueWithKey;
                  }) });
                  var adjustedReq = adjustOptimisticFromFailures(tblCache, reqWithResolvedKeys, res);
                  tblCache.optimisticOps.push(adjustedReq);
                  queueMicrotask(function() {
                    return req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                  });
                });
              } else {
                tblCache.optimisticOps.push(req);
                req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                promise.then(function(res) {
                  if (res.numFailures > 0) {
                    delArrayItem(tblCache.optimisticOps, req);
                    var adjustedReq = adjustOptimisticFromFailures(tblCache, req, res);
                    if (adjustedReq) {
                      tblCache.optimisticOps.push(adjustedReq);
                    }
                    req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                  }
                });
                promise.catch(function() {
                  delArrayItem(tblCache.optimisticOps, req);
                  req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                });
              }
              return promise;
            }, query: function(req) {
              var _a2;
              if (!isCachableContext(PSD, downTable) || !isCachableRequest("query", req))
                return downTable.query(req);
              var freezeResults = ((_a2 = PSD.trans) === null || _a2 === void 0 ? void 0 : _a2.db._options.cache) === "immutable";
              var _b = PSD, requery = _b.requery, signal = _b.signal;
              var _c = findCompatibleQuery(dbName, tableName, "query", req), cacheEntry = _c[0], exactMatch = _c[1], tblCache = _c[2], container = _c[3];
              if (cacheEntry && exactMatch) {
                cacheEntry.obsSet = req.obsSet;
              } else {
                var promise = downTable.query(req).then(function(res) {
                  var result = res.result;
                  if (cacheEntry)
                    cacheEntry.res = result;
                  if (freezeResults) {
                    for (var i = 0, l = result.length; i < l; ++i) {
                      Object.freeze(result[i]);
                    }
                    Object.freeze(result);
                  }
                  return res;
                }).catch(function(error) {
                  if (container && cacheEntry)
                    delArrayItem(container, cacheEntry);
                  return Promise.reject(error);
                });
                cacheEntry = {
                  obsSet: req.obsSet,
                  promise,
                  subscribers: /* @__PURE__ */ new Set(),
                  type: "query",
                  req,
                  dirty: false
                };
                if (container) {
                  container.push(cacheEntry);
                } else {
                  container = [cacheEntry];
                  if (!tblCache) {
                    tblCache = cache["idb://".concat(dbName, "/").concat(tableName)] = {
                      queries: {
                        query: {},
                        count: {}
                      },
                      objs: /* @__PURE__ */ new Map(),
                      optimisticOps: [],
                      unsignaledParts: {}
                    };
                  }
                  tblCache.queries.query[req.query.index.name || ""] = container;
                }
              }
              subscribeToCacheEntry(cacheEntry, container, requery, signal);
              return cacheEntry.promise.then(function(res) {
                var result = applyOptimisticOps(res.result, req, tblCache === null || tblCache === void 0 ? void 0 : tblCache.optimisticOps, downTable, cacheEntry, freezeResults);
                return {
                  result: freezeResults ? result : deepClone(result)
                };
              });
            } });
            return tableMW;
          } });
          return coreMW;
        }
      };
      function vipify(target, vipDb) {
        return new Proxy(target, {
          get: function(target2, prop, receiver) {
            if (prop === "db")
              return vipDb;
            return Reflect.get(target2, prop, receiver);
          }
        });
      }
      var Dexie$1 = (function() {
        function Dexie3(name, options) {
          var _this = this;
          this._middlewares = {};
          this.verno = 0;
          var deps = Dexie3.dependencies;
          this._options = options = __assign({
            addons: Dexie3.addons,
            autoOpen: true,
            indexedDB: deps.indexedDB,
            IDBKeyRange: deps.IDBKeyRange,
            cache: "cloned",
            maxConnections: DEFAULT_MAX_CONNECTIONS
          }, options);
          this._deps = {
            indexedDB: options.indexedDB,
            IDBKeyRange: options.IDBKeyRange
          };
          var addons = options.addons;
          this._dbSchema = {};
          this._versions = [];
          this._storeNames = [];
          this._allTables = {};
          this.idbdb = null;
          this._novip = this;
          var state = {
            dbOpenError: null,
            isBeingOpened: false,
            onReadyBeingFired: null,
            openComplete: false,
            dbReadyResolve: nop,
            dbReadyPromise: null,
            cancelOpen: nop,
            openCanceller: null,
            autoSchema: true,
            PR1398_maxLoop: 3,
            autoOpen: options.autoOpen
          };
          state.dbReadyPromise = new DexiePromise(function(resolve) {
            state.dbReadyResolve = resolve;
          });
          state.openCanceller = new DexiePromise(function(_, reject) {
            state.cancelOpen = reject;
          });
          this._state = state;
          this.name = name;
          this.on = Events(this, "populate", "blocked", "versionchange", "close", {
            ready: [promisableChain, nop]
          });
          this.once = function(event, callback) {
            var fn = function() {
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
              }
              _this.on(event).unsubscribe(fn);
              callback.apply(_this, args);
            };
            return _this.on(event, fn);
          };
          this.on.ready.subscribe = override(this.on.ready.subscribe, function(subscribe) {
            return function(subscriber, bSticky) {
              Dexie3.vip(function() {
                var state2 = _this._state;
                if (state2.openComplete) {
                  if (!state2.dbOpenError)
                    DexiePromise.resolve().then(subscriber);
                  if (bSticky)
                    subscribe(subscriber);
                } else if (state2.onReadyBeingFired) {
                  state2.onReadyBeingFired.push(subscriber);
                  if (bSticky)
                    subscribe(subscriber);
                } else {
                  subscribe(subscriber);
                  var db_1 = _this;
                  if (!bSticky)
                    subscribe(function unsubscribe() {
                      db_1.on.ready.unsubscribe(subscriber);
                      db_1.on.ready.unsubscribe(unsubscribe);
                    });
                }
              });
            };
          });
          this.Collection = createCollectionConstructor(this);
          this.Table = createTableConstructor(this);
          this.Transaction = createTransactionConstructor(this);
          this.Version = createVersionConstructor(this);
          this.WhereClause = createWhereClauseConstructor(this);
          this.on("versionchange", function(ev) {
            if (ev.newVersion > 0)
              console.warn("Another connection wants to upgrade database '".concat(_this.name, "'. Closing db now to resume the upgrade."));
            else
              console.warn("Another connection wants to delete database '".concat(_this.name, "'. Closing db now to resume the delete request."));
            _this.close({ disableAutoOpen: false });
          });
          this.on("blocked", function(ev) {
            if (!ev.newVersion || ev.newVersion < ev.oldVersion)
              console.warn("Dexie.delete('".concat(_this.name, "') was blocked"));
            else
              console.warn("Upgrade '".concat(_this.name, "' blocked by other connection holding version ").concat(ev.oldVersion / 10));
          });
          this._maxKey = getMaxKey(options.IDBKeyRange);
          this._createTransaction = function(mode, storeNames, dbschema, parentTransaction) {
            return new _this.Transaction(mode, storeNames, dbschema, _this._options.chromeTransactionDurability, parentTransaction);
          };
          this._fireOnBlocked = function(ev) {
            _this.on("blocked").fire(ev);
            connections.toArray().filter(function(c) {
              return c.name === _this.name && c !== _this && !c._state.vcFired;
            }).map(function(c) {
              return c.on("versionchange").fire(ev);
            });
          };
          this.use(cacheExistingValuesMiddleware);
          this.use(cacheMiddleware);
          this.use(observabilityMiddleware);
          this.use(virtualIndexMiddleware);
          this.use(hooksMiddleware);
          var vipDB = new Proxy(this, {
            get: function(_, prop, receiver) {
              if (prop === "_vip")
                return true;
              if (prop === "table")
                return function(tableName) {
                  return vipify(_this.table(tableName), vipDB);
                };
              var rv = Reflect.get(_, prop, receiver);
              if (rv instanceof Table)
                return vipify(rv, vipDB);
              if (prop === "tables")
                return rv.map(function(t) {
                  return vipify(t, vipDB);
                });
              if (prop === "_createTransaction")
                return function() {
                  var tx = rv.apply(this, arguments);
                  return vipify(tx, vipDB);
                };
              return rv;
            }
          });
          this.vip = vipDB;
          addons.forEach(function(addon) {
            return addon(_this);
          });
        }
        Dexie3.prototype.version = function(versionNumber) {
          if (isNaN(versionNumber) || versionNumber < 0.1)
            throw new exceptions.Type("Given version is not a positive number");
          versionNumber = Math.round(versionNumber * 10) / 10;
          if (this.idbdb || this._state.isBeingOpened)
            throw new exceptions.Schema("Cannot add version when database is open");
          this.verno = Math.max(this.verno, versionNumber);
          var versions = this._versions;
          var versionInstance = versions.filter(function(v) {
            return v._cfg.version === versionNumber;
          })[0];
          if (versionInstance)
            return versionInstance;
          versionInstance = new this.Version(versionNumber);
          versions.push(versionInstance);
          versions.sort(lowerVersionFirst);
          versionInstance.stores({});
          this._state.autoSchema = false;
          return versionInstance;
        };
        Dexie3.prototype._whenReady = function(fn) {
          var _this = this;
          return this.idbdb && (this._state.openComplete || PSD.letThrough || this._vip) ? fn() : new DexiePromise(function(resolve, reject) {
            if (_this._state.openComplete) {
              return reject(new exceptions.DatabaseClosed(_this._state.dbOpenError));
            }
            if (!_this._state.isBeingOpened) {
              if (!_this._state.autoOpen) {
                reject(new exceptions.DatabaseClosed());
                return;
              }
              _this.open().catch(nop);
            }
            _this._state.dbReadyPromise.then(resolve, reject);
          }).then(fn);
        };
        Dexie3.prototype.use = function(_a2) {
          var stack = _a2.stack, create = _a2.create, level = _a2.level, name = _a2.name;
          if (name)
            this.unuse({ stack, name });
          var middlewares = this._middlewares[stack] || (this._middlewares[stack] = []);
          middlewares.push({
            stack,
            create,
            level: level == null ? 10 : level,
            name
          });
          middlewares.sort(function(a, b) {
            return a.level - b.level;
          });
          return this;
        };
        Dexie3.prototype.unuse = function(_a2) {
          var stack = _a2.stack, name = _a2.name, create = _a2.create;
          if (stack && this._middlewares[stack]) {
            this._middlewares[stack] = this._middlewares[stack].filter(function(mw) {
              return create ? mw.create !== create : name ? mw.name !== name : false;
            });
          }
          return this;
        };
        Dexie3.prototype.open = function() {
          var _this = this;
          return usePSD(
            globalPSD,
            function() {
              return dexieOpen(_this);
            }
          );
        };
        Dexie3.prototype._close = function() {
          this.on.close.fire(new CustomEvent("close"));
          var state = this._state;
          connections.remove(this);
          if (this.idbdb) {
            try {
              this.idbdb.close();
            } catch (e) {
            }
            this.idbdb = null;
          }
          if (!state.isBeingOpened) {
            state.dbReadyPromise = new DexiePromise(function(resolve) {
              state.dbReadyResolve = resolve;
            });
            state.openCanceller = new DexiePromise(function(_, reject) {
              state.cancelOpen = reject;
            });
          }
        };
        Dexie3.prototype.close = function(_a2) {
          var _b = _a2 === void 0 ? { disableAutoOpen: true } : _a2, disableAutoOpen = _b.disableAutoOpen;
          var state = this._state;
          if (disableAutoOpen) {
            if (state.isBeingOpened) {
              state.cancelOpen(new exceptions.DatabaseClosed());
            }
            this._close();
            state.autoOpen = false;
            state.dbOpenError = new exceptions.DatabaseClosed();
          } else {
            this._close();
            state.autoOpen = this._options.autoOpen || state.isBeingOpened;
            state.openComplete = false;
            state.dbOpenError = null;
          }
        };
        Dexie3.prototype.delete = function(closeOptions) {
          var _this = this;
          if (closeOptions === void 0) {
            closeOptions = { disableAutoOpen: true };
          }
          var hasInvalidArguments = arguments.length > 0 && typeof arguments[0] !== "object";
          var state = this._state;
          return new DexiePromise(function(resolve, reject) {
            var doDelete = function() {
              _this.close(closeOptions);
              var req = _this._deps.indexedDB.deleteDatabase(_this.name);
              req.onsuccess = wrap(function() {
                _onDatabaseDeleted(_this._deps, _this.name);
                resolve();
              });
              req.onerror = eventRejectHandler(reject);
              req.onblocked = _this._fireOnBlocked;
            };
            if (hasInvalidArguments)
              throw new exceptions.InvalidArgument("Invalid closeOptions argument to db.delete()");
            if (state.isBeingOpened) {
              state.dbReadyPromise.then(doDelete);
            } else {
              doDelete();
            }
          });
        };
        Dexie3.prototype.backendDB = function() {
          return this.idbdb;
        };
        Dexie3.prototype.isOpen = function() {
          return this.idbdb !== null;
        };
        Dexie3.prototype.hasBeenClosed = function() {
          var dbOpenError = this._state.dbOpenError;
          return dbOpenError && dbOpenError.name === "DatabaseClosed";
        };
        Dexie3.prototype.hasFailed = function() {
          return this._state.dbOpenError !== null;
        };
        Dexie3.prototype.dynamicallyOpened = function() {
          return this._state.autoSchema;
        };
        Object.defineProperty(Dexie3.prototype, "tables", {
          get: function() {
            var _this = this;
            return keys(this._allTables).map(function(name) {
              return _this._allTables[name];
            });
          },
          enumerable: false,
          configurable: true
        });
        Dexie3.prototype.transaction = function() {
          var args = extractTransactionArgs.apply(this, arguments);
          return this._transaction.apply(this, args);
        };
        Dexie3.prototype._transaction = function(mode, tables, scopeFunc) {
          var _this = this;
          var parentTransaction = PSD.trans;
          if (!parentTransaction || parentTransaction.db !== this || mode.indexOf("!") !== -1)
            parentTransaction = null;
          var onlyIfCompatible = mode.indexOf("?") !== -1;
          mode = mode.replace("!", "").replace("?", "");
          var idbMode, storeNames;
          try {
            storeNames = tables.map(function(table) {
              var storeName = table instanceof _this.Table ? table.name : table;
              if (typeof storeName !== "string")
                throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
              return storeName;
            });
            if (mode == "r" || mode === READONLY)
              idbMode = READONLY;
            else if (mode == "rw" || mode == READWRITE)
              idbMode = READWRITE;
            else
              throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);
            if (parentTransaction) {
              if (parentTransaction.mode === READONLY && idbMode === READWRITE) {
                if (onlyIfCompatible) {
                  parentTransaction = null;
                } else
                  throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
              }
              if (parentTransaction) {
                storeNames.forEach(function(storeName) {
                  if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
                    if (onlyIfCompatible) {
                      parentTransaction = null;
                    } else
                      throw new exceptions.SubTransaction("Table " + storeName + " not included in parent transaction.");
                  }
                });
              }
              if (onlyIfCompatible && parentTransaction && !parentTransaction.active) {
                parentTransaction = null;
              }
            }
          } catch (e) {
            return parentTransaction ? parentTransaction._promise(null, function(_, reject) {
              reject(e);
            }) : rejection(e);
          }
          var enterTransaction = enterTransactionScope.bind(null, this, idbMode, storeNames, parentTransaction, scopeFunc);
          return parentTransaction ? parentTransaction._promise(idbMode, enterTransaction, "lock") : PSD.trans ? usePSD(PSD.transless, function() {
            return _this._whenReady(enterTransaction);
          }) : this._whenReady(enterTransaction);
        };
        Dexie3.prototype.table = function(tableName) {
          if (!hasOwn(this._allTables, tableName)) {
            throw new exceptions.InvalidTable("Table ".concat(tableName, " does not exist"));
          }
          return this._allTables[tableName];
        };
        return Dexie3;
      })();
      var symbolObservable = typeof Symbol !== "undefined" && "observable" in Symbol ? Symbol.observable : "@@observable";
      var Observable = (function() {
        function Observable2(subscribe) {
          this._subscribe = subscribe;
        }
        Observable2.prototype.subscribe = function(x, error, complete) {
          return this._subscribe(!x || typeof x === "function" ? { next: x, error, complete } : x);
        };
        Observable2.prototype[symbolObservable] = function() {
          return this;
        };
        return Observable2;
      })();
      var domDeps;
      try {
        domDeps = {
          indexedDB: _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
          IDBKeyRange: _global.IDBKeyRange || _global.webkitIDBKeyRange
        };
      } catch (e) {
        domDeps = { indexedDB: null, IDBKeyRange: null };
      }
      function liveQuery2(querier) {
        var hasValue = false;
        var currentValue;
        var observable = new Observable(function(observer) {
          var scopeFuncIsAsync = isAsyncFunction(querier);
          function execute(ctx) {
            var wasRootExec = beginMicroTickScope();
            try {
              if (scopeFuncIsAsync) {
                incrementExpectedAwaits();
              }
              var rv = newScope(querier, ctx);
              if (scopeFuncIsAsync) {
                rv = rv.finally(decrementExpectedAwaits);
              }
              return rv;
            } finally {
              wasRootExec && endMicroTickScope();
            }
          }
          var closed = false;
          var abortController;
          var accumMuts = {};
          var currentObs = {};
          var subscription = {
            get closed() {
              return closed;
            },
            unsubscribe: function() {
              if (closed)
                return;
              closed = true;
              if (abortController)
                abortController.abort();
              if (startedListening)
                globalEvents.storagemutated.unsubscribe(mutationListener);
            }
          };
          observer.start && observer.start(subscription);
          var startedListening = false;
          var doQuery = function() {
            return execInGlobalContext(_doQuery);
          };
          function shouldNotify() {
            return obsSetsOverlap(currentObs, accumMuts);
          }
          var mutationListener = function(parts) {
            extendObservabilitySet(accumMuts, parts);
            if (shouldNotify()) {
              doQuery();
            }
          };
          var _doQuery = function() {
            if (closed || !domDeps.indexedDB) {
              return;
            }
            accumMuts = {};
            var subscr = {};
            if (abortController)
              abortController.abort();
            abortController = new AbortController();
            var ctx = {
              subscr,
              signal: abortController.signal,
              requery: doQuery,
              querier,
              trans: null
            };
            var ret = execute(ctx);
            if (!startedListening) {
              globalEvents.storagemutated.subscribe(mutationListener);
              startedListening = true;
            }
            Promise.resolve(ret).then(function(result) {
              hasValue = true;
              currentValue = result;
              if (closed || ctx.signal.aborted) {
                return;
              }
              if (shouldNotify()) {
                doQuery();
              } else {
                currentObs = subscr;
                if (shouldNotify()) {
                  doQuery();
                } else {
                  accumMuts = {};
                  execInGlobalContext(function() {
                    return !closed && observer.next && observer.next(result);
                  });
                }
              }
            }, function(err) {
              hasValue = false;
              if (!["DatabaseClosedError", "AbortError"].includes(err === null || err === void 0 ? void 0 : err.name)) {
                if (!closed)
                  execInGlobalContext(function() {
                    if (closed)
                      return;
                    observer.error && observer.error(err);
                  });
              }
            });
          };
          setTimeout(doQuery, 0);
          return subscription;
        });
        observable.hasValue = function() {
          return hasValue;
        };
        observable.getValue = function() {
          return currentValue;
        };
        return observable;
      }
      var Dexie2 = Dexie$1;
      props(Dexie2, __assign(__assign({}, fullNameExceptions), {
        delete: function(databaseName) {
          var db2 = new Dexie2(databaseName, { addons: [] });
          return db2.delete();
        },
        exists: function(name) {
          return new Dexie2(name, { addons: [] }).open().then(function(db2) {
            db2.close();
            return true;
          }).catch("NoSuchDatabaseError", function() {
            return false;
          });
        },
        getDatabaseNames: function(cb) {
          try {
            return getDatabaseNames(Dexie2.dependencies).then(cb);
          } catch (_a2) {
            return rejection(new exceptions.MissingAPI());
          }
        },
        defineClass: function() {
          function Class(content) {
            extend(this, content);
          }
          return Class;
        },
        ignoreTransaction: function(scopeFunc) {
          return PSD.trans ? usePSD(PSD.transless || globalPSD, scopeFunc) : scopeFunc();
        },
        vip,
        async: function(generatorFn) {
          return function() {
            try {
              var rv = awaitIterator(generatorFn.apply(this, arguments));
              if (!rv || typeof rv.then !== "function")
                return DexiePromise.resolve(rv);
              return rv;
            } catch (e) {
              return rejection(e);
            }
          };
        },
        spawn: function(generatorFn, args, thiz) {
          try {
            var rv = awaitIterator(generatorFn.apply(thiz, args || []));
            if (!rv || typeof rv.then !== "function")
              return DexiePromise.resolve(rv);
            return rv;
          } catch (e) {
            return rejection(e);
          }
        },
        currentTransaction: {
          get: function() {
            return PSD.trans || null;
          }
        },
        waitFor: function(promiseOrFunction, optionalTimeout) {
          var promise = DexiePromise.resolve(typeof promiseOrFunction === "function" ? Dexie2.ignoreTransaction(promiseOrFunction) : promiseOrFunction).timeout(optionalTimeout || 6e4);
          return PSD.trans ? PSD.trans.waitFor(promise) : promise;
        },
        Promise: DexiePromise,
        debug: {
          get: function() {
            return debug;
          },
          set: function(value) {
            setDebug(value);
          }
        },
        derive,
        extend,
        props,
        override,
        Events,
        on: globalEvents,
        liveQuery: liveQuery2,
        extendObservabilitySet,
        getByKeyPath,
        setByKeyPath,
        delByKeyPath,
        shallowClone,
        deepClone,
        getObjectDiff,
        cmp: cmp2,
        asap: asap$1,
        minKey,
        addons: [],
        connections: {
          get: connections.toArray
        },
        errnames,
        dependencies: domDeps,
        cache,
        semVer: DEXIE_VERSION,
        version: DEXIE_VERSION.split(".").map(function(n) {
          return parseInt(n);
        }).reduce(function(p, c, i) {
          return p + c / Math.pow(10, i * 2);
        })
      }));
      Dexie2.maxKey = getMaxKey(Dexie2.dependencies.IDBKeyRange);
      if (typeof dispatchEvent !== "undefined" && typeof addEventListener !== "undefined") {
        globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, function(updatedParts) {
          if (!propagatingLocally) {
            var event_1;
            event_1 = new CustomEvent(STORAGE_MUTATED_DOM_EVENT_NAME, {
              detail: updatedParts
            });
            propagatingLocally = true;
            dispatchEvent(event_1);
            propagatingLocally = false;
          }
        });
        addEventListener(STORAGE_MUTATED_DOM_EVENT_NAME, function(_a2) {
          var detail = _a2.detail;
          if (!propagatingLocally) {
            propagateLocally(detail);
          }
        });
      }
      function propagateLocally(updateParts) {
        var wasMe = propagatingLocally;
        try {
          propagatingLocally = true;
          globalEvents.storagemutated.fire(updateParts);
          signalSubscribersNow(updateParts, true);
        } finally {
          propagatingLocally = wasMe;
        }
      }
      var propagatingLocally = false;
      var bc;
      var createBC = function() {
      };
      if (typeof BroadcastChannel !== "undefined") {
        createBC = function() {
          bc = new BroadcastChannel(STORAGE_MUTATED_DOM_EVENT_NAME);
          bc.onmessage = function(ev) {
            return ev.data && propagateLocally(ev.data);
          };
        };
        createBC();
        if (typeof bc.unref === "function") {
          bc.unref();
        }
        globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, function(changedParts) {
          if (!propagatingLocally) {
            bc.postMessage(changedParts);
          }
        });
      }
      if (typeof addEventListener !== "undefined") {
        addEventListener("pagehide", function(event) {
          if (!Dexie$1.disableBfCache && event.persisted) {
            if (debug)
              console.debug("Dexie: handling persisted pagehide");
            bc === null || bc === void 0 ? void 0 : bc.close();
            for (var _i = 0, _a2 = connections.toArray(); _i < _a2.length; _i++) {
              var db2 = _a2[_i];
              db2.close({ disableAutoOpen: false });
            }
          }
        });
        addEventListener("pageshow", function(event) {
          if (!Dexie$1.disableBfCache && event.persisted) {
            if (debug)
              console.debug("Dexie: handling persisted pageshow");
            createBC();
            propagateLocally({ all: new RangeSet2(-Infinity, [[]]) });
          }
        });
      }
      function add2(value) {
        return new PropModification2({ add: value });
      }
      function remove2(value) {
        return new PropModification2({ remove: value });
      }
      function replacePrefix2(a, b) {
        return new PropModification2({ replacePrefix: [a, b] });
      }
      DexiePromise.rejectionMapper = mapError;
      setDebug(debug);
      var namedExports = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        DEFAULT_MAX_CONNECTIONS,
        Dexie: Dexie$1,
        Entity: Entity2,
        PropModification: PropModification2,
        RangeSet: RangeSet2,
        add: add2,
        cmp: cmp2,
        default: Dexie$1,
        liveQuery: liveQuery2,
        mergeRanges: mergeRanges2,
        rangesOverlap: rangesOverlap2,
        remove: remove2,
        replacePrefix: replacePrefix2
      });
      __assign(Dexie$1, namedExports, { default: Dexie$1 });
      return Dexie$1;
    }));
  }
});

// node_modules/fasttext.wasm.js/dist/core/fastText.common.js
var fastText_common_exports = {};
__export(fastText_common_exports, {
  default: () => fastText_common_default
});
var fastTextModule, fastText_common_default;
var init_fastText_common = __esm({
  "node_modules/fasttext.wasm.js/dist/core/fastText.common.js"() {
    fastTextModule = (() => {
      var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
      return (function(moduleArg = {}) {
        var Module = moduleArg;
        var readyPromiseResolve, readyPromiseReject;
        Module["ready"] = new Promise((resolve, reject) => {
          readyPromiseResolve = resolve;
          readyPromiseReject = reject;
        });
        ["_malloc", "_free", "_memory", "___indirect_function_table", "onRuntimeInitialized"].forEach((prop) => {
          if (!Object.getOwnPropertyDescriptor(Module["ready"], prop)) {
            Object.defineProperty(Module["ready"], prop, { get: () => abort("You are getting " + prop + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js"), set: () => abort("You are setting " + prop + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js") });
          }
        });
        var moduleOverrides = Object.assign({}, Module);
        var arguments_ = [];
        var thisProgram = "./this.program";
        var quit_ = (status, toThrow) => {
          throw toThrow;
        };
        var ENVIRONMENT_IS_WEB = typeof window == "object";
        var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
        var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
        var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
        if (Module["ENVIRONMENT"]) {
          throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
        }
        var scriptDirectory = "";
        function locateFile(path) {
          if (Module["locateFile"]) {
            return Module["locateFile"](path, scriptDirectory);
          }
          return scriptDirectory + path;
        }
        var read_, readAsync, readBinary;
        if (ENVIRONMENT_IS_SHELL) {
          if (typeof process == "object" && typeof __require === "function" || typeof window == "object" || typeof importScripts == "function") throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
          if (typeof read != "undefined") {
            read_ = read;
          }
          readBinary = (f) => {
            if (typeof readbuffer == "function") {
              return new Uint8Array(readbuffer(f));
            }
            let data = read(f, "binary");
            assert(typeof data == "object");
            return data;
          };
          readAsync = (f, onload, onerror) => {
            setTimeout(() => onload(readBinary(f)));
          };
          if (typeof clearTimeout == "undefined") {
            globalThis.clearTimeout = (id2) => {
            };
          }
          if (typeof setTimeout == "undefined") {
            globalThis.setTimeout = (f) => typeof f == "function" ? f() : abort();
          }
          if (typeof scriptArgs != "undefined") {
            arguments_ = scriptArgs;
          } else if (typeof arguments != "undefined") {
            arguments_ = arguments;
          }
          if (typeof quit == "function") {
            quit_ = (status, toThrow) => {
              setTimeout(() => {
                if (!(toThrow instanceof ExitStatus)) {
                  let toLog = toThrow;
                  if (toThrow && typeof toThrow == "object" && toThrow.stack) {
                    toLog = [toThrow, toThrow.stack];
                  }
                  err(`exiting due to exception: ${toLog}`);
                }
                quit(status);
              });
              throw toThrow;
            };
          }
          if (typeof print != "undefined") {
            if (typeof console == "undefined") console = {};
            console.log = print;
            console.warn = console.error = typeof printErr != "undefined" ? printErr : print;
          }
        } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
          if (ENVIRONMENT_IS_WORKER) {
            scriptDirectory = self.location.href;
          } else if (typeof document != "undefined" && document.currentScript) {
            scriptDirectory = document.currentScript.src;
          }
          if (_scriptDir) {
            scriptDirectory = _scriptDir;
          }
          if (scriptDirectory.startsWith("blob:")) {
            scriptDirectory = "";
          } else {
            scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
          }
          if (!(typeof window == "object" || typeof importScripts == "function")) throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
          {
            read_ = (url) => {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", url, false);
              xhr.send(null);
              return xhr.responseText;
            };
            if (ENVIRONMENT_IS_WORKER) {
              readBinary = (url) => {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, false);
                xhr.responseType = "arraybuffer";
                xhr.send(null);
                return new Uint8Array(xhr.response);
              };
            }
            readAsync = (url, onload, onerror) => {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", url, true);
              xhr.responseType = "arraybuffer";
              xhr.onload = () => {
                if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                  onload(xhr.response);
                  return;
                }
                onerror();
              };
              xhr.onerror = onerror;
              xhr.send(null);
            };
          }
        } else {
          throw new Error("environment detection error");
        }
        var out = Module["print"] || console.log.bind(console);
        var err = Module["printErr"] || console.error.bind(console);
        Object.assign(Module, moduleOverrides);
        moduleOverrides = null;
        checkIncomingModuleAPI();
        if (Module["arguments"]) arguments_ = Module["arguments"];
        legacyModuleProp("arguments", "arguments_");
        if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
        legacyModuleProp("thisProgram", "thisProgram");
        if (Module["quit"]) quit_ = Module["quit"];
        legacyModuleProp("quit", "quit_");
        assert(typeof Module["memoryInitializerPrefixURL"] == "undefined", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");
        assert(typeof Module["pthreadMainPrefixURL"] == "undefined", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");
        assert(typeof Module["cdInitializerPrefixURL"] == "undefined", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");
        assert(typeof Module["filePackagePrefixURL"] == "undefined", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");
        assert(typeof Module["read"] == "undefined", "Module.read option was removed (modify read_ in JS)");
        assert(typeof Module["readAsync"] == "undefined", "Module.readAsync option was removed (modify readAsync in JS)");
        assert(typeof Module["readBinary"] == "undefined", "Module.readBinary option was removed (modify readBinary in JS)");
        assert(typeof Module["setWindowTitle"] == "undefined", "Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)");
        assert(typeof Module["TOTAL_MEMORY"] == "undefined", "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");
        legacyModuleProp("asm", "wasmExports");
        legacyModuleProp("read", "read_");
        legacyModuleProp("readAsync", "readAsync");
        legacyModuleProp("readBinary", "readBinary");
        legacyModuleProp("setWindowTitle", "setWindowTitle");
        assert(!ENVIRONMENT_IS_NODE, "node environment detected but not enabled at build time.  Add `node` to `-sENVIRONMENT` to enable.");
        assert(!ENVIRONMENT_IS_SHELL, "shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.");
        var wasmBinary;
        if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
        legacyModuleProp("wasmBinary", "wasmBinary");
        if (typeof WebAssembly != "object") {
          err("no native wasm support detected");
        }
        function intArrayFromBase64(s) {
          var decoded = atob(s);
          var bytes = new Uint8Array(decoded.length);
          for (var i = 0; i < decoded.length; ++i) {
            bytes[i] = decoded.charCodeAt(i);
          }
          return bytes;
        }
        var wasmMemory;
        var ABORT = false;
        var EXITSTATUS;
        function assert(condition, text) {
          if (!condition) {
            abort("Assertion failed" + (text ? ": " + text : ""));
          }
        }
        var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
        function updateMemoryViews() {
          var b = wasmMemory.buffer;
          Module["HEAP8"] = HEAP8 = new Int8Array(b);
          Module["HEAP16"] = HEAP16 = new Int16Array(b);
          Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
          Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
          Module["HEAP32"] = HEAP32 = new Int32Array(b);
          Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
          Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
          Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
        }
        assert(!Module["STACK_SIZE"], "STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time");
        assert(typeof Int32Array != "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray != void 0 && Int32Array.prototype.set != void 0, "JS engine does not provide full typed array support");
        assert(!Module["wasmMemory"], "Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally");
        assert(!Module["INITIAL_MEMORY"], "Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically");
        function writeStackCookie() {
          var max = _emscripten_stack_get_end();
          assert((max & 3) == 0);
          if (max == 0) {
            max += 4;
          }
          HEAPU32[max >> 2] = 34821223;
          HEAPU32[max + 4 >> 2] = 2310721022;
          HEAPU32[0 >> 2] = 1668509029;
        }
        function checkStackCookie() {
          if (ABORT) return;
          var max = _emscripten_stack_get_end();
          if (max == 0) {
            max += 4;
          }
          var cookie1 = HEAPU32[max >> 2];
          var cookie2 = HEAPU32[max + 4 >> 2];
          if (cookie1 != 34821223 || cookie2 != 2310721022) {
            abort(`Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`);
          }
          if (HEAPU32[0 >> 2] != 1668509029) {
            abort("Runtime error: The application has corrupted its heap memory area (address zero)!");
          }
        }
        (function() {
          var h16 = new Int16Array(1);
          var h8 = new Int8Array(h16.buffer);
          h16[0] = 25459;
          if (h8[0] !== 115 || h8[1] !== 99) throw "Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)";
        })();
        var __ATPRERUN__ = [];
        var __ATINIT__ = [];
        var __ATPOSTRUN__ = [];
        var runtimeInitialized = false;
        function preRun() {
          if (Module["preRun"]) {
            if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
            while (Module["preRun"].length) {
              addOnPreRun(Module["preRun"].shift());
            }
          }
          callRuntimeCallbacks(__ATPRERUN__);
        }
        function initRuntime() {
          assert(!runtimeInitialized);
          runtimeInitialized = true;
          checkStackCookie();
          callRuntimeCallbacks(__ATINIT__);
        }
        function postRun() {
          checkStackCookie();
          if (Module["postRun"]) {
            if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
            while (Module["postRun"].length) {
              addOnPostRun(Module["postRun"].shift());
            }
          }
          callRuntimeCallbacks(__ATPOSTRUN__);
        }
        function addOnPreRun(cb) {
          __ATPRERUN__.unshift(cb);
        }
        function addOnInit(cb) {
          __ATINIT__.unshift(cb);
        }
        function addOnPostRun(cb) {
          __ATPOSTRUN__.unshift(cb);
        }
        assert(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
        assert(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
        assert(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
        assert(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
        var runDependencies = 0;
        var runDependencyWatcher = null;
        var dependenciesFulfilled = null;
        var runDependencyTracking = {};
        function getUniqueRunDependency(id2) {
          var orig = id2;
          while (1) {
            if (!runDependencyTracking[id2]) return id2;
            id2 = orig + Math.random();
          }
        }
        function addRunDependency(id2) {
          runDependencies++;
          Module["monitorRunDependencies"]?.(runDependencies);
          if (id2) {
            assert(!runDependencyTracking[id2]);
            runDependencyTracking[id2] = 1;
            if (runDependencyWatcher === null && typeof setInterval != "undefined") {
              runDependencyWatcher = setInterval(() => {
                if (ABORT) {
                  clearInterval(runDependencyWatcher);
                  runDependencyWatcher = null;
                  return;
                }
                var shown = false;
                for (var dep in runDependencyTracking) {
                  if (!shown) {
                    shown = true;
                    err("still waiting on run dependencies:");
                  }
                  err(`dependency: ${dep}`);
                }
                if (shown) {
                  err("(end of list)");
                }
              }, 1e4);
            }
          } else {
            err("warning: run dependency added without ID");
          }
        }
        function removeRunDependency(id2) {
          runDependencies--;
          Module["monitorRunDependencies"]?.(runDependencies);
          if (id2) {
            assert(runDependencyTracking[id2]);
            delete runDependencyTracking[id2];
          } else {
            err("warning: run dependency removed without ID");
          }
          if (runDependencies == 0) {
            if (runDependencyWatcher !== null) {
              clearInterval(runDependencyWatcher);
              runDependencyWatcher = null;
            }
            if (dependenciesFulfilled) {
              var callback = dependenciesFulfilled;
              dependenciesFulfilled = null;
              callback();
            }
          }
        }
        function abort(what) {
          Module["onAbort"]?.(what);
          what = "Aborted(" + what + ")";
          err(what);
          ABORT = true;
          EXITSTATUS = 1;
          var e = new WebAssembly.RuntimeError(what);
          readyPromiseReject(e);
          throw e;
        }
        var dataURIPrefix = "data:application/octet-stream;base64,";
        var isDataURI = (filename) => filename.startsWith(dataURIPrefix);
        var isFileURI = (filename) => filename.startsWith("file://");
        function createExportWrapper(name) {
          return (...args) => {
            assert(runtimeInitialized, `native function \`${name}\` called before runtime initialization`);
            var f = wasmExports[name];
            assert(f, `exported native function \`${name}\` not found`);
            return f(...args);
          };
        }
        var wasmBinaryFile;
        wasmBinaryFile = "fastText.common.wasm";
        if (!isDataURI(wasmBinaryFile)) {
          wasmBinaryFile = locateFile(wasmBinaryFile);
        }
        function getBinarySync(file) {
          if (file == wasmBinaryFile && wasmBinary) {
            return new Uint8Array(wasmBinary);
          }
          if (readBinary) {
            return readBinary(file);
          }
          throw "both async and sync fetching of the wasm failed";
        }
        function getBinaryPromise(binaryFile) {
          if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
            if (typeof fetch == "function" && !isFileURI(binaryFile)) {
              return fetch(binaryFile, { credentials: "same-origin" }).then((response) => {
                if (!response["ok"]) {
                  throw `failed to load wasm binary file at '${binaryFile}'`;
                }
                return response["arrayBuffer"]();
              }).catch(() => getBinarySync(binaryFile));
            } else if (readAsync) {
              return new Promise((resolve, reject) => {
                readAsync(binaryFile, (response) => resolve(new Uint8Array(response)), reject);
              });
            }
          }
          return Promise.resolve().then(() => getBinarySync(binaryFile));
        }
        function instantiateArrayBuffer(binaryFile, imports, receiver) {
          return getBinaryPromise(binaryFile).then((binary) => WebAssembly.instantiate(binary, imports)).then(receiver, (reason) => {
            err(`failed to asynchronously prepare wasm: ${reason}`);
            if (isFileURI(wasmBinaryFile)) {
              err(`warning: Loading from a file URI (${wasmBinaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`);
            }
            abort(reason);
          });
        }
        function instantiateAsync(binary, binaryFile, imports, callback) {
          if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && !isFileURI(binaryFile) && typeof fetch == "function") {
            return fetch(binaryFile, { credentials: "same-origin" }).then((response) => {
              var result = WebAssembly.instantiateStreaming(response, imports);
              return result.then(callback, function(reason) {
                err(`wasm streaming compile failed: ${reason}`);
                err("falling back to ArrayBuffer instantiation");
                return instantiateArrayBuffer(binaryFile, imports, callback);
              });
            });
          }
          return instantiateArrayBuffer(binaryFile, imports, callback);
        }
        function createWasm() {
          var info = { "env": wasmImports, "wasi_snapshot_preview1": wasmImports };
          function receiveInstance(instance, module) {
            wasmExports = instance.exports;
            wasmMemory = wasmExports["memory"];
            assert(wasmMemory, "memory not found in wasm exports");
            updateMemoryViews();
            wasmTable = wasmExports["__indirect_function_table"];
            assert(wasmTable, "table not found in wasm exports");
            addOnInit(wasmExports["__wasm_call_ctors"]);
            removeRunDependency("wasm-instantiate");
            return wasmExports;
          }
          addRunDependency("wasm-instantiate");
          var trueModule = Module;
          function receiveInstantiationResult(result) {
            assert(Module === trueModule, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
            trueModule = null;
            receiveInstance(result["instance"]);
          }
          if (Module["instantiateWasm"]) {
            try {
              return Module["instantiateWasm"](info, receiveInstance);
            } catch (e) {
              err(`Module.instantiateWasm callback failed with error: ${e}`);
              readyPromiseReject(e);
            }
          }
          instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
          return {};
        }
        var tempDouble;
        function legacyModuleProp(prop, newName, incoming = true) {
          if (!Object.getOwnPropertyDescriptor(Module, prop)) {
            Object.defineProperty(Module, prop, { configurable: true, get() {
              let extra = incoming ? " (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)" : "";
              abort(`\`Module.${prop}\` has been replaced by \`${newName}\`` + extra);
            } });
          }
        }
        function ignoredModuleProp(prop) {
          if (Object.getOwnPropertyDescriptor(Module, prop)) {
            abort(`\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`);
          }
        }
        function isExportedByForceFilesystem(name) {
          return name === "FS_createPath" || name === "FS_createDataFile" || name === "FS_createPreloadedFile" || name === "FS_unlink" || name === "addRunDependency" || name === "removeRunDependency";
        }
        function missingGlobal(sym, msg) {
          if (typeof globalThis !== "undefined") {
            Object.defineProperty(globalThis, sym, { configurable: true, get() {
              warnOnce(`\`${sym}\` is not longer defined by emscripten. ${msg}`);
              return void 0;
            } });
          }
        }
        missingGlobal("buffer", "Please use HEAP8.buffer or wasmMemory.buffer");
        missingGlobal("asm", "Please use wasmExports instead");
        function missingLibrarySymbol(sym) {
          if (typeof globalThis !== "undefined" && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
            Object.defineProperty(globalThis, sym, { configurable: true, get() {
              var msg = `\`${sym}\` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line`;
              var librarySymbol = sym;
              if (!librarySymbol.startsWith("_")) {
                librarySymbol = "$" + sym;
              }
              msg += ` (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='${librarySymbol}')`;
              if (isExportedByForceFilesystem(sym)) {
                msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
              }
              warnOnce(msg);
              return void 0;
            } });
          }
          unexportedRuntimeSymbol(sym);
        }
        function unexportedRuntimeSymbol(sym) {
          if (!Object.getOwnPropertyDescriptor(Module, sym)) {
            Object.defineProperty(Module, sym, { configurable: true, get() {
              var msg = `'${sym}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
              if (isExportedByForceFilesystem(sym)) {
                msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
              }
              abort(msg);
            } });
          }
        }
        function ExitStatus(status) {
          this.name = "ExitStatus";
          this.message = `Program terminated with exit(${status})`;
          this.status = status;
        }
        var callRuntimeCallbacks = (callbacks) => {
          while (callbacks.length > 0) {
            callbacks.shift()(Module);
          }
        };
        var noExitRuntime = Module["noExitRuntime"] || true;
        var ptrToString = (ptr) => {
          assert(typeof ptr === "number");
          ptr >>>= 0;
          return "0x" + ptr.toString(16).padStart(8, "0");
        };
        var warnOnce = (text) => {
          warnOnce.shown ||= {};
          if (!warnOnce.shown[text]) {
            warnOnce.shown[text] = 1;
            err(text);
          }
        };
        var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : void 0;
        var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
          var endIdx = idx + maxBytesToRead;
          var endPtr = idx;
          while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
          if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
            return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
          }
          var str = "";
          while (idx < endPtr) {
            var u0 = heapOrArray[idx++];
            if (!(u0 & 128)) {
              str += String.fromCharCode(u0);
              continue;
            }
            var u1 = heapOrArray[idx++] & 63;
            if ((u0 & 224) == 192) {
              str += String.fromCharCode((u0 & 31) << 6 | u1);
              continue;
            }
            var u2 = heapOrArray[idx++] & 63;
            if ((u0 & 240) == 224) {
              u0 = (u0 & 15) << 12 | u1 << 6 | u2;
            } else {
              if ((u0 & 248) != 240) warnOnce("Invalid UTF-8 leading byte " + ptrToString(u0) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!");
              u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
            }
            if (u0 < 65536) {
              str += String.fromCharCode(u0);
            } else {
              var ch = u0 - 65536;
              str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
            }
          }
          return str;
        };
        var UTF8ToString = (ptr, maxBytesToRead) => {
          assert(typeof ptr == "number", `UTF8ToString expects a number (got ${typeof ptr})`);
          return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
        };
        var ___assert_fail = (condition, filename, line, func) => {
          abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function"]);
        };
        class ExceptionInfo {
          constructor(excPtr) {
            this.excPtr = excPtr;
            this.ptr = excPtr - 24;
          }
          set_type(type) {
            HEAPU32[this.ptr + 4 >> 2] = type;
          }
          get_type() {
            return HEAPU32[this.ptr + 4 >> 2];
          }
          set_destructor(destructor) {
            HEAPU32[this.ptr + 8 >> 2] = destructor;
          }
          get_destructor() {
            return HEAPU32[this.ptr + 8 >> 2];
          }
          set_caught(caught) {
            caught = caught ? 1 : 0;
            HEAP8[this.ptr + 12] = caught;
          }
          get_caught() {
            return HEAP8[this.ptr + 12] != 0;
          }
          set_rethrown(rethrown) {
            rethrown = rethrown ? 1 : 0;
            HEAP8[this.ptr + 13] = rethrown;
          }
          get_rethrown() {
            return HEAP8[this.ptr + 13] != 0;
          }
          init(type, destructor) {
            this.set_adjusted_ptr(0);
            this.set_type(type);
            this.set_destructor(destructor);
          }
          set_adjusted_ptr(adjustedPtr) {
            HEAPU32[this.ptr + 16 >> 2] = adjustedPtr;
          }
          get_adjusted_ptr() {
            return HEAPU32[this.ptr + 16 >> 2];
          }
          get_exception_ptr() {
            var isPointer = ___cxa_is_pointer_type(this.get_type());
            if (isPointer) {
              return HEAPU32[this.excPtr >> 2];
            }
            var adjusted = this.get_adjusted_ptr();
            if (adjusted !== 0) return adjusted;
            return this.excPtr;
          }
        }
        var exceptionLast = 0;
        var uncaughtExceptionCount = 0;
        var ___cxa_throw = (ptr, type, destructor) => {
          var info = new ExceptionInfo(ptr);
          info.init(type, destructor);
          exceptionLast = ptr;
          uncaughtExceptionCount++;
          assert(false, "Exception thrown, but exception catching is not enabled. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.");
        };
        var tupleRegistrations = {};
        var runDestructors = (destructors) => {
          while (destructors.length) {
            var ptr = destructors.pop();
            var del = destructors.pop();
            del(ptr);
          }
        };
        function readPointer(pointer) {
          return this["fromWireType"](HEAPU32[pointer >> 2]);
        }
        var awaitingDependencies = {};
        var registeredTypes = {};
        var typeDependencies = {};
        var InternalError;
        var throwInternalError = (message) => {
          throw new InternalError(message);
        };
        var whenDependentTypesAreResolved = (myTypes, dependentTypes, getTypeConverters) => {
          myTypes.forEach(function(type) {
            typeDependencies[type] = dependentTypes;
          });
          function onComplete(typeConverters2) {
            var myTypeConverters = getTypeConverters(typeConverters2);
            if (myTypeConverters.length !== myTypes.length) {
              throwInternalError("Mismatched type converter count");
            }
            for (var i = 0; i < myTypes.length; ++i) {
              registerType(myTypes[i], myTypeConverters[i]);
            }
          }
          var typeConverters = new Array(dependentTypes.length);
          var unregisteredTypes = [];
          var registered = 0;
          dependentTypes.forEach((dt, i) => {
            if (registeredTypes.hasOwnProperty(dt)) {
              typeConverters[i] = registeredTypes[dt];
            } else {
              unregisteredTypes.push(dt);
              if (!awaitingDependencies.hasOwnProperty(dt)) {
                awaitingDependencies[dt] = [];
              }
              awaitingDependencies[dt].push(() => {
                typeConverters[i] = registeredTypes[dt];
                ++registered;
                if (registered === unregisteredTypes.length) {
                  onComplete(typeConverters);
                }
              });
            }
          });
          if (0 === unregisteredTypes.length) {
            onComplete(typeConverters);
          }
        };
        var __embind_finalize_value_array = (rawTupleType) => {
          var reg = tupleRegistrations[rawTupleType];
          delete tupleRegistrations[rawTupleType];
          var elements = reg.elements;
          var elementsLength = elements.length;
          var elementTypes = elements.map((elt) => elt.getterReturnType).concat(elements.map((elt) => elt.setterArgumentType));
          var rawConstructor = reg.rawConstructor;
          var rawDestructor = reg.rawDestructor;
          whenDependentTypesAreResolved([rawTupleType], elementTypes, (elementTypes2) => {
            elements.forEach((elt, i) => {
              var getterReturnType = elementTypes2[i];
              var getter = elt.getter;
              var getterContext = elt.getterContext;
              var setterArgumentType = elementTypes2[i + elementsLength];
              var setter = elt.setter;
              var setterContext = elt.setterContext;
              elt.read = (ptr) => getterReturnType["fromWireType"](getter(getterContext, ptr));
              elt.write = (ptr, o) => {
                var destructors = [];
                setter(setterContext, ptr, setterArgumentType["toWireType"](destructors, o));
                runDestructors(destructors);
              };
            });
            return [{ name: reg.name, "fromWireType": (ptr) => {
              var rv = new Array(elementsLength);
              for (var i = 0; i < elementsLength; ++i) {
                rv[i] = elements[i].read(ptr);
              }
              rawDestructor(ptr);
              return rv;
            }, "toWireType": (destructors, o) => {
              if (elementsLength !== o.length) {
                throw new TypeError(`Incorrect number of tuple elements for ${reg.name}: expected=${elementsLength}, actual=${o.length}`);
              }
              var ptr = rawConstructor();
              for (var i = 0; i < elementsLength; ++i) {
                elements[i].write(ptr, o[i]);
              }
              if (destructors !== null) {
                destructors.push(rawDestructor, ptr);
              }
              return ptr;
            }, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": readPointer, destructorFunction: rawDestructor }];
          });
        };
        var structRegistrations = {};
        var __embind_finalize_value_object = (structType) => {
          var reg = structRegistrations[structType];
          delete structRegistrations[structType];
          var rawConstructor = reg.rawConstructor;
          var rawDestructor = reg.rawDestructor;
          var fieldRecords = reg.fields;
          var fieldTypes = fieldRecords.map((field) => field.getterReturnType).concat(fieldRecords.map((field) => field.setterArgumentType));
          whenDependentTypesAreResolved([structType], fieldTypes, (fieldTypes2) => {
            var fields = {};
            fieldRecords.forEach((field, i) => {
              var fieldName = field.fieldName;
              var getterReturnType = fieldTypes2[i];
              var getter = field.getter;
              var getterContext = field.getterContext;
              var setterArgumentType = fieldTypes2[i + fieldRecords.length];
              var setter = field.setter;
              var setterContext = field.setterContext;
              fields[fieldName] = { read: (ptr) => getterReturnType["fromWireType"](getter(getterContext, ptr)), write: (ptr, o) => {
                var destructors = [];
                setter(setterContext, ptr, setterArgumentType["toWireType"](destructors, o));
                runDestructors(destructors);
              } };
            });
            return [{ name: reg.name, "fromWireType": (ptr) => {
              var rv = {};
              for (var i in fields) {
                rv[i] = fields[i].read(ptr);
              }
              rawDestructor(ptr);
              return rv;
            }, "toWireType": (destructors, o) => {
              for (var fieldName in fields) {
                if (!(fieldName in o)) {
                  throw new TypeError(`Missing field: "${fieldName}"`);
                }
              }
              var ptr = rawConstructor();
              for (fieldName in fields) {
                fields[fieldName].write(ptr, o[fieldName]);
              }
              if (destructors !== null) {
                destructors.push(rawDestructor, ptr);
              }
              return ptr;
            }, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": readPointer, destructorFunction: rawDestructor }];
          });
        };
        var __embind_register_bigint = (primitiveType, name, size, minRange, maxRange) => {
        };
        var embind_init_charCodes = () => {
          var codes = new Array(256);
          for (var i = 0; i < 256; ++i) {
            codes[i] = String.fromCharCode(i);
          }
          embind_charCodes = codes;
        };
        var embind_charCodes;
        var readLatin1String = (ptr) => {
          var ret = "";
          var c = ptr;
          while (HEAPU8[c]) {
            ret += embind_charCodes[HEAPU8[c++]];
          }
          return ret;
        };
        var BindingError;
        var throwBindingError = (message) => {
          throw new BindingError(message);
        };
        function sharedRegisterType(rawType, registeredInstance, options = {}) {
          var name = registeredInstance.name;
          if (!rawType) {
            throwBindingError(`type "${name}" must have a positive integer typeid pointer`);
          }
          if (registeredTypes.hasOwnProperty(rawType)) {
            if (options.ignoreDuplicateRegistrations) {
              return;
            } else {
              throwBindingError(`Cannot register type '${name}' twice`);
            }
          }
          registeredTypes[rawType] = registeredInstance;
          delete typeDependencies[rawType];
          if (awaitingDependencies.hasOwnProperty(rawType)) {
            var callbacks = awaitingDependencies[rawType];
            delete awaitingDependencies[rawType];
            callbacks.forEach((cb) => cb());
          }
        }
        function registerType(rawType, registeredInstance, options = {}) {
          if (!("argPackAdvance" in registeredInstance)) {
            throw new TypeError("registerType registeredInstance requires argPackAdvance");
          }
          return sharedRegisterType(rawType, registeredInstance, options);
        }
        var GenericWireTypeSize = 8;
        var __embind_register_bool = (rawType, name, trueValue, falseValue) => {
          name = readLatin1String(name);
          registerType(rawType, { name, "fromWireType": function(wt) {
            return !!wt;
          }, "toWireType": function(destructors, o) {
            return o ? trueValue : falseValue;
          }, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": function(pointer) {
            return this["fromWireType"](HEAPU8[pointer]);
          }, destructorFunction: null });
        };
        var shallowCopyInternalPointer = (o) => ({ count: o.count, deleteScheduled: o.deleteScheduled, preservePointerOnDelete: o.preservePointerOnDelete, ptr: o.ptr, ptrType: o.ptrType, smartPtr: o.smartPtr, smartPtrType: o.smartPtrType });
        var throwInstanceAlreadyDeleted = (obj) => {
          function getInstanceTypeName(handle) {
            return handle.$$.ptrType.registeredClass.name;
          }
          throwBindingError(getInstanceTypeName(obj) + " instance already deleted");
        };
        var finalizationRegistry = false;
        var detachFinalizer = (handle) => {
        };
        var runDestructor = ($$) => {
          if ($$.smartPtr) {
            $$.smartPtrType.rawDestructor($$.smartPtr);
          } else {
            $$.ptrType.registeredClass.rawDestructor($$.ptr);
          }
        };
        var releaseClassHandle = ($$) => {
          $$.count.value -= 1;
          var toDelete = 0 === $$.count.value;
          if (toDelete) {
            runDestructor($$);
          }
        };
        var downcastPointer = (ptr, ptrClass, desiredClass) => {
          if (ptrClass === desiredClass) {
            return ptr;
          }
          if (void 0 === desiredClass.baseClass) {
            return null;
          }
          var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
          if (rv === null) {
            return null;
          }
          return desiredClass.downcast(rv);
        };
        var registeredPointers = {};
        var getInheritedInstanceCount = () => Object.keys(registeredInstances).length;
        var getLiveInheritedInstances = () => {
          var rv = [];
          for (var k in registeredInstances) {
            if (registeredInstances.hasOwnProperty(k)) {
              rv.push(registeredInstances[k]);
            }
          }
          return rv;
        };
        var deletionQueue = [];
        var flushPendingDeletes = () => {
          while (deletionQueue.length) {
            var obj = deletionQueue.pop();
            obj.$$.deleteScheduled = false;
            obj["delete"]();
          }
        };
        var delayFunction;
        var setDelayFunction = (fn) => {
          delayFunction = fn;
          if (deletionQueue.length && delayFunction) {
            delayFunction(flushPendingDeletes);
          }
        };
        var init_embind = () => {
          Module["getInheritedInstanceCount"] = getInheritedInstanceCount;
          Module["getLiveInheritedInstances"] = getLiveInheritedInstances;
          Module["flushPendingDeletes"] = flushPendingDeletes;
          Module["setDelayFunction"] = setDelayFunction;
        };
        var registeredInstances = {};
        var getBasestPointer = (class_, ptr) => {
          if (ptr === void 0) {
            throwBindingError("ptr should not be undefined");
          }
          while (class_.baseClass) {
            ptr = class_.upcast(ptr);
            class_ = class_.baseClass;
          }
          return ptr;
        };
        var getInheritedInstance = (class_, ptr) => {
          ptr = getBasestPointer(class_, ptr);
          return registeredInstances[ptr];
        };
        var makeClassHandle = (prototype, record) => {
          if (!record.ptrType || !record.ptr) {
            throwInternalError("makeClassHandle requires ptr and ptrType");
          }
          var hasSmartPtrType = !!record.smartPtrType;
          var hasSmartPtr = !!record.smartPtr;
          if (hasSmartPtrType !== hasSmartPtr) {
            throwInternalError("Both smartPtrType and smartPtr must be specified");
          }
          record.count = { value: 1 };
          return attachFinalizer(Object.create(prototype, { $$: { value: record, writable: true } }));
        };
        function RegisteredPointer_fromWireType(ptr) {
          var rawPointer = this.getPointee(ptr);
          if (!rawPointer) {
            this.destructor(ptr);
            return null;
          }
          var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
          if (void 0 !== registeredInstance) {
            if (0 === registeredInstance.$$.count.value) {
              registeredInstance.$$.ptr = rawPointer;
              registeredInstance.$$.smartPtr = ptr;
              return registeredInstance["clone"]();
            } else {
              var rv = registeredInstance["clone"]();
              this.destructor(ptr);
              return rv;
            }
          }
          function makeDefaultHandle() {
            if (this.isSmartPointer) {
              return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: rawPointer, smartPtrType: this, smartPtr: ptr });
            } else {
              return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this, ptr });
            }
          }
          var actualType = this.registeredClass.getActualType(rawPointer);
          var registeredPointerRecord = registeredPointers[actualType];
          if (!registeredPointerRecord) {
            return makeDefaultHandle.call(this);
          }
          var toType;
          if (this.isConst) {
            toType = registeredPointerRecord.constPointerType;
          } else {
            toType = registeredPointerRecord.pointerType;
          }
          var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);
          if (dp === null) {
            return makeDefaultHandle.call(this);
          }
          if (this.isSmartPointer) {
            return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp, smartPtrType: this, smartPtr: ptr });
          } else {
            return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp });
          }
        }
        var attachFinalizer = (handle) => {
          if ("undefined" === typeof FinalizationRegistry) {
            attachFinalizer = (handle2) => handle2;
            return handle;
          }
          finalizationRegistry = new FinalizationRegistry((info) => {
            console.warn(info.leakWarning.stack.replace(/^Error: /, ""));
            releaseClassHandle(info.$$);
          });
          attachFinalizer = (handle2) => {
            var $$ = handle2.$$;
            var hasSmartPtr = !!$$.smartPtr;
            if (hasSmartPtr) {
              var info = { $$ };
              var cls = $$.ptrType.registeredClass;
              info.leakWarning = new Error(`Embind found a leaked C++ instance ${cls.name} <${ptrToString($$.ptr)}>.
We'll free it automatically in this case, but this functionality is not reliable across various environments.
Make sure to invoke .delete() manually once you're done with the instance instead.
Originally allocated`);
              if ("captureStackTrace" in Error) {
                Error.captureStackTrace(info.leakWarning, RegisteredPointer_fromWireType);
              }
              finalizationRegistry.register(handle2, info, handle2);
            }
            return handle2;
          };
          detachFinalizer = (handle2) => finalizationRegistry.unregister(handle2);
          return attachFinalizer(handle);
        };
        var init_ClassHandle = () => {
          Object.assign(ClassHandle.prototype, { "isAliasOf"(other) {
            if (!(this instanceof ClassHandle)) {
              return false;
            }
            if (!(other instanceof ClassHandle)) {
              return false;
            }
            var leftClass = this.$$.ptrType.registeredClass;
            var left = this.$$.ptr;
            other.$$ = other.$$;
            var rightClass = other.$$.ptrType.registeredClass;
            var right = other.$$.ptr;
            while (leftClass.baseClass) {
              left = leftClass.upcast(left);
              leftClass = leftClass.baseClass;
            }
            while (rightClass.baseClass) {
              right = rightClass.upcast(right);
              rightClass = rightClass.baseClass;
            }
            return leftClass === rightClass && left === right;
          }, "clone"() {
            if (!this.$$.ptr) {
              throwInstanceAlreadyDeleted(this);
            }
            if (this.$$.preservePointerOnDelete) {
              this.$$.count.value += 1;
              return this;
            } else {
              var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), { $$: { value: shallowCopyInternalPointer(this.$$) } }));
              clone.$$.count.value += 1;
              clone.$$.deleteScheduled = false;
              return clone;
            }
          }, "delete"() {
            if (!this.$$.ptr) {
              throwInstanceAlreadyDeleted(this);
            }
            if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
              throwBindingError("Object already scheduled for deletion");
            }
            detachFinalizer(this);
            releaseClassHandle(this.$$);
            if (!this.$$.preservePointerOnDelete) {
              this.$$.smartPtr = void 0;
              this.$$.ptr = void 0;
            }
          }, "isDeleted"() {
            return !this.$$.ptr;
          }, "deleteLater"() {
            if (!this.$$.ptr) {
              throwInstanceAlreadyDeleted(this);
            }
            if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
              throwBindingError("Object already scheduled for deletion");
            }
            deletionQueue.push(this);
            if (deletionQueue.length === 1 && delayFunction) {
              delayFunction(flushPendingDeletes);
            }
            this.$$.deleteScheduled = true;
            return this;
          } });
        };
        function ClassHandle() {
        }
        var createNamedFunction = (name, body) => Object.defineProperty(body, "name", { value: name });
        var ensureOverloadTable = (proto, methodName, humanName) => {
          if (void 0 === proto[methodName].overloadTable) {
            var prevFunc = proto[methodName];
            proto[methodName] = function(...args) {
              if (!proto[methodName].overloadTable.hasOwnProperty(args.length)) {
                throwBindingError(`Function '${humanName}' called with an invalid number of arguments (${args.length}) - expects one of (${proto[methodName].overloadTable})!`);
              }
              return proto[methodName].overloadTable[args.length].apply(this, args);
            };
            proto[methodName].overloadTable = [];
            proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
          }
        };
        var exposePublicSymbol = (name, value, numArguments) => {
          if (Module.hasOwnProperty(name)) {
            if (void 0 === numArguments || void 0 !== Module[name].overloadTable && void 0 !== Module[name].overloadTable[numArguments]) {
              throwBindingError(`Cannot register public name '${name}' twice`);
            }
            ensureOverloadTable(Module, name, name);
            if (Module.hasOwnProperty(numArguments)) {
              throwBindingError(`Cannot register multiple overloads of a function with the same number of arguments (${numArguments})!`);
            }
            Module[name].overloadTable[numArguments] = value;
          } else {
            Module[name] = value;
            if (void 0 !== numArguments) {
              Module[name].numArguments = numArguments;
            }
          }
        };
        var char_0 = 48;
        var char_9 = 57;
        var makeLegalFunctionName = (name) => {
          if (void 0 === name) {
            return "_unknown";
          }
          name = name.replace(/[^a-zA-Z0-9_]/g, "$");
          var f = name.charCodeAt(0);
          if (f >= char_0 && f <= char_9) {
            return `_${name}`;
          }
          return name;
        };
        function RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast) {
          this.name = name;
          this.constructor = constructor;
          this.instancePrototype = instancePrototype;
          this.rawDestructor = rawDestructor;
          this.baseClass = baseClass;
          this.getActualType = getActualType;
          this.upcast = upcast;
          this.downcast = downcast;
          this.pureVirtualFunctions = [];
        }
        var upcastPointer = (ptr, ptrClass, desiredClass) => {
          while (ptrClass !== desiredClass) {
            if (!ptrClass.upcast) {
              throwBindingError(`Expected null or instance of ${desiredClass.name}, got an instance of ${ptrClass.name}`);
            }
            ptr = ptrClass.upcast(ptr);
            ptrClass = ptrClass.baseClass;
          }
          return ptr;
        };
        function constNoSmartPtrRawPointerToWireType(destructors, handle) {
          if (handle === null) {
            if (this.isReference) {
              throwBindingError(`null is not a valid ${this.name}`);
            }
            return 0;
          }
          if (!handle.$$) {
            throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
          }
          if (!handle.$$.ptr) {
            throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
          }
          var handleClass = handle.$$.ptrType.registeredClass;
          var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
          return ptr;
        }
        function genericPointerToWireType(destructors, handle) {
          var ptr;
          if (handle === null) {
            if (this.isReference) {
              throwBindingError(`null is not a valid ${this.name}`);
            }
            if (this.isSmartPointer) {
              ptr = this.rawConstructor();
              if (destructors !== null) {
                destructors.push(this.rawDestructor, ptr);
              }
              return ptr;
            } else {
              return 0;
            }
          }
          if (!handle || !handle.$$) {
            throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
          }
          if (!handle.$$.ptr) {
            throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
          }
          if (!this.isConst && handle.$$.ptrType.isConst) {
            throwBindingError(`Cannot convert argument of type ${handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name} to parameter type ${this.name}`);
          }
          var handleClass = handle.$$.ptrType.registeredClass;
          ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
          if (this.isSmartPointer) {
            if (void 0 === handle.$$.smartPtr) {
              throwBindingError("Passing raw pointer to smart pointer is illegal");
            }
            switch (this.sharingPolicy) {
              case 0:
                if (handle.$$.smartPtrType === this) {
                  ptr = handle.$$.smartPtr;
                } else {
                  throwBindingError(`Cannot convert argument of type ${handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name} to parameter type ${this.name}`);
                }
                break;
              case 1:
                ptr = handle.$$.smartPtr;
                break;
              case 2:
                if (handle.$$.smartPtrType === this) {
                  ptr = handle.$$.smartPtr;
                } else {
                  var clonedHandle = handle["clone"]();
                  ptr = this.rawShare(ptr, Emval.toHandle(() => clonedHandle["delete"]()));
                  if (destructors !== null) {
                    destructors.push(this.rawDestructor, ptr);
                  }
                }
                break;
              default:
                throwBindingError("Unsupporting sharing policy");
            }
          }
          return ptr;
        }
        function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
          if (handle === null) {
            if (this.isReference) {
              throwBindingError(`null is not a valid ${this.name}`);
            }
            return 0;
          }
          if (!handle.$$) {
            throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
          }
          if (!handle.$$.ptr) {
            throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
          }
          if (handle.$$.ptrType.isConst) {
            throwBindingError(`Cannot convert argument of type ${handle.$$.ptrType.name} to parameter type ${this.name}`);
          }
          var handleClass = handle.$$.ptrType.registeredClass;
          var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
          return ptr;
        }
        var init_RegisteredPointer = () => {
          Object.assign(RegisteredPointer.prototype, { getPointee(ptr) {
            if (this.rawGetPointee) {
              ptr = this.rawGetPointee(ptr);
            }
            return ptr;
          }, destructor(ptr) {
            this.rawDestructor?.(ptr);
          }, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": readPointer, "fromWireType": RegisteredPointer_fromWireType });
        };
        function RegisteredPointer(name, registeredClass, isReference, isConst, isSmartPointer, pointeeType, sharingPolicy, rawGetPointee, rawConstructor, rawShare, rawDestructor) {
          this.name = name;
          this.registeredClass = registeredClass;
          this.isReference = isReference;
          this.isConst = isConst;
          this.isSmartPointer = isSmartPointer;
          this.pointeeType = pointeeType;
          this.sharingPolicy = sharingPolicy;
          this.rawGetPointee = rawGetPointee;
          this.rawConstructor = rawConstructor;
          this.rawShare = rawShare;
          this.rawDestructor = rawDestructor;
          if (!isSmartPointer && registeredClass.baseClass === void 0) {
            if (isConst) {
              this["toWireType"] = constNoSmartPtrRawPointerToWireType;
              this.destructorFunction = null;
            } else {
              this["toWireType"] = nonConstNoSmartPtrRawPointerToWireType;
              this.destructorFunction = null;
            }
          } else {
            this["toWireType"] = genericPointerToWireType;
          }
        }
        var replacePublicSymbol = (name, value, numArguments) => {
          if (!Module.hasOwnProperty(name)) {
            throwInternalError("Replacing nonexistent public symbol");
          }
          if (void 0 !== Module[name].overloadTable && void 0 !== numArguments) {
            Module[name].overloadTable[numArguments] = value;
          } else {
            Module[name] = value;
            Module[name].argCount = numArguments;
          }
        };
        var dynCallLegacy = (sig, ptr, args) => {
          assert("dynCall_" + sig in Module, `bad function pointer type - dynCall function not found for sig '${sig}'`);
          if (args?.length) {
            assert(args.length === sig.substring(1).replace(/j/g, "--").length);
          } else {
            assert(sig.length == 1);
          }
          var f = Module["dynCall_" + sig];
          return f(ptr, ...args);
        };
        var wasmTableMirror = [];
        var wasmTable;
        var getWasmTableEntry = (funcPtr) => {
          var func = wasmTableMirror[funcPtr];
          if (!func) {
            if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
            wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
          }
          assert(wasmTable.get(funcPtr) == func, "JavaScript-side Wasm function table mirror is out of date!");
          return func;
        };
        var dynCall = (sig, ptr, args = []) => {
          if (sig.includes("j")) {
            return dynCallLegacy(sig, ptr, args);
          }
          assert(getWasmTableEntry(ptr), `missing table entry in dynCall: ${ptr}`);
          var rtn = getWasmTableEntry(ptr)(...args);
          return rtn;
        };
        var getDynCaller = (sig, ptr) => {
          assert(sig.includes("j") || sig.includes("p"), "getDynCaller should only be called with i64 sigs");
          return (...args) => dynCall(sig, ptr, args);
        };
        var embind__requireFunction = (signature, rawFunction) => {
          signature = readLatin1String(signature);
          function makeDynCaller() {
            if (signature.includes("j")) {
              return getDynCaller(signature, rawFunction);
            }
            return getWasmTableEntry(rawFunction);
          }
          var fp = makeDynCaller();
          if (typeof fp != "function") {
            throwBindingError(`unknown function pointer with signature ${signature}: ${rawFunction}`);
          }
          return fp;
        };
        var extendError = (baseErrorType, errorName) => {
          var errorClass = createNamedFunction(errorName, function(message) {
            this.name = errorName;
            this.message = message;
            var stack = new Error(message).stack;
            if (stack !== void 0) {
              this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
            }
          });
          errorClass.prototype = Object.create(baseErrorType.prototype);
          errorClass.prototype.constructor = errorClass;
          errorClass.prototype.toString = function() {
            if (this.message === void 0) {
              return this.name;
            } else {
              return `${this.name}: ${this.message}`;
            }
          };
          return errorClass;
        };
        var UnboundTypeError;
        var getTypeName = (type) => {
          var ptr = ___getTypeName(type);
          var rv = readLatin1String(ptr);
          _free(ptr);
          return rv;
        };
        var throwUnboundTypeError = (message, types) => {
          var unboundTypes = [];
          var seen = {};
          function visit(type) {
            if (seen[type]) {
              return;
            }
            if (registeredTypes[type]) {
              return;
            }
            if (typeDependencies[type]) {
              typeDependencies[type].forEach(visit);
              return;
            }
            unboundTypes.push(type);
            seen[type] = true;
          }
          types.forEach(visit);
          throw new UnboundTypeError(`${message}: ` + unboundTypes.map(getTypeName).join([", "]));
        };
        var __embind_register_class = (rawType, rawPointerType, rawConstPointerType, baseClassRawType, getActualTypeSignature, getActualType, upcastSignature, upcast, downcastSignature, downcast, name, destructorSignature, rawDestructor) => {
          name = readLatin1String(name);
          getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
          upcast &&= embind__requireFunction(upcastSignature, upcast);
          downcast &&= embind__requireFunction(downcastSignature, downcast);
          rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
          var legalFunctionName = makeLegalFunctionName(name);
          exposePublicSymbol(legalFunctionName, function() {
            throwUnboundTypeError(`Cannot construct ${name} due to unbound types`, [baseClassRawType]);
          });
          whenDependentTypesAreResolved([rawType, rawPointerType, rawConstPointerType], baseClassRawType ? [baseClassRawType] : [], (base) => {
            base = base[0];
            var baseClass;
            var basePrototype;
            if (baseClassRawType) {
              baseClass = base.registeredClass;
              basePrototype = baseClass.instancePrototype;
            } else {
              basePrototype = ClassHandle.prototype;
            }
            var constructor = createNamedFunction(name, function(...args) {
              if (Object.getPrototypeOf(this) !== instancePrototype) {
                throw new BindingError("Use 'new' to construct " + name);
              }
              if (void 0 === registeredClass.constructor_body) {
                throw new BindingError(name + " has no accessible constructor");
              }
              var body = registeredClass.constructor_body[args.length];
              if (void 0 === body) {
                throw new BindingError(`Tried to invoke ctor of ${name} with invalid number of parameters (${args.length}) - expected (${Object.keys(registeredClass.constructor_body).toString()}) parameters instead!`);
              }
              return body.apply(this, args);
            });
            var instancePrototype = Object.create(basePrototype, { constructor: { value: constructor } });
            constructor.prototype = instancePrototype;
            var registeredClass = new RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast);
            if (registeredClass.baseClass) {
              registeredClass.baseClass.__derivedClasses ??= [];
              registeredClass.baseClass.__derivedClasses.push(registeredClass);
            }
            var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);
            var pointerConverter = new RegisteredPointer(name + "*", registeredClass, false, false, false);
            var constPointerConverter = new RegisteredPointer(name + " const*", registeredClass, false, true, false);
            registeredPointers[rawType] = { pointerType: pointerConverter, constPointerType: constPointerConverter };
            replacePublicSymbol(legalFunctionName, constructor);
            return [referenceConverter, pointerConverter, constPointerConverter];
          });
        };
        var heap32VectorToArray = (count, firstElement) => {
          var array = [];
          for (var i = 0; i < count; i++) {
            array.push(HEAPU32[firstElement + i * 4 >> 2]);
          }
          return array;
        };
        function usesDestructorStack(argTypes) {
          for (var i = 1; i < argTypes.length; ++i) {
            if (argTypes[i] !== null && argTypes[i].destructorFunction === void 0) {
              return true;
            }
          }
          return false;
        }
        var InvokerFunctions = { "ftf": function(humanName, throwBindingError2, invoker, fn, runDestructors2, retType, classParam) {
          if (arguments.length !== 7) {
            throw new Error(humanName + "Expected 7 closure arguments " + arguments.length + " given.");
          }
          return function() {
            if (arguments.length !== 0) {
              throwBindingError2("function " + humanName + " called with " + arguments.length + " arguments, expected 0");
            }
            var rv = invoker(fn);
            var ret = retType["fromWireType"](rv);
            return ret;
          };
        }, "ttfn": function(humanName, throwBindingError2, invoker, fn, runDestructors2, retType, classParam) {
          if (arguments.length !== 7) {
            throw new Error(humanName + "Expected 7 closure arguments " + arguments.length + " given.");
          }
          return function() {
            if (arguments.length !== 0) {
              throwBindingError2("function " + humanName + " called with " + arguments.length + " arguments, expected 0");
            }
            var thisWired = classParam["toWireType"](null, this);
            var rv = invoker(fn, thisWired);
            var ret = retType["fromWireType"](rv);
            return ret;
          };
        }, "tffntn": function(humanName, throwBindingError2, invoker, fn, runDestructors2, retType, classParam, argType0, argType1, arg0Wired_dtor) {
          if (arguments.length !== 10) {
            throw new Error(humanName + "Expected 10 closure arguments " + arguments.length + " given.");
          }
          return function(arg0, arg1) {
            if (arguments.length !== 2) {
              throwBindingError2("function " + humanName + " called with " + arguments.length + " arguments, expected 2");
            }
            var thisWired = classParam["toWireType"](null, this);
            var arg0Wired = argType0["toWireType"](null, arg0);
            var arg1Wired = argType1["toWireType"](null, arg1);
            invoker(fn, thisWired, arg0Wired, arg1Wired);
            arg0Wired_dtor(arg0Wired);
          };
        }, "tffnt": function(humanName, throwBindingError2, invoker, fn, runDestructors2, retType, classParam, argType0, arg0Wired_dtor) {
          if (arguments.length !== 9) {
            throw new Error(humanName + "Expected 9 closure arguments " + arguments.length + " given.");
          }
          return function(arg0) {
            if (arguments.length !== 1) {
              throwBindingError2("function " + humanName + " called with " + arguments.length + " arguments, expected 1");
            }
            var thisWired = classParam["toWireType"](null, this);
            var arg0Wired = argType0["toWireType"](null, arg0);
            invoker(fn, thisWired, arg0Wired);
            arg0Wired_dtor(arg0Wired);
          };
        }, "ttfntn": function(humanName, throwBindingError2, invoker, fn, runDestructors2, retType, classParam, argType0, argType1, arg0Wired_dtor) {
          if (arguments.length !== 10) {
            throw new Error(humanName + "Expected 10 closure arguments " + arguments.length + " given.");
          }
          return function(arg0, arg1) {
            if (arguments.length !== 2) {
              throwBindingError2("function " + humanName + " called with " + arguments.length + " arguments, expected 2");
            }
            var thisWired = classParam["toWireType"](null, this);
            var arg0Wired = argType0["toWireType"](null, arg0);
            var arg1Wired = argType1["toWireType"](null, arg1);
            var rv = invoker(fn, thisWired, arg0Wired, arg1Wired);
            arg0Wired_dtor(arg0Wired);
            var ret = retType["fromWireType"](rv);
            return ret;
          };
        }, "ttfnnttt": function(humanName, throwBindingError2, invoker, fn, runDestructors2, retType, classParam, argType0, argType1, argType2, argType3, arg1Wired_dtor, arg2Wired_dtor, arg3Wired_dtor) {
          if (arguments.length !== 14) {
            throw new Error(humanName + "Expected 14 closure arguments " + arguments.length + " given.");
          }
          return function(arg0, arg1, arg2, arg3) {
            if (arguments.length !== 4) {
              throwBindingError2("function " + humanName + " called with " + arguments.length + " arguments, expected 4");
            }
            var thisWired = classParam["toWireType"](null, this);
            var arg0Wired = argType0["toWireType"](null, arg0);
            var arg1Wired = argType1["toWireType"](null, arg1);
            var arg2Wired = argType2["toWireType"](null, arg2);
            var arg3Wired = argType3["toWireType"](null, arg3);
            var rv = invoker(fn, thisWired, arg0Wired, arg1Wired, arg2Wired, arg3Wired);
            arg1Wired_dtor(arg1Wired);
            arg2Wired_dtor(arg2Wired);
            arg3Wired_dtor(arg3Wired);
            var ret = retType["fromWireType"](rv);
            return ret;
          };
        }, "ttfnt": function(humanName, throwBindingError2, invoker, fn, runDestructors2, retType, classParam, argType0, arg0Wired_dtor) {
          if (arguments.length !== 9) {
            throw new Error(humanName + "Expected 9 closure arguments " + arguments.length + " given.");
          }
          return function(arg0) {
            if (arguments.length !== 1) {
              throwBindingError2("function " + humanName + " called with " + arguments.length + " arguments, expected 1");
            }
            var thisWired = classParam["toWireType"](null, this);
            var arg0Wired = argType0["toWireType"](null, arg0);
            var rv = invoker(fn, thisWired, arg0Wired);
            arg0Wired_dtor(arg0Wired);
            var ret = retType["fromWireType"](rv);
            return ret;
          };
        }, "ttfntnn": function(humanName, throwBindingError2, invoker, fn, runDestructors2, retType, classParam, argType0, argType1, argType2, arg0Wired_dtor) {
          if (arguments.length !== 11) {
            throw new Error(humanName + "Expected 11 closure arguments " + arguments.length + " given.");
          }
          return function(arg0, arg1, arg2) {
            if (arguments.length !== 3) {
              throwBindingError2("function " + humanName + " called with " + arguments.length + " arguments, expected 3");
            }
            var thisWired = classParam["toWireType"](null, this);
            var arg0Wired = argType0["toWireType"](null, arg0);
            var arg1Wired = argType1["toWireType"](null, arg1);
            var arg2Wired = argType2["toWireType"](null, arg2);
            var rv = invoker(fn, thisWired, arg0Wired, arg1Wired, arg2Wired);
            arg0Wired_dtor(arg0Wired);
            var ret = retType["fromWireType"](rv);
            return ret;
          };
        }, "tffntt": function(humanName, throwBindingError2, invoker, fn, runDestructors2, retType, classParam, argType0, argType1, arg0Wired_dtor, arg1Wired_dtor) {
          if (arguments.length !== 11) {
            throw new Error(humanName + "Expected 11 closure arguments " + arguments.length + " given.");
          }
          return function(arg0, arg1) {
            if (arguments.length !== 2) {
              throwBindingError2("function " + humanName + " called with " + arguments.length + " arguments, expected 2");
            }
            var thisWired = classParam["toWireType"](null, this);
            var arg0Wired = argType0["toWireType"](null, arg0);
            var arg1Wired = argType1["toWireType"](null, arg1);
            invoker(fn, thisWired, arg0Wired, arg1Wired);
            arg0Wired_dtor(arg0Wired);
            arg1Wired_dtor(arg1Wired);
          };
        }, "tffnnn": function(humanName, throwBindingError2, invoker, fn, runDestructors2, retType, classParam, argType0, argType1) {
          if (arguments.length !== 9) {
            throw new Error(humanName + "Expected 9 closure arguments " + arguments.length + " given.");
          }
          return function(arg0, arg1) {
            if (arguments.length !== 2) {
              throwBindingError2("function " + humanName + " called with " + arguments.length + " arguments, expected 2");
            }
            var thisWired = classParam["toWireType"](null, this);
            var arg0Wired = argType0["toWireType"](null, arg0);
            var arg1Wired = argType1["toWireType"](null, arg1);
            invoker(fn, thisWired, arg0Wired, arg1Wired);
          };
        }, "ttfnnn": function(humanName, throwBindingError2, invoker, fn, runDestructors2, retType, classParam, argType0, argType1) {
          if (arguments.length !== 9) {
            throw new Error(humanName + "Expected 9 closure arguments " + arguments.length + " given.");
          }
          return function(arg0, arg1) {
            if (arguments.length !== 2) {
              throwBindingError2("function " + humanName + " called with " + arguments.length + " arguments, expected 2");
            }
            var thisWired = classParam["toWireType"](null, this);
            var arg0Wired = argType0["toWireType"](null, arg0);
            var arg1Wired = argType1["toWireType"](null, arg1);
            var rv = invoker(fn, thisWired, arg0Wired, arg1Wired);
            var ret = retType["fromWireType"](rv);
            return ret;
          };
        }, "ftfn": function(humanName, throwBindingError2, invoker, fn, runDestructors2, retType, classParam, argType0) {
          if (arguments.length !== 8) {
            throw new Error(humanName + "Expected 8 closure arguments " + arguments.length + " given.");
          }
          return function(arg0) {
            if (arguments.length !== 1) {
              throwBindingError2("function " + humanName + " called with " + arguments.length + " arguments, expected 1");
            }
            var arg0Wired = argType0["toWireType"](null, arg0);
            var rv = invoker(fn, arg0Wired);
            var ret = retType["fromWireType"](rv);
            return ret;
          };
        }, "tffnnt": function(humanName, throwBindingError2, invoker, fn, runDestructors2, retType, classParam, argType0, argType1, arg1Wired_dtor) {
          if (arguments.length !== 10) {
            throw new Error(humanName + "Expected 10 closure arguments " + arguments.length + " given.");
          }
          return function(arg0, arg1) {
            if (arguments.length !== 2) {
              throwBindingError2("function " + humanName + " called with " + arguments.length + " arguments, expected 2");
            }
            var thisWired = classParam["toWireType"](null, this);
            var arg0Wired = argType0["toWireType"](null, arg0);
            var arg1Wired = argType1["toWireType"](null, arg1);
            invoker(fn, thisWired, arg0Wired, arg1Wired);
            arg1Wired_dtor(arg1Wired);
          };
        }, "ttfnnt": function(humanName, throwBindingError2, invoker, fn, runDestructors2, retType, classParam, argType0, argType1, arg1Wired_dtor) {
          if (arguments.length !== 10) {
            throw new Error(humanName + "Expected 10 closure arguments " + arguments.length + " given.");
          }
          return function(arg0, arg1) {
            if (arguments.length !== 2) {
              throwBindingError2("function " + humanName + " called with " + arguments.length + " arguments, expected 2");
            }
            var thisWired = classParam["toWireType"](null, this);
            var arg0Wired = argType0["toWireType"](null, arg0);
            var arg1Wired = argType1["toWireType"](null, arg1);
            var rv = invoker(fn, thisWired, arg0Wired, arg1Wired);
            arg1Wired_dtor(arg1Wired);
            var ret = retType["fromWireType"](rv);
            return ret;
          };
        }, "ttfnn": function(humanName, throwBindingError2, invoker, fn, runDestructors2, retType, classParam, argType0) {
          if (arguments.length !== 8) {
            throw new Error(humanName + "Expected 8 closure arguments " + arguments.length + " given.");
          }
          return function(arg0) {
            if (arguments.length !== 1) {
              throwBindingError2("function " + humanName + " called with " + arguments.length + " arguments, expected 1");
            }
            var thisWired = classParam["toWireType"](null, this);
            var arg0Wired = argType0["toWireType"](null, arg0);
            var rv = invoker(fn, thisWired, arg0Wired);
            var ret = retType["fromWireType"](rv);
            return ret;
          };
        }, "tffnn": function(humanName, throwBindingError2, invoker, fn, runDestructors2, retType, classParam, argType0) {
          if (arguments.length !== 8) {
            throw new Error(humanName + "Expected 8 closure arguments " + arguments.length + " given.");
          }
          return function(arg0) {
            if (arguments.length !== 1) {
              throwBindingError2("function " + humanName + " called with " + arguments.length + " arguments, expected 1");
            }
            var thisWired = classParam["toWireType"](null, this);
            var arg0Wired = argType0["toWireType"](null, arg0);
            invoker(fn, thisWired, arg0Wired);
          };
        } };
        function createJsInvokerSignature(argTypes, isClassMethodFunc, returns, isAsync) {
          const signature = [isClassMethodFunc ? "t" : "f", returns ? "t" : "f", isAsync ? "t" : "f"];
          for (let i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
            const arg = argTypes[i];
            let destructorSig = "";
            if (arg.destructorFunction === void 0) {
              destructorSig = "u";
            } else if (arg.destructorFunction === null) {
              destructorSig = "n";
            } else {
              destructorSig = "t";
            }
            signature.push(destructorSig);
          }
          return signature.join("");
        }
        function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc, isAsync) {
          var argCount = argTypes.length;
          if (argCount < 2) {
            throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
          }
          assert(!isAsync, "Async bindings are only supported with JSPI.");
          var isClassMethodFunc = argTypes[1] !== null && classType !== null;
          var needsDestructorStack = usesDestructorStack(argTypes);
          var returns = argTypes[0].name !== "void";
          var closureArgs = [humanName, throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
          for (var i = 0; i < argCount - 2; ++i) {
            closureArgs.push(argTypes[i + 2]);
          }
          if (!needsDestructorStack) {
            for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
              if (argTypes[i].destructorFunction !== null) {
                closureArgs.push(argTypes[i].destructorFunction);
              }
            }
          }
          var signature = createJsInvokerSignature(argTypes, isClassMethodFunc, returns, isAsync);
          var invokerFn = InvokerFunctions[signature](...closureArgs);
          return createNamedFunction(humanName, invokerFn);
        }
        var __embind_register_class_constructor = (rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor) => {
          assert(argCount > 0);
          var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
          invoker = embind__requireFunction(invokerSignature, invoker);
          whenDependentTypesAreResolved([], [rawClassType], (classType) => {
            classType = classType[0];
            var humanName = `constructor ${classType.name}`;
            if (void 0 === classType.registeredClass.constructor_body) {
              classType.registeredClass.constructor_body = [];
            }
            if (void 0 !== classType.registeredClass.constructor_body[argCount - 1]) {
              throw new BindingError(`Cannot register multiple constructors with identical number of parameters (${argCount - 1}) for class '${classType.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
            }
            classType.registeredClass.constructor_body[argCount - 1] = () => {
              throwUnboundTypeError(`Cannot construct ${classType.name} due to unbound types`, rawArgTypes);
            };
            whenDependentTypesAreResolved([], rawArgTypes, (argTypes) => {
              argTypes.splice(1, 0, null);
              classType.registeredClass.constructor_body[argCount - 1] = craftInvokerFunction(humanName, argTypes, null, invoker, rawConstructor);
              return [];
            });
            return [];
          });
        };
        var getFunctionName = (signature) => {
          signature = signature.trim();
          const argsIndex = signature.indexOf("(");
          if (argsIndex !== -1) {
            assert(signature[signature.length - 1] == ")", "Parentheses for argument names should match.");
            return signature.substr(0, argsIndex);
          } else {
            return signature;
          }
        };
        var __embind_register_class_function = (rawClassType, methodName, argCount, rawArgTypesAddr, invokerSignature, rawInvoker, context, isPureVirtual, isAsync) => {
          var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
          methodName = readLatin1String(methodName);
          methodName = getFunctionName(methodName);
          rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
          whenDependentTypesAreResolved([], [rawClassType], (classType) => {
            classType = classType[0];
            var humanName = `${classType.name}.${methodName}`;
            if (methodName.startsWith("@@")) {
              methodName = Symbol[methodName.substring(2)];
            }
            if (isPureVirtual) {
              classType.registeredClass.pureVirtualFunctions.push(methodName);
            }
            function unboundTypesHandler() {
              throwUnboundTypeError(`Cannot call ${humanName} due to unbound types`, rawArgTypes);
            }
            var proto = classType.registeredClass.instancePrototype;
            var method = proto[methodName];
            if (void 0 === method || void 0 === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2) {
              unboundTypesHandler.argCount = argCount - 2;
              unboundTypesHandler.className = classType.name;
              proto[methodName] = unboundTypesHandler;
            } else {
              ensureOverloadTable(proto, methodName, humanName);
              proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
            }
            whenDependentTypesAreResolved([], rawArgTypes, (argTypes) => {
              var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context, isAsync);
              if (void 0 === proto[methodName].overloadTable) {
                memberFunction.argCount = argCount - 2;
                proto[methodName] = memberFunction;
              } else {
                proto[methodName].overloadTable[argCount - 2] = memberFunction;
              }
              return [];
            });
            return [];
          });
        };
        var validateThis = (this_, classType, humanName) => {
          if (!(this_ instanceof Object)) {
            throwBindingError(`${humanName} with invalid "this": ${this_}`);
          }
          if (!(this_ instanceof classType.registeredClass.constructor)) {
            throwBindingError(`${humanName} incompatible with "this" of type ${this_.constructor.name}`);
          }
          if (!this_.$$.ptr) {
            throwBindingError(`cannot call emscripten binding method ${humanName} on deleted object`);
          }
          return upcastPointer(this_.$$.ptr, this_.$$.ptrType.registeredClass, classType.registeredClass);
        };
        var __embind_register_class_property = (classType, fieldName, getterReturnType, getterSignature, getter, getterContext, setterArgumentType, setterSignature, setter, setterContext) => {
          fieldName = readLatin1String(fieldName);
          getter = embind__requireFunction(getterSignature, getter);
          whenDependentTypesAreResolved([], [classType], (classType2) => {
            classType2 = classType2[0];
            var humanName = `${classType2.name}.${fieldName}`;
            var desc = { get() {
              throwUnboundTypeError(`Cannot access ${humanName} due to unbound types`, [getterReturnType, setterArgumentType]);
            }, enumerable: true, configurable: true };
            if (setter) {
              desc.set = () => throwUnboundTypeError(`Cannot access ${humanName} due to unbound types`, [getterReturnType, setterArgumentType]);
            } else {
              desc.set = (v) => throwBindingError(humanName + " is a read-only property");
            }
            Object.defineProperty(classType2.registeredClass.instancePrototype, fieldName, desc);
            whenDependentTypesAreResolved([], setter ? [getterReturnType, setterArgumentType] : [getterReturnType], (types) => {
              var getterReturnType2 = types[0];
              var desc2 = { get() {
                var ptr = validateThis(this, classType2, humanName + " getter");
                return getterReturnType2["fromWireType"](getter(getterContext, ptr));
              }, enumerable: true };
              if (setter) {
                setter = embind__requireFunction(setterSignature, setter);
                var setterArgumentType2 = types[1];
                desc2.set = function(v) {
                  var ptr = validateThis(this, classType2, humanName + " setter");
                  var destructors = [];
                  setter(setterContext, ptr, setterArgumentType2["toWireType"](destructors, v));
                  runDestructors(destructors);
                };
              }
              Object.defineProperty(classType2.registeredClass.instancePrototype, fieldName, desc2);
              return [];
            });
            return [];
          });
        };
        var emval_freelist = [];
        var emval_handles = [];
        var __emval_decref = (handle) => {
          if (handle > 9 && 0 === --emval_handles[handle + 1]) {
            assert(emval_handles[handle] !== void 0, `Decref for unallocated handle.`);
            emval_handles[handle] = void 0;
            emval_freelist.push(handle);
          }
        };
        var count_emval_handles = () => emval_handles.length / 2 - 5 - emval_freelist.length;
        var init_emval = () => {
          emval_handles.push(0, 1, void 0, 1, null, 1, true, 1, false, 1);
          assert(emval_handles.length === 5 * 2);
          Module["count_emval_handles"] = count_emval_handles;
        };
        var Emval = { toValue: (handle) => {
          if (!handle) {
            throwBindingError("Cannot use deleted val. handle = " + handle);
          }
          assert(handle === 2 || emval_handles[handle] !== void 0 && handle % 2 === 0, `invalid handle: ${handle}`);
          return emval_handles[handle];
        }, toHandle: (value) => {
          switch (value) {
            case void 0:
              return 2;
            case null:
              return 4;
            case true:
              return 6;
            case false:
              return 8;
            default: {
              const handle = emval_freelist.pop() || emval_handles.length;
              emval_handles[handle] = value;
              emval_handles[handle + 1] = 1;
              return handle;
            }
          }
        } };
        var EmValType = { name: "emscripten::val", "fromWireType": (handle) => {
          var rv = Emval.toValue(handle);
          __emval_decref(handle);
          return rv;
        }, "toWireType": (destructors, value) => Emval.toHandle(value), "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": readPointer, destructorFunction: null };
        var __embind_register_emval = (rawType) => registerType(rawType, EmValType);
        var enumReadValueFromPointer = (name, width, signed) => {
          switch (width) {
            case 1:
              return signed ? function(pointer) {
                return this["fromWireType"](HEAP8[pointer]);
              } : function(pointer) {
                return this["fromWireType"](HEAPU8[pointer]);
              };
            case 2:
              return signed ? function(pointer) {
                return this["fromWireType"](HEAP16[pointer >> 1]);
              } : function(pointer) {
                return this["fromWireType"](HEAPU16[pointer >> 1]);
              };
            case 4:
              return signed ? function(pointer) {
                return this["fromWireType"](HEAP32[pointer >> 2]);
              } : function(pointer) {
                return this["fromWireType"](HEAPU32[pointer >> 2]);
              };
            default:
              throw new TypeError(`invalid integer width (${width}): ${name}`);
          }
        };
        var __embind_register_enum = (rawType, name, size, isSigned) => {
          name = readLatin1String(name);
          function ctor() {
          }
          ctor.values = {};
          registerType(rawType, { name, constructor: ctor, "fromWireType": function(c) {
            return this.constructor.values[c];
          }, "toWireType": (destructors, c) => c.value, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": enumReadValueFromPointer(name, size, isSigned), destructorFunction: null });
          exposePublicSymbol(name, ctor);
        };
        var requireRegisteredType = (rawType, humanName) => {
          var impl = registeredTypes[rawType];
          if (void 0 === impl) {
            throwBindingError(`${humanName} has unknown type ${getTypeName(rawType)}`);
          }
          return impl;
        };
        var __embind_register_enum_value = (rawEnumType, name, enumValue) => {
          var enumType = requireRegisteredType(rawEnumType, "enum");
          name = readLatin1String(name);
          var Enum = enumType.constructor;
          var Value = Object.create(enumType.constructor.prototype, { value: { value: enumValue }, constructor: { value: createNamedFunction(`${enumType.name}_${name}`, function() {
          }) } });
          Enum.values[enumValue] = Value;
          Enum[name] = Value;
        };
        var embindRepr = (v) => {
          if (v === null) {
            return "null";
          }
          var t = typeof v;
          if (t === "object" || t === "array" || t === "function") {
            return v.toString();
          } else {
            return "" + v;
          }
        };
        var floatReadValueFromPointer = (name, width) => {
          switch (width) {
            case 4:
              return function(pointer) {
                return this["fromWireType"](HEAPF32[pointer >> 2]);
              };
            case 8:
              return function(pointer) {
                return this["fromWireType"](HEAPF64[pointer >> 3]);
              };
            default:
              throw new TypeError(`invalid float width (${width}): ${name}`);
          }
        };
        var __embind_register_float = (rawType, name, size) => {
          name = readLatin1String(name);
          registerType(rawType, { name, "fromWireType": (value) => value, "toWireType": (destructors, value) => {
            if (typeof value != "number" && typeof value != "boolean") {
              throw new TypeError(`Cannot convert ${embindRepr(value)} to ${this.name}`);
            }
            return value;
          }, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": floatReadValueFromPointer(name, size), destructorFunction: null });
        };
        var integerReadValueFromPointer = (name, width, signed) => {
          switch (width) {
            case 1:
              return signed ? (pointer) => HEAP8[pointer] : (pointer) => HEAPU8[pointer];
            case 2:
              return signed ? (pointer) => HEAP16[pointer >> 1] : (pointer) => HEAPU16[pointer >> 1];
            case 4:
              return signed ? (pointer) => HEAP32[pointer >> 2] : (pointer) => HEAPU32[pointer >> 2];
            default:
              throw new TypeError(`invalid integer width (${width}): ${name}`);
          }
        };
        var __embind_register_integer = (primitiveType, name, size, minRange, maxRange) => {
          name = readLatin1String(name);
          if (maxRange === -1) {
            maxRange = 4294967295;
          }
          var fromWireType = (value) => value;
          if (minRange === 0) {
            var bitshift = 32 - 8 * size;
            fromWireType = (value) => value << bitshift >>> bitshift;
          }
          var isUnsignedType = name.includes("unsigned");
          var checkAssertions = (value, toTypeName) => {
            if (typeof value != "number" && typeof value != "boolean") {
              throw new TypeError(`Cannot convert "${embindRepr(value)}" to ${toTypeName}`);
            }
            if (value < minRange || value > maxRange) {
              throw new TypeError(`Passing a number "${embindRepr(value)}" from JS side to C/C++ side to an argument of type "${name}", which is outside the valid range [${minRange}, ${maxRange}]!`);
            }
          };
          var toWireType;
          if (isUnsignedType) {
            toWireType = function(destructors, value) {
              checkAssertions(value, this.name);
              return value >>> 0;
            };
          } else {
            toWireType = function(destructors, value) {
              checkAssertions(value, this.name);
              return value;
            };
          }
          registerType(primitiveType, { name, "fromWireType": fromWireType, "toWireType": toWireType, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": integerReadValueFromPointer(name, size, minRange !== 0), destructorFunction: null });
        };
        var __embind_register_memory_view = (rawType, dataTypeIndex, name) => {
          var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
          var TA = typeMapping[dataTypeIndex];
          function decodeMemoryView(handle) {
            var size = HEAPU32[handle >> 2];
            var data = HEAPU32[handle + 4 >> 2];
            return new TA(HEAP8.buffer, data, size);
          }
          name = readLatin1String(name);
          registerType(rawType, { name, "fromWireType": decodeMemoryView, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": decodeMemoryView }, { ignoreDuplicateRegistrations: true });
        };
        var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
          assert(typeof str === "string", `stringToUTF8Array expects a string (got ${typeof str})`);
          if (!(maxBytesToWrite > 0)) return 0;
          var startIdx = outIdx;
          var endIdx = outIdx + maxBytesToWrite - 1;
          for (var i = 0; i < str.length; ++i) {
            var u = str.charCodeAt(i);
            if (u >= 55296 && u <= 57343) {
              var u1 = str.charCodeAt(++i);
              u = 65536 + ((u & 1023) << 10) | u1 & 1023;
            }
            if (u <= 127) {
              if (outIdx >= endIdx) break;
              heap[outIdx++] = u;
            } else if (u <= 2047) {
              if (outIdx + 1 >= endIdx) break;
              heap[outIdx++] = 192 | u >> 6;
              heap[outIdx++] = 128 | u & 63;
            } else if (u <= 65535) {
              if (outIdx + 2 >= endIdx) break;
              heap[outIdx++] = 224 | u >> 12;
              heap[outIdx++] = 128 | u >> 6 & 63;
              heap[outIdx++] = 128 | u & 63;
            } else {
              if (outIdx + 3 >= endIdx) break;
              if (u > 1114111) warnOnce("Invalid Unicode code point " + ptrToString(u) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");
              heap[outIdx++] = 240 | u >> 18;
              heap[outIdx++] = 128 | u >> 12 & 63;
              heap[outIdx++] = 128 | u >> 6 & 63;
              heap[outIdx++] = 128 | u & 63;
            }
          }
          heap[outIdx] = 0;
          return outIdx - startIdx;
        };
        var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
          assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
          return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
        };
        var lengthBytesUTF8 = (str) => {
          var len = 0;
          for (var i = 0; i < str.length; ++i) {
            var c = str.charCodeAt(i);
            if (c <= 127) {
              len++;
            } else if (c <= 2047) {
              len += 2;
            } else if (c >= 55296 && c <= 57343) {
              len += 4;
              ++i;
            } else {
              len += 3;
            }
          }
          return len;
        };
        var __embind_register_std_string = (rawType, name) => {
          name = readLatin1String(name);
          var stdStringIsUTF8 = name === "std::string";
          registerType(rawType, { name, "fromWireType"(value) {
            var length = HEAPU32[value >> 2];
            var payload = value + 4;
            var str;
            if (stdStringIsUTF8) {
              var decodeStartPtr = payload;
              for (var i = 0; i <= length; ++i) {
                var currentBytePtr = payload + i;
                if (i == length || HEAPU8[currentBytePtr] == 0) {
                  var maxRead = currentBytePtr - decodeStartPtr;
                  var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                  if (str === void 0) {
                    str = stringSegment;
                  } else {
                    str += String.fromCharCode(0);
                    str += stringSegment;
                  }
                  decodeStartPtr = currentBytePtr + 1;
                }
              }
            } else {
              var a = new Array(length);
              for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAPU8[payload + i]);
              }
              str = a.join("");
            }
            _free(value);
            return str;
          }, "toWireType"(destructors, value) {
            if (value instanceof ArrayBuffer) {
              value = new Uint8Array(value);
            }
            var length;
            var valueIsOfTypeString = typeof value == "string";
            if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
              throwBindingError("Cannot pass non-string to std::string");
            }
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              length = lengthBytesUTF8(value);
            } else {
              length = value.length;
            }
            var base = _malloc(4 + length + 1);
            var ptr = base + 4;
            HEAPU32[base >> 2] = length;
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              stringToUTF8(value, ptr, length + 1);
            } else {
              if (valueIsOfTypeString) {
                for (var i = 0; i < length; ++i) {
                  var charCode = value.charCodeAt(i);
                  if (charCode > 255) {
                    _free(ptr);
                    throwBindingError("String has UTF-16 code units that do not fit in 8 bits");
                  }
                  HEAPU8[ptr + i] = charCode;
                }
              } else {
                for (var i = 0; i < length; ++i) {
                  HEAPU8[ptr + i] = value[i];
                }
              }
            }
            if (destructors !== null) {
              destructors.push(_free, base);
            }
            return base;
          }, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": readPointer, destructorFunction(ptr) {
            _free(ptr);
          } });
        };
        var UTF16Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf-16le") : void 0;
        var UTF16ToString = (ptr, maxBytesToRead) => {
          assert(ptr % 2 == 0, "Pointer passed to UTF16ToString must be aligned to two bytes!");
          var endPtr = ptr;
          var idx = endPtr >> 1;
          var maxIdx = idx + maxBytesToRead / 2;
          while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
          endPtr = idx << 1;
          if (endPtr - ptr > 32 && UTF16Decoder) return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
          var str = "";
          for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
            var codeUnit = HEAP16[ptr + i * 2 >> 1];
            if (codeUnit == 0) break;
            str += String.fromCharCode(codeUnit);
          }
          return str;
        };
        var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
          assert(outPtr % 2 == 0, "Pointer passed to stringToUTF16 must be aligned to two bytes!");
          assert(typeof maxBytesToWrite == "number", "stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
          maxBytesToWrite ??= 2147483647;
          if (maxBytesToWrite < 2) return 0;
          maxBytesToWrite -= 2;
          var startPtr = outPtr;
          var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
          for (var i = 0; i < numCharsToWrite; ++i) {
            var codeUnit = str.charCodeAt(i);
            HEAP16[outPtr >> 1] = codeUnit;
            outPtr += 2;
          }
          HEAP16[outPtr >> 1] = 0;
          return outPtr - startPtr;
        };
        var lengthBytesUTF16 = (str) => str.length * 2;
        var UTF32ToString = (ptr, maxBytesToRead) => {
          assert(ptr % 4 == 0, "Pointer passed to UTF32ToString must be aligned to four bytes!");
          var i = 0;
          var str = "";
          while (!(i >= maxBytesToRead / 4)) {
            var utf32 = HEAP32[ptr + i * 4 >> 2];
            if (utf32 == 0) break;
            ++i;
            if (utf32 >= 65536) {
              var ch = utf32 - 65536;
              str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
            } else {
              str += String.fromCharCode(utf32);
            }
          }
          return str;
        };
        var stringToUTF32 = (str, outPtr, maxBytesToWrite) => {
          assert(outPtr % 4 == 0, "Pointer passed to stringToUTF32 must be aligned to four bytes!");
          assert(typeof maxBytesToWrite == "number", "stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
          maxBytesToWrite ??= 2147483647;
          if (maxBytesToWrite < 4) return 0;
          var startPtr = outPtr;
          var endPtr = startPtr + maxBytesToWrite - 4;
          for (var i = 0; i < str.length; ++i) {
            var codeUnit = str.charCodeAt(i);
            if (codeUnit >= 55296 && codeUnit <= 57343) {
              var trailSurrogate = str.charCodeAt(++i);
              codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
            }
            HEAP32[outPtr >> 2] = codeUnit;
            outPtr += 4;
            if (outPtr + 4 > endPtr) break;
          }
          HEAP32[outPtr >> 2] = 0;
          return outPtr - startPtr;
        };
        var lengthBytesUTF32 = (str) => {
          var len = 0;
          for (var i = 0; i < str.length; ++i) {
            var codeUnit = str.charCodeAt(i);
            if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
            len += 4;
          }
          return len;
        };
        var __embind_register_std_wstring = (rawType, charSize, name) => {
          name = readLatin1String(name);
          var decodeString, encodeString, readCharAt, lengthBytesUTF;
          if (charSize === 2) {
            decodeString = UTF16ToString;
            encodeString = stringToUTF16;
            lengthBytesUTF = lengthBytesUTF16;
            readCharAt = (pointer) => HEAPU16[pointer >> 1];
          } else if (charSize === 4) {
            decodeString = UTF32ToString;
            encodeString = stringToUTF32;
            lengthBytesUTF = lengthBytesUTF32;
            readCharAt = (pointer) => HEAPU32[pointer >> 2];
          }
          registerType(rawType, { name, "fromWireType": (value) => {
            var length = HEAPU32[value >> 2];
            var str;
            var decodeStartPtr = value + 4;
            for (var i = 0; i <= length; ++i) {
              var currentBytePtr = value + 4 + i * charSize;
              if (i == length || readCharAt(currentBytePtr) == 0) {
                var maxReadBytes = currentBytePtr - decodeStartPtr;
                var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
                if (str === void 0) {
                  str = stringSegment;
                } else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + charSize;
              }
            }
            _free(value);
            return str;
          }, "toWireType": (destructors, value) => {
            if (!(typeof value == "string")) {
              throwBindingError(`Cannot pass non-string to C++ string type ${name}`);
            }
            var length = lengthBytesUTF(value);
            var ptr = _malloc(4 + length + charSize);
            HEAPU32[ptr >> 2] = length / charSize;
            encodeString(value, ptr + 4, length + charSize);
            if (destructors !== null) {
              destructors.push(_free, ptr);
            }
            return ptr;
          }, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": readPointer, destructorFunction(ptr) {
            _free(ptr);
          } });
        };
        var __embind_register_value_array = (rawType, name, constructorSignature, rawConstructor, destructorSignature, rawDestructor) => {
          tupleRegistrations[rawType] = { name: readLatin1String(name), rawConstructor: embind__requireFunction(constructorSignature, rawConstructor), rawDestructor: embind__requireFunction(destructorSignature, rawDestructor), elements: [] };
        };
        var __embind_register_value_array_element = (rawTupleType, getterReturnType, getterSignature, getter, getterContext, setterArgumentType, setterSignature, setter, setterContext) => {
          tupleRegistrations[rawTupleType].elements.push({ getterReturnType, getter: embind__requireFunction(getterSignature, getter), getterContext, setterArgumentType, setter: embind__requireFunction(setterSignature, setter), setterContext });
        };
        var __embind_register_value_object = (rawType, name, constructorSignature, rawConstructor, destructorSignature, rawDestructor) => {
          structRegistrations[rawType] = { name: readLatin1String(name), rawConstructor: embind__requireFunction(constructorSignature, rawConstructor), rawDestructor: embind__requireFunction(destructorSignature, rawDestructor), fields: [] };
        };
        var __embind_register_value_object_field = (structType, fieldName, getterReturnType, getterSignature, getter, getterContext, setterArgumentType, setterSignature, setter, setterContext) => {
          structRegistrations[structType].fields.push({ fieldName: readLatin1String(fieldName), getterReturnType, getter: embind__requireFunction(getterSignature, getter), getterContext, setterArgumentType, setter: embind__requireFunction(setterSignature, setter), setterContext });
        };
        var __embind_register_void = (rawType, name) => {
          name = readLatin1String(name);
          registerType(rawType, { isVoid: true, name, "argPackAdvance": 0, "fromWireType": () => void 0, "toWireType": (destructors, o) => void 0 });
        };
        var nowIsMonotonic = 1;
        var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;
        var emval_methodCallers = [];
        var __emval_call = (caller, handle, destructorsRef, args) => {
          caller = emval_methodCallers[caller];
          handle = Emval.toValue(handle);
          return caller(null, handle, destructorsRef, args);
        };
        var emval_addMethodCaller = (caller) => {
          var id2 = emval_methodCallers.length;
          emval_methodCallers.push(caller);
          return id2;
        };
        var emval_lookupTypes = (argCount, argTypes) => {
          var a = new Array(argCount);
          for (var i = 0; i < argCount; ++i) {
            a[i] = requireRegisteredType(HEAPU32[argTypes + i * 4 >> 2], "parameter " + i);
          }
          return a;
        };
        var reflectConstruct = Reflect.construct;
        var emval_returnValue = (returnType, destructorsRef, handle) => {
          var destructors = [];
          var result = returnType["toWireType"](destructors, handle);
          if (destructors.length) {
            HEAPU32[destructorsRef >> 2] = Emval.toHandle(destructors);
          }
          return result;
        };
        var __emval_get_method_caller = (argCount, argTypes, kind) => {
          var types = emval_lookupTypes(argCount, argTypes);
          var retType = types.shift();
          argCount--;
          var argN = new Array(argCount);
          var invokerFunction = (obj, func, destructorsRef, args) => {
            var offset = 0;
            for (var i = 0; i < argCount; ++i) {
              argN[i] = types[i]["readValueFromPointer"](args + offset);
              offset += types[i]["argPackAdvance"];
            }
            var rv = kind === 1 ? reflectConstruct(func, argN) : func.apply(obj, argN);
            return emval_returnValue(retType, destructorsRef, rv);
          };
          var functionName = `methodCaller<(${types.map((t) => t.name).join(", ")}) => ${retType.name}>`;
          return emval_addMethodCaller(createNamedFunction(functionName, invokerFunction));
        };
        var __emval_incref = (handle) => {
          if (handle > 9) {
            emval_handles[handle + 1] += 1;
          }
        };
        var __emval_run_destructors = (handle) => {
          var destructors = Emval.toValue(handle);
          runDestructors(destructors);
          __emval_decref(handle);
        };
        var __emval_take_value = (type, arg) => {
          type = requireRegisteredType(type, "_emval_take_value");
          var v = type["readValueFromPointer"](arg);
          return Emval.toHandle(v);
        };
        var __wasmfs_copy_preloaded_file_data = (index, buffer) => HEAPU8.set(wasmFSPreloadedFiles[index].fileData, buffer);
        var wasmFSPreloadedDirs = [];
        var __wasmfs_get_num_preloaded_dirs = () => wasmFSPreloadedDirs.length;
        var wasmFSPreloadedFiles = [];
        var wasmFSPreloadingFlushed = false;
        var __wasmfs_get_num_preloaded_files = () => {
          wasmFSPreloadingFlushed = true;
          return wasmFSPreloadedFiles.length;
        };
        var __wasmfs_get_preloaded_child_path = (index, childNameBuffer) => {
          var s = wasmFSPreloadedDirs[index].childName;
          var len = lengthBytesUTF8(s) + 1;
          stringToUTF8(s, childNameBuffer, len);
        };
        var __wasmfs_get_preloaded_file_mode = (index) => wasmFSPreloadedFiles[index].mode;
        var __wasmfs_get_preloaded_file_size = (index) => wasmFSPreloadedFiles[index].fileData.length;
        var __wasmfs_get_preloaded_parent_path = (index, parentPathBuffer) => {
          var s = wasmFSPreloadedDirs[index].parentPath;
          var len = lengthBytesUTF8(s) + 1;
          stringToUTF8(s, parentPathBuffer, len);
        };
        var __wasmfs_get_preloaded_path_name = (index, fileNameBuffer) => {
          var s = wasmFSPreloadedFiles[index].pathName;
          var len = lengthBytesUTF8(s) + 1;
          stringToUTF8(s, fileNameBuffer, len);
        };
        var __wasmfs_jsimpl_alloc_file = (backend, file) => {
          assert(wasmFS$backends[backend]);
          return wasmFS$backends[backend].allocFile(file);
        };
        var __wasmfs_jsimpl_free_file = (backend, file) => {
          assert(wasmFS$backends[backend]);
          return wasmFS$backends[backend].freeFile(file);
        };
        var __wasmfs_jsimpl_get_size = (backend, file) => {
          assert(wasmFS$backends[backend]);
          return wasmFS$backends[backend].getSize(file);
        };
        var convertI32PairToI53Checked = (lo2, hi2) => {
          assert(lo2 == lo2 >>> 0 || lo2 == (lo2 | 0));
          assert(hi2 === (hi2 | 0));
          return hi2 + 2097152 >>> 0 < 4194305 - !!lo2 ? (lo2 >>> 0) + hi2 * 4294967296 : NaN;
        };
        function __wasmfs_jsimpl_read(backend, file, buffer, length, offset_low, offset_high) {
          var offset = convertI32PairToI53Checked(offset_low, offset_high);
          assert(wasmFS$backends[backend]);
          if (!wasmFS$backends[backend].read) {
            return -28;
          }
          return wasmFS$backends[backend].read(file, buffer, length, offset);
        }
        function __wasmfs_jsimpl_write(backend, file, buffer, length, offset_low, offset_high) {
          var offset = convertI32PairToI53Checked(offset_low, offset_high);
          assert(wasmFS$backends[backend]);
          if (!wasmFS$backends[backend].write) {
            return -28;
          }
          return wasmFS$backends[backend].write(file, buffer, length, offset);
        }
        var FS_stdin_getChar_buffer = [];
        function intArrayFromString(stringy, dontAddNull, length) {
          var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
          var u8array = new Array(len);
          var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
          if (dontAddNull) u8array.length = numBytesWritten;
          return u8array;
        }
        var FS_stdin_getChar = () => {
          if (!FS_stdin_getChar_buffer.length) {
            var result = null;
            if (typeof window != "undefined" && typeof window.prompt == "function") {
              result = window.prompt("Input: ");
              if (result !== null) {
                result += "\n";
              }
            } else if (typeof readline == "function") {
              result = readline();
              if (result !== null) {
                result += "\n";
              }
            }
            if (!result) {
              return null;
            }
            FS_stdin_getChar_buffer = intArrayFromString(result, true);
          }
          return FS_stdin_getChar_buffer.shift();
        };
        var __wasmfs_stdin_get_char = () => {
          var c = FS_stdin_getChar();
          if (typeof c === "number") {
            return c;
          }
          return -1;
        };
        var _abort = () => {
          abort("native code called abort()");
        };
        var _emscripten_date_now = () => Date.now();
        var _emscripten_err = (str) => err(UTF8ToString(str));
        var _emscripten_get_now;
        _emscripten_get_now = () => performance.now();
        var _emscripten_memcpy_js = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num);
        var _emscripten_out = (str) => out(UTF8ToString(str));
        var getHeapMax = () => 2147483648;
        var growMemory = (size) => {
          var b = wasmMemory.buffer;
          var pages = (size - b.byteLength + 65535) / 65536;
          try {
            wasmMemory.grow(pages);
            updateMemoryViews();
            return 1;
          } catch (e) {
            err(`growMemory: Attempted to grow heap from ${b.byteLength} bytes to ${size} bytes, but got error: ${e}`);
          }
        };
        var _emscripten_resize_heap = (requestedSize) => {
          var oldSize = HEAPU8.length;
          requestedSize >>>= 0;
          assert(requestedSize > oldSize);
          var maxHeapSize = getHeapMax();
          if (requestedSize > maxHeapSize) {
            err(`Cannot enlarge memory, requested ${requestedSize} bytes, but the limit is ${maxHeapSize} bytes!`);
            return false;
          }
          var alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
          for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
            var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
            overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
            var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
            var replacement = growMemory(newSize);
            if (replacement) {
              return true;
            }
          }
          err(`Failed to grow the heap from ${oldSize} bytes to ${newSize} bytes, not enough memory!`);
          return false;
        };
        var ENV = {};
        var getExecutableName = () => thisProgram || "./this.program";
        var getEnvStrings = () => {
          if (!getEnvStrings.strings) {
            var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
            var env = { "USER": "web_user", "LOGNAME": "web_user", "PATH": "/", "PWD": "/", "HOME": "/home/web_user", "LANG": lang, "_": getExecutableName() };
            for (var x in ENV) {
              if (ENV[x] === void 0) delete env[x];
              else env[x] = ENV[x];
            }
            var strings = [];
            for (var x in env) {
              strings.push(`${x}=${env[x]}`);
            }
            getEnvStrings.strings = strings;
          }
          return getEnvStrings.strings;
        };
        var stringToAscii = (str, buffer) => {
          for (var i = 0; i < str.length; ++i) {
            assert(str.charCodeAt(i) === (str.charCodeAt(i) & 255));
            HEAP8[buffer++] = str.charCodeAt(i);
          }
          HEAP8[buffer] = 0;
        };
        var _environ_get = (__environ, environ_buf) => {
          var bufSize = 0;
          getEnvStrings().forEach((string, i) => {
            var ptr = environ_buf + bufSize;
            HEAPU32[__environ + i * 4 >> 2] = ptr;
            stringToAscii(string, ptr);
            bufSize += string.length + 1;
          });
          return 0;
        };
        var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
          var strings = getEnvStrings();
          HEAPU32[penviron_count >> 2] = strings.length;
          var bufSize = 0;
          strings.forEach((string) => bufSize += string.length + 1);
          HEAPU32[penviron_buf_size >> 2] = bufSize;
          return 0;
        };
        var runtimeKeepaliveCounter = 0;
        var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
        var _proc_exit = (code) => {
          EXITSTATUS = code;
          if (!keepRuntimeAlive()) {
            Module["onExit"]?.(code);
            ABORT = true;
          }
          quit_(code, new ExitStatus(code));
        };
        var exitJS = (status, implicit) => {
          EXITSTATUS = status;
          checkUnflushedContent();
          if (keepRuntimeAlive() && !implicit) {
            var msg = `program exited (with status: ${status}), but keepRuntimeAlive() is set (counter=${runtimeKeepaliveCounter}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;
            readyPromiseReject(msg);
            err(msg);
          }
          _proc_exit(status);
        };
        var _exit = exitJS;
        var initRandomFill = () => {
          if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
            return (view) => crypto.getRandomValues(view);
          } else abort("no cryptographic support found for randomDevice. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: (array) => { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };");
        };
        var randomFill = (view) => (randomFill = initRandomFill())(view);
        var _getentropy = (buffer, size) => {
          randomFill(HEAPU8.subarray(buffer, buffer + size));
          return 0;
        };
        var isLeapYear = (year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
        var arraySum = (array, index) => {
          var sum = 0;
          for (var i = 0; i <= index; sum += array[i++]) {
          }
          return sum;
        };
        var MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var addDays = (date, days) => {
          var newDate = new Date(date.getTime());
          while (days > 0) {
            var leap = isLeapYear(newDate.getFullYear());
            var currentMonth = newDate.getMonth();
            var daysInCurrentMonth = (leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[currentMonth];
            if (days > daysInCurrentMonth - newDate.getDate()) {
              days -= daysInCurrentMonth - newDate.getDate() + 1;
              newDate.setDate(1);
              if (currentMonth < 11) {
                newDate.setMonth(currentMonth + 1);
              } else {
                newDate.setMonth(0);
                newDate.setFullYear(newDate.getFullYear() + 1);
              }
            } else {
              newDate.setDate(newDate.getDate() + days);
              return newDate;
            }
          }
          return newDate;
        };
        var writeArrayToMemory = (array, buffer) => {
          assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
          HEAP8.set(array, buffer);
        };
        var _strftime = (s, maxsize, format, tm) => {
          var tm_zone = HEAPU32[tm + 40 >> 2];
          var date = { tm_sec: HEAP32[tm >> 2], tm_min: HEAP32[tm + 4 >> 2], tm_hour: HEAP32[tm + 8 >> 2], tm_mday: HEAP32[tm + 12 >> 2], tm_mon: HEAP32[tm + 16 >> 2], tm_year: HEAP32[tm + 20 >> 2], tm_wday: HEAP32[tm + 24 >> 2], tm_yday: HEAP32[tm + 28 >> 2], tm_isdst: HEAP32[tm + 32 >> 2], tm_gmtoff: HEAP32[tm + 36 >> 2], tm_zone: tm_zone ? UTF8ToString(tm_zone) : "" };
          var pattern = UTF8ToString(format);
          var EXPANSION_RULES_1 = { "%c": "%a %b %d %H:%M:%S %Y", "%D": "%m/%d/%y", "%F": "%Y-%m-%d", "%h": "%b", "%r": "%I:%M:%S %p", "%R": "%H:%M", "%T": "%H:%M:%S", "%x": "%m/%d/%y", "%X": "%H:%M:%S", "%Ec": "%c", "%EC": "%C", "%Ex": "%m/%d/%y", "%EX": "%H:%M:%S", "%Ey": "%y", "%EY": "%Y", "%Od": "%d", "%Oe": "%e", "%OH": "%H", "%OI": "%I", "%Om": "%m", "%OM": "%M", "%OS": "%S", "%Ou": "%u", "%OU": "%U", "%OV": "%V", "%Ow": "%w", "%OW": "%W", "%Oy": "%y" };
          for (var rule in EXPANSION_RULES_1) {
            pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
          }
          var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          function leadingSomething(value, digits, character) {
            var str = typeof value == "number" ? value.toString() : value || "";
            while (str.length < digits) {
              str = character[0] + str;
            }
            return str;
          }
          function leadingNulls(value, digits) {
            return leadingSomething(value, digits, "0");
          }
          function compareByDay(date1, date2) {
            function sgn(value) {
              return value < 0 ? -1 : value > 0 ? 1 : 0;
            }
            var compare;
            if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
              if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
                compare = sgn(date1.getDate() - date2.getDate());
              }
            }
            return compare;
          }
          function getFirstWeekStartDate(janFourth) {
            switch (janFourth.getDay()) {
              case 0:
                return new Date(janFourth.getFullYear() - 1, 11, 29);
              case 1:
                return janFourth;
              case 2:
                return new Date(janFourth.getFullYear(), 0, 3);
              case 3:
                return new Date(janFourth.getFullYear(), 0, 2);
              case 4:
                return new Date(janFourth.getFullYear(), 0, 1);
              case 5:
                return new Date(janFourth.getFullYear() - 1, 11, 31);
              case 6:
                return new Date(janFourth.getFullYear() - 1, 11, 30);
            }
          }
          function getWeekBasedYear(date2) {
            var thisDate = addDays(new Date(date2.tm_year + 1900, 0, 1), date2.tm_yday);
            var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
            var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
            var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
            var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
            if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
              if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
                return thisDate.getFullYear() + 1;
              }
              return thisDate.getFullYear();
            }
            return thisDate.getFullYear() - 1;
          }
          var EXPANSION_RULES_2 = { "%a": (date2) => WEEKDAYS[date2.tm_wday].substring(0, 3), "%A": (date2) => WEEKDAYS[date2.tm_wday], "%b": (date2) => MONTHS[date2.tm_mon].substring(0, 3), "%B": (date2) => MONTHS[date2.tm_mon], "%C": (date2) => {
            var year = date2.tm_year + 1900;
            return leadingNulls(year / 100 | 0, 2);
          }, "%d": (date2) => leadingNulls(date2.tm_mday, 2), "%e": (date2) => leadingSomething(date2.tm_mday, 2, " "), "%g": (date2) => getWeekBasedYear(date2).toString().substring(2), "%G": getWeekBasedYear, "%H": (date2) => leadingNulls(date2.tm_hour, 2), "%I": (date2) => {
            var twelveHour = date2.tm_hour;
            if (twelveHour == 0) twelveHour = 12;
            else if (twelveHour > 12) twelveHour -= 12;
            return leadingNulls(twelveHour, 2);
          }, "%j": (date2) => leadingNulls(date2.tm_mday + arraySum(isLeapYear(date2.tm_year + 1900) ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR, date2.tm_mon - 1), 3), "%m": (date2) => leadingNulls(date2.tm_mon + 1, 2), "%M": (date2) => leadingNulls(date2.tm_min, 2), "%n": () => "\n", "%p": (date2) => {
            if (date2.tm_hour >= 0 && date2.tm_hour < 12) {
              return "AM";
            }
            return "PM";
          }, "%S": (date2) => leadingNulls(date2.tm_sec, 2), "%t": () => "	", "%u": (date2) => date2.tm_wday || 7, "%U": (date2) => {
            var days = date2.tm_yday + 7 - date2.tm_wday;
            return leadingNulls(Math.floor(days / 7), 2);
          }, "%V": (date2) => {
            var val = Math.floor((date2.tm_yday + 7 - (date2.tm_wday + 6) % 7) / 7);
            if ((date2.tm_wday + 371 - date2.tm_yday - 2) % 7 <= 2) {
              val++;
            }
            if (!val) {
              val = 52;
              var dec31 = (date2.tm_wday + 7 - date2.tm_yday - 1) % 7;
              if (dec31 == 4 || dec31 == 5 && isLeapYear(date2.tm_year % 400 - 1)) {
                val++;
              }
            } else if (val == 53) {
              var jan1 = (date2.tm_wday + 371 - date2.tm_yday) % 7;
              if (jan1 != 4 && (jan1 != 3 || !isLeapYear(date2.tm_year))) val = 1;
            }
            return leadingNulls(val, 2);
          }, "%w": (date2) => date2.tm_wday, "%W": (date2) => {
            var days = date2.tm_yday + 7 - (date2.tm_wday + 6) % 7;
            return leadingNulls(Math.floor(days / 7), 2);
          }, "%y": (date2) => (date2.tm_year + 1900).toString().substring(2), "%Y": (date2) => date2.tm_year + 1900, "%z": (date2) => {
            var off = date2.tm_gmtoff;
            var ahead = off >= 0;
            off = Math.abs(off) / 60;
            off = off / 60 * 100 + off % 60;
            return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
          }, "%Z": (date2) => date2.tm_zone, "%%": () => "%" };
          pattern = pattern.replace(/%%/g, "\0\0");
          for (var rule in EXPANSION_RULES_2) {
            if (pattern.includes(rule)) {
              pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date));
            }
          }
          pattern = pattern.replace(/\0\0/g, "%");
          var bytes = intArrayFromString(pattern, false);
          if (bytes.length > maxsize) {
            return 0;
          }
          writeArrayToMemory(bytes, s);
          return bytes.length - 1;
        };
        var _strftime_l = (s, maxsize, format, tm, loc) => _strftime(s, maxsize, format, tm);
        var stringToUTF8OnStack = (str) => {
          var size = lengthBytesUTF8(str) + 1;
          var ret = stackAlloc(size);
          stringToUTF8(str, ret, size);
          return ret;
        };
        var PATH = { isAbs: (path) => path.charAt(0) === "/", splitPath: (filename) => {
          var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
          return splitPathRe.exec(filename).slice(1);
        }, normalizeArray: (parts, allowAboveRoot) => {
          var up = 0;
          for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i];
            if (last === ".") {
              parts.splice(i, 1);
            } else if (last === "..") {
              parts.splice(i, 1);
              up++;
            } else if (up) {
              parts.splice(i, 1);
              up--;
            }
          }
          if (allowAboveRoot) {
            for (; up; up--) {
              parts.unshift("..");
            }
          }
          return parts;
        }, normalize: (path) => {
          var isAbsolute = PATH.isAbs(path), trailingSlash = path.substr(-1) === "/";
          path = PATH.normalizeArray(path.split("/").filter((p) => !!p), !isAbsolute).join("/");
          if (!path && !isAbsolute) {
            path = ".";
          }
          if (path && trailingSlash) {
            path += "/";
          }
          return (isAbsolute ? "/" : "") + path;
        }, dirname: (path) => {
          var result = PATH.splitPath(path), root = result[0], dir = result[1];
          if (!root && !dir) {
            return ".";
          }
          if (dir) {
            dir = dir.substr(0, dir.length - 1);
          }
          return root + dir;
        }, basename: (path) => {
          if (path === "/") return "/";
          path = PATH.normalize(path);
          path = path.replace(/\/$/, "");
          var lastSlash = path.lastIndexOf("/");
          if (lastSlash === -1) return path;
          return path.substr(lastSlash + 1);
        }, join: (...paths) => PATH.normalize(paths.join("/")), join2: (l, r) => PATH.normalize(l + "/" + r) };
        var withStackSave = (f) => {
          var stack = stackSave();
          var ret = f();
          stackRestore(stack);
          return ret;
        };
        var readI53FromI64 = (ptr) => HEAPU32[ptr >> 2] + HEAP32[ptr + 4 >> 2] * 4294967296;
        var readI53FromU64 = (ptr) => HEAPU32[ptr >> 2] + HEAPU32[ptr + 4 >> 2] * 4294967296;
        var FS_mknod = (path, mode, dev) => FS.handleError(withStackSave(() => {
          var pathBuffer = stringToUTF8OnStack(path);
          return __wasmfs_mknod(pathBuffer, mode, dev);
        }));
        var FS_create = (path, mode = 438) => {
          mode &= 4095;
          mode |= 32768;
          return FS_mknod(path, mode, 0);
        };
        var FS_writeFile = (path, data) => withStackSave(() => {
          var pathBuffer = stringToUTF8OnStack(path);
          if (typeof data == "string") {
            var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
            var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
            data = buf.slice(0, actualNumBytes);
          }
          var dataBuffer = _malloc(data.length);
          assert(dataBuffer);
          for (var i = 0; i < data.length; i++) {
            HEAP8[dataBuffer + i] = data[i];
          }
          var ret = __wasmfs_write_file(pathBuffer, dataBuffer, data.length);
          _free(dataBuffer);
          return ret;
        });
        var FS_createDataFile = (parent, name, fileData, canRead, canWrite, canOwn) => {
          var pathName = name ? parent + "/" + name : parent;
          var mode = FS_getMode(canRead, canWrite);
          if (!wasmFSPreloadingFlushed) {
            wasmFSPreloadedFiles.push({ pathName, fileData, mode });
          } else {
            FS_create(pathName, mode);
            FS_writeFile(pathName, fileData);
          }
        };
        var asyncLoad = (url, onload, onerror, noRunDep) => {
          var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : "";
          readAsync(url, (arrayBuffer) => {
            assert(arrayBuffer, `Loading data file "${url}" failed (no arrayBuffer).`);
            onload(new Uint8Array(arrayBuffer));
            if (dep) removeRunDependency(dep);
          }, (event) => {
            if (onerror) {
              onerror();
            } else {
              throw `Loading data file "${url}" failed.`;
            }
          });
          if (dep) addRunDependency(dep);
        };
        var PATH_FS = { resolve: (...args) => {
          var resolvedPath = "", resolvedAbsolute = false;
          for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path = i >= 0 ? args[i] : FS.cwd();
            if (typeof path != "string") {
              throw new TypeError("Arguments to path.resolve must be strings");
            } else if (!path) {
              return "";
            }
            resolvedPath = path + "/" + resolvedPath;
            resolvedAbsolute = PATH.isAbs(path);
          }
          resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter((p) => !!p), !resolvedAbsolute).join("/");
          return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
        }, relative: (from, to) => {
          from = PATH_FS.resolve(from).substr(1);
          to = PATH_FS.resolve(to).substr(1);
          function trim(arr) {
            var start = 0;
            for (; start < arr.length; start++) {
              if (arr[start] !== "") break;
            }
            var end = arr.length - 1;
            for (; end >= 0; end--) {
              if (arr[end] !== "") break;
            }
            if (start > end) return [];
            return arr.slice(start, end - start + 1);
          }
          var fromParts = trim(from.split("/"));
          var toParts = trim(to.split("/"));
          var length = Math.min(fromParts.length, toParts.length);
          var samePartsLength = length;
          for (var i = 0; i < length; i++) {
            if (fromParts[i] !== toParts[i]) {
              samePartsLength = i;
              break;
            }
          }
          var outputParts = [];
          for (var i = samePartsLength; i < fromParts.length; i++) {
            outputParts.push("..");
          }
          outputParts = outputParts.concat(toParts.slice(samePartsLength));
          return outputParts.join("/");
        } };
        var preloadPlugins = Module["preloadPlugins"] || [];
        var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
          if (typeof Browser != "undefined") Browser.init();
          var handled = false;
          preloadPlugins.forEach((plugin) => {
            if (handled) return;
            if (plugin["canHandle"](fullname)) {
              plugin["handle"](byteArray, fullname, finish, onerror);
              handled = true;
            }
          });
          return handled;
        };
        var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
          var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
          var dep = getUniqueRunDependency(`cp ${fullname}`);
          function processData(byteArray) {
            function finish(byteArray2) {
              preFinish?.();
              if (!dontCreateFile) {
                FS_createDataFile(parent, name, byteArray2, canRead, canWrite, canOwn);
              }
              onload?.();
              removeRunDependency(dep);
            }
            if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
              onerror?.();
              removeRunDependency(dep);
            })) {
              return;
            }
            finish(byteArray);
          }
          addRunDependency(dep);
          if (typeof url == "string") {
            asyncLoad(url, processData, onerror);
          } else {
            processData(url);
          }
        };
        var FS_getMode = (canRead, canWrite) => {
          var mode = 0;
          if (canRead) mode |= 292 | 73;
          if (canWrite) mode |= 146;
          return mode;
        };
        var FS_modeStringToFlags = (str) => {
          var flagModes = { "r": 0, "r+": 2, "w": 512 | 64 | 1, "w+": 512 | 64 | 2, "a": 1024 | 64 | 1, "a+": 1024 | 64 | 2 };
          var flags = flagModes[str];
          if (typeof flags == "undefined") {
            throw new Error(`Unknown file open mode: ${str}`);
          }
          return flags;
        };
        var FS_mkdir = (path, mode = 511) => FS.handleError(withStackSave(() => {
          var buffer = stringToUTF8OnStack(path);
          return __wasmfs_mkdir(buffer, mode);
        }));
        var FS_mkdirTree = (path, mode) => {
          var dirs = path.split("/");
          var d = "";
          for (var i = 0; i < dirs.length; ++i) {
            if (!dirs[i]) continue;
            d += "/" + dirs[i];
            try {
              FS_mkdir(d, mode);
            } catch (e) {
              if (e.errno != 20) throw e;
            }
          }
        };
        var FS_unlink = (path) => withStackSave(() => {
          var buffer = stringToUTF8OnStack(path);
          return __wasmfs_unlink(buffer);
        });
        var wasmFS$backends = {};
        var wasmFSDevices = {};
        var wasmFSDeviceStreams = {};
        var FS = { init() {
          FS.ensureErrnoError();
        }, ErrnoError: null, handleError(returnValue) {
          if (returnValue < 0) {
            throw new FS.ErrnoError(-returnValue);
          }
          return returnValue;
        }, ensureErrnoError() {
          if (FS.ErrnoError) return;
          FS.ErrnoError = function ErrnoError(code) {
            this.errno = code;
            this.message = "FS error";
            this.name = "ErrnoError";
          };
          FS.ErrnoError.prototype = new Error();
          FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        }, createDataFile(parent, name, fileData, canRead, canWrite, canOwn) {
          FS_createDataFile(parent, name, fileData, canRead, canWrite, canOwn);
        }, createPath(parent, path, canRead, canWrite) {
          var parts = path.split("/").reverse();
          while (parts.length) {
            var part = parts.pop();
            if (!part) continue;
            var current = PATH.join2(parent, part);
            if (!wasmFSPreloadingFlushed) {
              wasmFSPreloadedDirs.push({ parentPath: parent, childName: part });
            } else {
              FS.mkdir(current);
            }
            parent = current;
          }
          return current;
        }, createPreloadedFile(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
          return FS_createPreloadedFile(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish);
        }, readFile(path, opts = {}) {
          opts.encoding = opts.encoding || "binary";
          if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
            throw new Error('Invalid encoding type "' + opts.encoding + '"');
          }
          var buf = withStackSave(() => __wasmfs_read_file(stringToUTF8OnStack(path)));
          var length = readI53FromI64(buf);
          var ret = new Uint8Array(HEAPU8.subarray(buf + 8, buf + 8 + length));
          if (opts.encoding === "utf8") {
            ret = UTF8ArrayToString(ret, 0);
          }
          return ret;
        }, cwd: () => UTF8ToString(__wasmfs_get_cwd()), analyzePath(path) {
          var exists = !!FS.findObject(path);
          return { exists, object: { contents: exists ? FS.readFile(path) : null } };
        }, mkdir: (path, mode) => FS_mkdir(path, mode), mkdirTree: (path, mode) => FS_mkdirTree(path, mode), rmdir: (path) => FS.handleError(withStackSave(() => __wasmfs_rmdir(stringToUTF8OnStack(path)))), open: (path, flags, mode) => withStackSave(() => {
          flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags;
          mode = typeof mode == "undefined" ? 438 : mode;
          var buffer = stringToUTF8OnStack(path);
          var fd = FS.handleError(__wasmfs_open(buffer, flags, mode));
          return { fd };
        }), create: (path, mode) => FS_create(path, mode), close: (stream) => FS.handleError(-__wasmfs_close(stream.fd)), unlink: (path) => FS_unlink(path), chdir: (path) => withStackSave(() => {
          var buffer = stringToUTF8OnStack(path);
          return __wasmfs_chdir(buffer);
        }), read(stream, buffer, offset, length, position) {
          var seeking = typeof position != "undefined";
          var dataBuffer = _malloc(length);
          var bytesRead;
          if (seeking) {
            bytesRead = __wasmfs_pread(stream.fd, dataBuffer, length, position);
          } else {
            bytesRead = __wasmfs_read(stream.fd, dataBuffer, length);
          }
          bytesRead = FS.handleError(bytesRead);
          for (var i = 0; i < length; i++) {
            buffer[offset + i] = HEAP8[dataBuffer + i];
          }
          _free(dataBuffer);
          return bytesRead;
        }, write(stream, buffer, offset, length, position, canOwn) {
          var seeking = typeof position != "undefined";
          var dataBuffer = _malloc(length);
          for (var i = 0; i < length; i++) {
            HEAP8[dataBuffer + i] = buffer[offset + i];
          }
          var bytesRead;
          if (seeking) {
            bytesRead = __wasmfs_pwrite(stream.fd, dataBuffer, length, position);
          } else {
            bytesRead = __wasmfs_write(stream.fd, dataBuffer, length);
          }
          bytesRead = FS.handleError(bytesRead);
          _free(dataBuffer);
          return bytesRead;
        }, allocate(stream, offset, length) {
          return FS.handleError(__wasmfs_allocate(stream.fd, offset >>> 0, (tempDouble = offset, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0), length >>> 0, (tempDouble = length, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)));
        }, writeFile: (path, data) => FS_writeFile(path, data), mmap: (stream, length, offset, prot, flags) => {
          var buf = FS.handleError(__wasmfs_mmap(length, prot, flags, stream.fd, offset >>> 0, (tempDouble = offset, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)));
          return { ptr: buf, allocated: true };
        }, msync: (stream, bufferPtr, offset, length, mmapFlags) => {
          assert(offset === 0);
          return FS.handleError(__wasmfs_msync(bufferPtr, length, mmapFlags));
        }, munmap: (addr, length) => FS.handleError(__wasmfs_munmap(addr, length)), symlink: (target, linkpath) => withStackSave(() => __wasmfs_symlink(stringToUTF8OnStack(target), stringToUTF8OnStack(linkpath))), readlink(path) {
          var readBuffer = FS.handleError(withStackSave(() => __wasmfs_readlink(stringToUTF8OnStack(path))));
          return UTF8ToString(readBuffer);
        }, statBufToObject(statBuf) {
          return { dev: HEAPU32[statBuf >> 2], mode: HEAPU32[statBuf + 4 >> 2], nlink: HEAPU32[statBuf + 8 >> 2], uid: HEAPU32[statBuf + 12 >> 2], gid: HEAPU32[statBuf + 16 >> 2], rdev: HEAPU32[statBuf + 20 >> 2], size: readI53FromI64(statBuf + 24), blksize: HEAPU32[statBuf + 32 >> 2], blocks: HEAPU32[statBuf + 36 >> 2], atime: readI53FromI64(statBuf + 40), mtime: readI53FromI64(statBuf + 56), ctime: readI53FromI64(statBuf + 72), ino: readI53FromU64(statBuf + 88) };
        }, stat(path) {
          var statBuf = _malloc(96);
          FS.handleError(withStackSave(() => __wasmfs_stat(stringToUTF8OnStack(path), statBuf)));
          var stats = FS.statBufToObject(statBuf);
          _free(statBuf);
          return stats;
        }, lstat(path) {
          var statBuf = _malloc(96);
          FS.handleError(withStackSave(() => __wasmfs_lstat(stringToUTF8OnStack(path), statBuf)));
          var stats = FS.statBufToObject(statBuf);
          _free(statBuf);
          return stats;
        }, chmod(path, mode) {
          return FS.handleError(withStackSave(() => {
            var buffer = stringToUTF8OnStack(path);
            return __wasmfs_chmod(buffer, mode);
          }));
        }, lchmod(path, mode) {
          return FS.handleError(withStackSave(() => {
            var buffer = stringToUTF8OnStack(path);
            return __wasmfs_lchmod(buffer, mode);
          }));
        }, fchmod(fd, mode) {
          return FS.handleError(__wasmfs_fchmod(fd, mode));
        }, utime: (path, atime, mtime) => FS.handleError(withStackSave(() => __wasmfs_utime(stringToUTF8OnStack(path), atime, mtime))), truncate(path, len) {
          return FS.handleError(withStackSave(() => __wasmfs_truncate(stringToUTF8OnStack(path), len >>> 0, (tempDouble = len, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0))));
        }, ftruncate(fd, len) {
          return FS.handleError(__wasmfs_ftruncate(fd, len >>> 0, (tempDouble = len, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)));
        }, findObject(path) {
          var result = withStackSave(() => __wasmfs_identify(stringToUTF8OnStack(path)));
          if (result == 44) {
            return null;
          }
          return { isFolder: result == 31, isDevice: false };
        }, readdir: (path) => withStackSave(() => {
          var pathBuffer = stringToUTF8OnStack(path);
          var entries = [];
          var state = __wasmfs_readdir_start(pathBuffer);
          if (!state) {
            throw new Error("No such directory");
          }
          var entry;
          while (entry = __wasmfs_readdir_get(state)) {
            entries.push(UTF8ToString(entry));
          }
          __wasmfs_readdir_finish(state);
          return entries;
        }), mount: (type, opts, mountpoint) => {
          if (typeof type == "string") {
            throw type;
          }
          var backendPointer = type.createBackend(opts);
          return FS.handleError(withStackSave(() => __wasmfs_mount(stringToUTF8OnStack(mountpoint), backendPointer)));
        }, unmount: (mountpoint) => FS.handleError(withStackSave(() => __wasmfs_unmount(stringToUTF8OnStack(mountpoint)))), mknod: (path, mode, dev) => FS_mknod(path, mode, dev), makedev: (ma, mi) => ma << 8 | mi, registerDevice(dev, ops) {
          var backendPointer = _wasmfs_create_jsimpl_backend();
          var definedOps = { userRead: ops.read, userWrite: ops.write, allocFile: (file) => {
            wasmFSDeviceStreams[file] = {};
          }, freeFile: (file) => {
            wasmFSDeviceStreams[file] = void 0;
          }, getSize: (file) => {
          }, read: (file, buffer, length, offset) => {
            var bufferArray = Module.HEAP8.subarray(buffer, buffer + length);
            try {
              var bytesRead = definedOps.userRead(wasmFSDeviceStreams[file], bufferArray, 0, length, offset);
            } catch (e) {
              return -e.errno;
            }
            Module.HEAP8.set(bufferArray, buffer);
            return bytesRead;
          }, write: (file, buffer, length, offset) => {
            var bufferArray = Module.HEAP8.subarray(buffer, buffer + length);
            try {
              var bytesWritten = definedOps.userWrite(wasmFSDeviceStreams[file], bufferArray, 0, length, offset);
            } catch (e) {
              return -e.errno;
            }
            Module.HEAP8.set(bufferArray, buffer);
            return bytesWritten;
          } };
          wasmFS$backends[backendPointer] = definedOps;
          wasmFSDevices[dev] = backendPointer;
        }, createDevice(parent, name, input, output) {
          if (typeof parent != "string") {
            throw new Error("Only string paths are accepted");
          }
          var path = PATH.join2(parent, name);
          var mode = FS_getMode(!!input, !!output);
          if (!FS.createDevice.major) FS.createDevice.major = 64;
          var dev = FS.makedev(FS.createDevice.major++, 0);
          FS.registerDevice(dev, { read(stream, buffer, offset, length, pos) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
              if (result === void 0 && bytesRead === 0) {
                throw new FS.ErrnoError(6);
              }
              if (result === null || result === void 0) break;
              bytesRead++;
              buffer[offset + i] = result;
            }
            return bytesRead;
          }, write(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset + i]);
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
            }
            return i;
          } });
          return FS.mkdev(path, mode, dev);
        }, mkdev(path, mode, dev) {
          if (typeof dev === "undefined") {
            dev = mode;
            mode = 438;
          }
          var deviceBackend = wasmFSDevices[dev];
          if (!deviceBackend) {
            throw new Error("Invalid device ID.");
          }
          return FS.handleError(withStackSave(() => _wasmfs_create_file(stringToUTF8OnStack(path), mode, deviceBackend)));
        }, rename(oldPath, newPath) {
          return FS.handleError(withStackSave(() => {
            var oldPathBuffer = stringToUTF8OnStack(oldPath);
            var newPathBuffer = stringToUTF8OnStack(newPath);
            return __wasmfs_rename(oldPathBuffer, newPathBuffer);
          }));
        }, llseek(stream, offset, whence) {
          return FS.handleError(__wasmfs_llseek(stream.fd, offset >>> 0, (tempDouble = offset, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0), whence));
        } };
        InternalError = Module["InternalError"] = class InternalError extends Error {
          constructor(message) {
            super(message);
            this.name = "InternalError";
          }
        };
        embind_init_charCodes();
        BindingError = Module["BindingError"] = class BindingError extends Error {
          constructor(message) {
            super(message);
            this.name = "BindingError";
          }
        };
        init_ClassHandle();
        init_embind();
        init_RegisteredPointer();
        UnboundTypeError = Module["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
        init_emval();
        FS.init();
        function checkIncomingModuleAPI() {
          ignoredModuleProp("fetchSettings");
        }
        var wasmImports = { __assert_fail: ___assert_fail, __cxa_throw: ___cxa_throw, _embind_finalize_value_array: __embind_finalize_value_array, _embind_finalize_value_object: __embind_finalize_value_object, _embind_register_bigint: __embind_register_bigint, _embind_register_bool: __embind_register_bool, _embind_register_class: __embind_register_class, _embind_register_class_constructor: __embind_register_class_constructor, _embind_register_class_function: __embind_register_class_function, _embind_register_class_property: __embind_register_class_property, _embind_register_emval: __embind_register_emval, _embind_register_enum: __embind_register_enum, _embind_register_enum_value: __embind_register_enum_value, _embind_register_float: __embind_register_float, _embind_register_integer: __embind_register_integer, _embind_register_memory_view: __embind_register_memory_view, _embind_register_std_string: __embind_register_std_string, _embind_register_std_wstring: __embind_register_std_wstring, _embind_register_value_array: __embind_register_value_array, _embind_register_value_array_element: __embind_register_value_array_element, _embind_register_value_object: __embind_register_value_object, _embind_register_value_object_field: __embind_register_value_object_field, _embind_register_void: __embind_register_void, _emscripten_get_now_is_monotonic: __emscripten_get_now_is_monotonic, _emval_call: __emval_call, _emval_decref: __emval_decref, _emval_get_method_caller: __emval_get_method_caller, _emval_incref: __emval_incref, _emval_run_destructors: __emval_run_destructors, _emval_take_value: __emval_take_value, _wasmfs_copy_preloaded_file_data: __wasmfs_copy_preloaded_file_data, _wasmfs_get_num_preloaded_dirs: __wasmfs_get_num_preloaded_dirs, _wasmfs_get_num_preloaded_files: __wasmfs_get_num_preloaded_files, _wasmfs_get_preloaded_child_path: __wasmfs_get_preloaded_child_path, _wasmfs_get_preloaded_file_mode: __wasmfs_get_preloaded_file_mode, _wasmfs_get_preloaded_file_size: __wasmfs_get_preloaded_file_size, _wasmfs_get_preloaded_parent_path: __wasmfs_get_preloaded_parent_path, _wasmfs_get_preloaded_path_name: __wasmfs_get_preloaded_path_name, _wasmfs_jsimpl_alloc_file: __wasmfs_jsimpl_alloc_file, _wasmfs_jsimpl_free_file: __wasmfs_jsimpl_free_file, _wasmfs_jsimpl_get_size: __wasmfs_jsimpl_get_size, _wasmfs_jsimpl_read: __wasmfs_jsimpl_read, _wasmfs_jsimpl_write: __wasmfs_jsimpl_write, _wasmfs_stdin_get_char: __wasmfs_stdin_get_char, abort: _abort, emscripten_date_now: _emscripten_date_now, emscripten_err: _emscripten_err, emscripten_get_now: _emscripten_get_now, emscripten_memcpy_js: _emscripten_memcpy_js, emscripten_out: _emscripten_out, emscripten_resize_heap: _emscripten_resize_heap, environ_get: _environ_get, environ_sizes_get: _environ_sizes_get, exit: _exit, getentropy: _getentropy, strftime_l: _strftime_l };
        var wasmExports = createWasm();
        var ___wasm_call_ctors = createExportWrapper("__wasm_call_ctors");
        var _free = Module["_free"] = createExportWrapper("free");
        var _main = createExportWrapper("__main_argc_argv");
        var _malloc = Module["_malloc"] = createExportWrapper("malloc");
        var ___getTypeName = createExportWrapper("__getTypeName");
        var _fflush = createExportWrapper("fflush");
        var _emscripten_builtin_memalign = createExportWrapper("emscripten_builtin_memalign");
        var _emscripten_stack_init = () => (_emscripten_stack_init = wasmExports["emscripten_stack_init"])();
        var _emscripten_stack_get_free = () => (_emscripten_stack_get_free = wasmExports["emscripten_stack_get_free"])();
        var _emscripten_stack_get_base = () => (_emscripten_stack_get_base = wasmExports["emscripten_stack_get_base"])();
        var _emscripten_stack_get_end = () => (_emscripten_stack_get_end = wasmExports["emscripten_stack_get_end"])();
        var stackSave = createExportWrapper("stackSave");
        var stackRestore = createExportWrapper("stackRestore");
        var stackAlloc = createExportWrapper("stackAlloc");
        var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports["emscripten_stack_get_current"])();
        var ___cxa_is_pointer_type = createExportWrapper("__cxa_is_pointer_type");
        var __wasmfs_read_file = createExportWrapper("_wasmfs_read_file");
        var __wasmfs_write_file = createExportWrapper("_wasmfs_write_file");
        var __wasmfs_mkdir = createExportWrapper("_wasmfs_mkdir");
        var __wasmfs_rmdir = createExportWrapper("_wasmfs_rmdir");
        var __wasmfs_open = createExportWrapper("_wasmfs_open");
        var __wasmfs_allocate = createExportWrapper("_wasmfs_allocate");
        var __wasmfs_mknod = createExportWrapper("_wasmfs_mknod");
        var __wasmfs_unlink = createExportWrapper("_wasmfs_unlink");
        var __wasmfs_chdir = createExportWrapper("_wasmfs_chdir");
        var __wasmfs_symlink = createExportWrapper("_wasmfs_symlink");
        var __wasmfs_readlink = createExportWrapper("_wasmfs_readlink");
        var __wasmfs_write = createExportWrapper("_wasmfs_write");
        var __wasmfs_pwrite = createExportWrapper("_wasmfs_pwrite");
        var __wasmfs_chmod = createExportWrapper("_wasmfs_chmod");
        var __wasmfs_fchmod = createExportWrapper("_wasmfs_fchmod");
        var __wasmfs_lchmod = createExportWrapper("_wasmfs_lchmod");
        var __wasmfs_llseek = createExportWrapper("_wasmfs_llseek");
        var __wasmfs_rename = createExportWrapper("_wasmfs_rename");
        var __wasmfs_read = createExportWrapper("_wasmfs_read");
        var __wasmfs_pread = createExportWrapper("_wasmfs_pread");
        var __wasmfs_truncate = createExportWrapper("_wasmfs_truncate");
        var __wasmfs_ftruncate = createExportWrapper("_wasmfs_ftruncate");
        var __wasmfs_close = createExportWrapper("_wasmfs_close");
        var __wasmfs_mmap = createExportWrapper("_wasmfs_mmap");
        var __wasmfs_msync = createExportWrapper("_wasmfs_msync");
        var __wasmfs_munmap = createExportWrapper("_wasmfs_munmap");
        var __wasmfs_utime = createExportWrapper("_wasmfs_utime");
        var __wasmfs_stat = createExportWrapper("_wasmfs_stat");
        var __wasmfs_lstat = createExportWrapper("_wasmfs_lstat");
        var __wasmfs_mount = createExportWrapper("_wasmfs_mount");
        var __wasmfs_unmount = createExportWrapper("_wasmfs_unmount");
        var __wasmfs_identify = createExportWrapper("_wasmfs_identify");
        var __wasmfs_readdir_start = createExportWrapper("_wasmfs_readdir_start");
        var __wasmfs_readdir_get = createExportWrapper("_wasmfs_readdir_get");
        var __wasmfs_readdir_finish = createExportWrapper("_wasmfs_readdir_finish");
        var __wasmfs_get_cwd = createExportWrapper("_wasmfs_get_cwd");
        var _wasmfs_create_jsimpl_backend = createExportWrapper("wasmfs_create_jsimpl_backend");
        var _wasmfs_create_memory_backend = createExportWrapper("wasmfs_create_memory_backend");
        var _wasmfs_create_file = createExportWrapper("wasmfs_create_file");
        var _wasmfs_flush = createExportWrapper("wasmfs_flush");
        var dynCall_fiij = Module["dynCall_fiij"] = createExportWrapper("dynCall_fiij");
        var dynCall_viijf = Module["dynCall_viijf"] = createExportWrapper("dynCall_viijf");
        var dynCall_jiji = Module["dynCall_jiji"] = createExportWrapper("dynCall_jiji");
        var dynCall_viijii = Module["dynCall_viijii"] = createExportWrapper("dynCall_viijii");
        var dynCall_iiiiij = Module["dynCall_iiiiij"] = createExportWrapper("dynCall_iiiiij");
        var dynCall_iiiiijj = Module["dynCall_iiiiijj"] = createExportWrapper("dynCall_iiiiijj");
        var dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = createExportWrapper("dynCall_iiiiiijj");
        var dynCall_ji = Module["dynCall_ji"] = createExportWrapper("dynCall_ji");
        var dynCall_iiiij = Module["dynCall_iiiij"] = createExportWrapper("dynCall_iiiij");
        var dynCall_iij = Module["dynCall_iij"] = createExportWrapper("dynCall_iij");
        Module["addOnPostRun"] = addOnPostRun;
        Module["addRunDependency"] = addRunDependency;
        Module["removeRunDependency"] = removeRunDependency;
        Module["FS_createPath"] = FS.createPath;
        Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
        Module["FS"] = FS;
        Module["FS_createDataFile"] = FS.createDataFile;
        Module["FS_unlink"] = FS.unlink;
        var missingLibrarySymbols = ["writeI53ToI64", "writeI53ToI64Clamped", "writeI53ToI64Signaling", "writeI53ToU64Clamped", "writeI53ToU64Signaling", "convertI32PairToI53", "convertU32PairToI53", "zeroMemory", "ydayFromDate", "inetPton4", "inetNtop4", "inetPton6", "inetNtop6", "readSockaddr", "writeSockaddr", "getCallstack", "emscriptenLog", "convertPCtoSourceLocation", "readEmAsmArgs", "jstoi_q", "listenOnce", "autoResumeAudioContext", "handleException", "runtimeKeepalivePush", "runtimeKeepalivePop", "callUserCallback", "maybeExit", "asmjsMangle", "alignMemory", "mmapAlloc", "HandleAllocator", "getNativeTypeSize", "STACK_SIZE", "STACK_ALIGN", "POINTER_SIZE", "ASSERTIONS", "getCFunc", "ccall", "cwrap", "uleb128Encode", "sigToWasmTypes", "generateFuncType", "convertJsFunctionToWasm", "getEmptyTableSlot", "updateTableMap", "getFunctionAddress", "addFunction", "removeFunction", "reallyNegative", "unSign", "strLen", "reSign", "formatString", "intArrayToString", "AsciiToString", "stringToNewUTF8", "registerKeyEventCallback", "maybeCStringToJsString", "findEventTarget", "getBoundingClientRect", "fillMouseEventData", "registerMouseEventCallback", "registerWheelEventCallback", "registerUiEventCallback", "registerFocusEventCallback", "fillDeviceOrientationEventData", "registerDeviceOrientationEventCallback", "fillDeviceMotionEventData", "registerDeviceMotionEventCallback", "screenOrientation", "fillOrientationChangeEventData", "registerOrientationChangeEventCallback", "fillFullscreenChangeEventData", "registerFullscreenChangeEventCallback", "JSEvents_requestFullscreen", "JSEvents_resizeCanvasForFullscreen", "registerRestoreOldStyle", "hideEverythingExceptGivenElement", "restoreHiddenElements", "setLetterbox", "softFullscreenResizeWebGLRenderTarget", "doRequestFullscreen", "fillPointerlockChangeEventData", "registerPointerlockChangeEventCallback", "registerPointerlockErrorEventCallback", "requestPointerLock", "fillVisibilityChangeEventData", "registerVisibilityChangeEventCallback", "registerTouchEventCallback", "fillGamepadEventData", "registerGamepadEventCallback", "registerBeforeUnloadEventCallback", "fillBatteryEventData", "battery", "registerBatteryEventCallback", "setCanvasElementSize", "getCanvasElementSize", "jsStackTrace", "stackTrace", "checkWasiClock", "flush_NO_FILESYSTEM", "wasiRightsToMuslOFlags", "wasiOFlagsToMuslOFlags", "createDyncallWrapper", "safeSetTimeout", "setImmediateWrapped", "clearImmediateWrapped", "polyfillSetImmediate", "getPromise", "makePromise", "idsToPromises", "makePromiseCallback", "findMatchingCatch", "Browser_asyncPrepareDataCounter", "setMainLoop", "wasmfsNodeConvertNodeCode", "wasmfsNodeFixStat", "wasmfsNodeLstat", "wasmfsNodeFstat", "FileSystemAsyncAccessHandle", "wasmfsOPFSCreateAsyncAccessHandle", "wasmfsOPFSProxyFinish", "wasmfsOPFSGetOrCreateFile", "wasmfsOPFSGetOrCreateDir", "heapObjectForWebGLType", "toTypedArrayIndex", "webgl_enable_ANGLE_instanced_arrays", "webgl_enable_OES_vertex_array_object", "webgl_enable_WEBGL_draw_buffers", "webgl_enable_WEBGL_multi_draw", "emscriptenWebGLGet", "computeUnpackAlignedImageSize", "colorChannelsInGlTextureFormat", "emscriptenWebGLGetTexPixelData", "emscriptenWebGLGetUniform", "webglGetUniformLocation", "webglPrepareUniformLocationsBeforeFirstUse", "webglGetLeftBracePos", "emscriptenWebGLGetVertexAttrib", "__glGetActiveAttribOrUniform", "writeGLArray", "registerWebGlEventCallback", "runAndAbortIfError", "ALLOC_NORMAL", "ALLOC_STACK", "allocate", "writeStringToMemory", "writeAsciiToMemory", "setErrNo", "demangle", "getFunctionArgsName", "createJsInvoker", "registerInheritedInstance", "unregisterInheritedInstance", "getStringOrSymbol", "emval_get_global"];
        missingLibrarySymbols.forEach(missingLibrarySymbol);
        var unexportedSymbols = ["run", "addOnPreRun", "addOnInit", "addOnPreMain", "addOnExit", "FS_createFolder", "FS_createLazyFile", "FS_createLink", "FS_createDevice", "FS_readFile", "out", "err", "callMain", "abort", "wasmMemory", "wasmExports", "stackAlloc", "stackSave", "stackRestore", "getTempRet0", "setTempRet0", "writeStackCookie", "checkStackCookie", "readI53FromI64", "readI53FromU64", "convertI32PairToI53Checked", "ptrToString", "exitJS", "getHeapMax", "growMemory", "ENV", "MONTH_DAYS_REGULAR", "MONTH_DAYS_LEAP", "MONTH_DAYS_REGULAR_CUMULATIVE", "MONTH_DAYS_LEAP_CUMULATIVE", "isLeapYear", "arraySum", "addDays", "ERRNO_CODES", "ERRNO_MESSAGES", "DNS", "Protocols", "Sockets", "initRandomFill", "randomFill", "timers", "warnOnce", "UNWIND_CACHE", "readEmAsmArgsArray", "jstoi_s", "getExecutableName", "dynCallLegacy", "getDynCaller", "dynCall", "keepRuntimeAlive", "asyncLoad", "wasmTable", "noExitRuntime", "freeTableIndexes", "functionsInTableMap", "setValue", "getValue", "PATH", "PATH_FS", "UTF8Decoder", "UTF8ArrayToString", "UTF8ToString", "stringToUTF8Array", "stringToUTF8", "lengthBytesUTF8", "intArrayFromString", "stringToAscii", "UTF16Decoder", "UTF16ToString", "stringToUTF16", "lengthBytesUTF16", "UTF32ToString", "stringToUTF32", "lengthBytesUTF32", "stringToUTF8OnStack", "writeArrayToMemory", "JSEvents", "specialHTMLTargets", "findCanvasEventTarget", "currentFullscreenStrategy", "restoreOldWindowedStyle", "ExitStatus", "getEnvStrings", "promiseMap", "uncaughtExceptionCount", "exceptionLast", "exceptionCaught", "ExceptionInfo", "Browser", "getPreloadedImageData__data", "wget", "preloadPlugins", "FS_modeStringToFlags", "FS_getMode", "FS_stdin_getChar_buffer", "FS_stdin_getChar", "MEMFS", "wasmFSPreloadedFiles", "wasmFSPreloadedDirs", "wasmFSPreloadingFlushed", "wasmFSDevices", "wasmFSDeviceStreams", "FS_mknod", "FS_create", "FS_writeFile", "FS_mkdir", "FS_mkdirTree", "wasmFS$JSMemoryFiles", "wasmFS$backends", "wasmfsNodeIsWindows", "wasmfsOPFSDirectoryHandles", "wasmfsOPFSFileHandles", "wasmfsOPFSAccessHandles", "wasmfsOPFSBlobs", "tempFixedLengthArray", "miniTempWebGLFloatBuffers", "miniTempWebGLIntBuffers", "GL", "AL", "GLUT", "EGL", "GLEW", "IDBStore", "SDL", "SDL_gfx", "allocateUTF8", "allocateUTF8OnStack", "InternalError", "BindingError", "throwInternalError", "throwBindingError", "registeredTypes", "awaitingDependencies", "typeDependencies", "tupleRegistrations", "structRegistrations", "sharedRegisterType", "whenDependentTypesAreResolved", "embind_charCodes", "embind_init_charCodes", "readLatin1String", "getTypeName", "getFunctionName", "heap32VectorToArray", "requireRegisteredType", "usesDestructorStack", "createJsInvokerSignature", "UnboundTypeError", "PureVirtualError", "GenericWireTypeSize", "InvokerFunctions", "EmValType", "init_embind", "throwUnboundTypeError", "ensureOverloadTable", "exposePublicSymbol", "replacePublicSymbol", "extendError", "createNamedFunction", "embindRepr", "registeredInstances", "getBasestPointer", "getInheritedInstance", "getInheritedInstanceCount", "getLiveInheritedInstances", "registeredPointers", "registerType", "integerReadValueFromPointer", "enumReadValueFromPointer", "floatReadValueFromPointer", "readPointer", "runDestructors", "craftInvokerFunction", "embind__requireFunction", "genericPointerToWireType", "constNoSmartPtrRawPointerToWireType", "nonConstNoSmartPtrRawPointerToWireType", "init_RegisteredPointer", "RegisteredPointer", "RegisteredPointer_fromWireType", "runDestructor", "releaseClassHandle", "finalizationRegistry", "detachFinalizer_deps", "detachFinalizer", "attachFinalizer", "makeClassHandle", "init_ClassHandle", "ClassHandle", "throwInstanceAlreadyDeleted", "deletionQueue", "flushPendingDeletes", "delayFunction", "setDelayFunction", "RegisteredClass", "shallowCopyInternalPointer", "downcastPointer", "upcastPointer", "validateThis", "char_0", "char_9", "makeLegalFunctionName", "emval_freelist", "emval_handles", "emval_symbols", "init_emval", "count_emval_handles", "Emval", "emval_returnValue", "emval_lookupTypes", "emval_methodCallers", "emval_addMethodCaller", "reflectConstruct"];
        unexportedSymbols.forEach(unexportedRuntimeSymbol);
        var calledRun;
        dependenciesFulfilled = function runCaller() {
          if (!calledRun) run();
          if (!calledRun) dependenciesFulfilled = runCaller;
        };
        function stackCheckInit() {
          _emscripten_stack_init();
          writeStackCookie();
        }
        function run(args = arguments_) {
          if (runDependencies > 0) {
            return;
          }
          stackCheckInit();
          preRun();
          if (runDependencies > 0) {
            return;
          }
          function doRun() {
            if (calledRun) return;
            calledRun = true;
            Module["calledRun"] = true;
            if (ABORT) return;
            initRuntime();
            readyPromiseResolve(Module);
            if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
            assert(!Module["_main"], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');
            postRun();
          }
          if (Module["setStatus"]) {
            Module["setStatus"]("Running...");
            setTimeout(function() {
              setTimeout(function() {
                Module["setStatus"]("");
              }, 1);
              doRun();
            }, 1);
          } else {
            doRun();
          }
          checkStackCookie();
        }
        function checkUnflushedContent() {
          var oldOut = out;
          var oldErr = err;
          var has = false;
          out = err = (x) => {
            has = true;
          };
          try {
            _wasmfs_flush();
          } catch (e) {
          }
          out = oldOut;
          err = oldErr;
          if (has) {
            warnOnce("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.");
            warnOnce("(this may also be due to not including full filesystem support - try building with -sFORCE_FILESYSTEM)");
          }
        }
        if (Module["preInit"]) {
          if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
          while (Module["preInit"].length > 0) {
            Module["preInit"].pop()();
          }
        }
        run();
        return moduleArg.ready;
      });
    })();
    fastText_common_default = fastTextModule;
  }
});

// node_modules/fasttext.wasm.js/dist/helpers/modules/common.mjs
async function initializeFastTextModule(options = {}) {
  const { wasmPath, ...rest } = options;
  const fastTextModularized = (await Promise.resolve().then(() => (init_fastText_common(), fastText_common_exports))).default;
  return await fastTextModularized({
    // Binding js use the callback to locate wasm for now
    locateFile: (url, scriptDirectory) => {
      if (wasmPath) {
        return typeof wasmPath === "string" ? wasmPath : wasmPath(url, scriptDirectory);
      }
      return (scriptDirectory || "/") + url;
    },
    ...rest
  });
}
async function getFastTextModule(options = {}) {
  return await initializeFastTextModule(options);
}
var init_common = __esm({
  "node_modules/fasttext.wasm.js/dist/helpers/modules/common.mjs"() {
  }
});

// node_modules/fasttext.wasm.js/dist/constants.mjs
var commonAssetsDir, commonAssetsModelsDir, trainFileInWasmFs, testFileInWasmFs, modelFileInWasmFs, IS_BROWSER, IS_WORKER;
var init_constants = __esm({
  "node_modules/fasttext.wasm.js/dist/constants.mjs"() {
    commonAssetsDir = "/fastText";
    commonAssetsModelsDir = "/fastText/models";
    trainFileInWasmFs = "train.txt";
    testFileInWasmFs = "test.txt";
    modelFileInWasmFs = "model.bin";
    IS_BROWSER = typeof window !== "undefined" && !!window.document && !!window.document.createElement;
    IS_WORKER = // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    "importScripts" in globalThis && typeof globalThis.importScripts == "function";
  }
});

// node_modules/fasttext.wasm.js/dist/helpers/modules/index.mjs
var readFile, request, fileURLToPath, buffer2Uin8Array, fetchFile;
var init_modules = __esm({
  "node_modules/fasttext.wasm.js/dist/helpers/modules/index.mjs"() {
    init_constants();
    buffer2Uin8Array = (buf) => new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
    fetchFile = async (url) => {
      if (IS_BROWSER || IS_WORKER) {
        return new Uint8Array(await (await fetch(url)).arrayBuffer());
      }
      if (url.startsWith("file://")) {
        readFile ??= (await import("fs/promises")).readFile;
        fileURLToPath ??= (await import("url")).fileURLToPath;
        return buffer2Uin8Array(await readFile(fileURLToPath(url)));
      } else {
        request ??= (await import("http")).request;
        return new Promise((resolve, reject) => {
          const chunks = [];
          request(
            url,
            (res) => res.on("close", () => resolve(buffer2Uin8Array(Buffer.concat(chunks)))).on("data", (chunk) => chunks.push(chunk)).on("error", (err) => reject(err))
          );
        });
      }
    };
  }
});

// node_modules/fasttext.wasm.js/dist/FastTextModel.mjs
var FastTextModel;
var init_FastTextModel = __esm({
  "node_modules/fasttext.wasm.js/dist/FastTextModel.mjs"() {
    init_constants();
    FastTextModel = class {
      core;
      ft;
      constructor(fastTextNative, fastTextModule2) {
        this.ft = fastTextNative;
        this.core = fastTextModule2;
      }
      getFloat32ArrayFromHeap = (len) => {
        const dataBytes = len * Float32Array.BYTES_PER_ELEMENT;
        const dataPtr = this.core._malloc(dataBytes);
        const dataHeap = new Uint8Array(this.core.HEAPU8.buffer, dataPtr, dataBytes);
        return {
          ptr: dataHeap.byteOffset,
          size: len,
          buffer: dataHeap.buffer
        };
      };
      heapToFloat32 = (r) => new Float32Array(r.buffer, r.ptr, r.size);
      /**
       * isQuant
       *
       * @return {bool}   true if the model is quantized
       */
      isQuant() {
        return this.ft.isQuant;
      }
      /**
       * getDimension
       *
       * @return {number}    the dimension (size) of a lookup vector (hidden layer)
       */
      getDimension() {
        return this.ft.args.dim;
      }
      /**
       * getWordVector
       *
       * @param {string}          word
       *
       * @return {Float32Array}   the vector representation of `word`.
       *
       */
      getWordVector(word) {
        const b = this.getFloat32ArrayFromHeap(this.getDimension());
        this.ft.getWordVector(b, word);
        return this.heapToFloat32(b);
      }
      /**
       * getSentenceVector
       *
       * @return {Float32Array}   the vector representation of `text`.
       *
       */
      getSentenceVector(text) {
        if (text.includes("\n")) ;
        text += "\n";
        const b = this.getFloat32ArrayFromHeap(this.getDimension());
        this.ft.getSentenceVector(b, text);
        return this.heapToFloat32(b);
      }
      /**
       * getNearestNeighbors
       *
       * returns the nearest `k` neighbors of `word`.
       *
       * @return words and their corresponding cosine similarities.
       *
       */
      getNearestNeighbors(word, k = 10) {
        return this.ft.getNN(word, k);
      }
      /**
       * getAnalogies
       *
       * returns the nearest `k` neighbors of the operation
       * `wordA - wordB + wordC`.
       *
       * @return words and their corresponding cosine similarities
       *
       */
      getAnalogies(wordA, wordB, wordC, k) {
        return this.ft.getAnalogies(k, wordA, wordB, wordC);
      }
      /**
       * getWordId
       *
       * Given a word, get the word id within the dictionary.
       * Returns -1 if word is not in the dictionary.
       */
      getWordId(word) {
        return this.ft.getWordId(word);
      }
      /**
       * getSubwordId
       *
       * Given a subword, return the index (within input matrix) it hashes to.
       */
      getSubwordId(subword) {
        return this.ft.getSubwordId(subword);
      }
      /**
       * getSubwords
       *
       * returns the subwords and their indicies.
       *
       * @return words and their corresponding indicies
       *
       */
      getSubwords(word) {
        return this.ft.getSubwords(word);
      }
      /**
       * getInputVector
       *
       * Given an index, get the corresponding vector of the Input Matrix.
       *
       * @return {Float32Array}   the vector of the `ind`'th index
       *
       */
      getInputVector(ind) {
        const b = this.getFloat32ArrayFromHeap(this.getDimension());
        this.ft.getInputVector(b, ind);
        return this.heapToFloat32(b);
      }
      /**
       * predict
       *
       * Given a string, get a list of labels and a list of corresponding
       * probabilities. k controls the number of returned labels.
       *
       * @return labels and their probabilities
       *
       */
      predict(text, k = 1, threshold = 0) {
        return this.ft.predict(text, k, threshold);
      }
      /**
       * getInputMatrix
       *
       * Get a reference to the full input matrix of a Model. This only
       * works if the model is not quantized.
       *
       * @return {DenseMatrix}
       *     densematrix with functions: `rows`, `cols`, `at(i,j)`
       *
       * example:
       *     let inputMatrix = model.getInputMatrix();
       *     let value = inputMatrix.at(1, 2);
       */
      getInputMatrix() {
        if (this.isQuant()) {
          throw new Error("Can't get quantized Matrix");
        }
        return this.ft.getInputMatrix();
      }
      /**
       * getOutputMatrix
       *
       * Get a reference to the full input matrix of a Model. This only
       * works if the model is not quantized.
       *
       * @return {DenseMatrix}
       *     densematrix with functions: `rows`, `cols`, `at(i,j)`
       *
       * example:
       *     let outputMatrix = model.getOutputMatrix();
       *     let value = outputMatrix.at(1, 2);
       */
      getOutputMatrix() {
        if (this.isQuant()) {
          throw new Error("Can't get quantized Matrix");
        }
        return this.ft.getOutputMatrix();
      }
      /**
       * getWords
       *
       * Get the entire list of words of the dictionary including the frequency
       * of the individual words. This does not include any subwords. For that
       * please consult the function get_subwords.
       *
       * @return {Pair.<Array.<string>, Array.<int>>}
       *     words and their corresponding frequencies
       *
       */
      getWords() {
        return this.ft.getWords();
      }
      /**
       * getLabels
       *
       * Get the entire list of labels of the dictionary including the frequency
       * of the individual labels.
       *
       * @return {Pair.<Array.<string>, Array.<int>>}
       *     labels and their corresponding frequencies
       *
       */
      getLabels() {
        return this.ft.getLabels();
      }
      /**
       * getLine
       *
       * Split a line of text into words and labels. Labels must start with
       * the prefix used to create the model (__label__ by default).
       *
       * @return {Pair.<Array.<string>, Array.<string>>}
       *     words and labels
       *
       */
      getLine(text) {
        return this.ft.getLine(text);
      }
      /**
       * saveModel
       *
       * Saves the model file in web assembly in-memory FS and returns a blob
       *
       * @return {Blob}           blob data of the file saved in web assembly FS
       *
       */
      saveModel() {
        this.ft.saveModel(modelFileInWasmFs);
        const content = this.core.FS.readFile(modelFileInWasmFs, {
          encoding: "binary"
        });
        return new Blob(
          [new Uint8Array(content, content.byteOffset, content.length)],
          { type: " application/octet-stream" }
        );
      }
      /**
       * test
       *
       * Downloads the test file from the specified url, evaluates the supervised
       * model with it.
       *
       * @return {Promise}   promise object that resolves to a `Meter` object
       *
       * example:
       * model.test("/absolute/url/to/test.txt", 1, 0.0).then((meter) => {
       *     console.log(meter.precision);
       *     console.log(meter.recall);
       *     console.log(meter.f1Score);
       *     console.log(meter.nexamples());
       * });
       *
       */
      test(url, k, threshold) {
        const fetchFunc = globalThis.fetch || fetch;
        const fastTextNative = this.ft;
        return new Promise((resolve, reject) => {
          fetchFunc(url).then((response) => {
            return response.arrayBuffer();
          }).then((bytes) => {
            const byteArray = new Uint8Array(bytes);
            const FS = this.core.FS;
            FS.writeFile(testFileInWasmFs, byteArray);
          }).then(() => {
            const meter = fastTextNative.test(testFileInWasmFs, k, threshold);
            resolve(meter);
          }).catch((error) => {
            reject(error);
          });
        });
      }
    };
  }
});

// node_modules/fasttext.wasm.js/dist/FastText.mjs
var getFastTextClass;
var init_FastText = __esm({
  "node_modules/fasttext.wasm.js/dist/FastText.mjs"() {
    init_modules();
    init_FastTextModel();
    init_constants();
    getFastTextClass = async (options) => {
      const { getFastTextModule: getFastTextModule2 } = options;
      const fastTextModule2 = await getFastTextModule2();
      return class FastText {
        core;
        ft;
        fs;
        constructor() {
          this.core = fastTextModule2;
          this.ft = new fastTextModule2.FastText();
          this.fs = fastTextModule2.FS;
        }
        /**
         * loadModel
         *
         * Loads the model file from the specified url, and returns the
         * corresponding `FastTextModel` object.
         */
        async loadModel(url) {
          const fastTextNative = this.ft;
          const arrayBuffer = await fetchFile(url);
          const byteArray = new Uint8Array(arrayBuffer);
          const FS = fastTextModule2.FS;
          await FS.writeFile(modelFileInWasmFs, byteArray);
          fastTextNative.loadModel(modelFileInWasmFs);
          return new FastTextModel(fastTextNative, this.core);
        }
        _train(url, modelName, kwargs = {}, callback = null) {
          const fetchFunc = globalThis.fetch || fetch;
          const fastTextNative = this.ft;
          return new Promise((resolve, reject) => {
            fetchFunc(url).then((response) => {
              return response.arrayBuffer();
            }).then((bytes) => {
              const byteArray = new Uint8Array(bytes);
              const FS = fastTextModule2.FS;
              FS.writeFile(trainFileInWasmFs, byteArray);
            }).then(() => {
              const argsList = [
                "lr",
                "lrUpdateRate",
                "dim",
                "ws",
                "epoch",
                "minCount",
                "minCountLabel",
                "neg",
                "wordNgrams",
                "loss",
                "model",
                "bucket",
                "minn",
                "maxn",
                "t",
                "label",
                "verbose",
                "pretrainedVectors",
                "saveOutput",
                "seed",
                "qout",
                "retrain",
                "qnorm",
                "cutoff",
                "dsub",
                "qnorm",
                "autotuneValidationFile",
                "autotuneMetric",
                "autotunePredictions",
                "autotuneDuration",
                "autotuneModelSize"
              ];
              const args = new fastTextModule2.Args();
              argsList.forEach((k) => {
                if (k in kwargs) {
                  args[k] = kwargs[k];
                }
              });
              args.model = fastTextModule2.ModelName[modelName];
              args.loss = "loss" in kwargs ? fastTextModule2.LossName[kwargs.loss] : "hs";
              args.thread = 1;
              args.input = trainFileInWasmFs;
              fastTextNative.train(args, callback);
              resolve(new FastTextModel(fastTextNative, this.core));
            }).catch((error) => {
              reject(error);
            });
          });
        }
        /**
         * trainSupervised
         *
         * Downloads the input file from the specified url, trains a supervised
         * model and returns a `FastTextModel` object.
         */
        trainSupervised(url, kwargs = {}, callback) {
          const self2 = this;
          return new Promise((resolve, reject) => {
            self2._train(url, "supervised", kwargs, callback).then((model) => {
              resolve(model);
            }).catch((error) => {
              reject(error);
            });
          });
        }
        /**
         * trainUnsupervised
         *
         * Downloads the input file from the specified url, trains an unsupervised
         * model and returns a `FastTextModel` object.
         *
         * @param {function}   callback
         *     train callback function
         *     `callback` function is called regularly from the train loop:
         *     `callback(progress, loss, wordsPerSec, learningRate, eta)`
         *
         * @return {Promise}   promise object that resolves to a `FastTextModel`
         *
         */
        trainUnsupervised(url, modelName, kwargs = {}, callback) {
          const self2 = this;
          return new Promise((resolve, reject) => {
            self2._train(url, modelName, kwargs, callback).then((model) => {
              resolve(model);
            }).catch((error) => {
              reject(error);
            });
          });
        }
      };
    };
  }
});

// node_modules/fasttext.wasm.js/dist/models/language-identification/assets/languages.json.mjs
var af, als, am, an, ar, arz, as, ast, av, az, azb, ba, bar, bcl, be, bg, bh, bn, bo, bpy, br, bs, bxr, ca, cbk, ce, ceb, ckb, co, cs, cv, cy, da, de, diq, dsb, dty, dv, el, eml, en, eo, es, et, eu, fa, fi, fr, frr, fy, ga, gd, gl, gn, gom, gu, gv, he, hi, hif, hr, hsb, ht, hu, hy, ia, id, ie, ilo, io, is, it, ja, jbo, jv, ka, kk, km, kn, ko, krc, ku, kv, kw, ky, la, lb, lez, li, lmo, lo, lrc, lt, lv, mai, mg, mhr, min, mk, ml, mn, mr, mrj, ms, mt, mwl, my, myv, mzn, nah, nap, nds, ne, nl, nn, no, oc, or, os, pa, pam, pfl, pl, pms, pnb, ps, pt, qu, rm, ro, ru, rue, sa, sah, sc, scn, sco, sd, sh, si, sk, sl, so, sq, sr, su, sv, sw, ta, te, tg, th, tk, tl, tr, tt, tyv, ug, uk, ur, uz, vec, vep, vi, vls, vo, wa, war, wuu, xal, xmf, yi, yo, yue, zh, languages;
var init_languages_json = __esm({
  "node_modules/fasttext.wasm.js/dist/models/language-identification/assets/languages.json.mjs"() {
    af = {
      alpha3: "afr",
      alpha2: "af",
      refName: "Afrikaans"
    };
    als = {
      alpha3: "gsw",
      alpha2: null,
      refName: "Swiss German"
    };
    am = {
      alpha3: "amh",
      alpha2: "am",
      refName: "Amharic"
    };
    an = {
      alpha3: "arg",
      alpha2: "an",
      refName: "Aragonese"
    };
    ar = {
      alpha3: "ara",
      alpha2: "ar",
      refName: "Arabic"
    };
    arz = {
      alpha3: "arz",
      alpha2: null,
      refName: "Egyptian Arabic"
    };
    as = {
      alpha3: "asm",
      alpha2: "as",
      refName: "Assamese"
    };
    ast = {
      alpha3: "ast",
      alpha2: null,
      refName: "Asturian"
    };
    av = {
      alpha3: "ava",
      alpha2: "av",
      refName: "Avaric"
    };
    az = {
      alpha3: "aze",
      alpha2: "az",
      refName: "Azerbaijani"
    };
    azb = {
      alpha3: "azb",
      alpha2: null,
      refName: "South Azerbaijani"
    };
    ba = {
      alpha3: "bak",
      alpha2: "ba",
      refName: "Bashkir"
    };
    bar = {
      alpha3: "bar",
      alpha2: null,
      refName: "Bavarian"
    };
    bcl = {
      alpha3: "bcl",
      alpha2: null,
      refName: "Central Bikol"
    };
    be = {
      alpha3: "bel",
      alpha2: "be",
      refName: "Belarusian"
    };
    bg = {
      alpha3: "bul",
      alpha2: "bg",
      refName: "Bulgarian"
    };
    bh = {
      alpha3: "bih",
      alpha2: "bh",
      refName: "Bihari languages"
    };
    bn = {
      alpha3: "ben",
      alpha2: "bn",
      refName: "Bengali"
    };
    bo = {
      alpha3: "bod",
      alpha2: "bo",
      refName: "Tibetan"
    };
    bpy = {
      alpha3: "bpy",
      alpha2: null,
      refName: "Bishnupriya"
    };
    br = {
      alpha3: "bre",
      alpha2: "br",
      refName: "Breton"
    };
    bs = {
      alpha3: "bos",
      alpha2: "bs",
      refName: "Bosnian"
    };
    bxr = {
      alpha3: "bxr",
      alpha2: null,
      refName: "Russia Buriat"
    };
    ca = {
      alpha3: "cat",
      alpha2: "ca",
      refName: "Catalan"
    };
    cbk = {
      alpha3: "cbk",
      alpha2: null,
      refName: "Chavacano"
    };
    ce = {
      alpha3: "che",
      alpha2: "ce",
      refName: "Chechen"
    };
    ceb = {
      alpha3: "ceb",
      alpha2: null,
      refName: "Cebuano"
    };
    ckb = {
      alpha3: "kur",
      alpha2: "ku",
      refName: "Kurdish"
    };
    co = {
      alpha3: "cos",
      alpha2: "co",
      refName: "Corsican"
    };
    cs = {
      alpha3: "ces",
      alpha2: "cs",
      refName: "Czech"
    };
    cv = {
      alpha3: "chv",
      alpha2: "cv",
      refName: "Chuvash"
    };
    cy = {
      alpha3: "cym",
      alpha2: "cy",
      refName: "Welsh"
    };
    da = {
      alpha3: "dan",
      alpha2: "da",
      refName: "Danish"
    };
    de = {
      alpha3: "deu",
      alpha2: "de",
      refName: "German"
    };
    diq = {
      alpha3: "zza",
      alpha2: null,
      refName: "Zaza"
    };
    dsb = {
      alpha3: "dsb",
      alpha2: null,
      refName: "Lower Sorbian"
    };
    dty = {
      alpha3: "dty",
      alpha2: null,
      refName: "Dotyali"
    };
    dv = {
      alpha3: "div",
      alpha2: "dv",
      refName: "Dhivehi"
    };
    el = {
      alpha3: "ell",
      alpha2: "el",
      refName: "Modern Greek (1453-)"
    };
    eml = {
      alpha3: "eml",
      alpha2: null,
      refName: "Emiliano-Romagnolo"
    };
    en = {
      alpha3: "eng",
      alpha2: "en",
      refName: "English"
    };
    eo = {
      alpha3: "epo",
      alpha2: "eo",
      refName: "Esperanto"
    };
    es = {
      alpha3: "spa",
      alpha2: "es",
      refName: "Spanish"
    };
    et = {
      alpha3: "est",
      alpha2: "et",
      refName: "Estonian"
    };
    eu = {
      alpha3: "eus",
      alpha2: "eu",
      refName: "Basque"
    };
    fa = {
      alpha3: "fas",
      alpha2: "fa",
      refName: "Persian"
    };
    fi = {
      alpha3: "fin",
      alpha2: "fi",
      refName: "Finnish"
    };
    fr = {
      alpha3: "fra",
      alpha2: "fr",
      refName: "French"
    };
    frr = {
      alpha3: "frr",
      alpha2: null,
      refName: "Northern Frisian"
    };
    fy = {
      alpha3: "fry",
      alpha2: "fy",
      refName: "Western Frisian"
    };
    ga = {
      alpha3: "gle",
      alpha2: "ga",
      refName: "Irish"
    };
    gd = {
      alpha3: "gla",
      alpha2: "gd",
      refName: "Scottish Gaelic"
    };
    gl = {
      alpha3: "glg",
      alpha2: "gl",
      refName: "Galician"
    };
    gn = {
      alpha3: "grn",
      alpha2: "gn",
      refName: "Guarani"
    };
    gom = {
      alpha3: "gom",
      alpha2: null,
      refName: "Goan Konkani"
    };
    gu = {
      alpha3: "guj",
      alpha2: "gu",
      refName: "Gujarati"
    };
    gv = {
      alpha3: "glv",
      alpha2: "gv",
      refName: "Manx"
    };
    he = {
      alpha3: "heb",
      alpha2: "he",
      refName: "Hebrew"
    };
    hi = {
      alpha3: "hin",
      alpha2: "hi",
      refName: "Hindi"
    };
    hif = {
      alpha3: "hif",
      alpha2: null,
      refName: "Fiji Hindi"
    };
    hr = {
      alpha3: "hrv",
      alpha2: "hr",
      refName: "Croatian"
    };
    hsb = {
      alpha3: "hsb",
      alpha2: null,
      refName: "Upper Sorbian"
    };
    ht = {
      alpha3: "hat",
      alpha2: "ht",
      refName: "Haitian"
    };
    hu = {
      alpha3: "hun",
      alpha2: "hu",
      refName: "Hungarian"
    };
    hy = {
      alpha3: "hye",
      alpha2: "hy",
      refName: "Armenian"
    };
    ia = {
      alpha3: "ina",
      alpha2: "ia",
      refName: "Interlingua (International Auxiliary Language Association)"
    };
    id = {
      alpha3: "ind",
      alpha2: "id",
      refName: "Indonesian"
    };
    ie = {
      alpha3: "ile",
      alpha2: "ie",
      refName: "Interlingue"
    };
    ilo = {
      alpha3: "ilo",
      alpha2: null,
      refName: "Iloko"
    };
    io = {
      alpha3: "ido",
      alpha2: "io",
      refName: "Ido"
    };
    is = {
      alpha3: "isl",
      alpha2: "is",
      refName: "Icelandic"
    };
    it = {
      alpha3: "ita",
      alpha2: "it",
      refName: "Italian"
    };
    ja = {
      alpha3: "jpn",
      alpha2: "ja",
      refName: "Japanese"
    };
    jbo = {
      alpha3: "jbo",
      alpha2: null,
      refName: "Lojban"
    };
    jv = {
      alpha3: "jav",
      alpha2: "jv",
      refName: "Javanese"
    };
    ka = {
      alpha3: "kat",
      alpha2: "ka",
      refName: "Georgian"
    };
    kk = {
      alpha3: "kaz",
      alpha2: "kk",
      refName: "Kazakh"
    };
    km = {
      alpha3: "khm",
      alpha2: "km",
      refName: "Khmer"
    };
    kn = {
      alpha3: "kan",
      alpha2: "kn",
      refName: "Kannada"
    };
    ko = {
      alpha3: "kor",
      alpha2: "ko",
      refName: "Korean"
    };
    krc = {
      alpha3: "krc",
      alpha2: null,
      refName: "Karachay-Balkar"
    };
    ku = {
      alpha3: "kmr",
      alpha2: null,
      refName: "Northern Kurdish"
    };
    kv = {
      alpha3: "kom",
      alpha2: "kv",
      refName: "Komi"
    };
    kw = {
      alpha3: "cor",
      alpha2: "kw",
      refName: "Cornish"
    };
    ky = {
      alpha3: "kir",
      alpha2: "ky",
      refName: "Kirghiz"
    };
    la = {
      alpha3: "lat",
      alpha2: "la",
      refName: "Latin"
    };
    lb = {
      alpha3: "ltz",
      alpha2: "lb",
      refName: "Luxembourgish"
    };
    lez = {
      alpha3: "lez",
      alpha2: null,
      refName: "Lezghian"
    };
    li = {
      alpha3: "lim",
      alpha2: "li",
      refName: "Limburgan"
    };
    lmo = {
      alpha3: "lmo",
      alpha2: null,
      refName: "Lombard"
    };
    lo = {
      alpha3: "lao",
      alpha2: "lo",
      refName: "Lao"
    };
    lrc = {
      alpha3: "lrc",
      alpha2: null,
      refName: "Northern Luri"
    };
    lt = {
      alpha3: "lit",
      alpha2: "lt",
      refName: "Lithuanian"
    };
    lv = {
      alpha3: "lav",
      alpha2: "lv",
      refName: "Latvian"
    };
    mai = {
      alpha3: "mai",
      alpha2: null,
      refName: "Maithili"
    };
    mg = {
      alpha3: "mlg",
      alpha2: "mg",
      refName: "Malagasy"
    };
    mhr = {
      alpha3: "mhr",
      alpha2: null,
      refName: "Eastern Mari"
    };
    min = {
      alpha3: "min",
      alpha2: null,
      refName: "Minangkabau"
    };
    mk = {
      alpha3: "mkd",
      alpha2: "mk",
      refName: "Macedonian"
    };
    ml = {
      alpha3: "mal",
      alpha2: "ml",
      refName: "Malayalam"
    };
    mn = {
      alpha3: "mon",
      alpha2: "mn",
      refName: "Mongolian"
    };
    mr = {
      alpha3: "mar",
      alpha2: "mr",
      refName: "Marathi"
    };
    mrj = {
      alpha3: "mrj",
      alpha2: null,
      refName: "Western Mari"
    };
    ms = {
      alpha3: "msa",
      alpha2: "ms",
      refName: "Malay (macrolanguage)"
    };
    mt = {
      alpha3: "mlt",
      alpha2: "mt",
      refName: "Maltese"
    };
    mwl = {
      alpha3: "mwl",
      alpha2: null,
      refName: "Mirandese"
    };
    my = {
      alpha3: "mya",
      alpha2: "my",
      refName: "Burmese"
    };
    myv = {
      alpha3: "myv",
      alpha2: null,
      refName: "Erzya"
    };
    mzn = {
      alpha3: "mzn",
      alpha2: null,
      refName: "Mazanderani"
    };
    nah = {
      alpha3: "nah",
      alpha2: null,
      refName: "Nahuatl languages"
    };
    nap = {
      alpha3: "nap",
      alpha2: null,
      refName: "Neapolitan"
    };
    nds = {
      alpha3: "nds",
      alpha2: null,
      refName: "Low German"
    };
    ne = {
      alpha3: "nep",
      alpha2: "ne",
      refName: "Nepali (macrolanguage)"
    };
    nl = {
      alpha3: "nld",
      alpha2: "nl",
      refName: "Dutch"
    };
    nn = {
      alpha3: "nor",
      alpha2: "no",
      refName: "Norwegian"
    };
    no = {
      alpha3: "nor",
      alpha2: "no",
      refName: "Norwegian"
    };
    oc = {
      alpha3: "oci",
      alpha2: "oc",
      refName: "Occitan (post 1500)"
    };
    or = {
      alpha3: "ory",
      alpha2: null,
      refName: "Odia"
    };
    os = {
      alpha3: "oss",
      alpha2: "os",
      refName: "Ossetian"
    };
    pa = {
      alpha3: "pan",
      alpha2: "pa",
      refName: "Panjabi"
    };
    pam = {
      alpha3: "pam",
      alpha2: null,
      refName: "Pampanga"
    };
    pfl = {
      alpha3: "pfl",
      alpha2: null,
      refName: "Pfaelzisch"
    };
    pl = {
      alpha3: "pol",
      alpha2: "pl",
      refName: "Polish"
    };
    pms = {
      alpha3: "pms",
      alpha2: null,
      refName: "Piemontese"
    };
    pnb = {
      alpha3: "pnb",
      alpha2: null,
      refName: "Western Panjabi"
    };
    ps = {
      alpha3: "pus",
      alpha2: "ps",
      refName: "Pushto"
    };
    pt = {
      alpha3: "por",
      alpha2: "pt",
      refName: "Portuguese"
    };
    qu = {
      alpha3: "que",
      alpha2: "qu",
      refName: "Quechua"
    };
    rm = {
      alpha3: "roh",
      alpha2: "rm",
      refName: "Romansh"
    };
    ro = {
      alpha3: "ron",
      alpha2: "ro",
      refName: "Romanian"
    };
    ru = {
      alpha3: "rus",
      alpha2: "ru",
      refName: "Russian"
    };
    rue = {
      alpha3: "rue",
      alpha2: null,
      refName: "Rusyn"
    };
    sa = {
      alpha3: "san",
      alpha2: "sa",
      refName: "Sanskrit"
    };
    sah = {
      alpha3: "sah",
      alpha2: null,
      refName: "Yakut"
    };
    sc = {
      alpha3: "srd",
      alpha2: "sc",
      refName: "Sardinian"
    };
    scn = {
      alpha3: "scn",
      alpha2: null,
      refName: "Sicilian"
    };
    sco = {
      alpha3: "sco",
      alpha2: null,
      refName: "Scots"
    };
    sd = {
      alpha3: "snd",
      alpha2: "sd",
      refName: "Sindhi"
    };
    sh = {
      alpha3: "hbs",
      alpha2: "sh",
      refName: "Serbo-Croatian"
    };
    si = {
      alpha3: "sin",
      alpha2: "si",
      refName: "Sinhala"
    };
    sk = {
      alpha3: "slk",
      alpha2: "sk",
      refName: "Slovak"
    };
    sl = {
      alpha3: "slv",
      alpha2: "sl",
      refName: "Slovenian"
    };
    so = {
      alpha3: "som",
      alpha2: "so",
      refName: "Somali"
    };
    sq = {
      alpha3: "sqi",
      alpha2: "sq",
      refName: "Albanian"
    };
    sr = {
      alpha3: "srp",
      alpha2: "sr",
      refName: "Serbian"
    };
    su = {
      alpha3: "sun",
      alpha2: "su",
      refName: "Sundanese"
    };
    sv = {
      alpha3: "swe",
      alpha2: "sv",
      refName: "Swedish"
    };
    sw = {
      alpha3: "swa",
      alpha2: "sw",
      refName: "Swahili (macrolanguage)"
    };
    ta = {
      alpha3: "tam",
      alpha2: "ta",
      refName: "Tamil"
    };
    te = {
      alpha3: "tel",
      alpha2: "te",
      refName: "Telugu"
    };
    tg = {
      alpha3: "tgk",
      alpha2: "tg",
      refName: "Tajik"
    };
    th = {
      alpha3: "tha",
      alpha2: "th",
      refName: "Thai"
    };
    tk = {
      alpha3: "tuk",
      alpha2: "tk",
      refName: "Turkmen"
    };
    tl = {
      alpha3: "tgl",
      alpha2: "tl",
      refName: "Tagalog"
    };
    tr = {
      alpha3: "tur",
      alpha2: "tr",
      refName: "Turkish"
    };
    tt = {
      alpha3: "tat",
      alpha2: "tt",
      refName: "Tatar"
    };
    tyv = {
      alpha3: "tyv",
      alpha2: null,
      refName: "Tuvinian"
    };
    ug = {
      alpha3: "uig",
      alpha2: "ug",
      refName: "Uighur"
    };
    uk = {
      alpha3: "ukr",
      alpha2: "uk",
      refName: "Ukrainian"
    };
    ur = {
      alpha3: "urd",
      alpha2: "ur",
      refName: "Urdu"
    };
    uz = {
      alpha3: "uzb",
      alpha2: "uz",
      refName: "Uzbek"
    };
    vec = {
      alpha3: "vec",
      alpha2: null,
      refName: "Venetian"
    };
    vep = {
      alpha3: "vep",
      alpha2: null,
      refName: "Veps"
    };
    vi = {
      alpha3: "vie",
      alpha2: "vi",
      refName: "Vietnamese"
    };
    vls = {
      alpha3: "vls",
      alpha2: null,
      refName: "Vlaams"
    };
    vo = {
      alpha3: "vol",
      alpha2: "vo",
      refName: "Volap\xFCk"
    };
    wa = {
      alpha3: "wln",
      alpha2: "wa",
      refName: "Walloon"
    };
    war = {
      alpha3: "war",
      alpha2: null,
      refName: "Waray (Philippines)"
    };
    wuu = {
      alpha3: "wuu",
      alpha2: null,
      refName: "Wu Chinese"
    };
    xal = {
      alpha3: "xal",
      alpha2: null,
      refName: "Kalmyk"
    };
    xmf = {
      alpha3: "xmf",
      alpha2: null,
      refName: "Mingrelian"
    };
    yi = {
      alpha3: "yid",
      alpha2: "yi",
      refName: "Yiddish"
    };
    yo = {
      alpha3: "yor",
      alpha2: "yo",
      refName: "Yoruba"
    };
    yue = {
      alpha3: "yue",
      alpha2: null,
      refName: "Yue Chinese"
    };
    zh = {
      alpha3: "zho",
      alpha2: "zh",
      refName: "Chinese"
    };
    languages = {
      af,
      als,
      am,
      an,
      ar,
      arz,
      as,
      ast,
      av,
      az,
      azb,
      ba,
      bar,
      bcl,
      be,
      bg,
      bh,
      bn,
      bo,
      bpy,
      br,
      bs,
      bxr,
      ca,
      cbk,
      ce,
      ceb,
      ckb,
      co,
      cs,
      cv,
      cy,
      da,
      de,
      diq,
      dsb,
      dty,
      dv,
      el,
      eml,
      en,
      eo,
      es,
      et,
      eu,
      fa,
      fi,
      fr,
      frr,
      fy,
      ga,
      gd,
      gl,
      gn,
      gom,
      gu,
      gv,
      he,
      hi,
      hif,
      hr,
      hsb,
      ht,
      hu,
      hy,
      ia,
      id,
      ie,
      ilo,
      io,
      is,
      it,
      ja,
      jbo,
      jv,
      ka,
      kk,
      km,
      kn,
      ko,
      krc,
      ku,
      kv,
      kw,
      ky,
      la,
      lb,
      lez,
      li,
      lmo,
      lo,
      lrc,
      lt,
      lv,
      mai,
      mg,
      mhr,
      min,
      mk,
      ml,
      mn,
      mr,
      mrj,
      ms,
      mt,
      mwl,
      my,
      myv,
      mzn,
      nah,
      nap,
      nds,
      ne,
      "new": {
        alpha3: "new",
        alpha2: null,
        refName: "Newari"
      },
      nl,
      nn,
      no,
      oc,
      or,
      os,
      pa,
      pam,
      pfl,
      pl,
      pms,
      pnb,
      ps,
      pt,
      qu,
      rm,
      ro,
      ru,
      rue,
      sa,
      sah,
      sc,
      scn,
      sco,
      sd,
      sh,
      si,
      sk,
      sl,
      so,
      sq,
      sr,
      su,
      sv,
      sw,
      ta,
      te,
      tg,
      th,
      tk,
      tl,
      tr,
      tt,
      tyv,
      ug,
      uk,
      ur,
      uz,
      vec,
      vep,
      vi,
      vls,
      vo,
      wa,
      war,
      wuu,
      xal,
      xmf,
      yi,
      yo,
      yue,
      zh
    };
  }
});

// node_modules/fasttext.wasm.js/dist/models/language-identification/base.mjs
var LANGUAGES_LIMIT, BaseLanguageIdentificationModel;
var init_base = __esm({
  "node_modules/fasttext.wasm.js/dist/models/language-identification/base.mjs"() {
    init_FastText();
    init_languages_json();
    LANGUAGES_LIMIT = Object.keys(languages).length;
    BaseLanguageIdentificationModel = class _BaseLanguageIdentificationModel {
      getFastTextModule;
      wasmPath;
      modelPath;
      model = null;
      static formatLang(raw) {
        const identifyLang = raw.replace("__label__", "");
        return _BaseLanguageIdentificationModel.normalizeIdentifyLang(identifyLang);
      }
      /**
       * fastText [language identification model](https://fasttext.cc/docs/en/language-identification.html)
       * result is based on [List of Wikipedias](https://en.wikipedia.org/wiki/List_of_Wikipedias) `WP code`
       *
       * This lib provide a normalize method to transform `WP code` to ISO 639-3 as much as possible.
       *
       * More detail refer to [languages scripts](https://github.com/yunsii/fasttext.wasm.js/tree/master/scripts/languages).
       *
       * Notice: ISO 639 provides two and three-character codes for representing names of languages. ISO 3166 provides two and three-character codes for representing names of countries.
       */
      static normalizeIdentifyLang(lang) {
        return languages[lang];
      }
      constructor(options) {
        const { getFastTextModule: getFastTextModule2, wasmPath, modelPath } = options;
        if (!modelPath) {
          throw new Error("No model path provided.");
        }
        this.getFastTextModule = getFastTextModule2;
        this.wasmPath = wasmPath;
        this.modelPath = modelPath;
      }
      /**
       * Use `lid.176.ftz` as default model
       */
      async load() {
        if (!this.model) {
          const FastText = await getFastTextClass({
            getFastTextModule: () => {
              return this.getFastTextModule({
                wasmPath: this.wasmPath
              });
            }
          });
          const fastText = new FastText();
          const modelHref = this.modelPath;
          this.model = await fastText.loadModel(modelHref);
        }
        return this.model;
      }
      async identify(text, top) {
        const minTop = Math.max(top || 1, 1);
        const limitTop = Math.min(LANGUAGES_LIMIT, minTop);
        const vector = (await this.load()).predict(text, limitTop, 0);
        if (typeof top === "undefined") {
          return {
            ..._BaseLanguageIdentificationModel.formatLang(vector.get(0)[1]),
            possibility: vector.get(0)[0]
          };
        }
        return Array.from({ length: vector.size() }).map((_, index) => {
          return {
            ..._BaseLanguageIdentificationModel.formatLang(vector.get(index)[1]),
            possibility: vector.get(index)[0]
          };
        });
      }
    };
  }
});

// node_modules/fasttext.wasm.js/dist/models/language-identification/common.mjs
async function getLanguageIdentificationModel(options = {}) {
  return new LanguageIdentificationModel(options);
}
var LanguageIdentificationModel, getLIDModel;
var init_common2 = __esm({
  "node_modules/fasttext.wasm.js/dist/models/language-identification/common.mjs"() {
    init_common();
    init_base();
    init_constants();
    LanguageIdentificationModel = class extends BaseLanguageIdentificationModel {
      constructor(options = {}) {
        const origin = typeof globalThis.location !== "undefined" ? globalThis.location.origin : "";
        super({
          wasmPath: `${origin}${commonAssetsDir}/fastText.common.wasm`,
          modelPath: `${origin}${commonAssetsModelsDir}/lid.176.ftz`,
          ...options,
          getFastTextModule
        });
      }
    };
    getLIDModel = getLanguageIdentificationModel;
  }
});

// node_modules/fasttext.wasm.js/dist/main/common.mjs
var common_exports = {};
__export(common_exports, {
  FastTextModel: () => FastTextModel,
  getFastTextClass: () => getFastTextClass,
  getFastTextModule: () => getFastTextModule,
  getLIDModel: () => getLIDModel,
  getLanguageIdentificationModel: () => getLanguageIdentificationModel
});
var init_common3 = __esm({
  "node_modules/fasttext.wasm.js/dist/main/common.mjs"() {
    init_common();
    init_FastText();
    init_FastTextModel();
    init_common2();
  }
});

// node_modules/dexie/import-wrapper.mjs
var import_dexie = __toESM(require_dexie(), 1);
var DexieSymbol = Symbol.for("Dexie");
var Dexie = globalThis[DexieSymbol] || (globalThis[DexieSymbol] = import_dexie.default);
if (import_dexie.default.semVer !== Dexie.semVer) {
  throw new Error(`Two different versions of Dexie loaded in the same app: ${import_dexie.default.semVer} and ${Dexie.semVer}`);
}
var {
  liveQuery,
  mergeRanges,
  rangesOverlap,
  RangeSet,
  cmp,
  Entity,
  PropModification,
  replacePrefix,
  add,
  remove,
  DexieYProvider
} = Dexie;
var import_wrapper_default = Dexie;

// src/db/database.ts
var AtentivDatabase = class extends import_wrapper_default {
  domains;
  tab_sessions;
  activities;
  workstreams;
  workstream_events;
  snapshots;
  rules;
  user_feedback;
  decision_traces;
  focus_metrics;
  settings;
  model_registry;
  feature_snapshots;
  browser_events;
  activity_segments;
  tab_switch_events;
  constructor() {
    super("AtentivDB");
    this.version(1).stores({
      domains: "++id, &domain, category, productivity_type, source, user_override, created_at, updated_at",
      tab_sessions: "&session_id, tab_id, window_id, domain, start_time, end_time, category, activity_type, productivity_type, workstream_id, created_at",
      activities: "&activity_id, session_id, category, activity_type, productivity_type, created_at",
      workstreams: "&workstream_id, name, category, status, last_active, created_at",
      workstream_events: "++id, workstream_id, session_id, entered_at, exited_at",
      snapshots: "&snapshot_id, title, workstream_id, timestamp",
      rules: "&rule_id, name, enabled, priority, created_at",
      user_feedback: "&feedback_id, session_id, timestamp",
      decision_traces: "&decision_id, session_id, timestamp, selected_workstream",
      focus_metrics: "++id, &period, focus_score, created_at",
      settings: "&key, updated_at",
      model_registry: "&model_id, version, active, created_at",
      feature_snapshots: "&id, session_id, url_hash, created_at"
    });
    this.version(2).stores({
      domains: "++id, &domain, category, productivity_type, source, user_override, created_at, updated_at",
      tab_sessions: "&session_id, tab_id, window_id, domain, start_time, end_time, category, activity_type, productivity_type, workstream_id, created_at",
      activities: "&activity_id, session_id, category, activity_type, productivity_type, created_at",
      workstreams: "&workstream_id, name, category, status, last_active, created_at",
      workstream_events: "++id, workstream_id, session_id, entered_at, exited_at",
      snapshots: "&snapshot_id, title, workstream_id, timestamp",
      rules: "&rule_id, name, enabled, priority, created_at",
      user_feedback: "&feedback_id, session_id, timestamp",
      decision_traces: "&decision_id, session_id, timestamp, selected_workstream",
      focus_metrics: "++id, &period, focus_score, created_at",
      settings: "&key, updated_at",
      model_registry: "&model_id, version, active, created_at",
      feature_snapshots: "&id, session_id, url_hash, created_at",
      browser_events: "&event_id, event_type, timestamp, tab_id, window_id",
      activity_segments: "&segment_id, tab_id, domain, start, end, productivity, workstream_id",
      tab_switch_events: "&switch_id, timestamp, previous_tab_id, new_tab_id, switch_burden"
    });
    this.version(3).stores({
      domains: "++id, &domain, category, productivity_type, source, user_override, created_at, updated_at",
      tab_sessions: "&session_id, tab_id, window_id, domain, start_time, end_time, category, activity_type, productivity_type, workstream_id, created_at, [workstream_id+start_time], [domain+start_time], [productivity_type+start_time]",
      activities: "&activity_id, session_id, category, activity_type, productivity_type, created_at",
      workstreams: "&workstream_id, name, category, status, last_active, created_at",
      workstream_events: "++id, workstream_id, session_id, entered_at, exited_at, [workstream_id+entered_at]",
      snapshots: "&snapshot_id, title, workstream_id, timestamp",
      rules: "&rule_id, name, enabled, priority, created_at",
      user_feedback: "&feedback_id, session_id, timestamp",
      decision_traces: "&decision_id, session_id, timestamp, selected_workstream, [session_id+timestamp]",
      focus_metrics: "++id, &period, focus_score, created_at",
      settings: "&key, updated_at",
      model_registry: "&model_id, version, active, created_at",
      feature_snapshots: "&id, session_id, url_hash, created_at",
      browser_events: "&event_id, event_type, timestamp, tab_id, window_id",
      activity_segments: "&segment_id, tab_id, domain, start, end, productivity, workstream_id, [domain+start]",
      tab_switch_events: "&switch_id, timestamp, previous_tab_id, new_tab_id, switch_burden"
    }).upgrade(async (tx) => {
      console.log(
        "[AtentivDB] Upgrading schema to Version 3 with compound indices."
      );
    });
  }
};
var db = new AtentivDatabase();

// src/db/repositories/sessionRepository.ts
var SessionRepository = class {
  static async create(session) {
    const now = Date.now();
    const fullSession = {
      session_id: session.session_id || crypto.randomUUID(),
      tab_id: session.tab_id || 0,
      window_id: session.window_id || 0,
      url: session.url,
      domain: session.domain,
      title: session.title || "",
      start_time: session.start_time || now,
      end_time: session.end_time || now,
      dwell_time: session.dwell_time || 0,
      active_time: session.active_time || 0,
      idle_time: session.idle_time || 0,
      category: session.category || "Uncategorized",
      activity_type: session.activity_type || "General Browsing",
      productivity_type: session.productivity_type || "neutral",
      productivity_score: session.productivity_score ?? 50,
      workstream_id: session.workstream_id || "general",
      workstream_name: session.workstream_name || "General",
      classification_confidence: session.classification_confidence ?? 1,
      classification_latency_ms: session.classification_latency_ms ?? 0,
      model_version: session.model_version || "1.0.0",
      created_at: session.created_at || now
    };
    await db.tab_sessions.put(fullSession);
    return fullSession;
  }
  static async getById(sessionId) {
    return await db.tab_sessions.get(sessionId);
  }
  static async updateDwell(sessionId, activeTimeDelta, now) {
    const existing = await db.tab_sessions.get(sessionId);
    if (!existing) return;
    const newActive = existing.active_time + activeTimeDelta;
    const newDwell = Math.max(existing.dwell_time, newActive);
    await db.tab_sessions.update(sessionId, {
      active_time: newActive,
      dwell_time: newDwell,
      end_time: now
    });
  }
  static async updateIdle(sessionId, idleTimeDelta, now) {
    const existing = await db.tab_sessions.get(sessionId);
    if (!existing) return;
    await db.tab_sessions.update(sessionId, {
      idle_time: (existing.idle_time || 0) + idleTimeDelta,
      end_time: now
    });
  }
  static async close(sessionId, endTime) {
    const existing = await db.tab_sessions.get(sessionId);
    if (!existing) return;
    await db.tab_sessions.update(sessionId, {
      end_time: endTime,
      dwell_time: existing.dwell_time
    });
  }
  static async getRange(from, to) {
    return await db.tab_sessions.where("start_time").between(from, to, true, true).toArray();
  }
  static async getRecent(limit = 100) {
    return await db.tab_sessions.orderBy("start_time").reverse().limit(limit).toArray();
  }
  static async getByWorkstream(workstreamId) {
    return await db.tab_sessions.where("workstream_id").equals(workstreamId).toArray();
  }
  /**
   * Fast compound query by workstream and time range.
   */
  static async getByWorkstreamRange(workstreamId, from, to) {
    return await db.tab_sessions.where("[workstream_id+start_time]").between([workstreamId, from], [workstreamId, to], true, true).toArray();
  }
  /**
   * Fast compound query by domain and time range.
   */
  static async getByDomainRange(domain, from, to) {
    return await db.tab_sessions.where("[domain+start_time]").between([domain, from], [domain, to], true, true).toArray();
  }
  /**
   * High-scale paginated range query to prevent UI thread lockups and memory bloat.
   */
  static async getRangePaged(from, to, offset = 0, limit = 50) {
    const query = db.tab_sessions.where("start_time").between(from, to, true, true);
    const total = await query.count();
    const sessions = await query.offset(offset).limit(limit).toArray();
    return { sessions, total };
  }
  /**
   * Count total tracked sessions in the database.
   */
  static async countTotal() {
    return await db.tab_sessions.count();
  }
  /**
   * Bulk insert sessions with high-throughput batching.
   */
  static async bulkCreate(sessions) {
    if (sessions.length === 0) return;
    await db.tab_sessions.bulkPut(sessions);
  }
  /**
   * Delete session by ID.
   */
  static async delete(sessionId) {
    await db.tab_sessions.delete(sessionId);
  }
};

// src/db/repositories/workstreamRepository.ts
var WorkstreamRepository = class {
  static async create(data) {
    const now = Date.now();
    const ws = {
      workstream_id: data.workstream_id,
      name: data.name,
      category: data.category,
      centroid: data.centroid,
      created_at: data.created_at || now,
      updated_at: data.updated_at || now,
      first_seen: data.first_seen || now,
      last_active: data.last_active || now,
      total_active_seconds: data.total_active_seconds || 0,
      confidence: data.confidence ?? 1,
      status: data.status || "active"
    };
    await db.workstreams.put(ws);
    return ws;
  }
  static async getById(workstreamId) {
    return await db.workstreams.get(workstreamId);
  }
  static async listActive(limit = 20) {
    return await db.workstreams.where("status").equals("active").sortBy("last_active").then((res) => res.reverse().slice(0, limit));
  }
  static async upsert(record) {
    await db.workstreams.put(record);
  }
  static async updateCentroid(workstreamId, newCentroid, activeDurationSeconds) {
    const ws = await db.workstreams.get(workstreamId);
    if (!ws) return;
    await db.workstreams.update(workstreamId, {
      centroid: newCentroid,
      total_active_seconds: ws.total_active_seconds + activeDurationSeconds,
      last_active: Date.now(),
      updated_at: Date.now()
    });
  }
  static async recordEvent(event) {
    await db.workstream_events.add(event);
  }
  static async getRecentEvents(limit = 50) {
    return await db.workstream_events.orderBy("entered_at").reverse().limit(limit).toArray();
  }
};

// libraries/workstreams/workstream_rules.json
var workstream_rules_default = {
  version: "1.0.1",
  similarity_weights: {
    semantic_similarity: 0.35,
    category_similarity: 0.2,
    activity_similarity: 0.15,
    domain_relationship: 0.1,
    temporal_proximity: 0.1,
    navigation_relationship: 0.1
  },
  clustering_thresholds: {
    attach_to_existing_workstream: 0.68,
    cosine_similarity_threshold: 0.68,
    enter_threshold: 0.7,
    keep_threshold: 0.55,
    hysteresis_margin: 0.05,
    high_confidence_match: 0.75,
    max_temporal_gap_seconds: 1200,
    temporal_window_seconds: 1200,
    rapid_switch_window_seconds: 45,
    max_active_workstreams_in_cache: 20
  },
  merge_rules: {
    min_shared_tabs: 3,
    centroid_similarity_threshold: 0.85
  },
  split_rules: {
    unrelated_duration_seconds: 900
  },
  seed_workstreams: [
    {
      id: "ws-dev",
      name: "Software Engineering & Development",
      category: "Technology",
      default_activities: ["Coding", "Debugging", "Documentation"]
    },
    {
      id: "ws-research",
      name: "Academic & Scientific Research",
      category: "Education",
      default_activities: ["Paper Reading", "Technical Research", "Search"]
    },
    {
      id: "ws-learning",
      name: "Technical Learning & Courses",
      category: "Education",
      default_activities: ["Lecture", "Tutorial", "Course"]
    },
    {
      id: "ws-communication",
      name: "Team Sync & Communications",
      category: "Chat",
      default_activities: ["Email", "Messaging", "Meeting"]
    }
  ]
};

// src/workstreams/similarity.ts
function cosineSimilarity(v1, v2) {
  if (!v1 || !v2 || v1.length === 0 || v2.length === 0) return 0;
  let dot = 0;
  let norm1 = 0;
  let norm2 = 0;
  const len = Math.min(v1.length, v2.length);
  for (let i = 0; i < len; i++) {
    dot += v1[i] * v2[i];
    norm1 += v1[i] * v1[i];
    norm2 += v2[i] * v2[i];
  }
  if (norm1 === 0 || norm2 === 0) return 0;
  return Math.max(
    0,
    Math.min(1, dot / (Math.sqrt(norm1) * Math.sqrt(norm2)))
  );
}
function computeWorkstreamSimilarity(input) {
  const weights = workstream_rules_default.similarity_weights;
  const semantic = cosineSimilarity(input.pageVector, input.workstreamCentroid);
  let categorySim = 0;
  if (input.pageCategory.toLowerCase() === input.workstreamCategory.toLowerCase()) {
    categorySim = 1;
  } else if (input.pageCategory === "Technology" && input.workstreamCategory === "Education" || input.pageCategory === "Education" && input.workstreamCategory === "Technology") {
    categorySim = 0.5;
  }
  let activitySim = 0.5;
  if (input.pageCategory === input.workstreamCategory) {
    activitySim = 0.8;
  }
  let domainSim = 0;
  if (input.workstreamDomains && input.workstreamDomains.includes(input.pageDomain)) {
    domainSim = 1;
  }
  const deltaSeconds = Math.max(
    0,
    (input.currentTimestamp - input.lastActiveTimestamp) / 1e3
  );
  const maxGap = workstream_rules_default.clustering_thresholds.max_temporal_gap_seconds || 1200;
  const temporal = Math.max(0, 1 - deltaSeconds / maxGap);
  const nav = input.isLinkedNavigation ? 1 : 0;
  const totalScore = weights.semantic_similarity * semantic + weights.category_similarity * categorySim + weights.activity_similarity * activitySim + weights.domain_relationship * domainSim + weights.temporal_proximity * temporal + weights.navigation_relationship * nav;
  return Math.max(0, Math.min(1, totalScore));
}

// src/workstreams/workstreamEngine.ts
var tentativeBuffer = [];
var WorkstreamEngine = class {
  static async assignWorkstream(input) {
    const activeWorkstreams = await WorkstreamRepository.listActive(10);
    const enterThreshold = workstream_rules_default.clustering_thresholds.enter_threshold || 0.7;
    const keepThreshold = workstream_rules_default.clustering_thresholds.keep_threshold || 0.55;
    const delta = workstream_rules_default.clustering_thresholds.hysteresis_margin || 0.05;
    let bestWs = null;
    let bestScore = -1;
    let currentWsScore = -1;
    const similarityScores = {};
    for (const ws of activeWorkstreams) {
      const score = computeWorkstreamSimilarity({
        pageVector: input.sentenceVector,
        workstreamCentroid: ws.centroid,
        pageCategory: input.category,
        workstreamCategory: ws.category,
        pageActivity: input.activity,
        pageDomain: input.domain,
        lastActiveTimestamp: ws.last_active,
        currentTimestamp: input.timestamp,
        isLinkedNavigation: input.linkedNavigation
      });
      similarityScores[ws.name] = Number(score.toFixed(3));
      if (input.currentWorkstreamId && ws.workstream_id === input.currentWorkstreamId) {
        currentWsScore = score;
      }
      if (score > bestScore) {
        bestScore = score;
        bestWs = ws;
      }
    }
    if (input.currentWorkstreamId && currentWsScore >= keepThreshold) {
      const currentWs = activeWorkstreams.find(
        (w) => w.workstream_id === input.currentWorkstreamId
      );
      if (currentWs) {
        const canSwitch = bestWs && bestWs.workstream_id !== currentWs.workstream_id && bestScore > currentWsScore + delta && bestScore >= enterThreshold;
        if (!canSwitch) {
          return {
            workstreamId: currentWs.workstream_id,
            workstreamName: currentWs.name,
            confidence: Number(currentWsScore.toFixed(3)),
            isNewWorkstream: false,
            similarityScores
          };
        }
      }
    }
    const attachThreshold = workstream_rules_default.clustering_thresholds.attach_to_existing_workstream || 0.68;
    if (bestWs && bestScore >= attachThreshold) {
      const newCentroid = this.blendCentroid(
        bestWs.centroid,
        input.sentenceVector
      );
      await WorkstreamRepository.updateCentroid(
        bestWs.workstream_id,
        newCentroid,
        10
      );
      return {
        workstreamId: bestWs.workstream_id,
        workstreamName: bestWs.name,
        confidence: Number(bestScore.toFixed(3)),
        isNewWorkstream: false,
        similarityScores
      };
    }
    const matchingTentativeIdx = tentativeBuffer.findIndex(
      (t) => t.domain === input.domain || t.category === input.category && Math.abs(t.timestamp - input.timestamp) < 6e5
    );
    if (matchingTentativeIdx !== -1) {
      tentativeBuffer.splice(matchingTentativeIdx, 1);
      const synthesizedName2 = this.synthesizeWorkstreamName(
        input.title,
        input.domain,
        input.category,
        input.activity
      );
      const newWsId2 = crypto.randomUUID();
      const newRecord2 = {
        workstream_id: newWsId2,
        name: synthesizedName2,
        category: input.category,
        centroid: input.sentenceVector ? Array.from(input.sentenceVector) : void 0,
        created_at: input.timestamp,
        updated_at: input.timestamp,
        first_seen: input.timestamp,
        last_active: input.timestamp,
        total_active_seconds: 0,
        confidence: 0.9,
        status: "active"
      };
      await WorkstreamRepository.upsert(newRecord2);
      return {
        workstreamId: newWsId2,
        workstreamName: synthesizedName2,
        confidence: 0.9,
        isNewWorkstream: true,
        similarityScores
      };
    }
    tentativeBuffer.push({
      domain: input.domain,
      title: input.title,
      category: input.category,
      activity: input.activity,
      timestamp: input.timestamp,
      vector: input.sentenceVector ? Array.from(input.sentenceVector) : void 0
    });
    if (tentativeBuffer.length > 10) tentativeBuffer.shift();
    const synthesizedName = this.synthesizeWorkstreamName(
      input.title,
      input.domain,
      input.category,
      input.activity
    );
    const newWsId = crypto.randomUUID();
    const newRecord = {
      workstream_id: newWsId,
      name: synthesizedName,
      category: input.category,
      centroid: input.sentenceVector ? Array.from(input.sentenceVector) : void 0,
      created_at: input.timestamp,
      updated_at: input.timestamp,
      first_seen: input.timestamp,
      last_active: input.timestamp,
      total_active_seconds: 0,
      confidence: 0.8,
      status: "active"
    };
    await WorkstreamRepository.upsert(newRecord);
    return {
      workstreamId: newWsId,
      workstreamName: synthesizedName,
      confidence: 0.8,
      isNewWorkstream: true,
      isTentative: true,
      similarityScores
    };
  }
  static blendCentroid(oldCentroid, newVector) {
    if (!newVector || newVector.length === 0) return oldCentroid || [];
    const vec2 = Array.from(newVector);
    if (!oldCentroid || oldCentroid.length === 0) return vec2;
    const alpha = 0.8;
    return oldCentroid.map((c, i) => alpha * c + (1 - alpha) * (vec2[i] || 0));
  }
  static synthesizeWorkstreamName(title, domain, category, activity) {
    const cleanTitle = title.replace(/[\-–|•].*$/, "").replace(/https?:\/\/\S+/g, "").trim();
    if (cleanTitle && cleanTitle.length > 3 && cleanTitle.length < 50) {
      return cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    }
    if (domain.includes("github.com")) return "Code & Repository Work";
    if (domain.includes("stackoverflow.com"))
      return "Technical Debugging & Issues";
    if (domain.includes("arxiv.org") || domain.includes("scholar.google"))
      return "Academic Literature Research";
    if (domain.includes("youtube.com"))
      return activity === "Tutorial" ? "Technical Video Tutorial" : "Media & Video";
    if (domain.includes("notion.so") || domain.includes("linear.app"))
      return "Project Planning & Tasks";
    return `${category} \u2014 ${activity}`;
  }
  /**
   * SRS Revision 3.1: Merge rule (>3 tabs or centroid >0.85)
   */
  static canMergeWorkstreams(ws1, ws2, sharedTabsCount = 0) {
    if (sharedTabsCount > (workstream_rules_default.merge_rules?.min_shared_tabs ?? 3))
      return true;
    if (ws1.centroid && ws2.centroid) {
      const similarity = cosineSimilarity(ws1.centroid, ws2.centroid);
      if (similarity > (workstream_rules_default.merge_rules?.centroid_similarity_threshold ?? 0.85))
        return true;
    }
    return false;
  }
  /**
   * Merges source workstream into target workstream and blends centroids
   */
  static async mergeWorkstreams(targetWsId, sourceWsId) {
    const active = await WorkstreamRepository.listActive(50);
    const target = active.find((w) => w.workstream_id === targetWsId);
    const source = active.find((w) => w.workstream_id === sourceWsId);
    if (!target || !source) return;
    if (source.centroid) {
      const blended = this.blendCentroid(target.centroid, source.centroid);
      await WorkstreamRepository.updateCentroid(
        targetWsId,
        blended,
        source.total_active_seconds
      );
    }
    await WorkstreamRepository.upsert({
      ...source,
      status: "archived",
      updated_at: Date.now()
    });
  }
  /**
   * SRS Revision 3.1: Split rule (split after 15 min / 900s of unrelated browsing)
   */
  static shouldSplitWorkstream(unrelatedActiveSeconds) {
    const splitThreshold = workstream_rules_default.split_rules?.unrelated_duration_seconds || 900;
    return unrelatedActiveSeconds >= splitThreshold;
  }
};

// src/workstreams/contextSwitch.ts
var ContextSwitchEvaluator = class {
  static evaluate(ctx) {
    const isTabSwitch = ctx.fromTabId !== void 0 && ctx.toTabId !== void 0 && ctx.fromTabId !== ctx.toTabId || ctx.fromUrl && ctx.toUrl && ctx.fromUrl !== ctx.toUrl;
    const isWorkstreamSwitch = Boolean(
      ctx.fromWorkstreamId && ctx.toWorkstreamId && ctx.fromWorkstreamId !== ctx.toWorkstreamId
    );
    if (!isTabSwitch && !isWorkstreamSwitch) {
      return {
        isSwitch: false,
        penaltyPoints: 0,
        switchType: "within_workstream",
        isRapidSwitch: false,
        switchBurden: "low",
        switchBurdenScore: 0
      };
    }
    const elapsedSeconds = Math.max(
      0,
      (ctx.now - ctx.lastSwitchTimestamp) / 1e3
    );
    const isRapid = elapsedSeconds <= 45;
    let basePenalty = 2;
    let switchType = "related";
    if (!isWorkstreamSwitch) {
      basePenalty = 0;
      switchType = "within_workstream";
    } else if (ctx.fromCategory && ctx.toCategory && ctx.fromCategory.toLowerCase() === ctx.toCategory.toLowerCase()) {
      basePenalty = 1;
      switchType = "same_category";
    } else if (ctx.fromCategory === "Technology" && ctx.toCategory === "Education" || ctx.fromCategory === "Education" && ctx.toCategory === "Technology") {
      basePenalty = 2;
      switchType = "related";
    } else {
      basePenalty = 4;
      switchType = "unrelated";
    }
    const penaltyPoints = isRapid ? Math.round(basePenalty * 1.5) : basePenalty;
    const switchBurden = penaltyPoints <= 1 ? "low" : penaltyPoints <= 3 ? "medium" : "high";
    const switchBurdenScore = Math.min(100, penaltyPoints * 18);
    return {
      isSwitch: true,
      penaltyPoints,
      switchType,
      isRapidSwitch: isRapid,
      switchBurden,
      switchBurdenScore
    };
  }
};

// libraries/privacy/sensitive_domains.json
var sensitive_domains_default = {
  version: "1.0.0",
  description: "Sensitive domains automatically excluded or protected by Atentiv",
  sensitive_categories: {
    banking: [
      "chase.com",
      "bankofamerica.com",
      "wellsfargo.com",
      "citi.com",
      "hdfcbank.com",
      "icicibank.com",
      "sbi.co.in",
      "paypal.com",
      "stripe.com",
      "wise.com",
      "revolut.com"
    ],
    password_managers: [
      "1password.com",
      "bitwarden.com",
      "lastpass.com",
      "dashlane.com",
      "keepersecurity.com"
    ],
    authentication_oauth: [
      "accounts.google.com",
      "login.microsoftonline.com",
      "auth0.com",
      "okta.com",
      "id.apple.com"
    ],
    healthcare_private: [
      "mychart.org",
      "epic.com",
      "cerner.com",
      "labcorp.com",
      "questdiagnostics.com"
    ],
    tax_government_secure: [
      "irs.gov",
      "incometax.gov.in",
      "hmrc.gov.uk"
    ]
  },
  default_excluded_domains: [
    "accounts.google.com",
    "login.microsoftonline.com",
    "1password.com",
    "bitwarden.com",
    "paypal.com"
  ],
  sensitive_url_patterns: [
    "/login",
    "/signin",
    "/auth",
    "/checkout",
    "/password",
    "/token",
    "/reset-password",
    "/verify"
  ]
};

// src/privacy/exclusionEngine.ts
var ExclusionEngine = class {
  static sensitiveSet = null;
  static sensitivePatterns = [];
  static init() {
    if (this.sensitiveSet) return;
    this.sensitiveSet = /* @__PURE__ */ new Set();
    const categories = sensitive_domains_default.sensitive_categories;
    for (const list of Object.values(categories)) {
      for (const d of list) {
        this.sensitiveSet.add(d.toLowerCase());
      }
    }
    this.sensitivePatterns = sensitive_domains_default.sensitive_url_patterns || [];
  }
  static check(domain, fullUrl = "", userExclusions = []) {
    this.init();
    const cleanDomain = domain.toLowerCase().trim();
    for (const excl of userExclusions) {
      const e = excl.toLowerCase().trim();
      if (!e) continue;
      if (cleanDomain === e || cleanDomain.endsWith("." + e)) {
        return {
          isExcluded: true,
          reason: `User exclusion rule matched: ${excl}`
        };
      }
      if (e.includes("*")) {
        const regexStr = "^" + e.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$";
        if (new RegExp(regexStr).test(cleanDomain)) {
          return {
            isExcluded: true,
            reason: `User wildcard exclusion matched: ${excl}`
          };
        }
      }
    }
    if (this.sensitiveSet.has(cleanDomain)) {
      return {
        isExcluded: true,
        reason: "Built-in sensitive domain protection"
      };
    }
    const parts = cleanDomain.split(".");
    for (let i = 1; i < parts.length - 1; i++) {
      const parent = parts.slice(i).join(".");
      if (this.sensitiveSet.has(parent)) {
        return {
          isExcluded: true,
          reason: "Built-in sensitive domain protection (subdomain)"
        };
      }
    }
    if (fullUrl) {
      try {
        const path = new URL(fullUrl).pathname.toLowerCase();
        for (const pattern of this.sensitivePatterns) {
          if (path.includes(pattern)) {
            return {
              isExcluded: true,
              reason: `Sensitive URL pattern detected: ${pattern}`
            };
          }
        }
      } catch {
      }
    }
    return { isExcluded: false };
  }
  static isExcluded(domain, userExclusions = [], fullUrl = "") {
    return this.check(domain, fullUrl, userExclusions).isExcluded;
  }
  static sanitizeUrl(rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      parsed.search = "";
      parsed.hash = "";
      parsed.username = "";
      parsed.password = "";
      return parsed.toString().replace(/\/$/, "");
    } catch {
      return rawUrl;
    }
  }
};

// src/rules/ruleEngine.ts
var RuleEngine = class {
  static match(rules, ctx) {
    const activeRules = rules.filter((r) => r.enabled).sort((a, b) => b.priority - a.priority);
    for (const rule of activeRules) {
      if (this.evalCondition(rule.condition, ctx)) {
        return {
          matchedRule: rule,
          action: rule.action,
          reason: `User Rule '${rule.name}' (priority ${rule.priority}) matched`
        };
      }
    }
    return null;
  }
  static evalCondition(cond, ctx) {
    const cleanDomain = ctx.domain.toLowerCase().trim();
    if (cond.domain_exact && cleanDomain !== cond.domain_exact.toLowerCase().trim()) {
      return false;
    }
    if (cond.domain_wildcard) {
      const pattern = "^" + cond.domain_wildcard.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$";
      if (!new RegExp(pattern, "i").test(cleanDomain)) {
        return false;
      }
    }
    if (cond.url_path_prefix) {
      try {
        const path = new URL(ctx.url).pathname.toLowerCase();
        if (!path.startsWith(cond.url_path_prefix.toLowerCase())) {
          return false;
        }
      } catch {
        return false;
      }
    }
    if (cond.title_contains) {
      const titleLower = ctx.title.toLowerCase();
      if (Array.isArray(cond.title_contains)) {
        const matchesAny = cond.title_contains.some(
          (term) => titleLower.includes(String(term).toLowerCase())
        );
        if (!matchesAny) return false;
      } else {
        if (!titleLower.includes(String(cond.title_contains).toLowerCase())) {
          return false;
        }
      }
    }
    if (cond.title_regex) {
      try {
        if (!new RegExp(cond.title_regex, "i").test(ctx.title)) {
          return false;
        }
      } catch {
        return false;
      }
    }
    if (cond.heading_contains && ctx.headings && ctx.headings.length > 0) {
      const combined = ctx.headings.join(" ").toLowerCase();
      if (Array.isArray(cond.heading_contains)) {
        const matchesAny = cond.heading_contains.some(
          (term) => combined.includes(String(term).toLowerCase())
        );
        if (!matchesAny) return false;
      } else {
        if (!combined.includes(String(cond.heading_contains).toLowerCase())) {
          return false;
        }
      }
    }
    if (cond.page_category && ctx.category) {
      if (ctx.category.toLowerCase() !== cond.page_category.toLowerCase()) {
        return false;
      }
    }
    if (cond.time_of_day_start !== void 0 || cond.day_of_week) {
      const now = new Date(ctx.timestamp || Date.now());
      if (cond.time_of_day_start !== void 0 && cond.time_of_day_end !== void 0) {
        const hour = now.getHours();
        if (hour < cond.time_of_day_start || hour > cond.time_of_day_end) {
          return false;
        }
      }
      if (cond.day_of_week && cond.day_of_week.length > 0) {
        const day = now.getDay();
        if (!cond.day_of_week.includes(day)) {
          return false;
        }
      }
    }
    return true;
  }
};

// libraries/domains/domains.json
var domains_default = {
  version: "1.0.0",
  updated_at: "2026-09-28T00:00:00Z",
  domains: [
    {
      domain: "github.com",
      category: "Technology",
      activity: "Coding",
      defaultProductivity: "productive",
      keywords: ["repository", "pull request", "commit", "issue", "branch", "code", "merge"],
      source: "curated",
      confidence: 1
    },
    {
      domain: "gitlab.com",
      category: "Technology",
      activity: "Coding",
      defaultProductivity: "productive",
      keywords: ["repository", "merge request", "pipeline", "ci/cd"],
      source: "curated",
      confidence: 1
    },
    {
      domain: "stackoverflow.com",
      category: "Technology",
      activity: "Debugging",
      defaultProductivity: "productive",
      keywords: ["question", "answer", "error", "exception", "solution", "debug"],
      source: "curated",
      confidence: 0.98
    },
    {
      domain: "stackexchange.com",
      category: "Technology",
      activity: "Debugging",
      defaultProductivity: "productive",
      keywords: ["question", "answer", "solution"],
      source: "curated",
      confidence: 0.95
    },
    {
      domain: "arxiv.org",
      category: "Education",
      activity: "Paper Reading",
      defaultProductivity: "productive",
      keywords: ["preprint", "paper", "abstract", "pdf", "neural", "quantum", "computation"],
      source: "curated",
      confidence: 1
    },
    {
      domain: "scholar.google.com",
      category: "Education",
      activity: "Technical Research",
      defaultProductivity: "productive",
      keywords: ["citations", "articles", "peer review", "journal", "author"],
      source: "curated",
      confidence: 0.98
    },
    {
      domain: "wikipedia.org",
      category: "Education",
      activity: "Reference Lookup",
      defaultProductivity: "productive",
      keywords: ["encyclopedia", "history", "definition", "overview"],
      source: "curated",
      confidence: 0.9
    },
    {
      domain: "docs.python.org",
      category: "Technology",
      activity: "Documentation",
      defaultProductivity: "productive",
      keywords: ["python", "standard library", "module", "function", "tutorial"],
      source: "curated",
      confidence: 1
    },
    {
      domain: "developer.mozilla.org",
      category: "Technology",
      activity: "Documentation",
      defaultProductivity: "productive",
      keywords: ["mdn", "javascript", "css", "html", "web api", "dom"],
      source: "curated",
      confidence: 1
    },
    {
      domain: "react.dev",
      category: "Technology",
      activity: "Documentation",
      defaultProductivity: "productive",
      keywords: ["react", "hooks", "component", "state", "props", "virtual dom"],
      source: "curated",
      confidence: 1
    },
    {
      domain: "typescriptlang.org",
      category: "Technology",
      activity: "Documentation",
      defaultProductivity: "productive",
      keywords: ["typescript", "type system", "interface", "generics", "tsconfig"],
      source: "curated",
      confidence: 1
    },
    {
      domain: "mail.google.com",
      category: "Chat",
      activity: "Email",
      defaultProductivity: "productive",
      keywords: ["inbox", "mail", "thread", "message", "compose"],
      source: "curated",
      confidence: 0.95
    },
    {
      domain: "slack.com",
      category: "Chat",
      activity: "Messaging",
      defaultProductivity: "productive",
      keywords: ["channel", "thread", "workspace", "direct message", "slack"],
      source: "curated",
      confidence: 0.95
    },
    {
      domain: "notion.so",
      category: "Work",
      activity: "Project Management",
      defaultProductivity: "productive",
      keywords: ["workspace", "notes", "database", "kanban", "roadmap", "wiki"],
      source: "curated",
      confidence: 0.95
    },
    {
      domain: "linear.app",
      category: "Work",
      activity: "Task Management",
      defaultProductivity: "productive",
      keywords: ["issue", "cycle", "project", "backlog", "triage"],
      source: "curated",
      confidence: 1
    },
    {
      domain: "figma.com",
      category: "Work",
      activity: "Planning",
      defaultProductivity: "productive",
      keywords: ["design", "prototype", "canvas", "wireframe", "vector", "component"],
      source: "curated",
      confidence: 0.95
    },
    {
      domain: "youtube.com",
      category: "Entertainment",
      activity: "Video",
      defaultProductivity: "neutral",
      keywords: ["watch", "video", "channel", "playlist", "stream"],
      source: "curated",
      confidence: 0.85
    },
    {
      domain: "netflix.com",
      category: "Entertainment",
      activity: "Streaming",
      defaultProductivity: "distracting",
      keywords: ["watch", "movie", "series", "episode"],
      source: "curated",
      confidence: 1
    },
    {
      domain: "reddit.com",
      category: "Entertainment",
      activity: "Community",
      defaultProductivity: "neutral",
      keywords: ["post", "subreddit", "comments", "thread", "upvote"],
      source: "curated",
      confidence: 0.8
    },
    {
      domain: "instagram.com",
      category: "Entertainment",
      activity: "Social Media",
      defaultProductivity: "distracting",
      keywords: ["reels", "feed", "stories", "photo", "explore"],
      source: "curated",
      confidence: 1
    },
    {
      domain: "twitter.com",
      category: "News",
      activity: "Feed Browsing",
      defaultProductivity: "distracting",
      keywords: ["tweet", "timeline", "trending", "retweet"],
      source: "curated",
      confidence: 0.9
    },
    {
      domain: "x.com",
      category: "News",
      activity: "Feed Browsing",
      defaultProductivity: "distracting",
      keywords: ["post", "timeline", "trending", "status"],
      source: "curated",
      confidence: 0.9
    },
    {
      domain: "amazon.com",
      category: "Shop",
      activity: "Shopping",
      defaultProductivity: "distracting",
      keywords: ["cart", "order", "product", "delivery", "price"],
      source: "curated",
      confidence: 0.95
    },
    {
      domain: "amazon.in",
      category: "Shop",
      activity: "Shopping",
      defaultProductivity: "distracting",
      keywords: ["cart", "order", "product", "delivery", "rupees"],
      source: "curated",
      confidence: 0.95
    },
    {
      domain: "coursera.org",
      category: "Education",
      activity: "Course",
      defaultProductivity: "productive",
      keywords: ["course", "specialization", "assignment", "quiz", "lecture", "certificate"],
      source: "curated",
      confidence: 1
    },
    {
      domain: "edx.org",
      category: "Education",
      activity: "Course",
      defaultProductivity: "productive",
      keywords: ["course", "university", "syllabus", "lecture"],
      source: "curated",
      confidence: 1
    }
  ]
};

// src/db/repositories/domainRepository.ts
var DomainRepository = class {
  static async getByDomain(domain) {
    const cleanDomain = domain.toLowerCase().trim();
    const exact = await db.domains.where("domain").equals(cleanDomain).first();
    if (exact) return exact;
    const parts = cleanDomain.split(".");
    for (let i = 1; i < parts.length - 1; i++) {
      const parent = parts.slice(i).join(".");
      const match = await db.domains.where("domain").equals(parent).first();
      if (match) return match;
    }
    return void 0;
  }
  static async upsert(record) {
    const existing = await db.domains.where("domain").equals(record.domain).first();
    if (existing && existing.id) {
      await db.domains.update(existing.id, {
        ...record,
        updated_at: Date.now()
      });
    } else {
      await db.domains.add({
        ...record,
        created_at: Date.now(),
        updated_at: Date.now()
      });
    }
  }
  static async seedDefaults() {
    const count = await db.domains.count();
    if (count > 0) return 0;
    const defaults = domains_default.domains || [];
    const now = Date.now();
    const records = defaults.map((d) => ({
      domain: d.domain,
      category: d.category,
      default_activity: d.activity || d.default_activity || "General Browsing",
      productivity_type: d.defaultProductivity || d.productivity_type || "neutral",
      keywords: d.keywords || [],
      source: d.source || "curated",
      confidence: d.confidence ?? 1,
      user_override: false,
      created_at: now,
      updated_at: now
    }));
    await db.domains.bulkAdd(records);
    return records.length;
  }
  static async listAll() {
    return await db.domains.toArray();
  }
};

// src/ml/inferenceCache.ts
var InferenceCache = class {
  static cache = /* @__PURE__ */ new Map();
  static MAX_CACHE_ENTRIES = 2e3;
  static makeKey(domain, title, headings = []) {
    const normDomain = domain.toLowerCase().trim();
    const normTitle = title.toLowerCase().trim().substring(0, 100);
    const headingsSample = headings.slice(0, 3).join("|").toLowerCase().trim();
    return `${normDomain}::${normTitle}::${headingsSample}`;
  }
  static get(key) {
    const entry = this.cache.get(key);
    if (!entry) return void 0;
    if (Date.now() - entry.timestamp > 864e5) {
      this.cache.delete(key);
      return void 0;
    }
    return entry;
  }
  static set(key, val) {
    if (this.cache.size >= this.MAX_CACHE_ENTRIES) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, val);
  }
  static clear() {
    this.cache.clear();
  }
};

// src/ml/modelLoader.ts
var activeModelWrapper = null;
var loadPromise = null;
var ModelLoader = class {
  static getActiveModel() {
    return activeModelWrapper;
  }
  static isLoaded() {
    return activeModelWrapper !== null && activeModelWrapper.isLoaded;
  }
  static async load(modelPathOverride) {
    if (activeModelWrapper) return activeModelWrapper;
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      try {
        const isExtension = typeof chrome !== "undefined" && !!chrome.runtime?.id;
        if (isExtension) {
          const { getFastTextClass: getFastTextClass2, getFastTextModule: getFastTextModule2 } = await Promise.resolve().then(() => (init_common3(), common_exports));
          const wasmUrl = chrome.runtime.getURL("wasm/fastText.common.wasm");
          const modelUrl = modelPathOverride || chrome.runtime.getURL("models/atentiv-classifier.ftz");
          const FastText = await getFastTextClass2({
            getFastTextModule: () => getFastTextModule2({ wasmPath: wasmUrl })
          });
          const ft = new FastText();
          const rawModel = await ft.loadModel(modelUrl);
          activeModelWrapper = this.wrapModel(rawModel, "2.0.0");
          return activeModelWrapper;
        } else {
          const { getFastTextClass: getFastTextClass2, getFastTextModule: getFastTextModule2 } = await Promise.resolve().then(() => (init_common3(), common_exports));
          const FastText = await getFastTextClass2({ getFastTextModule: getFastTextModule2 });
          const ft = new FastText();
          const modelUrl = modelPathOverride || `file://${process.cwd()}/public/models/atentiv-classifier.ftz`;
          const rawModel = await ft.loadModel(modelUrl);
          activeModelWrapper = this.wrapModel(
            rawModel,
            "2.0.0"
          );
          return activeModelWrapper;
        }
      } catch (err) {
        console.warn(
          "FastText WASM load failed, activating heuristic fallback model:",
          err
        );
        activeModelWrapper = this.createFallbackModel();
        return activeModelWrapper;
      }
    })();
    return loadPromise;
  }
  static wrapModel(model, version) {
    return {
      isLoaded: true,
      version,
      predict: (text, k = 3, threshold = 0) => {
        try {
          const res = model.predict(text, k, threshold);
          const out = [];
          for (let i = 0; i < res.size(); i++) {
            const pair = res.get(i);
            const cleanLabel = pair[1].replace("__label__", "");
            out.push({ label: cleanLabel, score: Number(pair[0].toFixed(4)) });
          }
          return out;
        } catch {
          return [{ label: "Uncategorized", score: 0.5 }];
        }
      },
      getSentenceVector: (text) => {
        try {
          return model.getSentenceVector(text);
        } catch {
          return new Float32Array(50);
        }
      },
      getDimension: () => {
        try {
          return model.getDimension();
        } catch {
          return 50;
        }
      }
    };
  }
  static createFallbackModel() {
    return {
      isLoaded: true,
      version: "fallback-heuristics-1.0",
      predict: (text) => {
        const lower = text.toLowerCase();
        if (lower.includes("code") || lower.includes("python") || lower.includes("git")) {
          return [
            { label: "Technology", score: 0.9 },
            { label: "Education", score: 0.4 }
          ];
        }
        if (lower.includes("paper") || lower.includes("arxiv") || lower.includes("study")) {
          return [
            { label: "Education", score: 0.9 },
            { label: "Technology", score: 0.5 }
          ];
        }
        if (lower.includes("video") || lower.includes("watch") || lower.includes("music")) {
          return [{ label: "Entertainment", score: 0.9 }];
        }
        if (lower.includes("shop") || lower.includes("cart") || lower.includes("buy")) {
          return [{ label: "Shop", score: 0.9 }];
        }
        return [{ label: "Uncategorized", score: 0.6 }];
      },
      getSentenceVector: () => new Float32Array(50),
      getDimension: () => 50
    };
  }
};

// libraries/keywords/development.json
var development_default = {
  category: "Technology",
  activity_group: "Development",
  keywords: [
    "python",
    "javascript",
    "typescript",
    "react",
    "node",
    "api",
    "git",
    "github",
    "repository",
    "debugging",
    "compiler",
    "database",
    "sql",
    "postgres",
    "mongodb",
    "docker",
    "kubernetes",
    "vue",
    "angular",
    "nextjs",
    "vite",
    "webpack",
    "rust",
    "golang",
    "c++",
    "java",
    "css",
    "html",
    "tailwind",
    "pull request",
    "commit",
    "branch",
    "merge",
    "syntaxerror",
    "modulenotfounderror",
    "nullpointerexception",
    "stack trace",
    "refactor",
    "unit test",
    "pytest",
    "jest",
    "backend",
    "frontend"
  ]
};

// libraries/keywords/research.json
var research_default = {
  category: "Education",
  activity_group: "Research",
  keywords: [
    "research",
    "paper",
    "arxiv",
    "survey",
    "experiment",
    "benchmark",
    "reference",
    "methodology",
    "dataset",
    "literature",
    "abstract",
    "proceedings",
    "citation",
    "ieee",
    "acm",
    "springer",
    "pubmed",
    "doi",
    "hypothesis",
    "empirical",
    "evaluation",
    "neural",
    "transformer",
    "deep learning",
    "statistical",
    "peer review"
  ]
};

// libraries/keywords/learning.json
var learning_default = {
  category: "Education",
  activity_group: "Learning",
  keywords: [
    "course",
    "lecture",
    "tutorial",
    "lesson",
    "study",
    "assignment",
    "exam",
    "documentation",
    "handbook",
    "guide",
    "syllabus",
    "walkthrough",
    "learn",
    "class",
    "curriculum",
    "textbook",
    "module",
    "certification",
    "workshop",
    "exercise",
    "practice",
    "udemy",
    "coursera",
    "edx",
    "khan academy"
  ]
};

// libraries/keywords/communication.json
var communication_default = {
  category: "Chat",
  activity_group: "Communication",
  keywords: [
    "inbox",
    "mail",
    "gmail",
    "outlook",
    "slack",
    "discord",
    "message",
    "chat",
    "meeting",
    "zoom",
    "google meet",
    "teams",
    "thread",
    "conversation",
    "reply",
    "sync",
    "huddle",
    "calendar",
    "invite",
    "standup"
  ]
};

// libraries/keywords/entertainment.json
var entertainment_default = {
  category: "Entertainment",
  activity_group: "Entertainment",
  keywords: [
    "movie",
    "music",
    "celebrity",
    "meme",
    "funny",
    "viral",
    "trailer",
    "song",
    "spotify",
    "netflix",
    "prime video",
    "anime",
    "gaming",
    "gameplay",
    "stream",
    "twitch",
    "comedy",
    "parody",
    "bloopers",
    "clip",
    "compilation"
  ]
};

// src/intelligence/runtimePipeline.ts
function normalizeText(text, maxChars) {
  if (!text) return "";
  let s = String(text);
  try {
    s = s.normalize("NFKC");
  } catch {
  }
  s = s.replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, " ");
  s = s.replace(/https?:\/\/[^\s]+/gi, " ");
  s = s.replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, " ");
  s = s.replace(/\b\d{7,}\b/g, " ");
  s = s.replace(/[^\w\s\.\-_]/g, " ");
  s = s.toLowerCase();
  s = s.replace(/\s+/g, " ").trim();
  if (typeof maxChars === "number" && maxChars > 0) {
    s = s.substring(0, maxChars).trim();
  }
  return s;
}
function normalizeAndJoinCompositeText(fields) {
  const parts = [];
  if (fields.title) {
    const t = normalizeText(fields.title, 300);
    if (t) parts.push(t);
  }
  if (fields.description) {
    const d = normalizeText(fields.description, 500);
    if (d) parts.push(d);
  }
  if (fields.headings && Array.isArray(fields.headings)) {
    const cleanHeadings = [];
    for (const h of fields.headings.slice(0, 20)) {
      const ch = normalizeText(h, 150);
      if (ch) cleanHeadings.push(ch);
    }
    if (cleanHeadings.length > 0) {
      parts.push(cleanHeadings.join(" "));
    }
  }
  if (fields.mainText) {
    const mt2 = normalizeText(fields.mainText, 2048);
    if (mt2) parts.push(mt2);
  }
  if (parts.length === 0) return "";
  const joined = parts.join(" ").replace(/\s+/g, " ").trim();
  return joined.substring(0, 4096).trim();
}

// src/features/textFeatures.ts
function sanitizeUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }
    parsed.search = "";
    parsed.hash = "";
    parsed.username = "";
    parsed.password = "";
    const sanitized = parsed.toString().replace(/\/$/, "");
    let domain = parsed.hostname.toLowerCase();
    if (domain.startsWith("www.")) {
      domain = domain.substring(4);
    }
    const pathTokens = parsed.pathname.toLowerCase().split(/[\/\-_\.]+/).filter((t) => t.length > 1 && !/^\d+$/.test(t));
    return { sanitized, domain, pathTokens };
  } catch {
    return null;
  }
}
function buildCompositeFeatureText(domain, pathTokens, title, headings = [], metaDescription = "", excerpt = "") {
  const composite = normalizeAndJoinCompositeText({
    title,
    description: metaDescription,
    headings,
    mainText: excerpt
  });
  if (!composite && domain) {
    return normalizeText(
      `${domain.replace(/\./g, " ")} ${pathTokens.slice(0, 10).join(" ")}`
    );
  }
  return composite;
}

// libraries/productivity/productivity_rules.json
var productivity_rules_default = {
  version: "1.0.0",
  description: "Baseline contextual productivity inference rules",
  activity_defaults: {
    Coding: "productive",
    Debugging: "productive",
    Documentation: "productive",
    "Code Review": "productive",
    "Paper Reading": "productive",
    "Technical Research": "productive",
    Search: "neutral",
    "Reference Lookup": "productive",
    Lecture: "productive",
    Tutorial: "productive",
    Course: "productive",
    Practice: "productive",
    Email: "neutral",
    Messaging: "neutral",
    Meeting: "productive",
    Collaboration: "productive",
    Planning: "productive",
    "Task Management": "productive",
    "Project Management": "productive",
    Video: "neutral",
    Music: "neutral",
    Streaming: "distracting",
    Gaming: "distracting",
    "Social Media": "distracting",
    "Feed Browsing": "distracting",
    Community: "neutral",
    "Product Search": "neutral",
    Shopping: "distracting",
    Reviews: "neutral",
    "General Browsing": "neutral",
    Unknown: "neutral"
  },
  contextual_overrides: [
    {
      condition: "domain == 'youtube.com' and (contains_keyword('tutorial') or contains_keyword('lecture') or contains_keyword('course') or contains_keyword('programming') or contains_keyword('explained'))",
      activity: "Tutorial",
      productivity: "productive"
    },
    {
      condition: "domain == 'youtube.com' and (contains_keyword('meme') or contains_keyword('funny') or contains_keyword('music') or contains_keyword('trailer') or contains_keyword('compilation'))",
      activity: "Video",
      productivity: "distracting"
    },
    {
      condition: "domain == 'reddit.com' and (contains_keyword('learnprogramming') or contains_keyword('machinelearning') or contains_keyword('reactjs') or contains_keyword('datascience'))",
      activity: "Technical Research",
      productivity: "productive"
    },
    {
      condition: "domain == 'reddit.com' and (contains_keyword('funny') or contains_keyword('memes') or contains_keyword('gaming') or contains_keyword('aww'))",
      activity: "Community",
      productivity: "distracting"
    }
  ]
};

// src/ml/classifier.ts
var Classifier = class {
  static async classify(input) {
    const t0 = performance.now();
    const sessionId = input.sessionId || crypto.randomUUID();
    const sanitized = sanitizeUrl(input.url);
    if (!sanitized) {
      const latency2 = performance.now() - t0;
      return {
        category: "Uncategorized",
        categoryScores: [{ label: "Uncategorized", score: 1 }],
        confidence: 1,
        activity: "Unknown",
        productivity: "neutral",
        productivityScore: 0,
        modelVersion: "none",
        isExcluded: true,
        exclusionReason: "Non-trackable or internal URL protocol",
        compositeText: "",
        decisionTrace: this.makeTrace(
          sessionId,
          [],
          null,
          [],
          [],
          1,
          "Unknown",
          "neutral",
          "None",
          {},
          ["Non-trackable URL"],
          "none",
          latency2
        ),
        inferenceLatencyMs: latency2
      };
    }
    const { domain, pathTokens } = sanitized;
    const cleanTitle = (input.title || "").trim();
    const headings = input.headings || [];
    const reasons = [];
    const exclCheck = ExclusionEngine.check(
      domain,
      input.url,
      input.userExclusions || []
    );
    if (exclCheck.isExcluded) {
      const latency2 = performance.now() - t0;
      return {
        category: "Private",
        categoryScores: [{ label: "Private", score: 1 }],
        confidence: 1,
        activity: "Excluded",
        productivity: "neutral",
        productivityScore: 0,
        modelVersion: "none",
        isExcluded: true,
        exclusionReason: exclCheck.reason,
        compositeText: domain,
        decisionTrace: this.makeTrace(
          sessionId,
          [],
          null,
          [],
          [],
          1,
          "Excluded",
          "neutral",
          "None",
          {},
          [exclCheck.reason || "Excluded"],
          "none",
          latency2
        ),
        inferenceLatencyMs: latency2
      };
    }
    const pageCtx = {
      domain,
      url: input.url,
      title: cleanTitle,
      headings,
      timestamp: Date.now()
    };
    const ruleMatch = RuleEngine.match(input.userRules || [], pageCtx);
    if (ruleMatch) {
      reasons.push(ruleMatch.reason);
      const action = ruleMatch.action;
      if (action.exclude_from_tracking || action.mark_as_private) {
        const latency3 = performance.now() - t0;
        return {
          category: action.category || "Private",
          categoryScores: [{ label: action.category || "Private", score: 1 }],
          confidence: 1,
          activity: action.activity_type || "Excluded",
          productivity: "neutral",
          productivityScore: 0,
          modelVersion: "user-rule",
          isExcluded: true,
          exclusionReason: ruleMatch.reason,
          compositeText: domain,
          decisionTrace: this.makeTrace(
            sessionId,
            [
              {
                rule_id: ruleMatch.matchedRule.rule_id,
                name: ruleMatch.matchedRule.name,
                priority: ruleMatch.matchedRule.priority
              }
            ],
            null,
            [],
            [],
            1,
            action.activity_type || "Excluded",
            "neutral",
            action.force_workstream || "User Override",
            {},
            reasons,
            "user-rule",
            latency3
          ),
          inferenceLatencyMs: latency3
        };
      }
      const assignedCategory = action.category || "Technology";
      const assignedActivity = action.activity_type || "Coding";
      const assignedProductivity = action.productivity_type || "productive";
      const latency2 = performance.now() - t0;
      return {
        category: assignedCategory,
        categoryScores: [{ label: assignedCategory, score: 1 }],
        confidence: 1,
        activity: assignedActivity,
        productivity: assignedProductivity,
        productivityScore: assignedProductivity === "productive" ? 1 : assignedProductivity === "distracting" ? -1 : 0,
        modelVersion: "user-rule",
        isExcluded: false,
        compositeText: buildCompositeFeatureText(
          domain,
          pathTokens,
          cleanTitle,
          headings,
          input.metaDescription,
          input.visibleTextExcerpt
        ),
        decisionTrace: this.makeTrace(
          sessionId,
          [
            {
              rule_id: ruleMatch.matchedRule.rule_id,
              name: ruleMatch.matchedRule.name,
              priority: ruleMatch.matchedRule.priority
            }
          ],
          null,
          [],
          [{ label: assignedCategory, score: 1 }],
          1,
          assignedActivity,
          assignedProductivity,
          action.force_workstream || "User Assigned",
          {},
          reasons,
          "user-rule",
          latency2
        ),
        inferenceLatencyMs: latency2
      };
    }
    const cacheKey = InferenceCache.makeKey(domain, cleanTitle, headings);
    const cached = InferenceCache.get(cacheKey);
    if (cached) {
      reasons.push("Inference Cache Hit (24h TTL)");
      const latency2 = performance.now() - t0;
      return {
        category: cached.category,
        categoryScores: cached.categoryScores,
        confidence: cached.confidence,
        activity: cached.activity,
        productivity: cached.productivity,
        productivityScore: cached.productivity === "productive" ? 1 : cached.productivity === "distracting" ? -1 : 0,
        modelVersion: cached.modelVersion,
        isExcluded: false,
        compositeText: buildCompositeFeatureText(
          domain,
          pathTokens,
          cleanTitle,
          headings,
          input.metaDescription,
          input.visibleTextExcerpt
        ),
        decisionTrace: this.makeTrace(
          sessionId,
          [],
          null,
          [],
          cached.categoryScores,
          cached.confidence,
          cached.activity,
          cached.productivity,
          "Cached",
          {},
          reasons,
          cached.modelVersion,
          latency2
        ),
        inferenceLatencyMs: latency2
      };
    }
    let domainRecord = await DomainRepository.getByDomain(domain);
    if (!domainRecord) {
      await DomainRepository.seedDefaults();
      domainRecord = await DomainRepository.getByDomain(domain);
    }
    const compositeText = buildCompositeFeatureText(
      domain,
      pathTokens,
      cleanTitle,
      headings,
      input.metaDescription,
      input.visibleTextExcerpt
    );
    let predictions = [];
    let sentenceVector = void 0;
    let modelVersion = "fastText-1.0";
    try {
      let model = ModelLoader.getActiveModel();
      if (!model) {
        model = await ModelLoader.load();
      }
      predictions = model.predict(compositeText, 3, 0);
      sentenceVector = model.getSentenceVector(compositeText);
      modelVersion = model.version;
    } catch {
      reasons.push(
        "fastText WASM unavailable; fell back silently to keyword scoring"
      );
    }
    const topPred = predictions[0] || null;
    let finalCategory = "Uncategorized";
    let confidence = 0.5;
    if (domainRecord && domainRecord.confidence >= 0.95) {
      finalCategory = domainRecord.category;
      confidence = domainRecord.confidence;
      reasons.push(
        `Curated domain rule '${domain}' matched (${domainRecord.category})`
      );
    } else if (topPred && topPred.score > 0.35) {
      finalCategory = topPred.label;
      confidence = topPred.score;
      reasons.push(
        `fastText model predicted ${topPred.label} with confidence ${topPred.score.toFixed(2)}`
      );
    } else {
      const kw2 = this.inferActivity(compositeText, "Uncategorized");
      if (kw2.matchedKeywords.length > 0) {
        if (kw2.activity === "Coding" || kw2.activity === "Debugging" || kw2.activity === "Documentation")
          finalCategory = "Technology";
        else if (kw2.activity === "Research" || kw2.activity === "Paper Reading")
          finalCategory = "Research";
        else if (kw2.activity === "Learning" || kw2.activity === "Tutorial" || kw2.activity === "Lecture")
          finalCategory = "Education";
        else if (kw2.activity === "Communication" || kw2.activity === "Email")
          finalCategory = "Communication";
        else if (kw2.activity === "Entertainment" || kw2.activity === "Video")
          finalCategory = "Entertainment";
        confidence = 0.7;
        reasons.push(
          `Keyword scoring heuristic assigned '${finalCategory}' based on keywords [${kw2.matchedKeywords.slice(0, 3).join(", ")}]`
        );
      } else {
        finalCategory = "Uncategorized";
        confidence = 0.5;
        reasons.push("Safe fallback: Uncategorized");
      }
      predictions = [{ label: finalCategory, score: confidence }];
    }
    const { activity, matchedKeywords } = this.inferActivity(
      compositeText,
      finalCategory,
      domainRecord?.default_activity
    );
    reasons.push(
      `Activity Engine determined '${activity}' based on keywords: [${matchedKeywords.slice(0, 3).join(", ")}]`
    );
    const productivity = this.inferProductivity(
      domain,
      compositeText,
      activity,
      finalCategory,
      domainRecord?.productivity_type
    );
    reasons.push(`Productivity Engine assigned '${productivity}'`);
    const latency = performance.now() - t0;
    const result = {
      category: finalCategory,
      categoryScores: predictions,
      confidence,
      activity,
      productivity,
      productivityScore: productivity === "productive" ? 1 : productivity === "distracting" ? -1 : 0,
      modelVersion,
      isExcluded: false,
      sentenceVector,
      compositeText,
      decisionTrace: this.makeTrace(
        sessionId,
        [],
        domainRecord ? {
          domain: domainRecord.domain,
          category: domainRecord.category,
          activity: domainRecord.default_activity
        } : null,
        matchedKeywords,
        predictions,
        confidence,
        activity,
        productivity,
        "Determined during Workstream Matching",
        {},
        reasons,
        modelVersion,
        latency
      ),
      inferenceLatencyMs: latency
    };
    InferenceCache.set(cacheKey, {
      category: result.category,
      categoryScores: result.categoryScores,
      confidence: result.confidence,
      activity: result.activity,
      productivity: result.productivity,
      modelVersion: result.modelVersion,
      timestamp: Date.now()
    });
    return result;
  }
  static inferActivity(text, category, defaultActivity) {
    const matched = [];
    const lower = text.toLowerCase();
    const checkDict = (keywords) => {
      const hits = [];
      for (const kw2 of keywords) {
        if (lower.includes(kw2.toLowerCase())) hits.push(kw2);
      }
      return hits;
    };
    const devHits = checkDict(development_default.keywords);
    const resHits = checkDict(research_default.keywords);
    const learnHits = checkDict(learning_default.keywords);
    const commHits = checkDict(communication_default.keywords);
    const entHits = checkDict(entertainment_default.keywords);
    if (devHits.length > 0) {
      matched.push(...devHits);
      if (lower.includes("error") || lower.includes("exception") || lower.includes("debug") || lower.includes("issue")) {
        return { activity: "Debugging", matchedKeywords: matched };
      }
      if (lower.includes("docs") || lower.includes("documentation") || lower.includes("reference") || lower.includes("api")) {
        return { activity: "Documentation", matchedKeywords: matched };
      }
      return { activity: "Coding", matchedKeywords: matched };
    }
    if (resHits.length > 0) {
      matched.push(...resHits);
      return { activity: "Technical Research", matchedKeywords: matched };
    }
    if (learnHits.length > 0) {
      matched.push(...learnHits);
      if (lower.includes("tutorial") || lower.includes("walkthrough"))
        return { activity: "Tutorial", matchedKeywords: matched };
      if (lower.includes("lecture") || lower.includes("video"))
        return { activity: "Lecture", matchedKeywords: matched };
      return { activity: "Course", matchedKeywords: matched };
    }
    if (commHits.length > 0) {
      matched.push(...commHits);
      if (lower.includes("mail") || lower.includes("inbox"))
        return { activity: "Email", matchedKeywords: matched };
      return { activity: "Messaging", matchedKeywords: matched };
    }
    if (entHits.length > 0) {
      matched.push(...entHits);
      return { activity: "Video", matchedKeywords: matched };
    }
    return {
      activity: defaultActivity || (category === "Technology" ? "Coding" : category === "Education" ? "Paper Reading" : "General Browsing"),
      matchedKeywords: matched
    };
  }
  static inferProductivity(domain, text, activity, category, domainDefault) {
    const lowerText = text.toLowerCase();
    if (domain.includes("youtube.com")) {
      if (lowerText.includes("tutorial") || lowerText.includes("lecture") || lowerText.includes("course") || lowerText.includes("documentation") || lowerText.includes("programming") || lowerText.includes("code")) {
        return "productive";
      }
      return "distracting";
    }
    if (domain.includes("reddit.com")) {
      if (lowerText.includes("learnprogramming") || lowerText.includes("programming") || lowerText.includes("machinelearning") || lowerText.includes("reactjs") || lowerText.includes("datascience") || lowerText.includes("rust") || activity === "Coding" || activity === "Technical Research" || activity === "Documentation") {
        return "productive";
      }
      if (lowerText.includes("memes") || lowerText.includes("funny") || lowerText.includes("gaming")) {
        return "distracting";
      }
      return "neutral";
    }
    if (domainDefault) return domainDefault;
    const actDefaults = productivity_rules_default.activity_defaults;
    if (actDefaults[activity]) {
      return actDefaults[activity];
    }
    if (category === "Technology" || category === "Education" || category === "Work")
      return "productive";
    if (category === "Entertainment" || category === "Shop")
      return "distracting";
    return "neutral";
  }
  static makeTrace(sessionId, ruleMatches, domainMatch, keywordMatches, modelPredictions, modelConfidence, selectedActivity, selectedProductivity, selectedWorkstream, workstreamScores, finalReason, modelVersion, totalLatencyMs) {
    return {
      session_id: sessionId,
      timestamp: Date.now(),
      rule_matches: ruleMatches,
      domain_match: domainMatch,
      keyword_matches: keywordMatches,
      model_predictions: modelPredictions,
      model_confidence: modelConfidence,
      selected_activity: selectedActivity,
      selected_productivity: selectedProductivity,
      selected_workstream: selectedWorkstream,
      workstream_scores: workstreamScores,
      final_reason: finalReason,
      model_version: modelVersion,
      feature_schema_version: "1.0.0",
      total_latency_ms: Number(totalLatencyMs.toFixed(2))
    };
  }
};

// src/db/repositories/traceRepository.ts
var TraceRepository = class {
  static async record(trace) {
    await db.decision_traces.put(trace);
  }
  static async getById(decisionId) {
    return await db.decision_traces.get(decisionId);
  }
  static async getBySession(sessionId) {
    return await db.decision_traces.where("session_id").equals(sessionId).first();
  }
  static async getRecent(limit = 20) {
    return await db.decision_traces.orderBy("timestamp").reverse().limit(limit).toArray();
  }
};

// src/db/repositories/ruleRepository.ts
var RuleRepository = class {
  static async listActive() {
    const rules = await db.rules.orderBy("priority").reverse().toArray();
    return rules.filter((r) => Boolean(r.enabled));
  }
  static async listAll() {
    return await db.rules.orderBy("priority").reverse().toArray();
  }
  static async add(rule) {
    const now = Date.now();
    await db.rules.put({
      ...rule,
      created_at: now,
      updated_at: now
    });
  }
  static async update(ruleId, changes) {
    await db.rules.update(ruleId, {
      ...changes,
      updated_at: Date.now()
    });
  }
  static async remove(ruleId) {
    await db.rules.delete(ruleId);
  }
};

// src/background/sessionManager.ts
var SessionManager = class {
  static active = null;
  static lastSwitchTime = Date.now();
  static getActiveCheckpoint() {
    return this.active;
  }
  static async initFromStorage() {
    try {
      const sessionData = await chrome.storage.session.get("activeCheckpoint");
      if (sessionData && sessionData.activeCheckpoint) {
        this.active = sessionData.activeCheckpoint;
      }
    } catch {
      this.active = null;
    }
  }
  static async reconcile(reset = false) {
    const now = Date.now();
    const settings = await chrome.storage.local.get("atentiv_settings");
    const enabled = settings.atentiv_settings?.enabled ?? true;
    const userExclusions = settings.atentiv_settings?.exclusions || [];
    if (!enabled) {
      if (this.active) {
        await SessionRepository.close(this.active.sessionId, now);
        this.active = null;
        await chrome.storage.session.remove("activeCheckpoint");
      }
      await chrome.storage.session.set({
        trackingState: "PAUSED"
      });
      return;
    }
    if (reset && this.active) {
      await SessionRepository.close(this.active.sessionId, now);
      this.active = null;
      await chrome.storage.session.remove("activeCheckpoint");
    }
    try {
      const window2 = await chrome.windows.getLastFocused().catch(() => null);
      if (!window2 || window2.id === void 0) {
        if (this.active) {
          const elapsedActive = Math.min(
            now - this.active.lastCheckpoint,
            6e4
          );
          if (elapsedActive > 0) {
            await SessionRepository.updateDwell(
              this.active.sessionId,
              elapsedActive,
              now
            );
          }
          await SessionRepository.close(this.active.sessionId, now);
          this.active = null;
          await chrome.storage.session.remove("activeCheckpoint");
        }
        await chrome.storage.session.set({
          trackingState: "NO_ACTIVE_SESSION"
        });
        return;
      }
      const [tab] = await chrome.tabs.query({
        active: true,
        windowId: window2.id
      });
      if (!tab || !tab.url || tab.incognito) {
        if (this.active) {
          const elapsedActive = Math.min(
            now - this.active.lastCheckpoint,
            6e4
          );
          if (elapsedActive > 0) {
            await SessionRepository.updateDwell(
              this.active.sessionId,
              elapsedActive,
              now
            );
          }
          await SessionRepository.close(this.active.sessionId, now);
          this.active = null;
          await chrome.storage.session.remove("activeCheckpoint");
        }
        await chrome.storage.session.set({
          trackingState: tab?.incognito ? "UNTRACKABLE" : "NO_ACTIVE_SESSION"
        });
        return;
      }
      const isUntrackable = !tab.url.startsWith("http://") && !tab.url.startsWith("https://");
      if (isUntrackable) {
        if (this.active) {
          const elapsedActive = Math.min(
            now - this.active.lastCheckpoint,
            6e4
          );
          if (elapsedActive > 0) {
            await SessionRepository.updateDwell(
              this.active.sessionId,
              elapsedActive,
              now
            );
          }
          await SessionRepository.close(this.active.sessionId, now);
          this.active = null;
          await chrome.storage.session.remove("activeCheckpoint");
        }
        await chrome.storage.session.set({
          trackingState: "UNTRACKABLE",
          untrackableReason: "Tracking unavailable on internal browser page. Atentiv will resume automatically on a supported webpage."
        });
        return;
      }
      const sanitizedTabUrl = ExclusionEngine.sanitizeUrl(tab.url);
      const isSameTab = this.active && this.active.tabId === tab.id && (this.active.url === tab.url || this.active.url === sanitizedTabUrl);
      if (isSameTab && this.active) {
        const idleThresholdSec = Math.max(
          60,
          Math.min(600, settings.atentiv_settings?.idleThresholdSeconds ?? 180)
        );
        const idleState = await chrome.idle.queryState(idleThresholdSec).catch(() => "active");
        const isAudible = Boolean(tab.audible);
        const isQualifyingCategory = [
          "Education",
          "Technology",
          "Research",
          "Communication",
          "Learning"
        ].includes(this.active.category);
        const mediaException = isAudible && isQualifyingCategory;
        if (idleState !== "active" && !mediaException) {
          const elapsedIdle = Math.min(now - this.active.lastCheckpoint, 6e4);
          if (elapsedIdle > 0) {
            await SessionRepository.updateIdle(
              this.active.sessionId,
              elapsedIdle,
              now
            );
          }
          this.active.lastCheckpoint = now;
          await chrome.storage.session.set({
            activeCheckpoint: this.active,
            trackingState: "INACTIVE"
          });
          return;
        }
        const elapsedActive = Math.min(now - this.active.lastCheckpoint, 6e4);
        if (elapsedActive > 0) {
          this.active.dwellTime += elapsedActive;
          this.active.lastCheckpoint = now;
          await SessionRepository.updateDwell(
            this.active.sessionId,
            elapsedActive,
            now
          );
          await chrome.storage.session.set({
            activeCheckpoint: this.active,
            trackingState: "TRACKING"
          });
        }
        return;
      }
      const previousActive = this.active;
      if (this.active) {
        const elapsedActive = Math.min(now - this.active.lastCheckpoint, 6e4);
        if (elapsedActive > 0) {
          await SessionRepository.updateDwell(
            this.active.sessionId,
            elapsedActive,
            now
          );
        }
        await SessionRepository.close(this.active.sessionId, now);
        this.active = null;
        await chrome.storage.session.remove("activeCheckpoint");
      }
      const userRules = await RuleRepository.listActive();
      const classification = await Classifier.classify({
        url: tab.url,
        title: tab.title || "",
        sessionId: crypto.randomUUID(),
        userRules,
        userExclusions
      });
      if (classification.isExcluded) {
        this.active = null;
        await chrome.storage.session.remove("activeCheckpoint");
        return;
      }
      const wsAssignment = await WorkstreamEngine.assignWorkstream({
        domain: new URL(tab.url).hostname.replace(/^www\./, ""),
        title: tab.title || "",
        category: classification.category,
        activity: classification.activity,
        sentenceVector: classification.sentenceVector,
        timestamp: now
      });
      const switchEval = ContextSwitchEvaluator.evaluate({
        fromWorkstreamId: previousActive?.workstreamId || "",
        toWorkstreamId: wsAssignment.workstreamId,
        fromCategory: previousActive?.category || "",
        toCategory: classification.category,
        fromTabId: previousActive?.tabId,
        toTabId: tab.id,
        fromUrl: previousActive?.url,
        toUrl: tab.url,
        lastSwitchTimestamp: this.lastSwitchTime,
        now
      });
      if (switchEval.isSwitch) {
        this.lastSwitchTime = now;
        const wsEvent = {
          workstream_id: wsAssignment.workstreamId,
          session_id: classification.decisionTrace.session_id,
          entered_at: now,
          exited_at: now,
          duration: 0,
          previous_workstream_id: previousActive?.workstreamId || null,
          switch_penalty: switchEval.penaltyPoints
        };
        await WorkstreamRepository.recordEvent(wsEvent);
      }
      const newSession = {
        session_id: classification.decisionTrace.session_id,
        tab_id: tab.id || 0,
        window_id: window2.id,
        url: ExclusionEngine.sanitizeUrl(tab.url),
        domain: new URL(tab.url).hostname.replace(/^www\./, ""),
        title: tab.title || new URL(tab.url).hostname,
        start_time: now,
        end_time: now,
        dwell_time: 0,
        active_time: 0,
        idle_time: 0,
        category: classification.category,
        activity_type: classification.activity,
        productivity_type: classification.productivity,
        productivity_score: classification.productivityScore,
        workstream_id: wsAssignment.workstreamId,
        workstream_name: wsAssignment.workstreamName,
        classification_confidence: classification.confidence,
        classification_latency_ms: classification.inferenceLatencyMs,
        model_version: classification.modelVersion,
        created_at: now
      };
      await SessionRepository.create(newSession);
      await TraceRepository.record({
        decision_id: crypto.randomUUID(),
        ...classification.decisionTrace,
        selected_workstream: wsAssignment.workstreamName,
        workstream_scores: wsAssignment.similarityScores
      });
      this.active = {
        sessionId: newSession.session_id,
        tabId: newSession.tab_id,
        windowId: newSession.window_id,
        url: newSession.url,
        domain: newSession.domain,
        title: newSession.title,
        category: newSession.category,
        activity: newSession.activity_type,
        productivity: newSession.productivity_type,
        workstreamId: newSession.workstream_id,
        workstreamName: newSession.workstream_name,
        since: now,
        lastCheckpoint: now,
        dwellTime: 0
      };
      await chrome.storage.session.set({
        activeCheckpoint: this.active,
        trackingState: "TRACKING"
      });
    } catch (err) {
      console.error("SessionManager reconcile error:", err);
    }
  }
};

// src/ml/audioClassifier.ts
var AudioClassifier = class {
  /**
   * Detects the audio streaming or media platform from the URL and title.
   */
  static detectPlatform(url, title = "") {
    const raw = (url + " " + title).toLowerCase();
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
      if (host === "music.youtube.com") return "YouTube Music";
      if (host === "youtube.com" || host === "youtu.be") return "YouTube";
      if (host === "open.spotify.com" || host === "spotify.com")
        return "Spotify";
      if (host === "soundcloud.com") return "SoundCloud";
      if (host === "music.apple.com") return "Apple Music";
      if (host === "podcasts.apple.com") return "Apple Podcasts";
      if (host === "twitch.tv") return "Twitch";
      if (host === "netflix.com") return "Netflix";
      if (host.includes("bandcamp.com")) return "Bandcamp";
      if (host.includes("deezer.com")) return "Deezer";
      if (host.includes("mixcloud.com")) return "Mixcloud";
      if (host.includes("audible.com")) return "Audible";
      if (host.includes("bbc.co.uk") && parsed.pathname.includes("sounds"))
        return "BBC Sounds";
      if (host === "music.amazon.com") return "Amazon Music";
      if (host.includes("pandora.com")) return "Pandora";
      if (host === "meet.google.com" || host.includes("zoom.us") || host.includes("teams.microsoft.com") || host === "discord.com") {
        return "Voice / Meeting";
      }
    } catch {
    }
    if (raw.includes("spotify")) return "Spotify";
    if (raw.includes("youtube") || raw.includes("youtu.be")) return "YouTube";
    if (raw.includes("soundcloud")) return "SoundCloud";
    if (raw.includes("twitch")) return "Twitch";
    if (raw.includes("netflix")) return "Netflix";
    if (raw.includes("podcast")) return "Apple Podcasts";
    if (raw.includes("audible")) return "Audible";
    return "Web Audio Stream";
  }
  /**
   * Classifies an audible tab using fastText ML and computes the distraction score.
   */
  static async classifyAudio(url, title = "", metaDescription = "") {
    const platform = this.detectPlatform(url, title);
    const cleanTitle = (title || "").trim();
    const syntheticTitle = `[${platform} Audio] ${cleanTitle}`;
    const classification = await Classifier.classify({
      url,
      title: syntheticTitle,
      metaDescription
    });
    const category = classification.category || "Uncategorized";
    const confidence = classification.confidence || 0.7;
    const modelVersion = classification.modelVersion || "fastText-1.0";
    const { score, level, isDistracting, reason, productivity } = this.computeDistractionScore(platform, category, cleanTitle, confidence);
    return {
      platform,
      category,
      confidence,
      distractionScore: score,
      isDistracting,
      distractionLevel: level,
      distractionReason: reason,
      productivityType: productivity,
      activity: classification.activity || `Audio: ${platform}`,
      modelVersion,
      timestamp: Date.now()
    };
  }
  /**
   * Computes quantitative distraction score based on FastText category + acoustic/semantic modifiers.
   */
  static computeDistractionScore(platform, category, title, confidence) {
    const t = title.toLowerCase();
    let baseScore = 50;
    switch (category) {
      case "Education":
        baseScore = 15;
        break;
      case "Technology":
      case "Research":
      case "Work":
        baseScore = 20;
        break;
      case "Communication":
        baseScore = 35;
        break;
      case "Travel":
      case "Government":
      case "Health":
        baseScore = 45;
        break;
      case "News":
        baseScore = 60;
        break;
      case "Chat":
      case "Shop":
        baseScore = 75;
        break;
      case "Entertainment":
        baseScore = 85;
        break;
      default:
        baseScore = 50;
        break;
    }
    let modifier = 0;
    const reasons = [];
    const focusPattern = /\b(lo-?fi|lofi|ambient|instrumental|classical|binaural|white\s*noise|pink\s*noise|nature|rain|synthwave|meditation|chillhop|piano|sleep|study\s*(beats|music)?|deep\s*focus|concentration|soundtrack|bgm)\b/i;
    if (focusPattern.test(t)) {
      modifier -= 35;
      reasons.push(
        "Acoustic profile indicates ambient/instrumental focus aid (-35)"
      );
    }
    const lecturePattern = /\b(lecture|tutorial|course|seminar|keynote|conference|audiobook|lesson|documentary|deep\s*dive|explanation|walkthrough)\b/i;
    if (lecturePattern.test(t)) {
      modifier -= 25;
      reasons.push("Spoken content is educational/instructional (-25)");
    }
    const distractionPattern = /\b(gameplay|gaming|let'?s\s*play|reaction|reacting|comedy|stand-?up|prank|meme|drama|anime|sitcom|trailer|streamer|esports|speedrun|music\s*video|official\s*(video|mv))\b/i;
    if (distractionPattern.test(t)) {
      modifier += 25;
      reasons.push("Visual/entertainment media with high cognitive draw (+25)");
    }
    if (platform === "Voice / Meeting") {
      baseScore = 25;
      reasons.push("Live communication/meeting channel");
    } else if (platform === "Netflix" || platform === "Twitch") {
      modifier += 15;
      reasons.push(`${platform} streaming video platform (+15)`);
    } else if (platform === "Audible" || platform === "Apple Podcasts") {
      modifier -= 10;
      reasons.push("Spoken audio / podcast platform (-10)");
    }
    const finalScore = Math.max(
      0,
      Math.min(100, Math.round(baseScore + modifier))
    );
    const isDistracting = finalScore >= 60;
    const level = finalScore < 40 ? "low" : finalScore < 65 ? "moderate" : "high";
    const productivity = finalScore < 40 ? "productive" : finalScore < 65 ? "neutral" : "distracting";
    const reasonSummary = `[${platform} \xB7 ML: ${category} (${(confidence * 100).toFixed(0)}%)] ${reasons.length > 0 ? reasons.join("; ") : `Base ${category} audio profile`} \u2192 Score: ${finalScore}/100 (${isDistracting ? "Distracting" : "Focus-friendly"})`;
    return {
      score: finalScore,
      level,
      isDistracting,
      reason: reasonSummary,
      productivity
    };
  }
};

// src/background/audioSessionManager.ts
var AudioSessionManager = class {
  static activeSessions = /* @__PURE__ */ new Map();
  /**
   * Retrieves all currently active audio sessions across any open browser tabs.
   */
  static getActiveSessions() {
    return Array.from(this.activeSessions.values());
  }
  /**
   * Retrieves the latest active audio session, or null if no tabs are playing audio.
   */
  static getLatestActiveSession() {
    const list = this.getActiveSessions();
    if (list.length === 0) return null;
    return list[list.length - 1];
  }
  /**
   * Scans open tabs for audible audio playback and syncs sessions with the database.
   */
  static async reconcileAudioTabs() {
    if (typeof chrome === "undefined" || !chrome.tabs?.query) {
      return;
    }
    const now = Date.now();
    try {
      const allTabs = await chrome.tabs.query({});
      const audibleTabs = allTabs.filter(
        (t) => Boolean(t.audible) && Boolean(t.url) && !t.incognito
      );
      const currentAudibleIds = /* @__PURE__ */ new Set();
      for (const tab of audibleTabs) {
        if (!tab.id || !tab.url) continue;
        if (!tab.url.startsWith("http://") && !tab.url.startsWith("https://")) {
          continue;
        }
        currentAudibleIds.add(tab.id);
        const existing = this.activeSessions.get(tab.id);
        if (existing) {
          const elapsed = Math.min(now - existing.lastTick, 6e4);
          if (elapsed > 0) {
            existing.audibleDwellMs += elapsed;
            existing.lastTick = now;
            await SessionRepository.updateDwell(
              existing.sessionId,
              elapsed,
              now
            );
          }
        } else {
          let domain = "";
          try {
            domain = new URL(tab.url).hostname.replace(/^www\./, "");
          } catch {
            domain = "audio-media";
          }
          const classification = await AudioClassifier.classifyAudio(tab.url, tab.title || "");
          const sessionId = crypto.randomUUID();
          const newAudioRecord = {
            session_id: sessionId,
            tab_id: tab.id,
            window_id: tab.windowId || 0,
            url: ExclusionEngine.sanitizeUrl(tab.url),
            domain,
            title: tab.title || `${classification.platform} Audio Stream`,
            start_time: now,
            end_time: now,
            dwell_time: 0,
            active_time: 0,
            idle_time: 0,
            category: classification.category,
            activity_type: `Audio: ${classification.platform}`,
            productivity_type: classification.productivityType,
            productivity_score: 100 - classification.distractionScore,
            workstream_id: "audio-playback",
            workstream_name: `${classification.platform} Audio`,
            classification_confidence: classification.confidence,
            classification_latency_ms: 1,
            model_version: classification.modelVersion,
            is_audio_session: true,
            audio_platform: classification.platform,
            distraction_score: classification.distractionScore,
            is_distracting: classification.isDistracting,
            distraction_reason: classification.distractionReason,
            created_at: now
          };
          await db.tab_sessions.put(newAudioRecord);
          const activeEntry = {
            sessionId,
            tabId: tab.id,
            windowId: tab.windowId || 0,
            url: tab.url,
            domain,
            title: tab.title || `${classification.platform} Audio Stream`,
            platform: classification.platform,
            category: classification.category,
            confidence: classification.confidence,
            distractionScore: classification.distractionScore,
            isDistracting: classification.isDistracting,
            distractionLevel: classification.distractionLevel,
            distractionReason: classification.distractionReason,
            productivityType: classification.productivityType,
            startTime: now,
            lastTick: now,
            audibleDwellMs: 0,
            isAudible: true
          };
          this.activeSessions.set(tab.id, activeEntry);
        }
      }
      for (const [tabId, session] of this.activeSessions.entries()) {
        if (!currentAudibleIds.has(tabId)) {
          const finalElapsed = Math.min(now - session.lastTick, 6e4);
          if (finalElapsed > 0) {
            await SessionRepository.updateDwell(
              session.sessionId,
              finalElapsed,
              now
            );
          }
          await SessionRepository.close(session.sessionId, now);
          this.activeSessions.delete(tabId);
        }
      }
      if (chrome.storage?.session?.set) {
        await chrome.storage.session.set({
          activeAudioSessions: this.getActiveSessions()
        }).catch(() => {
        });
      }
    } catch (e) {
      console.error("Atentiv AudioSessionManager Error:", e);
    }
  }
  /**
   * Explicitly closes an audio session when a tab is closed.
   */
  static async handleTabRemoved(tabId) {
    const session = this.activeSessions.get(tabId);
    if (!session) return;
    const now = Date.now();
    const elapsed = Math.min(now - session.lastTick, 6e4);
    if (elapsed > 0) {
      await SessionRepository.updateDwell(session.sessionId, elapsed, now);
    }
    await SessionRepository.close(session.sessionId, now);
    this.activeSessions.delete(tabId);
    if (chrome.storage?.session?.set) {
      await chrome.storage.session.set({
        activeAudioSessions: this.getActiveSessions()
      }).catch(() => {
      });
    }
  }
};

// src/db/retentionManager.ts
var RetentionManager = class {
  static DEFAULT_RETENTION_DAYS = 30;
  /**
   * Retrieves the configured retention period in days from chrome.storage.local.
   * Defaults to 30 days. Value of 0 means "keep forever".
   */
  static async getConfiguredRetentionDays() {
    try {
      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        const data = await chrome.storage.local.get("atentiv_settings");
        const settings = data.atentiv_settings;
        if (settings && typeof settings.retentionDays === "number") {
          return settings.retentionDays;
        }
      }
    } catch {
    }
    return this.DEFAULT_RETENTION_DAYS;
  }
  /**
   * Calculates retention statistics across all analytical object stores.
   */
  static async getRetentionStats() {
    const retentionDays = await this.getConfiguredRetentionDays();
    const cutoffTimestamp = retentionDays > 0 ? Date.now() - retentionDays * 864e5 : 0;
    const [
      totalSessions,
      totalActivities,
      totalWorkstreamEvents,
      totalTraces,
      totalBrowserEvents,
      totalSegments,
      totalSwitchEvents,
      totalFeatureSnapshots
    ] = await Promise.all([
      db.tab_sessions.count(),
      db.activities.count(),
      db.workstream_events.count(),
      db.decision_traces.count(),
      db.browser_events.count(),
      db.activity_segments.count(),
      db.tab_switch_events.count(),
      db.feature_snapshots.count()
    ]);
    const oldestSession = await db.tab_sessions.orderBy("start_time").first();
    const oldestRecordTimestamp = oldestSession ? oldestSession.start_time : null;
    return {
      retentionDays,
      cutoffTimestamp,
      totalSessions,
      totalActivities,
      totalWorkstreamEvents,
      totalTraces,
      totalBrowserEvents,
      totalSegments,
      totalSwitchEvents,
      totalFeatureSnapshots,
      oldestRecordTimestamp
    };
  }
  /**
   * Prunes all temporal session, event, segment, and trace data older than the retention threshold.
   * User rules, domain knowledge, saved snapshots, and workstream definitions are permanently preserved.
   *
   * @param overrideRetentionDays Optional manual override for retention period in days
   */
  static async pruneExpired(overrideRetentionDays) {
    const startTime = performance.now();
    const retentionDays = overrideRetentionDays !== void 0 ? overrideRetentionDays : await this.getConfiguredRetentionDays();
    if (retentionDays === 0) {
      return {
        success: true,
        retentionDays: 0,
        cutoffTimestamp: 0,
        prunedSessions: 0,
        prunedActivities: 0,
        prunedWorkstreamEvents: 0,
        prunedTraces: 0,
        prunedBrowserEvents: 0,
        prunedSegments: 0,
        prunedSwitchEvents: 0,
        prunedFeatureSnapshots: 0,
        totalPruned: 0,
        durationMs: performance.now() - startTime
      };
    }
    const cutoffTimestamp = Date.now() - retentionDays * 864e5;
    let prunedSessions = 0;
    let prunedActivities = 0;
    let prunedWorkstreamEvents = 0;
    let prunedTraces = 0;
    let prunedBrowserEvents = 0;
    let prunedSegments = 0;
    let prunedSwitchEvents = 0;
    let prunedFeatureSnapshots = 0;
    await db.transaction(
      "rw",
      [
        db.tab_sessions,
        db.activities,
        db.workstream_events,
        db.decision_traces,
        db.browser_events,
        db.activity_segments,
        db.tab_switch_events,
        db.feature_snapshots
      ],
      async () => {
        prunedSessions = await db.tab_sessions.where("start_time").below(cutoffTimestamp).delete();
        prunedActivities = await db.activities.where("created_at").below(cutoffTimestamp).delete();
        prunedWorkstreamEvents = await db.workstream_events.where("entered_at").below(cutoffTimestamp).delete();
        prunedTraces = await db.decision_traces.where("timestamp").below(cutoffTimestamp).delete();
        prunedBrowserEvents = await db.browser_events.where("timestamp").below(cutoffTimestamp).delete();
        prunedSegments = await db.activity_segments.where("start").below(cutoffTimestamp).delete();
        prunedSwitchEvents = await db.tab_switch_events.where("timestamp").below(cutoffTimestamp).delete();
        prunedFeatureSnapshots = await db.feature_snapshots.where("created_at").below(cutoffTimestamp).delete();
      }
    );
    const totalPruned = prunedSessions + prunedActivities + prunedWorkstreamEvents + prunedTraces + prunedBrowserEvents + prunedSegments + prunedSwitchEvents + prunedFeatureSnapshots;
    const durationMs = performance.now() - startTime;
    return {
      success: true,
      retentionDays,
      cutoffTimestamp,
      prunedSessions,
      prunedActivities,
      prunedWorkstreamEvents,
      prunedTraces,
      prunedBrowserEvents,
      prunedSegments,
      prunedSwitchEvents,
      prunedFeatureSnapshots,
      totalPruned,
      durationMs
    };
  }
};

// src/background/eventMonitor.ts
var queue = Promise.resolve();
var serial = (fn) => {
  queue = queue.then(fn).then(
    () => {
    },
    (e) => console.error("Atentiv EventMonitor Error:", e)
  );
  return queue;
};
var EventMonitor = class {
  static setupListeners() {
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === "atentiv-heartbeat") {
        serial(async () => {
          await SessionManager.reconcile();
          await AudioSessionManager.reconcileAudioTabs();
        });
      } else if (alarm.name === "atentiv-daily-retention") {
        serial(() => RetentionManager.pruneExpired());
      }
    });
    if (chrome.tabs.onCreated?.addListener) {
      chrome.tabs.onCreated.addListener((tab) => {
        serial(async () => {
          await SessionManager.reconcile();
          try {
            const allTabs = await chrome.tabs.query({});
            for (const t of allTabs) {
              if (t.id && t.url && (t.url.startsWith("http://") || t.url.startsWith("https://"))) {
                chrome.tabs.sendMessage(t.id, { type: "NEW_TAB_CREATED", tabId: tab.id }).catch(() => {
                });
              }
            }
          } catch {
          }
        });
      });
    }
    chrome.tabs.onActivated.addListener(
      () => serial(() => SessionManager.reconcile())
    );
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.audible !== void 0) {
        serial(() => AudioSessionManager.reconcileAudioTabs());
      }
      if (tab.active && (changeInfo.url || changeInfo.status === "complete")) {
        serial(() => SessionManager.reconcile());
      }
    });
    chrome.tabs.onRemoved.addListener(
      (tabId) => serial(async () => {
        await AudioSessionManager.handleTabRemoved(tabId);
        await SessionManager.reconcile();
      })
    );
    chrome.windows.onFocusChanged.addListener(
      () => serial(() => SessionManager.reconcile())
    );
    chrome.idle.onStateChanged.addListener(
      () => serial(() => SessionManager.reconcile())
    );
    chrome.runtime.onInstalled.addListener(() => {
      serial(async () => {
        await chrome.alarms.create("atentiv-heartbeat", {
          periodInMinutes: 0.5
        });
        await chrome.alarms.create("atentiv-daily-retention", {
          periodInMinutes: 1440
        });
        const existing = await chrome.storage.local.get("atentiv_settings");
        if (!existing.atentiv_settings || existing.atentiv_settings.enabled === void 0) {
          await chrome.storage.local.set({
            atentiv_settings: {
              enabled: true,
              exclusions: [],
              retentionDays: 30,
              targetWorkstream: null
            }
          });
        }
        await SessionManager.initFromStorage();
        await SessionManager.reconcile();
      });
    });
    chrome.runtime.onStartup.addListener(() => {
      serial(async () => {
        await chrome.storage.session.remove("activeCheckpoint");
        await chrome.alarms.create("atentiv-heartbeat", {
          periodInMinutes: 0.5
        });
        await chrome.alarms.create("atentiv-daily-retention", {
          periodInMinutes: 1440
        });
        await SessionManager.reconcile();
      });
    });
  }
};

// src/db/repositories/metricsRepository.ts
var MetricsRepository = class {
  static async getSummary(from, to) {
    const sessions = await db.tab_sessions.where("start_time").between(from, to, true, true).toArray();
    let totalActiveMs = 0;
    let productiveMs = 0;
    let neutralMs = 0;
    let distractingMs = 0;
    const domainTimes = {};
    const catTimes = {};
    const actTimes = {};
    const wsTimes = {};
    let switchCount = 0;
    let prevWs = null;
    const sorted = sessions.slice().sort((a, b) => a.start_time - b.start_time);
    for (const s of sorted) {
      const activeMs = s.active_time || s.end_time - s.start_time || 0;
      totalActiveMs += activeMs;
      if (s.productivity_type === "productive") productiveMs += activeMs;
      else if (s.productivity_type === "distracting") distractingMs += activeMs;
      else neutralMs += activeMs;
      domainTimes[s.domain] = (domainTimes[s.domain] || 0) + activeMs;
      catTimes[s.category] = (catTimes[s.category] || 0) + activeMs;
      actTimes[s.activity_type] = (actTimes[s.activity_type] || 0) + activeMs;
      if (s.workstream_id) {
        if (!wsTimes[s.workstream_id]) {
          wsTimes[s.workstream_id] = {
            id: s.workstream_id,
            name: s.workstream_name || "General",
            category: s.category,
            ms: 0
          };
        }
        wsTimes[s.workstream_id].ms += activeMs;
        if (prevWs && prevWs !== s.workstream_id) {
          switchCount++;
        }
        prevWs = s.workstream_id;
      }
    }
    const totalActiveSeconds = Math.round(totalActiveMs / 1e3);
    const productiveSeconds = Math.round(productiveMs / 1e3);
    const neutralSeconds = Math.round(neutralMs / 1e3);
    const distractingSeconds = Math.round(distractingMs / 1e3);
    const dominantWsMs = Object.values(wsTimes).reduce(
      (max, w) => Math.max(max, w.ms),
      0
    );
    const prodRatio = totalActiveMs > 0 ? productiveMs / totalActiveMs : 0;
    const stabilityRatio = totalActiveMs > 0 ? dominantWsMs / totalActiveMs : 0;
    const switchPenalty = Math.min(40, switchCount * 2);
    let focusScore = 0;
    if (totalActiveSeconds > 0) {
      const rawFocus = 100 * (0.65 * prodRatio + 0.35 * stabilityRatio) - switchPenalty;
      focusScore = Math.max(0, Math.min(100, Math.round(rawFocus)));
    }
    const topDomains = Object.entries(domainTimes).map(([domain, ms2]) => ({
      domain,
      activeSeconds: Math.round(ms2 / 1e3),
      percentage: totalActiveMs > 0 ? Math.round(ms2 / totalActiveMs * 100) : 0
    })).sort((a, b) => b.activeSeconds - a.activeSeconds).slice(0, 10);
    const categoryDistribution = {};
    for (const [k, v] of Object.entries(catTimes)) {
      categoryDistribution[k] = Math.round(v / 1e3);
    }
    const activityDistribution = {};
    for (const [k, v] of Object.entries(actTimes)) {
      activityDistribution[k] = Math.round(v / 1e3);
    }
    const workstreamSummary = Object.values(wsTimes).map((w) => ({
      id: w.id,
      name: w.name,
      category: w.category,
      activeSeconds: Math.round(w.ms / 1e3)
    })).sort((a, b) => b.activeSeconds - a.activeSeconds);
    return {
      totalActiveSeconds,
      productiveSeconds,
      neutralSeconds,
      distractingSeconds,
      switchCount,
      switchPenalty,
      focusScore,
      topDomains,
      categoryDistribution,
      activityDistribution,
      workstreamSummary
    };
  }
  static async getTodaySummary() {
    const startOfToday = (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0);
    const now = Date.now();
    return await this.getSummary(startOfToday, now);
  }
  static async getWeekSummary() {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 864e5;
    return await this.getSummary(sevenDaysAgo, now);
  }
};

// src/db/repositories/snapshotRepository.ts
var SnapshotRepository = class {
  /**
   * Save a new context snapshot or update an existing one.
   */
  static async save(data) {
    const now = Date.now();
    const record = {
      snapshot_id: data.snapshot_id || crypto.randomUUID(),
      title: data.title.trim() || `Workspace Snapshot ${new Date(now).toLocaleDateString()}`,
      workstream_id: data.workstream_id || "general",
      saved_tabs: data.saved_tabs.map((t) => ({
        url: t.url,
        title: t.title || t.url,
        favicon: t.favicon,
        category: t.category
      })),
      window_layout: data.window_layout,
      timestamp: data.timestamp || now
    };
    if (data.note) {
      record.note = String(data.note);
    }
    await db.snapshots.put(record);
    return record;
  }
  /**
   * Get snapshot by ID.
   */
  static async getById(snapshotId) {
    if (!snapshotId) return void 0;
    return await db.snapshots.get(snapshotId);
  }
  /**
   * List recent snapshots sorted chronologically descending.
   */
  static async listRecent(limit = 50) {
    return await db.snapshots.orderBy("timestamp").reverse().limit(limit).toArray();
  }
  /**
   * List all snapshots associated with a specific workstream.
   */
  static async listByWorkstream(workstreamId) {
    return await db.snapshots.where("workstream_id").equals(workstreamId).reverse().sortBy("timestamp");
  }
  /**
   * Update snapshot details (e.g. rename title, update notes, or modify tabs).
   */
  static async update(snapshotId, updates) {
    const existing = await db.snapshots.get(snapshotId);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      ...updates,
      snapshot_id: existing.snapshot_id
      // Immutable ID
    };
    await db.snapshots.put(updated);
    return updated;
  }
  /**
   * Delete a snapshot by ID.
   */
  static async delete(snapshotId) {
    if (!snapshotId) return false;
    const existing = await db.snapshots.get(snapshotId);
    if (!existing) return false;
    await db.snapshots.delete(snapshotId);
    return true;
  }
  /**
   * Export all snapshots for data backup.
   */
  static async exportAll() {
    return await db.snapshots.toArray();
  }
  /**
   * Clear all snapshots.
   */
  static async clearAll() {
    await db.snapshots.clear();
  }
  /**
   * Count total saved snapshots.
   */
  static async count() {
    return await db.snapshots.count();
  }
};

// src/db/writeBuffer.ts
var DatabaseWriteBuffer = class {
  static queue = [];
  static isFlushing = false;
  static flushTimer = null;
  static MAX_QUEUE_SIZE = 1e3;
  static DEFAULT_MAX_ATTEMPTS = 5;
  static INITIAL_RETRY_DELAY_MS = 200;
  static stats = {
    totalEnqueued: 0,
    totalFlushed: 0,
    totalFailed: 0,
    transientErrorsHandled: 0
  };
  /**
   * Enqueue a write operation. Attempts immediate execution.
   * If the immediate write fails due to transient database lock/error,
   * it queues the operation in the resilient buffer for retry.
   */
  static async executeWithRetry(tableName, action, dataOrKey, keyForUpdate, maxAttempts = this.DEFAULT_MAX_ATTEMPTS) {
    const table = db[tableName];
    if (!table) {
      console.error(
        `[Atentiv WriteBuffer] Invalid table name: ${String(tableName)}`
      );
      return false;
    }
    try {
      if (action === "put") {
        await table.put(dataOrKey);
      } else if (action === "add") {
        await table.add(dataOrKey);
      } else if (action === "update") {
        await table.update(keyForUpdate, dataOrKey);
      } else if (action === "delete") {
        await table.delete(dataOrKey);
      }
      this.stats.totalFlushed++;
      return true;
    } catch (err) {
      this.stats.transientErrorsHandled++;
      console.warn(
        `[Atentiv WriteBuffer] Direct write to ${String(tableName)} failed. Buffering operation. Error:`,
        err?.message || err
      );
      const op = {
        id: crypto.randomUUID(),
        tableName,
        action,
        data: action === "update" ? dataOrKey : dataOrKey,
        key: action === "update" ? keyForUpdate : action === "delete" ? dataOrKey : void 0,
        timestamp: Date.now(),
        attempts: 1,
        maxAttempts,
        error: String(err?.message || err)
      };
      this.enqueue(op);
      this.scheduleFlush(this.INITIAL_RETRY_DELAY_MS);
      return false;
    }
  }
  /**
   * Add operation to memory queue, honoring max buffer capacity.
   */
  static enqueue(op) {
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.queue.shift();
      console.warn(
        "[Atentiv WriteBuffer] Queue capacity reached. Discarded oldest buffered write."
      );
    }
    this.queue.push(op);
    this.stats.totalEnqueued++;
  }
  /**
   * Schedule buffer drain with exponential backoff.
   */
  static scheduleFlush(delayMs) {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(async () => {
      this.flushTimer = null;
      await this.flush();
    }, delayMs);
  }
  /**
   * Attempt to flush all queued write operations.
   */
  static async flush() {
    if (this.isFlushing || this.queue.length === 0) {
      return { processed: 0, remaining: this.queue.length };
    }
    this.isFlushing = true;
    let processed = 0;
    const pending = [...this.queue];
    this.queue = [];
    for (const op of pending) {
      const table = db[op.tableName];
      if (!table) continue;
      try {
        if (op.action === "put") {
          await table.put(op.data);
        } else if (op.action === "add") {
          await table.add(op.data);
        } else if (op.action === "update") {
          await table.update(op.key, op.data);
        } else if (op.action === "delete") {
          await table.delete(op.key);
        }
        processed++;
        this.stats.totalFlushed++;
      } catch (err) {
        op.attempts++;
        op.error = String(err?.message || err);
        if (op.attempts < op.maxAttempts) {
          this.queue.push(op);
        } else {
          this.stats.totalFailed++;
          console.error(
            `[Atentiv WriteBuffer] Operation ${op.id} dropped after ${op.attempts} failed attempts.`,
            op.error
          );
        }
      }
    }
    this.isFlushing = false;
    if (this.queue.length > 0) {
      this.scheduleFlush(this.INITIAL_RETRY_DELAY_MS * 2);
    }
    return { processed, remaining: this.queue.length };
  }
  /**
   * Inspect current buffer state.
   */
  static getBufferStatus() {
    return {
      queueLength: this.queue.length,
      isFlushing: this.isFlushing,
      ...this.stats
    };
  }
  /**
   * Clear all pending items (e.g. during DELETE_ALL_DATA).
   */
  static clear() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    this.queue = [];
    this.isFlushing = false;
  }
};

// src/model.ts
var DEFAULT_PRODUCTIVE_DOMAINS = [
  "geeksforgeeks.org",
  "wikipedia.org",
  "docs.google.com",
  "github.com",
  "stackoverflow.com",
  "arxiv.org",
  "scholar.google.com",
  "react.dev",
  "typescriptlang.org",
  "canva.com",
  "notion.so",
  "developer.chrome.com",
  "developer.mozilla.org",
  "chatgpt.com",
  "claude.ai"
];
var DEFAULT_UNPRODUCTIVE_DOMAINS = [
  "youtube.com",
  "reddit.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "netflix.com",
  "twitch.tv"
];

// src/background/smartNavigationEngine.ts
var SmartNavigationEngine = class {
  /**
   * Retrieves contextual navigation targets ranked by relevance
   */
  static async getNavigationGroups() {
    const isExtension = typeof chrome !== "undefined" && !!chrome.tabs?.query;
    let openTabs = [];
    if (isExtension) {
      try {
        openTabs = await chrome.tabs.query({ currentWindow: true });
      } catch {
        openTabs = [];
      }
    }
    const openUrlMap = /* @__PURE__ */ new Map();
    for (const t of openTabs) {
      if (t.url) {
        const clean = ExclusionEngine.sanitizeUrl(t.url);
        openUrlMap.set(t.url, t);
        if (clean) openUrlMap.set(clean, t);
      }
    }
    const workstreams = await WorkstreamRepository.listActive(5);
    const recentSessions = await db.tab_sessions.orderBy("start_time").reverse().limit(30).toArray();
    const savedSnapshots = await db.snapshots.orderBy("timestamp").reverse().limit(5).toArray();
    const groups = [];
    const projectTabs = [];
    const seenUrls = /* @__PURE__ */ new Set();
    const devDomains = [
      "github.com",
      "gitlab.com",
      "stackoverflow.com",
      "localhost",
      "127.0.0.1",
      "react.dev",
      "developer.mozilla.org"
    ];
    for (const ot of openTabs) {
      if (!ot.url || ot.incognito) continue;
      const domain = ot.url ? new URL(ot.url, "http://localhost").hostname.replace(/^www\./, "") : "";
      if (devDomains.some((d) => domain.includes(d))) {
        if (!seenUrls.has(ot.url)) {
          seenUrls.add(ot.url);
          projectTabs.push({
            title: ot.title || domain,
            url: ot.url,
            domain,
            favicon: ot.favIconUrl,
            isOpen: true,
            tabId: ot.id,
            productivity: "productive",
            category: "Technology"
          });
        }
      }
    }
    if (projectTabs.length === 0) {
      projectTabs.push(
        {
          title: "GitHub \u2014 project-dashboard",
          url: "https://github.com",
          domain: "github.com",
          favicon: "https://github.githubassets.com/favicons/favicon.svg",
          isOpen: openUrlMap.has("https://github.com"),
          productivity: "productive",
          category: "Technology"
        },
        {
          title: "Google Docs \u2014 Project Report",
          url: "https://docs.google.com",
          domain: "docs.google.com",
          favicon: "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico",
          isOpen: openUrlMap.has("https://docs.google.com"),
          productivity: "productive",
          category: "Work"
        },
        {
          title: "Notion Workspace",
          url: "https://notion.so",
          domain: "notion.so",
          favicon: "https://www.notion.so/images/favicon.ico",
          isOpen: openUrlMap.has("https://notion.so"),
          productivity: "productive",
          category: "Productivity"
        }
      );
    }
    groups.push({
      id: "grp-continue",
      title: "Continue",
      subtitle: "Project",
      icon: "folder",
      tabCount: projectTabs.length,
      tabs: projectTabs,
      relevanceScore: 0.95,
      isActive: true
    });
    const researchTabs = [
      {
        title: "arXiv \u2014 Cognitive Task Interleaving",
        url: "https://arxiv.org",
        domain: "arxiv.org",
        isOpen: openUrlMap.has("https://arxiv.org"),
        productivity: "productive",
        category: "Education"
      },
      {
        title: "Google Scholar",
        url: "https://scholar.google.com",
        domain: "scholar.google.com",
        isOpen: openUrlMap.has("https://scholar.google.com"),
        productivity: "productive",
        category: "Education"
      },
      {
        title: "MDN Web Docs",
        url: "https://developer.mozilla.org",
        domain: "developer.mozilla.org",
        isOpen: openUrlMap.has("https://developer.mozilla.org"),
        productivity: "productive",
        category: "Technology"
      },
      {
        title: "Wikipedia \u2014 Context Switching",
        url: "https://wikipedia.org",
        domain: "wikipedia.org",
        isOpen: openUrlMap.has("https://wikipedia.org"),
        productivity: "productive",
        category: "Education"
      },
      {
        title: "Nature Scientific Reports",
        url: "https://nature.com",
        domain: "nature.com",
        isOpen: openUrlMap.has("https://nature.com"),
        productivity: "productive",
        category: "Education"
      }
    ];
    groups.push({
      id: "grp-research",
      title: "Research",
      subtitle: "Reading",
      icon: "book",
      tabCount: researchTabs.length,
      tabs: researchTabs,
      relevanceScore: 0.82,
      isActive: false
    });
    const designTabs = [
      {
        title: "Figma \u2014 Atentiv HUD Components",
        url: "https://figma.com",
        domain: "figma.com",
        isOpen: openUrlMap.has("https://figma.com"),
        productivity: "productive",
        category: "Design"
      },
      {
        title: "Lucide Icons Gallery",
        url: "https://lucide.dev",
        domain: "lucide.dev",
        isOpen: openUrlMap.has("https://lucide.dev"),
        productivity: "productive",
        category: "Design"
      }
    ];
    groups.push({
      id: "grp-design",
      title: "Design",
      subtitle: "UI & Mockups",
      icon: "palette",
      tabCount: designTabs.length,
      tabs: designTabs,
      relevanceScore: 0.74,
      isActive: false
    });
    return groups;
  }
  /**
   * Switches to an existing open tab if available, avoiding duplicate tabs.
   * Creates a new tab only if no matching tab is found.
   */
  static async switchOrOpen(url, title) {
    if (typeof chrome === "undefined" || !chrome.tabs?.query) {
      if (typeof window !== "undefined") {
        window.open(url, "_blank");
      }
      return { switched: false };
    }
    try {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const targetUrl = new URL(url, "http://localhost");
      const targetDomain = targetUrl.hostname.replace(/^www\./, "").toLowerCase();
      let match = tabs.find((t) => t.url === url);
      if (!match) {
        match = tabs.find((t) => {
          if (!t.url) return false;
          try {
            const u = new URL(t.url);
            return u.hostname.replace(/^www\./, "").toLowerCase() === targetDomain && (u.pathname === targetUrl.pathname || u.pathname.startsWith(targetUrl.pathname));
          } catch {
            return false;
          }
        });
      }
      if (!match) {
        match = tabs.find((t) => {
          if (!t.url) return false;
          try {
            return new URL(t.url).hostname.replace(/^www\./, "").toLowerCase() === targetDomain;
          } catch {
            return false;
          }
        });
      }
      if (match && match.id !== void 0) {
        await chrome.tabs.update(match.id, { active: true });
        if (match.windowId !== void 0 && chrome.windows?.update) {
          await chrome.windows.update(match.windowId, { focused: true }).catch(() => {
          });
        }
        return { switched: true, tabId: match.id };
      }
      const newTab = await chrome.tabs.create({ url, active: true });
      return { switched: false, tabId: newTab.id };
    } catch {
      if (typeof window !== "undefined") {
        window.open(url, "_blank");
      }
      return { switched: false };
    }
  }
  /**
   * Opens or switches to all tabs in a Smart Navigation group
   */
  static async openGroupTabs(tabs) {
    for (const tab of tabs) {
      await this.switchOrOpen(tab.url, tab.title);
    }
  }
};

// src/background/messageRouter.ts
var MessageRouter = class {
  static setupRouter() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender).then((res) => sendResponse(res)).catch((err) => sendResponse({ error: String(err) }));
      return true;
    });
  }
  static async handleMessage(msg, sender) {
    switch (msg.type) {
      case "read":
      case "GET_STATE": {
        await SessionManager.reconcile();
        const active = SessionManager.getActiveCheckpoint();
        const todayMetrics = await MetricsRepository.getTodaySummary();
        const settingsData = await chrome.storage.local.get("atentiv_settings");
        const settings = settingsData.atentiv_settings || {};
        const activeWorkstreams = await WorkstreamRepository.listActive(10);
        const rules = await RuleRepository.listAll();
        const dbSnapshots = await db.snapshots.orderBy("timestamp").reverse().toArray();
        const dbSessions = await db.tab_sessions.orderBy("start_time").reverse().limit(100).toArray();
        const traces = await TraceRepository.getRecent(msg.limit || 50);
        const categoryColors = {
          Technology: "#6366f1",
          Education: "#10b981",
          Work: "#3b82f6",
          Chat: "#f59e0b",
          Entertainment: "#ec4899",
          Shop: "#8b5cf6",
          News: "#06b6d4",
          Government: "#64748b",
          Health: "#ef4444",
          Travel: "#14b8a6",
          Uncategorized: "#94a3b8"
        };
        const visits = dbSessions.map((s) => ({
          id: s.session_id,
          title: s.title,
          url: s.url,
          stream: s.workstream_id,
          start: s.start_time,
          end: s.start_time + s.dwell_time,
          tabId: s.tab_id,
          switched: false,
          category: s.category,
          activity: s.activity_type,
          productivity: s.productivity_type,
          domain: s.domain,
          dwellTime: s.dwell_time
        }));
        const streams = activeWorkstreams.length > 0 ? activeWorkstreams.map((ws) => ({
          id: ws.workstream_id,
          name: ws.name,
          color: categoryColors[ws.category] || "#6366f1",
          keywords: ws.keywords ? ws.keywords.join(", ") : "",
          domains: ws.domains ? ws.domains.join(", ") : ""
        })) : [
          {
            id: "ws-tech",
            name: "Engineering & Tech",
            color: "#6366f1",
            keywords: "code, dev",
            domains: "github.com"
          },
          {
            id: "ws-edu",
            name: "Research & Learning",
            color: "#10b981",
            keywords: "study, docs",
            domains: "arxiv.org"
          },
          {
            id: "ws-other",
            name: "General Browsing",
            color: "#94a3b8",
            keywords: "",
            domains: ""
          }
        ];
        const snapshots = dbSnapshots.map((s) => ({
          id: s.snapshot_id,
          name: s.title,
          note: s.note || "",
          created: s.timestamp,
          tabs: s.saved_tabs.map((t) => ({ title: t.title, url: t.url }))
        }));
        const goalData = await chrome.storage.local.get("atentiv_goal");
        const currentGoal = goalData.atentiv_goal || {
          goal: "",
          end: 0,
          stream: ""
        };
        const legacyState = {
          enabled: settings.enabled ?? true,
          streams,
          visits,
          snapshots,
          excluded: (settings.exclusions || []).join(", "),
          goal: currentGoal.goal || "",
          goalEnd: currentGoal.end || 0,
          goalStream: currentGoal.stream || "",
          productiveDomains: settings.productiveDomains || DEFAULT_PRODUCTIVE_DOMAINS,
          unproductiveDomains: settings.unproductiveDomains || DEFAULT_UNPRODUCTIVE_DOMAINS,
          idleThresholdSeconds: settings.idleThresholdSeconds ?? 180,
          idleSeconds: 0,
          isIdle: false
        };
        await chrome.storage.local.set({ state: legacyState });
        return {
          state: legacyState,
          active,
          todayMetrics,
          settings,
          activeWorkstreams,
          rules,
          snapshots: dbSnapshots,
          traces
        };
      }
      case "GET_HUD_STATE": {
        await SessionManager.reconcile();
        const active = SessionManager.getActiveCheckpoint();
        const todayMetrics = await MetricsRepository.getTodaySummary();
        const settingsData = await chrome.storage.local.get("atentiv_settings");
        const settings = settingsData.atentiv_settings || {};
        const enabled = settings.enabled ?? true;
        const sessionMeta = await chrome.storage.session.get([
          "trackingState",
          "untrackableReason"
        ]);
        const trackingState = sessionMeta?.trackingState || (active ? "TRACKING" : !enabled ? "PAUSED" : "INACTIVE");
        const isUntrackable = trackingState === "UNTRACKABLE";
        const isIdle = !isUntrackable && active === null && enabled;
        const activeWorkstreams = await WorkstreamRepository.listActive(10);
        const recentSessions = await db.tab_sessions.orderBy("start_time").reverse().limit(8).toArray();
        const recentTabs = recentSessions.map((s) => ({
          domain: s.domain,
          title: s.title,
          url: s.url,
          productivity: s.productivity_type,
          category: s.category || "Browsing",
          activity: s.activity_type || "General",
          workstream: s.workstream_name || "",
          dwellTime: s.dwell_time
        }));
        let openTabs = [];
        try {
          if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
            const allTabs = await chrome.tabs.query({});
            openTabs = allTabs.filter((t) => {
              const u = t.url || t.pendingUrl || "";
              return !u.startsWith("chrome://") && !u.startsWith("chrome-extension://") && !u.startsWith("edge://");
            }).map((t) => {
              let domain = "";
              try {
                domain = new URL(t.url || "").hostname.replace(/^www\./, "");
              } catch {
              }
              return {
                id: t.id,
                title: t.title || domain || t.url || "New Tab",
                url: t.url || "",
                domain,
                favIconUrl: t.favIconUrl,
                active: t.active
              };
            });
          }
        } catch {
        }
        const currentTabInfo = active ? {
          domain: active.domain,
          title: active.title,
          url: active.url,
          category: active.category,
          activity: active.activity,
          productivity: active.productivity,
          activeDwellTime: active.dwellTime
        } : {
          domain: isUntrackable ? "Restricted Page" : "",
          title: isUntrackable ? "Tracking unavailable on internal browser page (chrome://, edge://, about:). Atentiv will resume automatically on a supported webpage." : "",
          url: "",
          category: isUntrackable ? "Untrackable" : "Browsing",
          activity: isUntrackable ? "System" : "General",
          productivity: "neutral",
          activeDwellTime: 0
        };
        let score = null;
        let productiveMs = 0;
        let distractingMs = 0;
        let neutralMs = 0;
        let switchCount = 0;
        let hasData = false;
        if (todayMetrics && todayMetrics.totalActiveSeconds > 0) {
          score = isNaN(todayMetrics.focusScore) ? 0 : Math.round(todayMetrics.focusScore);
          productiveMs = todayMetrics.productiveSeconds * 1e3;
          distractingMs = todayMetrics.distractingSeconds * 1e3;
          neutralMs = todayMetrics.neutralSeconds * 1e3;
          switchCount = todayMetrics.switchCount;
          hasData = true;
        } else if (active && active.dwellTime > 0) {
          const liveProductivity = active.productivity;
          const liveDwellMs = active.dwellTime;
          productiveMs = liveProductivity === "productive" ? liveDwellMs : 0;
          distractingMs = liveProductivity === "distracting" ? liveDwellMs : 0;
          neutralMs = liveProductivity === "neutral" ? liveDwellMs : 0;
          const prodRatio = liveProductivity === "productive" ? 1 : 0;
          score = Math.max(
            0,
            Math.min(100, Math.round(100 * (0.65 * prodRatio + 0.35 * 1)))
          );
          hasData = true;
        }
        return {
          currentTab: currentTabInfo,
          todayMetrics: {
            score,
            hasData,
            productiveTime: productiveMs,
            unproductiveTime: distractingMs,
            neutralTime: neutralMs,
            idleTime: 0,
            switches: switchCount
          },
          status: {
            trackingState,
            isEnabled: enabled,
            isRecording: enabled && !isUntrackable && active !== null,
            isPaused: !enabled,
            isIdle,
            isUntrackable,
            state: !enabled ? "paused" : isUntrackable ? "untrackable" : active ? "active" : "idle",
            message: isUntrackable ? "Tracking unavailable on internal browser page (chrome://, edge://, about:). Atentiv will resume automatically on a supported webpage." : !enabled ? "Tracking paused by user." : isIdle ? "Tracking paused \u2014 inactive." : "Tracking active"
          },
          activeWorkstreams,
          recentTabs,
          openTabs,
          activeAudioSessions: AudioSessionManager.getActiveSessions(),
          latestAudioSession: AudioSessionManager.getLatestActiveSession()
        };
      }
      case "GET_AUDIO_SESSIONS": {
        await AudioSessionManager.reconcileAudioTabs();
        return {
          activeAudioSessions: AudioSessionManager.getActiveSessions(),
          latestAudioSession: AudioSessionManager.getLatestActiveSession()
        };
      }
      case "CLASSIFY_AUDIO_TAB": {
        const { url, title, metaDescription } = msg;
        const result = await AudioClassifier.classifyAudio(
          url,
          title,
          metaDescription
        );
        return { result };
      }
      case "GET_TRACES": {
        const traces = await TraceRepository.getRecent(msg.limit || 50);
        return { traces };
      }
      case "SAVE_WORKSPACE":
      case "saveSnapshot":
      case "save": {
        let validTabs = [];
        if (Array.isArray(msg.tabs) && msg.tabs.length > 0) {
          validTabs = msg.tabs.map((t) => ({
            url: sanitizeUrl(t.url)?.sanitized || t.url,
            title: t.title || t.url,
            favicon: t.favicon
          }));
        } else {
          const tabs = await chrome.tabs.query({ currentWindow: true });
          for (const t of tabs) {
            if (!t.url || t.incognito) continue;
            const urlInfo = sanitizeUrl(t.url);
            if (!urlInfo) continue;
            if (ExclusionEngine.isExcluded(urlInfo.domain)) continue;
            validTabs.push({
              url: urlInfo.sanitized,
              title: t.title || urlInfo.domain,
              favicon: t.favIconUrl
            });
          }
        }
        const snapshot = await SnapshotRepository.save({
          snapshot_id: crypto.randomUUID(),
          title: String(msg.name || msg.title || "Saved Workspace"),
          workstream_id: msg.workstreamId || "general",
          saved_tabs: validTabs,
          note: msg.note ? String(msg.note) : void 0,
          timestamp: Date.now()
        });
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, snapshot, state: readRes.state };
      }
      case "UPDATE_SNAPSHOT":
      case "update_snapshot": {
        const snapId = msg.id || msg.snapshotId;
        const existing = await SnapshotRepository.getById(snapId);
        if (!existing) throw new Error("Snapshot not found");
        let validTabs = existing.saved_tabs || [];
        if (Array.isArray(msg.tabs) && msg.tabs.length > 0) {
          validTabs = msg.tabs.map((t) => ({
            url: sanitizeUrl(t.url)?.sanitized || t.url,
            title: t.title || t.url,
            favicon: t.favicon
          }));
        }
        const updated = await SnapshotRepository.update(snapId, {
          title: String(msg.name || existing.title),
          saved_tabs: validTabs,
          note: msg.note !== void 0 ? String(msg.note) : existing.note
        });
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, snapshot: updated, state: readRes.state };
      }
      case "RESTORE_WORKSPACE":
      case "restore": {
        const snap = await SnapshotRepository.getById(msg.snapshotId || msg.id);
        if (!snap || !snap.saved_tabs) throw new Error("Snapshot not found");
        for (const tab of snap.saved_tabs) {
          if (tab.url) {
            await chrome.tabs.create({ url: tab.url, active: false });
          }
        }
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, state: readRes.state };
      }
      case "DELETE_SNAPSHOT":
      case "delete_snapshot":
      case "deleteSnapshot": {
        await SnapshotRepository.delete(msg.snapshotId || msg.id);
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, state: readRes.state };
      }
      case "USER_FEEDBACK": {
        const feedback = {
          feedback_id: crypto.randomUUID(),
          session_id: msg.sessionId || crypto.randomUUID(),
          input_features: msg.inputFeatures || {},
          predicted_category: msg.predictedCategory || "",
          predicted_activity: msg.predictedActivity || "",
          predicted_productivity: msg.predictedProductivity || "neutral",
          user_category: msg.userCategory,
          user_activity: msg.userActivity,
          user_productivity: msg.userProductivity,
          user_workstream: msg.userWorkstream,
          reason: msg.reason || "User manual correction",
          timestamp: Date.now(),
          model_version: "1.0.0"
        };
        await db.user_feedback.put(feedback);
        if (msg.domain) {
          await RuleRepository.add({
            rule_id: crypto.randomUUID(),
            name: `User Override for ${msg.domain}`,
            enabled: true,
            priority: 100,
            // High priority user rule
            condition: { domain_exact: msg.domain },
            action: {
              category: msg.userCategory,
              activity_type: msg.userActivity,
              productivity_type: msg.userProductivity,
              force_workstream: msg.userWorkstream
            }
          });
        }
        await SessionManager.reconcile(true);
        return { success: true };
      }
      case "ADD_PRODUCTIVE_DOMAIN": {
        const settingsData = await chrome.storage.local.get("atentiv_settings");
        const settings = settingsData.atentiv_settings || {};
        const prod = new Set(
          settings.productiveDomains || DEFAULT_PRODUCTIVE_DOMAINS
        );
        const unprod = new Set(
          settings.unproductiveDomains || DEFAULT_UNPRODUCTIVE_DOMAINS
        );
        const dom = String(msg.domain || "").trim().toLowerCase();
        if (dom) {
          prod.add(dom);
          unprod.delete(dom);
        }
        const updated = {
          ...settings,
          productiveDomains: Array.from(prod),
          unproductiveDomains: Array.from(unprod)
        };
        await chrome.storage.local.set({ atentiv_settings: updated });
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, state: readRes.state };
      }
      case "ADD_UNPRODUCTIVE_DOMAIN": {
        const settingsData = await chrome.storage.local.get("atentiv_settings");
        const settings = settingsData.atentiv_settings || {};
        const prod = new Set(
          settings.productiveDomains || DEFAULT_PRODUCTIVE_DOMAINS
        );
        const unprod = new Set(
          settings.unproductiveDomains || DEFAULT_UNPRODUCTIVE_DOMAINS
        );
        const dom = String(msg.domain || "").trim().toLowerCase();
        if (dom) {
          unprod.add(dom);
          prod.delete(dom);
        }
        const updated = {
          ...settings,
          productiveDomains: Array.from(prod),
          unproductiveDomains: Array.from(unprod)
        };
        await chrome.storage.local.set({ atentiv_settings: updated });
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, state: readRes.state };
      }
      case "REMOVE_DOMAIN_OVERRIDE": {
        const settingsData = await chrome.storage.local.get("atentiv_settings");
        const settings = settingsData.atentiv_settings || {};
        const prod = (settings.productiveDomains || DEFAULT_PRODUCTIVE_DOMAINS).filter((d) => d !== msg.domain);
        const unprod = (settings.unproductiveDomains || DEFAULT_UNPRODUCTIVE_DOMAINS).filter((d) => d !== msg.domain);
        const updated = {
          ...settings,
          productiveDomains: prod,
          unproductiveDomains: unprod
        };
        await chrome.storage.local.set({ atentiv_settings: updated });
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, state: readRes.state };
      }
      case "UPDATE_SETTINGS":
      case "settings": {
        const current = (await chrome.storage.local.get("atentiv_settings")).atentiv_settings || {};
        const updated = {
          ...current,
          enabled: msg.enabled ?? current.enabled ?? true,
          idleThresholdSeconds: msg.idleThresholdSeconds ?? current.idleThresholdSeconds ?? 180,
          productiveDomains: msg.productiveDomains ?? current.productiveDomains ?? DEFAULT_PRODUCTIVE_DOMAINS,
          unproductiveDomains: msg.unproductiveDomains ?? current.unproductiveDomains ?? DEFAULT_UNPRODUCTIVE_DOMAINS,
          exclusions: typeof msg.excluded === "string" ? msg.excluded.split(",").map((s) => s.trim()).filter(Boolean) : msg.exclusions ?? current.exclusions ?? []
        };
        await chrome.storage.local.set({ atentiv_settings: updated });
        await SessionManager.reconcile();
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, settings: updated, state: readRes.state };
      }
      case "goal": {
        const goalObj = {
          goal: msg.goal || "",
          end: msg.end || 0,
          stream: msg.stream || ""
        };
        await chrome.storage.local.set({ atentiv_goal: goalObj });
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, goal: goalObj, state: readRes.state };
      }
      case "DELETE_ALL_DATA":
      case "clear": {
        await db.tab_sessions.clear();
        await db.activities.clear();
        await db.workstream_events.clear();
        await db.workstreams.clear();
        await db.snapshots.clear();
        await db.decision_traces.clear();
        await db.user_feedback.clear();
        await db.focus_metrics.clear();
        await db.feature_snapshots.clear();
        await db.browser_events.clear();
        await db.activity_segments.clear();
        await db.tab_switch_events.clear();
        DatabaseWriteBuffer.clear();
        await chrome.storage.session.remove("activeCheckpoint");
        await chrome.storage.local.set({
          atentiv_settings: { enabled: false, exclusions: [] }
        });
        await SessionManager.reconcile(true);
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, state: readRes.state };
      }
      case "EXPORT_DATA": {
        const exportBlob = {
          exportVersion: "1.0",
          databaseVersion: 3,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          settings: (await chrome.storage.local.get("atentiv_settings")).atentiv_settings || {},
          domains: await db.domains.toArray(),
          tab_sessions: await db.tab_sessions.toArray(),
          activities: await db.activities.toArray(),
          workstreams: await db.workstreams.toArray(),
          workstream_events: await db.workstream_events.toArray(),
          snapshots: await SnapshotRepository.exportAll(),
          rules: await db.rules.toArray(),
          user_feedback: await db.user_feedback.toArray(),
          decision_traces: await db.decision_traces.limit(1e3).toArray(),
          focus_metrics: await db.focus_metrics.toArray(),
          browser_events: await db.browser_events.limit(1e3).toArray(),
          activity_segments: await db.activity_segments.limit(1e3).toArray(),
          tab_switch_events: await db.tab_switch_events.limit(1e3).toArray()
        };
        return { exportData: exportBlob };
      }
      case "PRUNE_RETENTION": {
        const pruneResult = await RetentionManager.pruneExpired(
          msg.retentionDays
        );
        return { success: true, pruneResult };
      }
      case "GET_RETENTION_STATS": {
        const stats = await RetentionManager.getRetentionStats();
        return { success: true, stats };
      }
      case "GET_WRITE_BUFFER_STATUS": {
        const status = DatabaseWriteBuffer.getBufferStatus();
        return { success: true, status };
      }
      case "FLUSH_WRITE_BUFFER": {
        const flushResult = await DatabaseWriteBuffer.flush();
        return { success: true, flushResult };
      }
      case "PAGE_SIGNALS_UPDATED": {
        await SessionManager.reconcile();
        return { acknowledged: true };
      }
      case "GET_HUD_DATA": {
        await SessionManager.reconcile();
        const active = SessionManager.getActiveCheckpoint();
        const todayMetrics = await MetricsRepository.getTodaySummary();
        const settingsData = await chrome.storage.local.get("atentiv_settings");
        const settings = settingsData.atentiv_settings || {};
        const enabled = settings.enabled ?? true;
        const idleState = await chrome.idle.queryState(60).catch(() => "active");
        const isIdle = idleState !== "active";
        const smartNav = await SmartNavigationEngine.getNavigationGroups();
        const recentSessions = await db.tab_sessions.orderBy("start_time").reverse().limit(8).toArray();
        const recentTabs = recentSessions.map((s) => ({
          domain: s.domain,
          title: s.title,
          url: s.url,
          productivity: s.productivity_type,
          dwellTime: s.dwell_time,
          timestamp: s.start_time
        }));
        const currentTabInfo = {
          domain: active?.domain || msg.domain || "github.com",
          title: active?.title || msg.title || "Atentiv / project-dashboard",
          url: active?.url || msg.url || "https://github.com/atentiv/project-dashboard",
          category: active?.category || "Technology",
          activity: active?.activity || "Development",
          productivity: active?.productivity || "productive",
          activeDwellTime: active?.dwellTime || 756e3
          // default 12m 36s if fresh
        };
        const score = todayMetrics ? Math.round(todayMetrics.focusScore) : 82;
        return {
          currentTab: currentTabInfo,
          todayMetrics: {
            score: isNaN(score) ? 82 : score,
            productiveTime: todayMetrics ? todayMetrics.productiveSeconds * 1e3 : 1512e4,
            // 4h 12m
            unproductiveTime: todayMetrics ? todayMetrics.distractingSeconds * 1e3 : 228e4,
            // 38m
            idleTime: 264e4,
            // 44m
            switches: todayMetrics?.switchCount ?? 14,
            activeCoverage: 94
          },
          status: {
            isRecording: enabled && !isIdle,
            isIdle,
            state: !enabled ? "stopped" : isIdle ? "idle" : "active"
          },
          smartNav,
          recentTabs
        };
      }
      case "SWITCH_OR_OPEN_TAB": {
        const result = await SmartNavigationEngine.switchOrOpen(
          msg.url,
          msg.title
        );
        return result;
      }
      case "OPEN_GROUP_TABS": {
        if (Array.isArray(msg.tabs)) {
          await SmartNavigationEngine.openGroupTabs(msg.tabs);
        }
        return { success: true };
      }
      case "TOGGLE_RECORDING": {
        const settingsData = await chrome.storage.local.get("atentiv_settings");
        const current = settingsData.atentiv_settings || {};
        const enabled = msg.enabled !== void 0 ? !!msg.enabled : !(current.enabled ?? true);
        const updated = { ...current, enabled };
        await chrome.storage.local.set({ atentiv_settings: updated });
        await SessionManager.reconcile(!enabled);
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, enabled, state: readRes.state };
      }
      case "rules": {
        if (Array.isArray(msg.streams)) {
          for (const s of msg.streams) {
            if (s.name) {
              await WorkstreamRepository.create({
                workstream_id: crypto.randomUUID(),
                name: s.name,
                category: s.category || "General"
              }).catch(() => {
              });
            }
          }
        }
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, state: readRes.state };
      }
      case "log": {
        if (msg.url) {
          try {
            const domain = new URL(msg.url).hostname.replace(/^www\./, "");
            await db.tab_sessions.put({
              session_id: crypto.randomUUID(),
              tab_id: 1,
              url: msg.url,
              domain,
              title: msg.title || msg.url,
              category: "Browsing",
              activity_type: "Browsing",
              productivity_type: "neutral",
              dwell_time: 10,
              idle_time: 0,
              start_time: Date.now() - 1e4,
              end_time: Date.now(),
              window_id: 1,
              workstream_id: "default",
              workstream_name: "General Browsing",
              status: "closed",
              is_active: false
            });
          } catch {
          }
        }
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, state: readRes.state };
      }
      case "SET_TAB_PRODUCTIVITY": {
        const { domain, productivity } = msg;
        if (!domain || !productivity)
          throw new Error("Missing domain or productivity");
        if (productivity === "productive") {
          await this.handleMessage({ type: "ADD_PRODUCTIVE_DOMAIN", domain });
        } else if (productivity === "unproductive") {
          await this.handleMessage({ type: "ADD_UNPRODUCTIVE_DOMAIN", domain });
        } else {
          await this.handleMessage({ type: "REMOVE_DOMAIN_OVERRIDE", domain });
        }
        await RuleRepository.add({
          rule_id: crypto.randomUUID(),
          name: `HUD Override for ${domain}`,
          enabled: true,
          priority: 110,
          condition: { domain_exact: domain },
          action: { productivity_type: productivity }
        });
        await SessionManager.reconcile(true);
        return { success: true };
      }
      case "OPEN_SIDEPANEL": {
        if (chrome.sidePanel && typeof chrome.sidePanel.open === "function") {
          try {
            if (sender?.tab?.id) {
              await chrome.sidePanel.open({ tabId: sender.tab.id });
            } else if (sender?.tab?.windowId) {
              await chrome.sidePanel.open({
                windowId: sender.tab.windowId
              });
            } else {
              const windows = await chrome.windows.getAll();
              if (windows[0]?.id)
                await chrome.sidePanel.open({
                  windowId: windows[0].id
                });
            }
            return { success: true };
          } catch (e) {
            console.warn("Atentiv: Could not open side panel", e);
            return { success: false, error: "Side panel could not be opened" };
          }
        } else {
          return { success: false, error: "Side panel API not available" };
        }
      }
      case "CLOSE_BACKGROUND_TABS": {
        try {
          const window2 = await chrome.windows.getLastFocused().catch(() => null);
          const queryFilter = window2?.id !== void 0 ? { windowId: window2.id } : { currentWindow: true };
          const tabs = await chrome.tabs.query(queryFilter);
          const tabsToClose = tabs.filter(
            (t) => !t.pinned && !t.active && t.id !== void 0
          );
          const tabIds = tabsToClose.map((t) => t.id).filter(Boolean);
          if (tabIds.length > 0) {
            await chrome.tabs.remove(tabIds);
          }
          return { success: true, closedCount: tabIds.length };
        } catch (err) {
          console.error("Error closing background tabs:", err);
          return { success: false, closedCount: 0, error: String(err) };
        }
      }
      default:
        throw new Error(`Unknown message type: ${msg.type}`);
    }
  }
};

// src/background/serviceWorker.ts
console.log("Atentiv Service Worker initializing...");
var popupWindowId = null;
if (chrome.windows?.onRemoved?.addListener) {
  chrome.windows.onRemoved.addListener((closedWinId) => {
    if (closedWinId === popupWindowId) {
      popupWindowId = null;
    }
  });
}
async function openOrFocusRestrictedPopup() {
  if (popupWindowId !== null) {
    try {
      await chrome.windows.update(popupWindowId, { focused: true });
      return;
    } catch {
      popupWindowId = null;
    }
  }
  try {
    const popupUrl = chrome.runtime?.getURL ? chrome.runtime.getURL("sidepanel.html") : "sidepanel.html";
    const win = await chrome.windows.create({
      url: popupUrl,
      type: "popup",
      width: 420,
      height: 680
    });
    if (win && win.id !== void 0) {
      popupWindowId = win.id;
    }
  } catch (err) {
    console.warn(
      "Atentiv: Failed to create restricted page popup window:",
      err
    );
  }
}
chrome.action.onClicked.addListener((tab) => {
  const url = tab.url || "";
  const tabId = tab.id;
  if (!url || url.startsWith("chrome://") || url.startsWith("chrome-extension://") || url.startsWith("edge://") || url.startsWith("about:") || url.startsWith("file://")) {
    openOrFocusRestrictedPopup();
    return;
  }
  if (!tabId) return;
  chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] }).catch(() => {
  }).finally(() => {
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, { type: "TOGGLE_ATENTIV_HUD" }).catch(
        (e) => console.warn("Atentiv: Could not send TOGGLE_ATENTIV_HUD", e)
      );
    }, 150);
  });
});
MessageRouter.setupRouter();
EventMonitor.setupListeners();
serial(async () => {
  await DomainRepository.seedDefaults();
  await SessionManager.initFromStorage();
  await SessionManager.reconcile();
  try {
    const pruneRes = await RetentionManager.pruneExpired();
    if (pruneRes.totalPruned > 0) {
      console.log(
        `[AtentivDB] Startup retention maintenance pruned ${pruneRes.totalPruned} expired records.`
      );
    }
  } catch (err) {
    console.warn("[AtentivDB] Startup retention maintenance error:", err);
  }
  console.log("Atentiv Service Worker ready.");
});
