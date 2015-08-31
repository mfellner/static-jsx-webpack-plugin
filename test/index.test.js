import fs from 'mz/fs'
import path from 'path'
import rimraf from 'rimraf'
import should from 'should'
import webpack from 'webpack'
import StaticJsxPlugin from '../index.js'

const TMP_DIR = path.join(__dirname, 'tmp')
const FIXTURES_DIR = path.join(__dirname, 'fixtures')

describe('StaticJsxPlugin', () => {
  var compiler = webpack({
    entry: path.join(FIXTURES_DIR, 'index.jsx'),
    output: {
      path: TMP_DIR,
      filename: 'bundle.js'
    },
    module: {
      loaders: [{
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel',
      }]
    },
    plugins: [new StaticJsxPlugin()]
  })

  afterEach(done => {
    rimraf(TMP_DIR, done)
  })

  it('should transform JSX to HTML', done => {
    compiler.run(async function(err, stats) {
      try {
        if (err) return done(err)
        console.log(stats.toString({chunkModules: false}))
        const bundle = await fs.readFile(path.join(TMP_DIR, 'bundle.js'))
        const actual = await fs.readFile(path.join(TMP_DIR, 'index.html'))
        const expected = await fs.readFile(path.join(FIXTURES_DIR, 'index.html'))
        actual.toString().should.equal(expected.toString())
        done()
      } catch (e) {
        return done(e)
      }
    })
  })
})
