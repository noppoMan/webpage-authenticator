# webpage-authenticator

A Proxy Server with custom authorizers. This is mainly developed for providing authentication for Tensorboard to avoid leaking secret data.

<img src="https://user-images.githubusercontent.com/1511276/87540304-66515d80-c6da-11ea-885c-8f5397be7813.gif">

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

#### Environment Variables
* WA_PROXY_URL: A url for proxy target
* PORT: Listening port of proxy server

```sh
WA_PROXY_URL=http://proxy-target.com:8080 ts-node webpage-authenticator/src/proxy.ts
```

#### Serving with Basic Authentication 
First of all, You should generate .htpassword file under the root directory. The password should be crypted with [bcrypt](https://en.wikipedia.org/wiki/Bcrypt).
Also You can use [htpassword.ts](https://github.com/noppoMan/webpage-authenticator/blob/master/src/bin/htpassword.ts) to generate htpassword formatted string.

