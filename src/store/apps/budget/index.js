// Minimal stub for budget store API used by pages during build
export const getCategoryPicklist = () => async dispatch => {
  // no-op stub: pages may dispatch this during runtime
  return Promise.resolve([])
}

export const getSchemePicklist = () => async dispatch => Promise.resolve([])
export const getBudgets = () => async dispatch => Promise.resolve([])
export const getBudgetVersions = () => async dispatch => Promise.resolve([])
export const getProducts = () => async dispatch => Promise.resolve([])

export default {}
