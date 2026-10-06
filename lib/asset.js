// Files in public/ live under the site's base path on GitHub Pages
// (/dynamix-toolbox/...), which plain <img src> doesn't add by itself.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path) => (/^(https?:|data:|\/\/)/.test(path) || !path ? path : `${BASE}/${path.replace(/^\//, "")}`);
