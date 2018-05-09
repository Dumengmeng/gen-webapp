#!/usr/bin/env node

// 命令行输入： gen-cli [projectName]

const fs = require('fs')
const path = require('path')
const colors = require('colors')
const program = require('commander')
const exec = require('child_process').exec
const readlineSync = require('readline-sync')
program.parse(process.argv)

console.log('__dirname', __dirname)


const app = {

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
        this.projectName = readlineSync.question(colors.green(`Your project name：(${projectName})`), {
            defaultInput: projectName
        })
    },

    quesType() {
        // 项目的类型 default:PC
        this.projectTypeIndex = readlineSync.keyInSelect(projectTypes, colors.green('Choose your project type：'))
    },
    
    _getProUrl(idx = 0) {
        if (proSourceUrl) {
            return proSourceUrl[idx].url
        }
    },

    

}


const currentPath = `${__dirname}/${projectName}`

// 获取项目路径
const getProUrl = (idx = 0) => {
    if (proSourceUrl) {
        return proSourceUrl[idx].url
    }
}

// 删除文件或文件夹
const deleteall = (path) => {
    let files = []
    if(fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function(file, index) {
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) {
                deleteall(curPath)
            } else {
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(path)
    }
}

// 删除.git文件夹
const deleteGitDic = (path) => {
    if (fs.existsSync(path)) {
        deleteall(path)
    }
}

// 退出当前进程
const exitProcess = () => {
    console.log('\nFailed to build your app! \n')
    process.exit()
}

// 是否为空目录
const isEmptyDirectory = (path) => {
    fs.readdir(path, function (err, files) {
        return !(files && files.length)
    })
}

// 若当前已存在目录文件，则询问是否清空
const prepare = (curPath) => {
    if (!isEmptyDirectory(curPath)) {
        const isRewrite = readlineSync.keyInYN(colors.green('Confirm to rewrite current directory?'))
        if (isRewrite) {
            deleteall(curPath)
        } else {
            exitProcess()
        }
    }
}

// 确认开始创建项目
const confirm = () => {
    const isConfirmed = readlineSync.keyInYN(colors.green('Confirm to build your project?'))
    if (isConfirmed) {
        console.log(colors.green("I'm going to build your app... \n"))
    } else {
        exitProcess()
    }
}

// 从远程克隆目录文件
const buildPro = () => {
    const proUrl = getProUrl(projectTypeIndex)
    if (proUrl) {
        const cmd = `git clone ${proUrl} ${__dirname}/${projectName}`
        exec(cmd, function(error, stdout, stderr){
            if(error) {
                console.error('error: ' + error)
                return
            }

            deleteGitDic(`${currentPath}/.git`)
        })
    } else {
        console.log('项目gitlab路径为空！')
    }
}


prepare(__dirname)
confirm()
buildPro()

console.log(colors.yellow('All work done!'))