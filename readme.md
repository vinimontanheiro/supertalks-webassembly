- [EMSCRIPTEN](https://emscripten.org/)

#### Command helper
- emcc => emscripten compiler C to wasm
- em++ => emscripten compiler C++ to wasm
- --bind => to bind the type of build
- -02 => type 02 uses a simple optimizations (minify and javascript output)
- -s => define an option
- WASM=1 => generate a WASM file
- BINARYEN_ASYNC_COMPILATION=0  => disables de async mode
- --closure 0 -s NO_DYNAMIC_EXECUTION=1 => override the eval 
- -implementation for named functions
- SINGLE_FILE=1 => just output one javascript file
- EXTRA_EXPORTED_RUNTIME_METHODS => expose WebAssembly functions to javascript 
- EXPORTED_FUNCTIONS => expose specifics functions to javascript 
- --post-js => to put all the output in an inner function scope (javascript file for ECMAScript 6 module)

#### Compiling C++ implementation to WASM:
```
$ em++ -s WASM=1 -s EXPORTED_FUNCTIONS='["_showMessage"]' -s EXTRA_EXPORTED_RUNTIME_METHODS='["intArrayFromString", "ALLOC_NORMAL","allocate"]' --post-js em-es6-module.js -std=c++11 main.cpp -o asm-module.js
```

```
g++ $(pkg-config --cflags --libs /usr/local/Cellar/opencv/4.4.0/lib/pkgconfig/opencv4.pc) opencv.hpp -std=c++11 -o teste
```