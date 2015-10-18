import fs from 'mz/fs'
import path from 'path'
import rimraf from 'rimraf'
import webpack from 'webpack'
import CommonsChunkPlugin from 'webpack/lib/optimize/CommonsChunkPlugin'

import StaticJsxPlugin from '../index'
import * as domUtil from './util/dom'

import chai from 'chai'
chai.use(require('chai-fs'))
chai.use(require('chai-things'))

const expect = chai.expect
const TMP_DIR = path.join(__dirname, 'tmp')
const FIXTURES_DIR = path.join(__dirname, 'fixtures')

function getFile(dir, file) {
  return new Promise(function(resolve, reject) {
    fs.readFile(path.join(dir, file)).
    then(data => resolve(data.toString())).
    catch(err => reject(err))
  })
}

const baseConf = {
  module: {
    loaders: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      loader: 'babel',
    }]
  }
}

describe('StaticJsxPlugin', () => {
  afterEach(done =>
    rimraf(TMP_DIR, done)
  )

  it('should transform a JSX entry to HTML', done => {
    const conf = {
      entry: path.join(FIXTURES_DIR, 'index.jsx'),
      output: {
        path: TMP_DIR,
        filename: 'bundle.js'
      },
      module: baseConf.module,
      plugins: [new StaticJsxPlugin()]
    }
    webpack(conf).run(async function(err, stats) {
      try {
        if (err) return done(err)
        // console.log(stats.toString({chunkModules: false}))
        expect(path.join(TMP_DIR, 'bundle.js')).to.be.a.file()
        const expected = await getFile(FIXTURES_DIR, 'index.html')
        expect(path.join(TMP_DIR, 'index.html')).to.be.a.file().and.have.content(expected)
        done()
      } catch (e) {
        return done(e)
      }
    })
  })

  it('should transform multiple named entries', done => {
    const conf = {
      entry: {
        indexOne: path.join(FIXTURES_DIR, 'index.jsx'),
        indexTwo: path.join(FIXTURES_DIR, 'index-two.jsx')
      },
      output: {
        path: TMP_DIR,
        filename: '[name]-chunk.js'
      },
      module: baseConf.module,
      plugins: [new StaticJsxPlugin()]
    }
    webpack(conf).run(async function(err, stats) {
      try {
        if (err) return done(err)
        // console.log(stats.toString({chunkModules: false}))
        const $ = domUtil.findFirst, _ = domUtil.findAll

        expect(path.join(TMP_DIR, 'indexOne-chunk.js')).to.be.a.file()
        expect(path.join(TMP_DIR, 'indexTwo-chunk.js')).to.be.a.file()

        const dom1 = await domUtil.parseHtml(await getFile(TMP_DIR, 'index.html'))

        expect(_(dom1, 'h1')).to.have.length(1)
        expect($($($(dom1, 'main'), 'h1'))).to.be.equal('Hello, world')
        expect(_(dom1, 'script')).to.have.length(1).
        and.all.have.deep.property('attribs.src', 'indexOne-chunk.js')

        const dom2 = await domUtil.parseHtml(await getFile(TMP_DIR, 'index-two.html'))

        expect(_(dom2, 'h1')).to.have.length(1)
        expect($($($(dom2, 'main'), 'h1'))).to.be.equal('Hello, 2nd world')
        expect(_(dom2, 'script')).to.have.length(1).
        and.all.have.deep.property('attribs.src', 'indexTwo-chunk.js')

        done()
      } catch (e) {
        return done(e)
      }
    })
  })

  it('should transform multiple modules', done => {
    const conf = {
      entry: [
        path.join(FIXTURES_DIR, 'example.js'),
        path.join(FIXTURES_DIR, 'index.jsx')
      ],
      output: {
        path: TMP_DIR,
        filename: 'bundle.js'
      },
      module: baseConf.module,
      plugins: [new StaticJsxPlugin()]
    }
    webpack(conf).run(async function(err, stats) {
      try {
        if (err) return done(err)
        // console.log(stats.toString({chunkModules: false}))
        expect(path.join(TMP_DIR, 'bundle.js')).to.be.a.file()
        const expected = await getFile(FIXTURES_DIR, 'index.html')
        expect(path.join(TMP_DIR, 'index.html')).to.be.a.file().and.have.content(expected)
        done()
      } catch (e) {
        return done(e)
      }
    })
  })

  it('should inject externals', done => {
    const conf = {
      entry: path.join(FIXTURES_DIR, 'index-externals.jsx'),
      output: {
        path: TMP_DIR,
        filename: 'bundle.js'
      },
      externals: {
        'react': 'React',
        'testmodule': 'TestModule'
      },
      module: baseConf.module,
      plugins: [new StaticJsxPlugin()]
    }
    webpack(conf).run(async function(err, stats) {
      try {
        if (err) return done(err)
        // console.log(stats.toString({chunkModules: false}))
        const $ = domUtil.findFirst, _ = domUtil.findAll

        const dom = await domUtil.parseHtml(await getFile(TMP_DIR, 'index-externals.html'))
        expect(_(dom, 'h1')).to.have.length(1)
        expect($($($(dom, 'body'), 'h1'))).to.equal('foobar')
        done()
      } catch (e) {
        return done(e)
      }
    })
  })

  it.skip('should work with the CommonsChunkPlugin', done => {
    const conf = {
      entry: {
        indexOne: path.join(FIXTURES_DIR, 'index.jsx'),
        indexTwo: path.join(FIXTURES_DIR, 'index-two.jsx')
      },
      output: {
        path: TMP_DIR,
        filename: '[name]-chunk.js'
      },
      module: baseConf.module,
      plugins: [
        new StaticJsxPlugin(),
        new CommonsChunkPlugin('common-chunk.js')
      ]
    }
    webpack(conf).run(async function(err, stats) {
      try {
        if (err) return done(err)
        // console.log(stats.toString({chunkModules: false}))
        expect(path.join(TMP_DIR, 'bundle.js')).to.be.a.file()
        const expected = getFile(FIXTURES_DIR, 'index.html')
        expect(path.join(TMP_DIR, 'index.html')).to.be.a.file().and.have.content(expected)
        done()
      } catch (e) {
        return done(e)
      }
    })
  })
})
