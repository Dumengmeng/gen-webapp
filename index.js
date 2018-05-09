#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const colors = require('colors')
const program = require('commander')
const exec = require('child_process').exec
const readlineSync = require('readline-sync')
program.parse(process.argv)


const gen = {

    curPath: process.cwd(),
    projectName: program.args[0]|| 'webapp',
    projectTypeIndex: 0,
    projectTypes: ['PC', 'H5'],
    proSourceUrl: [{
        type: 'PC',
        url: 'git@git.elenet.me:mengmeng.du/test-gen.git'
    }, {
        type: 'H5',
        url: 'git@git.elenet.me:mengmeng.du/test-gen.git'
    }],
    
    quesName() {
        // 项目的名称 default:webapp
        this.projectName = readlineSync.question(colors.green(`Your project name：(${this.projectName})`), {
            defaultInput: this.projectName
        })
    },

    quesType() {
        // 项目的类型 default:PC
        this.projectTypeIndex = readlineSync.keyInSelect(this.projectTypes, colors.green('Choose your project type：'))
    },

    prepare(path) {
        // 若当前已存在目录文件，则询问是否清空
        if (!this._isEmptyDirectory(path)) {
            const isRewrite = readlineSync.keyInYN(colors.green('Confirm to rewrite current directory?'))
            if (isRewrite) {
                this._deleteall(path)
            } else {
                this._exitProcess()
            }
        }
    },

    confirm() {
        // 确认开始创建项目
        const isConfirmed = readlineSync.keyInYN(colors.green('Confirm to build your project?'))
        if (isConfirmed) {
            console.log(colors.green("I'm going to build your app... "))
        } else {
            this._exitProcess()
        }
    },

    buildPro() {
        // 从远程克隆目录文件
        const proUrl = this._getProUrl(this.projectTypeIndex)
        if (proUrl) {
            const cmd = `git clone ${proUrl} ${this.curPath}`
            exec(cmd, (error, stdout, stderr) => {
                if(error) {
                    console.error('Some error occured: ' + error)
                    this._exitProcess()
                }

                _deleteGitDic(`${this.curPath}/.git`)

                console.log(colors.yellow('All work done!'))
                
            })
        } else {
            console.log('项目仓库路径为空！')
        }
    },
    
    _getProUrl(idx = 0) {
        // 获取项目路径
        return this.proSourceUrl ? this.proSourceUrl[idx].url : ''
    },
    
    _deleteall(path) {
        // 删除文件或文件夹
        let files = []
        if(fs.existsSync(path)) {
            files = fs.readdirSync(path)
            files.forEach(function(file, index) {
                var curPath = `${path}/${file}`
                if(fs.statSync(curPath).isDirectory()) {
                    this._deleteall(curPath)
                } else {
                    fs.unlinkSync(curPath)
                }
            })
            fs.rmdirSync(path)
        }
    },

    _deleteGitDic(path) {
        // 删除.git文件夹
        if (fs.existsSync(path)) {
            this._deleteall(path)
        }
    },

    _exitProcess() {
        // 退出当前进程
        console.log('\nFailed to build your app! \n')
        process.exit()
    },

    _isEmptyDirectory(path) {
        // 是否为空目录
        return !fs.readdirSync(path).length
    },
}

try {
    gen.quesName()
    gen.quesType()
    gen.prepare(gen.curPath)
    gen.confirm()
    gen.buildPro()
} catch (e) {
    console.log('Some error occured:', JSON.stringify(e))
}
