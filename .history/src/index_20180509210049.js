#!/usr/bin/env node

// 命令行输入： gen-cli [projectName]

const colors = require('colors')
const path = require('path')
const fs = require('fs')
const program = require('commander')
const exec = require('child_process').exec
const readlineSync = require('readline-sync')

// -m prject name
// -t project type PC/H5 待定
// const projectTypes = ['H5', 'PC']

program.parse(process.argv)
let projectName = program.args[0]|| 'webapp'

const proSourceUrl = 'git@git.elenet.me:mengmeng.du/test-gen.git'

projectName = readlineSync.question(colors.green(`Your project name：(${projectName})`), {
    defaultInput: projectName
})

const currentPath = `${__dirname}/${projectName}`
// const projectTypeIndex = readlineSync.keyInSelect(projectTypes, 'Choose your project type：')

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

// 确认开始创建项目
const confirm = () => {
    const isConfirmed = readlineSync.keyInYN(colors.green('Confirm to build your project?'))
    if (isConfirmed) {
        console.log(colors.green("\nI'm going to build your app... \n"))
    } else {
        exitProcess()
    }
}

// 是否为空目录
const isEmptyDirectory = (path) => {
        fs.readdir(path, function (err, files) {
                return !(files && files.length)
        });
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

// 从远程克隆目录文件
const buildPro = () => {
    exec(`git clone ${proSourceUrl} ${__dirname}/${projectName}`, function(error, stdout, stderr){
        if(error) {
            console.error('error: ' + error)
            return
        }
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);

        deleteGitDic(`${currentPath}/.git`)
    })
}


prepare(currentPath)
confirm()
buildPro()

console.log(colors.yellow('All work done!'))