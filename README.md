# rhome

使用 rhome 工具通过 json schema 来验证 discover|control|report-state 接口的返回值来验证接入 Rokid Homebase 协议。

## 功能

- 调用 discover|control|report-state 接口。

- 使用 jsonshema 对返回的数据格式进行校验，并指出具体错误信息。

## 安装

从 [Release](https://github.com/Rokid/rokid-homebase-cli/releases) 页面下载最新的适合你的操作系统的已打包的程序。

## 使用

```
$ rhome -h

  Usage: rhome [options] [command]

  Options:

    -V, --version                               output the version number
    -v, --verbose                               show raw response body
    -h, --help                                  output usage information

  Commands:

    add                                         add a session of remote driver
    del <name>                                  delete the session of remote driver
    sessions                                    list all added sessions
    use <name>                                  user an added session

    discover [options]                          list all devices of a driver
    control [options] <id> <directive> [value]  execute the device<id> with target action(e.g color num 256)
    report-state [options] <id>                 get current state of a driver
```

* `rhome` 运行后，将在用户目录下新建 **rhome.json** 文件，保存 sessions、devices、currentSession 信息。如有必要，开发者可以进行修改。
* `add` 是交互式命令。 name 必须由 **字母**、**数字** 和 **下划线** 组成。例如: demo_1。 其余为命令行模式。
* `sessions` 命令显示已添加的所有 session，和显示当前使用的 session。默认使用第一个 session，或通过 `use` 指定。
* `-b` 显示 list | get | execute 的原始返回。
* `-l` 显示 **rhome.json** 文件中的当前 session 下的所有设备。

rhome demo:

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

## 数据校验

`rhome` 将对返回数据进行校验，并显示具体的错误信息。

* 数据格式正确

```
$ rhome discover

id: 0
sessionName: demo
deviceId: "e12e2735-5e64-44d3-8ee2-46471f03d182"
name: light1
type: light
offline: false
```

* 数据格式错误

如有错误，将会显示具体的错误信息，以供参考。

```
$ rhome discover

body checked by json schema:
instance does not match allOf schema [subschema 1] with 2 error[s]:
instance.data[0].actions.color[1] is not one of enum values: random,num
instance.data[0] requires property "type"
```
