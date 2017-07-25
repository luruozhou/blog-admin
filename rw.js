/**
 * the new release watch
 */
var Path = require('path');
var child_process = require('child_process');
var fs = require('fs');
var events = require('events');
var util = require('util');
var Chalk = require('chalk');
var Chokidar = require('chokidar');

// release watch 配置文件
var DEFAULT_NODE_CMD = 'node';

var LOCAL_NODE_MODULES_PATH = Path.resolve(__dirname, './node_modules');

/**
 * 判断是否是 object
 */
function isObject(arg) {
    return typeof arg === 'object' && arg !== null;
}

/**
 * 扩展一个对象的属性
 */
function extend(origin, add) {
    // Don't do anything if add isn't an object
    if (!add || !isObject(add)) return origin;

    var keys = Object.keys(add);
    var i = keys.length;
    while (i--) {
        origin[keys[i]] = add[keys[i]];
    }
    return origin;
};

/**
 * 读取一个 json 文件
 */
function readJson(filePath, callback) {
    fs.readFile(filePath, function(err, data) {
        if (err) {
            return callback(err);
        }

        try {
            var obj = JSON.parse(data);
            callback(null, obj);
        } catch (e) {
            callback(e);
        }
    });
}

/**
 * 运行一个命令
 */
function runCommand(command, options) {
    var defaultOptions = {
        encoding: 'utf8',
        cwd: null,
        env: null
    };

    options = extend(defaultOptions, options);

    var commandInArray = command.split(' ');
    var file = commandInArray[0];
    var args = commandInArray.slice(1);

    var child = child_process.spawn(file, args, {
        cwd: options.cwd,
        env: options.env,
        gid: options.gid,
        uid: options.uid,
        windowsVerbatimArguments: !!options.windowsVerbatimArguments
    });

    function errorHandler(e) {
        child.stdout.destroy();
        child.stderr.destroy();
    }

    if (options.encoding) {
        child.stderr.setEncoding(options.encoding);
        child.stdout.setEncoding(options.encoding);
    }

    child.on('error', errorHandler);

    return child;
}

/**
 *
 */
function makeLimitedCallback(max, callback) {
    var inc = 0;
    return function(err) {
        if (++inc == max) {
            return callback && callback(err);
        }

        if (inc > max) {
            console.error('this function called was exceeded max count');
            console.error(new Error().stack);
        }
    }
}


/**
 * Command Resolver
 *
 * options.node
 * options.pkgName
 * options.cmdName
 * options.verRule.args
 * options.verRule.pattern
 */
function CommandResolver(options) {
    this.node = options.node;
    this.pkgName = options.pkgName;
    this.cmdName = options.cmdName;
    this.fullCmdName = options.cmdName;
    this.verRule = options.verRule;
    this.isLocalCmd = false;
}
util.inherits(CommandResolver, events.EventEmitter);

CommandResolver.prototype.resolve = function(callback) {
    var _this = this;
    var localCmdPath = Path.resolve(LOCAL_NODE_MODULES_PATH, this.pkgName, 'bin/', this.cmdName);

    fs.stat(localCmdPath, function(err, stats) {
        if (err) {
            Watcher.warn(util.format('推荐安装 "%s" 命令到项目中, 运行"%s"', Chalk.green(_this.pkgName), Chalk.green(util.format('cd blog-admin && npm install %s', _this.pkgName))), false);

            _this.emit('resolved', err);
            return callback && callback(err);
        }

        _this.isLocalCmd = true;
        _this.fullCmdName = localCmdPath;
        _this.emit('resolved');
        callback && callback();
    });
};

CommandResolver.prototype.exec = function(args, callback) {
    callback = callback || function() {};
    args = args || [];

    var command;
    if (this.isLocalCmd) {
        command = util.format('%s %s %s', this.node, this.fullCmdName, args.join(' '));
    } else {
        command = util.format('%s %s', this.fullCmdName, args.join(' '));
    }

    return child_process.exec(command, callback);
};

CommandResolver.prototype.run = function(args, options) {
    var command;
    args = args || [];

    if (this.isLocalCmd) {
        command = util.format('%s %s %s', this.node, this.fullCmdName, args.join(' '));
    } else {
        command = util.format('%s %s', this.fullCmdName, args.join(' '));
    }
    return runCommand(command, options);
};

CommandResolver.prototype.version = function(callback) {
    var _this = this;
    var args = this.verRule.args || ['-v'];

    this.exec(args, function(err, stdout, stderr) {
        if (err) {
            return callback(err);
        }

        if (stdout) {
            var version = stdout.replace(_this.verRule.pattern, '$1').trim();
            Watcher.log(_this.cmdName + ' version is ' + Chalk.green(version), false);
            Watcher.log(_this.cmdName + ' command: ' + Chalk.green(_this.fullCmdName), false);

        } else {
            Watcher.log('Not get ' + _this.cmdName + ' version');
        }

        callback();
    })
}


