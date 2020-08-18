#include <iostream>
#include <emscripten/emscripten.h>

using namespace std;

#ifdef __cplusplus
extern "C" {
#endif

void EMSCRIPTEN_KEEPALIVE showMessage(const char* message) {     
   cout << message << endl; 
}

#ifdef __cplusplus
}
#endif




