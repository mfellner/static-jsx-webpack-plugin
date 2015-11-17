import React from 'react'           // external
import TestModule from 'testmodule' // external

/**
 * A React class that depends on 'externalized' modules.
 * I.e. modules which are excluded from the webpack bundle.
 */
export default class Index extends React.Component {
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