/**
 * Watcher
 */
function Watcher(command) {
    this.command = command;
    this.child = null;
    this.compiling = false;
    this._childClosedTimes = 0;
    this.prettyName = this.command.cmdName;
}
util.inherits(Watcher, events.EventEmitter);

Watcher.prototype.watch = function() {
    throw new Error('Not Implement');
};

Watcher.prototype._childCloseHandler = function(code) {
    var _this = this;
    Watcher.warn(util.format('[%s] was closed with code "%d"', this.prettyName, code), true);

    this._childClosedTimes++;

    if (this._childClosedTimes > 10) {
        Watcher.warn(util.format('up to max child closed times'));
        process.exit();
    }

    setTimeout(function() {
        Watcher.log(util.format('intent to restart [%s] watching...', _this.prettyName), true);
        _this.watch();
    }, 500);
};

Watcher.prototype._childErrorHandler = function(err) {
    console.error(util.format('run %s watch command, catch an error, you may check it: '));
    console.error(err);
};

Watcher.log = function(message, rwMarker) {
    var time = '[' + new Date().toTimeString().match(/\S+/)[0] + '] ';
    var leadingSpaces = Array(time.length + 1).join(' ');
    console.log(time,message)
    // console.log(Chalk.gray(time) + (rwMarker === false ? '' : Chalk.yellow('rw ')) + message.replace(/\n(?!$)/g, leadingSpaces));
};

Watcher.warn = function(message, rwMarker) {
    var time = '[' + new Date().toTimeString().match(/\S+/)[0] + '] ';
    var leadingSpaces = Array(time.length + 1).join(' ');
    console.error(Chalk.red(time) + (rwMarker === false ? '' : Chalk.yellow('rw ')) + message.replace(/\n(?!$)/g, leadingSpaces));
};


/**
 * Tsc Watcher
 */
function TscWatcher(command) {
    Watcher.call(this, command);
    this.prettyName = 'tsc -w';
}
util.inherits(TscWatcher, Watcher);

TscWatcher.prototype._stdoutDataHandler = function(data) {
    var message = data
        .replace(/[^:]+TS\d+:/, '')
        .trim()
        .replace(/[A-Z](?![A-Z])/g, function(match) {
            return match.toLowerCase();
        });

    Watcher.log(Chalk.cyan('tsc ') + message, false);

    if (/File change detected\./.test(data)) {
        // file change detected
        this.compiling = true;
        this.emit('compiling');

    } else if (/Compilation complete\./.test(data)) {
        // compilation complete
        this.compiling = false;
        this.emit('complete');
    }
};

TscWatcher.prototype.watch = function() {
    Watcher.log(Chalk.cyan('tsc') + ' compiling...', false);
    this.child = this.command.run(['-w']);

    this.child.stdout.on('data', this._stdoutDataHandler.bind(this));
    this.child.on('close', this._childCloseHandler.bind(this));
    this.child.on('error', this._childErrorHandler.bind(this));
};


/**
 * Sweater
 */
function Sweater(watchers, options) {
    this.watchers = watchers;
    this.options = options;
    this.config = null;
    this.package = null;
    this.watcher = null;

    this.warmUpTimer = null;
    this.nodeInstance = null; // node 实例
    this.running = false; // node 运行状态
    this.restarting = false; // node 重启状态
}

Sweater.prototype.init = function(callback) {
    var _this = this;

    var done = makeLimitedCallback(2, callback);

    readJson(Path.resolve(_this.options.directory, 'swconfig.json'), function(err, data) {
        if (err) {
            return done(err);
        }
        _this.config = data;
        done();
    });

    readJson(Path.resolve(_this.options.directory, 'package.json'), function(err, data) {
        if (err) {
            return done(err);
        }
        _this.package = data;
        done();
    });
};

Sweater.prototype._watcherReadyHandler = function() {
    this.watcher.on('all', this._watcherAllHandler.bind(this));
    this.warmUp();
};

Sweater.prototype._watcherAllHandler = function() {
    if (!this.restarting && this.running) {
        Sweater.log('files changed...');
    }
    if (this.running) {
        this.restarting = true;
        this.nodeInstance.kill();
    } else {
        this.warmUp();
    }
};

Sweater.prototype.wear = function() {
    Sweater.log('Sweater wear...');
    var _this = this;

    this.watcher = Chokidar.watch(_this.config.globs, {
        cwd: _this.options.directory
    });

    this.watcher.once('ready', this._watcherReadyHandler.bind(this));
};

Sweater.prototype.isWatchersCompiling = function() {
    return this.watchers.some(function(watcher) {
        return watcher.compiling;
    });;
};

