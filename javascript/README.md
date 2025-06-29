# Javascript README

## Localhost with SSL

`cd` to app's directory, then:

```
mkcert -install
mkcert localhost 127.0.0.1 ::1
http-server -S -C localhost+2.pem -K localhost+2-key.pem
```

Default port: `8080`