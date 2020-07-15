# webpage-authenticator

A Proxy Server with custom authorizers. This is mainly developed for providing authentication for Tensorboard to avoid leaking secret data.

## Supported Authorization methods

- [x] Basic Auth
- [ ] Email and Password
- [ ] JWT
- [ ] Other Custom Authorizers

## Usage

### Installation
```sh
git clone https://github.com/noppoMan/webpage-authenticator.git
cd webpage-authenticator
npm i
```

### Serving

First of all, You should generate .htpassword file under root directory. the password should be crypted with [bcrypt](https://en.wikipedia.org/wiki/Bcrypt).

```sh
TP_PROXY_URL=http://proxy-target.com:8080 ts-node webpage-authenticator/src/proxy.ts
```

