import { createServer as HTTPSCreateServer} from 'https';
import { createServer as HTTPCreateServer, IncomingMessage, ServerResponse } from 'http';
import * as bcrypt from 'bcrypt';
import { readFile } from 'fs';
import * as httpProxy from 'http-proxy';

interface Authenticator {
    loadCredential(): Promise<void>;
    authenticate(req: IncomingMessage, res: ServerResponse, onAuthorized: () => void): void;
}

export class AuthError extends Error {
    public name = 'AuthError';

    public statusCode = 401;

    constructor(public message: string, public errorCode: number) { 
        super(message);
        Object.setPrototypeOf(this, AuthError.prototype);
    }

    public toString() {
        return this.name + ': ' + this.message;
    }
}

function parsehtpasswd(data: Buffer): {password: string, user: string}[] {
    const invalidFormatError = new AuthError("Invalid .htpasswd format", 10001);

    const lines = data.toString().split("\n");
    if(lines.length === 0) {
        throw invalidFormatError;
    }

    return lines.map(x => {
        const components = x.split(":");
        const user = components[0];
        const pswd = components[1];

        if(!user || !pswd) {
            throw invalidFormatError;
        }

        return {
            user: user,
            password: pswd
        };
    });
}

class BasicAuthAuthenticator implements Authenticator {
    creds: {password: string, user: string}[] = []

    async loadCredential(): Promise<void> {
        this.creds = await new Promise<{password: string, user: string}[]>((resolve, reject) => {
            readFile(`${__dirname}/../.htpasswd`, (err, data) => {
                if(err) {
                    return reject(err);
                }
                try {
                    resolve(parsehtpasswd(data))
                } catch(error) {
                    reject(error);
                }
            });
        });
    }

    authenticate(req: IncomingMessage, res: ServerResponse, onAuthorized: () => void): void {
        const basicAuthHeader = {
            'Content-Type': 'text/plain',
            'WWW-Authenticate': 'Basic realm="tensorboard-proxy"'
        };

        if(req.headers.authorization && req.headers.authorization.startsWith("Basic")) {
            const decoded = Buffer.from(req.headers.authorization.split(" ")[1], "base64").toString();

            const components = decoded.split(":");
            const user = components[0];
            const pswd = components[1];
        
            if(user && pswd) {
                for(const cred of this.creds) {
                    // TODO potentially blocking.
                    if(cred.user !== user || !bcrypt.compareSync(pswd, cred.password)) {
                        continue;
                    }

                    onAuthorized();
                    return;                    
                }
            }

            res.writeHead(401, basicAuthHeader);
            res.end();
        } else {
            res.writeHead(401, basicAuthHeader);
            res.end();
        }
    }
}

function isNotEmpty(val: string|undefined|null) {
    if(val === null || val === undefined || val === "") {
        return false;
    }
    return true;
}

const useHTTPS = isNotEmpty(process.env.WA_USE_HTTPS);
const ProxyURL = process.env.WA_PROXY_URL;

if(!ProxyURL) {
    console.log("the env var `WA_PROXY_URL` should not be empty");
    process.exit(1);
}

const createServer = useHTTPS ? HTTPSCreateServer : HTTPCreateServer;

async function main() {
    const authenticator = new BasicAuthAuthenticator();
    await authenticator.loadCredential();

    const proxy = httpProxy.createProxyServer({target: ProxyURL});

    createServer((req, res) => {
        authenticator.authenticate(req, res, () => {
            proxy.web(req, res);
        });
    }).listen(process.env.PORT || 3000);
}

main();