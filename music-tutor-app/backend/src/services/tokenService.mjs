import jwt from "jsonwebtoken";

export function signUserToken(userId) {
    //create JWT with user's DB id signed using secret key and hashing algorithm
    // the data is NOT encrypted! Instead, it is hashed using algorithm that uses the JWT_SECRET and any alteration to the JWT client-side will produce different hash and will expose alteration
    // maybe add user's role later?
    // method signjature is sign(payload, secret, options)
    // it creates a hashed header that specifies the hasing algorithm and token type (JWT)
    // then hashes the payload. Then creates a 'signature' by hasing payload and signature with secret key
    //these 3 things, separated by '.' are the actual JWT.
    // give the token a payload as an object rather than a primitive because the object-form is easier to extend later e.g. add user role
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token) {
    // this takes the token - as sent back by client- and de-hashes the header and payload; 
    // it will then re-generate the signature itself by hashing payload and header and compares this result to the signature from client-side JWT
    // if there is any  difference between client-side signature and server-side regenerated signature, client-side JWT is rejected
    // it can also be rejected if client-side JWT is passed expiry date

    // .verify() will return the JWT payload on success, or throw an error on fail.
  return jwt.verify(token, process.env.JWT_SECRET);
}
