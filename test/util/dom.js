import htmlparser from 'htmlparser2'

function dataPropOrObj(obj) {
  if (typeof obj === 'object' && obj.hasOwnProperty('data')) {
    return obj.data
  } else {
    return data
  }
}

function firstChildOrObj(obj) {
  if (Array.isArray(obj.children)) {
    return dataPropOrObj(obj.children[0])
  } else {
    return dataPropOrObj(obj)
  }
}

function getTestFn(test) {
  switch (typeof test) {
    case 'string':
      return (v) => v.name === test
    default:
      return test
  }
}

/**
 * Depth-first search of a htmlparser2 DOM tree.
 *
 * @param  {object}   nodes - DOM nodes.
 * @param  {function} callback - Call for each element.
 * @return {object} The callback result or null.
 */
function dfs(nodes, callback) {
  if (!nodes) return null

  let v = Array.isArray(nodes) ? nodes[0] : nodes
  let vs = [v]
  let cbResult = null
  let visited = []

  while (vs.length > 0) {
    v = vs.pop()
    if (visited.indexOf(v) === -1) {
      cbResult = callback(v)
        // If there is a callback result, return the value.
      if (typeof cbResult !== 'undefined') {
        return cbResult
      }
      visited.push(v)
      if (Array.isArray(v.children)) {
        vs = vs.concat(v.children)
      }
    }
  }
  return null
}

/**
 * Return the first matching element of a htmlparser2 DOM tree.
 *
 * @param  {object}          nodes - DOM nodes.
 * @param  {function|string} test - Test function or name of the DOM element.
 * @return {object} The found node or null.
 */
export function findFirst(nodes, test) {
  if (!nodes) return null
  let testFn = getTestFn(test)

  return dfs(nodes, (v) =>
    testFn ? (testFn(v) ? v : undefined) : firstChildOrObj(v)
  )
}

/**
 * Return all matching elements of a htmlparser2 DOM tree.
 *
 * @param  {object}          nodes - DOM nodes.
 * @param  {function|string} test - Test function or name of the DOM element.
 * @return {Array} The found nodes.
 */
export function findAll(nodes, test) {
  if (!nodes) return null
  let testFn = getTestFn(test)
  let found = []

  dfs(nodes, function(v) {
    if (!testFn) {
      found.push(firstChildOrObj(v))
    } else if (testFn(v)) {
      found.push(v)
    }
  })
  return found
}

/**
 * Parse a raw HTML string and generate a DOM object.
 *
 * @param  {string} html - Raw HTML to parse.
 * @return {Promise} - Result of the HTML parsing.
 */
export function parseHtml(html) {
  return new Promise((resolve, reject) => {
    const parser = new htmlparser.Parser(new htmlparser.DomHandler((error, dom) => {
      if (error) reject(error)
      else resolve(dom)
    }))
    parser.write(html)
    parser.done()
  })
}
