import Module from "./asm-module.js";

onmessage = ({data:{message}}) => {
  const stringPtr = Module.allocate(Module.intArrayFromString(message), 'i8', Module.ALLOC_NORMAL);
  Module._showMessage(stringPtr);
  Module._free(stringPtr); 
};

