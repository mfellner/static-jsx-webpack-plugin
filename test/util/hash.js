import crypto from 'crypto'

export function stringify(obj) {
  let visited = []
  return JSON.stringify(obj, function(k, v) {
    // Filter values with circular references.
    if (Array.isArray(v)) {
      // Treat arrays separately to avoid null values.
      return v.filter(x => visited.indexOf(x) == -1)
    } else {
      if (visited.indexOf(v) != -1) {
        return
      } else {
        if (typeof v === 'object') visited.push(v)
        return v
      }
    }
  })
}

export default function hash(obj) {
  return crypto.createHash('sha1').
  update(stringify(obj)).
  digest('hex')
}
