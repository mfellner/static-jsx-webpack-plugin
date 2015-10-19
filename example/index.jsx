import React from 'react'
import ReactDOM from 'react-dom'
import content from './content.jsx'

const Content = React.createFactory(content)

class Index extends React.Component {
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
            <Content/>
          </main>
          {this.props.scripts.map((script, i) => {
            return (<script key={i} src={script} defer={true}/>)
          })}
        </body>
      </html>
    )
  }
}

// If we're running in the browser, mount the root component.
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ReactDOM.render(Content(), document.getElementById('main'));
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

export default Index
