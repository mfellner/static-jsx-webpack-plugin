import React from 'react'

/**
 * A basic React class with styles and scripts properties.
 */
export default class Index extends React.Component {
  render() {
    return (
      <html lang="en">
        <head>
          <title>{this.props.title}</title>
          {this.props.styles.map((style, i) => {
            return (<link key={i} rel="stylesheet" href={style}/>)
          })}
        </head>
        <body>
          <main id="main">
            <h1>Hello, world</h1>
          </main>
          {this.props.scripts.map((script, i) => {
            return (<script key={i} src={script} defer={true}/>)
          })}
        </body>
      </html>
    )
  }
}

Index.propTypes = {
  title: React.PropTypes.string,
  styles: React.PropTypes.array,
  scripts: React.PropTypes.array
}

Index.defaultProps = {
  styles: [],
  scripts: []
}