Sweater.prototype.warmUp = function() {
    var _this = this;

    clearTimeout(this.warmUpTimer);

    var timeout = this.config.warmUpTimeout;
    if (!this.firstWarmed) {
        this.firstWarmed = true;
        timeout = 0;
    }

    this.warmUpTimer = setTimeout(function() {
        if (_this.isWatchersCompiling()) {
            _this.warmUp();
            return;
        }

        var command = util.format('%s %s', _this.options.nodeForZmWww, _this.package.main);
        var options = {
            cwd: _this.options.directory
        };

        _this.nodeInstance = runCommand(command, options);
        _this.running = true;
        Sweater.log('starts process ' + _this.nodeInstance.pid + '.');

        var lineEnded = true;
        _this.nodeInstance.stdout.on('data', function(data) {
            Sweater.log(data, false, false, lineEnded);
            if(/listening on/.test(data)){
                console.log('\n\n\n')
            }
            lineEnded = /\n$/.test(data);
        });

        _this.nodeInstance.stderr.on('data', function(data) {
            Sweater.warn(data, false, false, lineEnded);
            lineEnded = /\n$/.test(data);
        });

        _this.nodeInstance.on('error', function(err) {
            Sweater.warn(err);
            process.exit();
        });

        _this.nodeInstance.on('exit', function(code, signal) {
            _this.running = false;
            Sweater.log('process ' + _this.nodeInstance.pid + ' exits with code ' + (code || 0) + (signal ? ' (' + signal + ')' : '') + '.');

            if (_this.restarting) {
                _this.restarting = false;
                _this.warmUp();
            }
        });
    }, timeout);
};

Sweater.log = function(message, sweaterMark, endOfLine, lineEnded) {
    var time = '[' + new Date().toTimeString().match(/\S+/)[0] + '] ';
    var spaces = Array(time.length + 1).join(' ');
    var start = Chalk.gray(time) + (sweaterMark === false ? '' : Chalk.green('sw') + ' ');
    message = (lineEnded === false ? '' : start) + message.toString().replace(/\n(?!$)/gm, '\n' + spaces);
    if (endOfLine === false) {
        process.stdout.write(message);
    } else {
        console.log(message);
    }
};

Sweater.warn = function(message, sweaterMark, endOfLine, lineEnded) {
    var time = '[' + new Date().toTimeString().match(/\S+/)[0] + '] ';
    var spaces = Array(time.length + 1).join(' ');
    var start = Chalk.red(time) + (sweaterMark === false ? '' : Chalk.red('sw') + ' ');
    message = (lineEnded === false ? '' : start) + message.toString().replace(/\n(?!$)/gm, '\n' + spaces);
    if (endOfLine === false) {
        process.stderr.write(message);
    } else {
        console.error(message);
    }
};


/**
 * 创建 watcher
 */
function generateWatchers(options) {
    var watchers = [];

    var tscWatcher = new TscWatcher(options.tsc);
    watchers.push(tscWatcher);
    return watchers;
}

/**
 * 显示 watcher 命令版本号
 */
function displayWatcherVersion(commands, callback) {
    var len = 2;
    if (commands.length < len) {
        len = commands.length;
    }
    if (len == 0) {
        callback();
    }

    var done = makeLimitedCallback(len, callback);

    for (var i = 0; i < len; i++) {
        commands[i].version(done);
    }
}

function resolveCommand(commands, callback) {
    var done = makeLimitedCallback(commands.length, callback);

    for (var i = 0; i < commands.length; i++) {
        commands[i].resolve(done);
    }
}

/**
 * 运行 watch
 */
function runWatcherWatch(watchers, callback) {
    watchers[0].once('complete', function() {
        if (watchers.length > 1) {
            var done = makeLimitedCallback(watchers.length - 1, callback);
            for (var i = 1; i < watchers.length; i++) {
                watchers[i].watch();
                watchers[i].once('complete', done);
            }

        } else {
            callback();
        }
    });

    watchers[0].watch();
}

function main() {
    var apps = process.argv.slice(2);

    var nodeForTsc = DEFAULT_NODE_CMD;
    var nodeForZmWwww = DEFAULT_NODE_CMD;


    var watchers;
    var sweater;

    var tsc = new CommandResolver({
        node: nodeForTsc,
        pkgName: 'typescript',
        cmdName: 'tsc',
        verRule: {
            pattern: /.*version\s*([\d.]+)|^.*$/igm
        }
    });

    watchers = generateWatchers({
        apps: apps,
        tsc: tsc
    });

    sweater = new Sweater(watchers, {
        directory: Path.resolve('./'),
        nodeForZmWww: nodeForZmWwww
    });

    var done = makeLimitedCallback(2, sweater.wear.bind(sweater));

    resolveCommand([tsc], function() {
        displayWatcherVersion([tsc], function() {
            console.log('/*-------------------------------------------------------------*/');
            runWatcherWatch(watchers, done);
        });
    });

    sweater.init(done);
}

if (require.main === module) {
    main();
}