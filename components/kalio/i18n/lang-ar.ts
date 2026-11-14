/* Galio in Arabic: the shared Kalio base, the Bakini words Galio still uses and Galio's own, one chunk. */
import base from "./base/ar";
import bakini from "./bakini.ar";
import galio from "./galio.ar";

export default { ...base, ...bakini, ...galio } as Record<string, string>;
