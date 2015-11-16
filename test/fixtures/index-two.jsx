import React from 'react'

export default class IndexTwo extends React.Component {
  render() {
    return (
      <html lang="en">
        <head>
          <title>Index Two</title>
          {this.props.styles.map((style, i) => {
            return (<link key={i} rel="stylesheet" href={style}/>)
          })}
        </head>
        <body>
          <main id="main">
            <h1>Hello, 2nd world</h1>
          </main>
          {this.props.scripts.map((script, i) => {
            return (<script key={i} src={script} defer={true}/>)
          })}
        </body>
      </html>
    )
  }
}

IndexTwo.propTypes = {
  styles: React.PropTypes.array,
  scripts: React.PropTypes.array
}

IndexTwo.defaultProps = {
  styles: [],
  scripts: []
}
