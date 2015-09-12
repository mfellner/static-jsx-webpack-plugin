import React from 'react'           // external
import TestModule from 'testmodule' // external

class Index extends React.Component {
  render() {
    const test = new TestModule('foo')
    return (
      <html>
        <body>
          <h1>{test.bar('bar')}</h1>
        </body>
      </html>
    )
  }
}

export default Index
