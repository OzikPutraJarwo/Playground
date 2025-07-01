# Javascript README

## Localhost with SSL

`cd` to app's directory, then:

```
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

Activate:

```
http-server -S -C localhost+2.pem -K localhost+2-key.pem
```

Default port: `8080`

For auto refresh (using `browser-sync`), install from npm:

```
sudo npm install -g browser-sync
```

Then activate:

```
browser-sync start --server --https --cert "localhost+2.pem" --key "localhost+2-key.pem" --port 8080 --files "**/*"
```