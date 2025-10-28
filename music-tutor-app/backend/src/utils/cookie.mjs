export const cookieOptions = {
  httpOnly: true, // client-side js can't read the cookie contents
  secure: false, // // NOT RECOMMENDED AS FALSE, but it means the cookie can be sent to and received from browser via http and doesn't require https and  proxy server
  maxAge: 60000 * 60 * 24,
  sameSite: "lax", // [sets the level of samesite restriction on cookie sending ] to get around the issue of "sameSite: 'none'" requiring https which would require reverse proxy to overcome in development.
};

export function setAuthCookie(res, token) {
  // modify response object within express by adding JWT with cookie's settings instructions for browser.
  res.cookie("token", token, cookieOptions);
}