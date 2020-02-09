## 在多台设备上同步vscode配置的命令行工具

> 原来写了个[vscode插件](https://github.com/januwA/your-vscode-config)，但不怎么好用

1. 创建一个gist并获取gist的id，在gist中创建一个`c.json5`的文件，配置会被写入进去
2. 创建一个github的token，并给与repo和gist权限。
3. 将这两个配置保存起来`vc config -h`

## Install
```
$ npm i -g vscode-config
```

## use
```shell
$ vc -h
$ vc config -h
$ vc config --token <your github token>
$ vc config --id <your gist id>
```

## 拉取配置到本地
```shell
$ vc pull
```
> 如果pull卡住了，就退出进程在执行一次

## 将本地配置保存到gist
```shell
$ vc push
```