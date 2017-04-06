# rhome

develop tool for rokid homebase developer whicn can validate response data by json schema of list/get/execute interface, refered in rokid homebase open API.

## install

```bash
$ npm install -g rhome
```

## usage

```bash
$ rhome -h

Usage: rhome [options] [command]


  Commands:

    serve <path> [port]            transform local driver to server with default port 3000
    add                            add a remote driver's session
    del <name>                     delete a remote driver's session
    sessions                       list all added sessions
    use <name>                     user an added session
    list                           list a driver's all devices
    get <id>                       get one device's current state
    exec <id> <prop> <name> [val]  execute the device<id> with target action(e.g color num 12345)
    *                              [object Object]
    help [cmd]                     display help for [cmd]

  show help

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -b, --body     show response body of list/get/execute
    -l, --local    list local devices
```

* `rhome` will create `rhome.json` file in your user root path for the first time, which can modify if necessary.
* `add` is an interactive command.
* other commands are command line mode.
* `-b` show raw response body of list|get|execute.
* `-l` list local devices of `rhome.json` listed before.


a simple sample of rhome:

```bash
$ rhome add

? remote driver's name demo
? remote driver's endpoint http://127.0.0.1:3000
? userId in userAuth. If null, skip
? userToken in userAuth. If null, skip
{
  "name": "demo",
  "endpoint": "http://127.0.0.1:3000",
  "userId": "",
  "userToken": ""
}
```

## validate data

`rhome` validate response data by json schemas which show detail errors of data.

* success response data

```bash
$ rhome list

id: 0
sessionName: demo
deviceId: "e12e2735-5e64-44d3-8ee2-46471f03d182"
name: light1
type: light
offline: false
```

* error response data

In this case, you can check your errors of specific data shown in error message.

```bash

$ rhome list

body checked by json schema:
instance does not match allOf schema [subschema 1] with 2 error[s]:
instance.data[0].actions.color[1] is not one of enum values: random,num
instance.data[0] requires property "type"
```