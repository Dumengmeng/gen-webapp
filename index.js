#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const colors = require('colors')
const program = require('commander')
const cld_process = require('child_process')
const exec = cld_process.exec
const execSync = cld_process.execSync
const readline = require('readline')
const readlineSync = require('readline-sync')
program.parse(process.argv)


const gen = {

    bindObj: {},
    curPath: process.cwd(),
    projectName: program.args[0]|| 'webapp',
    projectTypeIndex: 0,
    loadingDoneTag: false,
    projectTypes: ['PC', 'H5'],
    proSourceUrl: [{
        type: 'PC',
        url: 'git@git.elenet.me:mengmeng.du/gen-PC.git'
    }, {
        type: 'H5',
        url: 'git@git.elenet.me:mengmeng.du/gen-H5.git'
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
            const isRewrite = readlineSync.keyInYN(colors.green("Your directory isn't clean, ensure to rewrite it?"))
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
            console.log(colors.green(`I'm going to build your app...`))
            this._setLoadingAction(this.bindObj)
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
                this._deleteGitDic(`${this.curPath}/.git`)
                this.loadingDoneTag = true
                console.log(colors.yellow('\rAll work done!'))
            })
        } else {
            console.log('项目仓库路径为空！')
        }
    },

    _setLoadingAction(obj) {
        const fix = ['-', '\\', '/']
        let num = 0
        let loadTimer = setInterval(() => {
            process.stdout.write(`\r${fix[(num++) % 3]}`)
            if (this.loadingDoneTag) {
                clearInterval(loadTimer)
                readline.clearLine(process.stdout, 0)
            }
        }, 200)
    },
    
    _getProUrl(idx = 0) {
        // 获取项目路径
        return this.proSourceUrl ? this.proSourceUrl[idx].url : ''
    },
    
    _deleteall(path) {
        // 清空文件夹
        if(fs.existsSync(path)) {
            let files = fs.readdirSync(path)
            files.forEach((file, index) => {
                var curPath = `${path}/${file}`
                if(fs.statSync(curPath).isDirectory()) {
                    execSync(`rm -rf ${path}/${file}`, err => {
                        console.log('remove dir error: ', err)
                    })
                } else {
                    execSync(`rm ${path}/${file}`, err => {
                        console.log('remove file error: ', err)
                    })
                }
            })
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
