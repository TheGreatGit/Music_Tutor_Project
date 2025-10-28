run this to generate JWT secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"