import {Store} from "redux";

const logger = (store: Store<any, any>) => (next: any) => (action: any) => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}

export default logger