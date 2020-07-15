import * as bcrypt from 'bcrypt';

const user = process.argv[2];
const password = process.argv[3];

if(!user || !password) {
    console.log("Invalid arguments detected.");
    console.log("Usage: htpassword.ts [user] [password]");
    process.exit(1);
}

const hashed = bcrypt.hashSync(password, 10);

console.log(`${user}:${hashed}`);