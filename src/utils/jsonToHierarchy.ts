import { hierarchy } from "d3-hierarchy"

export const jsonToHierarchy = (data) => {
  const root = hierarchy(data)

  const descendants = root.descendants()
  const leaves = root.leaves()

  return [root, descendants, leaves]
}