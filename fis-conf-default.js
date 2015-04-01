var fisConf = {
    statics: '/static',
    templates: '/template',
    namespace: '',
    server: {
        rewrite: true,
        libs: 'pc',
        type: 'php',
        clean: {
            exclude: "fisdata**,smarty**,rewrite**,index.php**,WEB-INF**"
        }
    },
    modules : {
        parser : {
            less : 'less',
            tmpl: 'bdtmpl',
            po: 'po',
            //custom--------------
            scss: 'sass'
            //custom--------------
        },
        preprocessor: {
            tpl: 'components, extlang',
            html: 'components',
            js: 'components',
            css: 'components'
        },
        postprocessor: {
            tpl: 'require-async',
            js: 'jswrapper, require-async'
        },
        optimizer : {
            tpl : 'smarty-xss,html-compress'
        },
        prepackager: 'widget-inline,js-i18n'
    },
    roadmap : {
        ext : {
            less : 'css',
            tmpl : 'js',
            po   : 'json',
            //custom-----------------------
            scss : 'css'
            //custom-----------------------
        },
        path : [
            // i18n
            {
                reg: '/fis_translate.tpl',
                release: '${templates}/${namespace}/widget/fis_translate.tpl'
            },
            {
                reg: /\/lang\/([^\/]+)\.po/i,
                release: '/config/lang/${namespace}.$1.po'
            },
            //i18n end
            {
                reg: /^\/components\/(.*\.(js|css))$/i,
                isMod: true,
                release: '${statics}/${namespace}/components/$1'
            },
            {
                reg : /^\/widget\/(.*\.tpl)$/i,
                isMod : true,
                url : '${namespace}/widget/$1',
                release : '${templates}/${namespace}/widget/$1'
            },
            {
                reg : /^\/widget\/(.*\.(js|css))$/i,
                isMod : true,
                release : '${statics}/${namespace}/widget/$1'
            },
            {
                reg : /^\/page\/(.+\.tpl)$/i,
                isMod: true,
                release : '${templates}/${namespace}/page/$1',
                extras: {
                    isPage: true
                }
            },
            {
                reg : /\.tmpl$/i,
                release : false,
                useOptimizer: false
            },
            {
                reg: /^\/(static)\/(.*)/i,
                release: '${statics}/${namespace}/$2'
            },
            {
                reg: /^\/(config|test)\/(.*\.json$)/i,
                isMod: false,
                charset: 'utf8',
                release: '/$1/${namespace}/$2'
            },
            {
                reg: /^\/(config|test)\/(.*)/i,
                isMod: false,
                release: '/$1/${namespace}/$2'
            },
            {
                reg : /^\/(plugin|smarty\.conf$)|\.php$/i
            },
            {
                reg : 'server.conf',
                release : '/server-conf/${namespace}.conf'
            },
            {
                reg: "domain.conf",
                release: '/config/$&'
            },
            {
                reg: "build.sh",
                release: false
            },
            {
                reg : '${namespace}-map.json',
                release : '/config/${namespace}-map.json'
            },
            {
                reg: /^.+$/,
                release: '${statics}/${namespace}$&'
            },

            //custom-------------------
            {
                reg: /\/static\/js\/app\/(?!.*[init]\.js$)[\s\S]+/,
                isMod: true
            },
            {
                reg: /\/static\/js\/core\/(?!.*[invoke]\.js$)[\s\S]+/,
                isMod: true
            }
            //custom-------------------
        ]
    },
    settings : {
        parser : {
            bdtmpl : {
                LEFT_DELIMITER : '<#',
                RIGHT_DELIMITER : '#>'
            }
        },
        postprocessor : {
            jswrapper: {
                type: 'amd'
            }
        },

        //---线上环境关闭console
        'uglify-js' : {
            compress : {
                drop_console: true
            }
        },

        //custom------------------
        optimizer: {
            'uglify-js': {
                compress : {
                    drop_console: true
                }
            }
        }
        //custom------------------
    },

    component: {
        protocol: 'github',
        gitlab: {
            author: 'fis-components'
        },
        skipRoadmapCheck: true
    }
};

module.exports = fisConf;