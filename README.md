# rhome

develop tool for rokid homebase developer whicn can validate response data by json schema of list/get/execute interface, refered in rokid homebase open API.

## install

```bash
$ npm install -g rokid-homebase-cli
```

## usage

```
$ rhome -h

 Usage: rhome [options] [command]


  Commands:

    serve <path> [port]                      transform local driver to server with default port 3000
    ssdp                                     start homebase ssdp broadcast
    add                                      add a remote driver's session
    del <name>                               delete a remote driver's session
    sessions                                 list all added sessions
    use <name>                               user an added session
    list [options]                           list a driver's all devices
    get [options] <id>                       get one device's current state
    exec [options] <id> <prop> <name> [val]  execute the device<id> with target action(e.g color num 256)

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -v, --verbose  show raw response body
```

* `rhome` will create `rhome.json` file in your user root path for the first time, which can modify if necessary.
* `add` is an interactive command. `name` must be only characters, numbers and underscore, e.g demo_1
* other commands are command line mode.
* `-b` show raw response body of list | get | execute.
* `-l` show local device(s) of list | get
* `-d` show response data of list | get | execute
* for detail usage of each command as below

```
$ rhome list -h

  Usage: list [options]

  list a driver's all devices

  Options:

    -h, --help   output usage information
    -d, --data   show response data of list
    -l, --local  list local devices

```

a simple sample of rhome:

```
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

```
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

```
$ rhome list

body checked by json schema:
instance does not match allOf schema [subschema 1] with 2 error[s]:
instance.data[0].actions.color[1] is not one of enum values: random,num
instance.data[0] requires property "type"
```