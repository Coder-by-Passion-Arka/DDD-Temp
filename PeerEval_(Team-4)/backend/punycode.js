// import punycode from "punycode/punycode.js";
import punycode from "punycode.js";

const ret_1 = punycode.ucs2.encode([0x61, 0x62, 0x63]);
// → 'abc'
const ret_2  = punycode.ucs2.encode([0x1D306]);
// → '\uD834\uDF06'

console.log(ret_1);
console.log(ret_2);