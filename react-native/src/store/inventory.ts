import { Action, Reducer } from "redux";
import { ThunkAction } from "redux-thunk";
import { RootAction, RootState } from ".";
import config from "../config";

export interface Inventory {
  id: string;
  createdTime: string;
  fields: {
    Posted: string;
    "Product Code": string;
    "Product Name": string;
    "Product Image": string;
    "Product Categories": string;
  };
}

export interface InventoryState {
  fetching: boolean;
  sending: boolean;
  byId: { [id: string]: Inventory };
  allIds: string[];
  offset: number | string;
}

const initialState = {
  fetching: false,
  sending: false,
  byId: {},
  allIds: [],
  offset: 0
};

export const inventoryReducer: Reducer<InventoryState, RootAction> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case FETCH_INVENTORY:
      return {
        ...state,
        fetching: true
      };
    case FETCH_INVENTORY_SUCCESS:
      return {
        ...state,
        fetching: false,
        byId: {
          ...state.byId,
          ...action.payload.records.reduce((byId, item) => {
            byId[item.id] = item;
            return byId;
          }, {} as { [id: string]: Inventory })
        },
        allIds: state.allIds.concat(
          action.payload.records.map((item) => item.id)
        ),
        offset: action.payload.offset
      };
    case FETCH_INVENTORY_ERROR:
      return {
        ...state,
        fetching: false
      };
    case SEND_INVENTORY:
      return {
        ...state,
        sending: true
      };
    case SEND_INVENTORY_SUCCESS:
    case SEND_INVENTORY_ERROR:
      return {
        ...state,
        sending: false
      };
    default:
      return state;
  }
};

const FETCH_INVENTORY = "FETCH_INVENTORY";
const FETCH_INVENTORY_SUCCESS = "FETCH_INVENTORY_SUCCESS";
const FETCH_INVENTORY_ERROR = "FETCH_INVENTORY_ERROR";
const SEND_INVENTORY = "SEND_INVENTORY";
const SEND_INVENTORY_SUCCESS = "SEND_INVENTORY_SUCCESS";
const SEND_INVENTORY_ERROR = "SEND_INVENTORY_ERROR";

interface FetchInventoryAction extends Action<typeof FETCH_INVENTORY> {}
interface FetchInventorySuccessAction
  extends Action<typeof FETCH_INVENTORY_SUCCESS> {
  payload: { records: Inventory[]; offset: InventoryState["offset"] };
}
interface FetchInventoryErrorAction
  extends Action<typeof FETCH_INVENTORY_ERROR> {
  error: boolean;
  payload: Error;
}
interface SendInventoryAction extends Action<typeof SEND_INVENTORY> {}
interface SendInventorySuccessAction
  extends Action<typeof SEND_INVENTORY_SUCCESS> {
  payload: Inventory;
}
interface SendInventoryErrorAction extends Action<typeof SEND_INVENTORY_ERROR> {
  error: boolean;
  payload: Error;
}
export type InventoryAction =
  | FetchInventoryAction
  | FetchInventorySuccessAction
  | FetchInventoryErrorAction
  | SendInventoryAction
  | SendInventorySuccessAction
  | SendInventoryErrorAction;

export const actions = {
  fetchInventory:
    (): ThunkAction<void, RootState, undefined, InventoryAction> =>
    (dispatch) => {
      dispatch({ type: FETCH_INVENTORY });
      fetch(
        "https://api.airtable.com/v0/appJkRh9E7qNlXOav/Home?offset=0&maxRecords=100&view=Grid%20view",
        {
          headers: {
            Authorization: config.Authorization
          }
        }
      )
        .then((response) => response.json())
        .then((body) => {
          dispatch({
            type: FETCH_INVENTORY_SUCCESS,
            payload: { records: body.records, offset: body.offset || 0 }
          });
        })
        .catch((e) => {
          dispatch({
            type: FETCH_INVENTORY_ERROR,
            error: true,
            payload: e
          });
        });
    },

  fetchMoreInventory:
    (
      offset: InventoryState["offset"]
    ): ThunkAction<void, RootState, undefined, InventoryAction> =>
    (dispatch) => {
      dispatch({ type: FETCH_INVENTORY });
      fetch(
        `https://api.airtable.com/v0/appJkRh9E7qNlXOav/Home?offset=${offset}`,
        {
          headers: {
            Authorization: config.Authorization
          }
        }
      )
        .then((response) => response.json())
        .then((body) => {
          dispatch({
            type: FETCH_INVENTORY_SUCCESS,
            payload: { records: body.records, offset: body.offset || 0 }
          });
        })
        .catch((e) => {
          dispatch({
            type: FETCH_INVENTORY_ERROR,
            error: true,
            payload: e
          });
        });
    },

  sendInventory:
    (
      data: string,
      goBack: () => void
    ): ThunkAction<void, RootState, undefined, InventoryAction> =>
    (dispatch, getState) => {
      if (getState().inventory.sending) {
        return;
      }
      dispatch({ type: SEND_INVENTORY });
      fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`)
        .then((response) => response.json())
        .then((body) => {
          return fetch(
            "https://api.airtable.com/v0/appJkRh9E7qNlXOav/Home?maxRecords=100&view=Grid%20view",
            {
              method: "POST",
              headers: {
                Authorization: config.Authorization,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                fields: {
                  "Product Code": data,
                  "Product Name": body?.product["product_name"],
                  "Product Categories": body?.product["categories"],
                  "Product Image": body?.product["image_url"]
                }
              })
            }
          );
        })
        .then((response) => response.json())
        .then((body) => {
          dispatch({ type: SEND_INVENTORY_SUCCESS, payload: body });
          goBack();
        })
        .catch((e) => {
          dispatch({
            type: SEND_INVENTORY_ERROR,
            error: true,
            payload: e
          });
        });
    }
};

export const selectors = {
  selectInventory: (state: RootState) =>
    state.inventory.allIds.map((id) => state.inventory.byId[id]),
  inventoryOffset: (state: RootState) => state.inventory.offset
};
