import fs from 'mz/fs'
import path from 'path'
import rimraf from 'rimraf'
import should from 'should'
import shouldPromised from 'should-promised'
import webpack from 'webpack'
import CommonsChunkPlugin from 'webpack/lib/optimize/CommonsChunkPlugin'
import StaticJsxPlugin from '../index.js'

const TMP_DIR = path.join(__dirname, 'tmp')
const FIXTURES_DIR = path.join(__dirname, 'fixtures')

function getFile(dir, file) {
  return new Promise(function(resolve, reject) {
    fs.readFile(path.join(dir, file)).
    then(data => resolve(data.toString())).
    catch(err => resolve(null))
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
        await getFile(TMP_DIR, 'bundle.js').should.finally.not.be.null()
        const expected = await fs.readFile(path.join(FIXTURES_DIR, 'html/single/index.html'))
        await getFile(TMP_DIR, 'index.html').should.finally.not.be.null().and.
        equal(expected.toString())
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
        await getFile(TMP_DIR, 'indexOne-chunk.js').should.finally.not.be.null()
        await getFile(TMP_DIR, 'indexTwo-chunk.js').should.finally.not.be.null()

        const expected1 = await fs.readFile(path.join(FIXTURES_DIR, 'html/named/index.html'))
        await getFile(TMP_DIR, 'index.html').should.finally.not.be.null().and.
        equal(expected1.toString())

        const expected2 = await fs.readFile(path.join(FIXTURES_DIR, 'html/named/index-two.html'))
        await getFile(TMP_DIR, 'index-two.html').should.finally.not.be.null().and.
        equal(expected2.toString())
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
        await getFile(TMP_DIR, 'bundle.js').should.finally.not.be.null()

        const expected = await fs.readFile(path.join(FIXTURES_DIR, 'html/single/index.html'))
        await getFile(TMP_DIR, 'index.html').should.finally.not.be.null().and.
        equal(expected.toString())
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
        await getFile(TMP_DIR, 'bundle.js').should.finally.not.be.null()
        const expected = await fs.readFile(path.join(FIXTURES_DIR, 'html/single/index-externals.html'))
        await getFile(TMP_DIR, 'index-externals.html').should.finally.not.be.null().and.
        equal(expected.toString())
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
        console.log(stats.toString({
          chunkModules: false
        }))
        await getFile(TMP_DIR, 'bundle.js').should.finally.not.be.null()
        const expected = await fs.readFile(path.join(FIXTURES_DIR, 'html/single/index.html'))
        await getFile(TMP_DIR, 'index.html').should.finally.not.be.null().and.
        equal(expected.toString())
        done()
      } catch (e) {
        return done(e)
      }
    })
  })
})
