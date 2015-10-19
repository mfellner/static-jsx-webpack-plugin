import React from 'react'
import update from 'react-addons-update'

export default class Content extends React.Component {
  constructor(props) {
    super(props)
    this.state = {items: []}
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h1>Hello, world</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <button className="btn btn-default"
                    onClick={this.onAddItem.bind(this)}>
              click me!
            </button>
          </div>
          <div className="col-md-6">
            {this.state.items.map((item, i) => (
              <div key={i} className="panel panel-default">
                <div className="panel-body">
                  {item}
                  <button className="btn btn-default btn-sm pull-right"
                          onClick={this.onRemoveItem.bind(this, i)}>
                    <span className="glyphicon glyphicon-remove"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  componentDidMount() {
    console.log('Content component did mount!')
  }

  onAddItem() {
    const item = `Foo ${Math.floor(Math.random() * 4242)}`
    this.setState({
      items: update(this.state.items, {$push: [item]})
    })
  }

  onRemoveItem(i) {
    this.setState({
      items: update(this.state.items, {$splice: [[i, 1]]})
    })
  }
}
