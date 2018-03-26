# RHome

使用 rhome 工具通过 json schema 来验证 list/execute 接口的返回值来验证接入 Rokid Homebase 协议。

## 安装

从 [Release](https://github.com/Rokid/rokid-homebase-cli/releases) 页面下载最新的适合你的操作系统的已打包的程序。

## 使用方法

```
$ rhome -h

Usage: rhome [options] [command]


  Commands:

    serve <path> [port]                      transform local driver to server with default port 3000
    ssdp                                     start homebase ssdp broadcast
    add                                      add a session of remote driver
    del <name>                               delete the session of remote driver
    sessions                                 list all added sessions
    use <name>                               user an added session
    list [options]                           list all devices of a driver
    get [options] <id>                       get current state of a driver
    exec [options] <id> <prop> <name> [val]  execute the device<id> with target action(e.g color num 256)

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -v, --verbose  show raw response body
```

* `rhome` 会在你的用户根目录创建 `rhome.json` 保存应用数据，你也可以自行直接修改
* `add` 是一个需要命令行交互的命令. `name` 只能包含字母、数字与下划线, e.g demo_1
* 更详细的命令可以使用 `-h` 参数查看

```
$ rhome list -h

  Usage: list [options]

  list all devices of a driver

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

### 验证数据

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
