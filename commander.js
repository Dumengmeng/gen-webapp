/* 
    usage:
    elefed-cli <command> [options]

    options:
    -v --version

    command：
    create [options] --- init a new project by given frame // clone指定的框架初始化一个新的项目
        -pn --project Project name
        -t --type Project type
        -r --repository Remote repository url
        -pt --path The path to put your project(relative|absolute)

    develop [options] --- develop a project by clone remote repository // 在现有项目基础上进行开发 
        -r --repository Remote repository to clone  
        -pt --path The path to put your project(relative|absolute)        

    (git) 将git命令进行封装，支持所有git操作

    
    !!!支持自定义命令行!!!
*/


const program = require('commander')

const setCmd = (version) => {
    let userInputParams = {}
    
    program
        .usage('<command> [options]')
        .version(version, '-v, --version')
        .option('-p, --push', 'Update your pro from origin and commit and push your code')
        // TODO
        .option('-m, --description', 'Your descripton to commit')
        
    program
        .command('create')
        .description('Create a new project by given frame')
        .option('-n, --projectName <projectName>', 'Project name') 
        .option('-t, --type <type>', 'Project type [h5|pc|H5|PC]', /^(h5|pc|H5|PC)$/i) // 限制为h5|pc|H5|PC
        .option('-r, --repository <repository>', 'Remote repository url')
        .option('-b, --branch <branch>', 'Your develop branch')
        .option('-f, --force', 'Force to clean current directory and build your project without confirm')
        .action((cmd) => {
            const { projectName, type, repository, branch } = cmd
            userInputParams = { projectName, type, repository, branch, cmdType: 'create', typeOrder: 0 }
        })

    program
        .command('dev')
        .description('Develop a project by clone remote repository')
        .option('-r, --repository <repository>', 'Remote repository to clone ')
        .option('-b, --branch <branch>', 'Your develop branch')
        .action((cmd) => {
            const { repository, branch } = cmd
            userInputParams = { repository, branch, cmdType: 'dev', typeOrder: 1 }
        })

    program.on('--help', () => {
        console.log('\n  Examples:\n')
        console.log('    $ elefed-cli create -n my-app -t h5 -r git@gitlab.com... ')
        console.log('    $ elefed-cli dev -r git@gitlab.com... ')
        console.log("    $ elefed-cli -p -m 'some desc...'")
        console.log('')
    })

    program.parse(process.argv)
    // console.log(program)

    return userInputParams

}

module.exports = setCmd